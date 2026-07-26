// Chụp màn hình bằng CDP + device emulation (KHÔNG cần cài thêm gói).
// Vì sao: headless Chrome đặt --window-size KHÔNG bằng layout viewport → phải
// dùng Emulation.setDeviceMetricsOverride mới ra đúng khổ mobile (xem DESIGN.md §9).
//
// Cần: có Google Chrome ở /Applications. Dev server đang chạy (vd :3000).
// Dùng: node cdp-shot.js <url> <outfile.png> <width> <height> <dpr> <mobile:0|1>
//   node cdp-shot.js http://localhost:3000/math/sort m390.png 390 844 3 1
const net = require("net"), http = require("http"), crypto = require("crypto");
const fs = require("fs"), { spawn } = require("child_process");
const [url, out, W, H, DPR, MOBILE] = process.argv.slice(2);
const width = +W, height = +H, dpr = +DPR, mobile = MOBILE === "1";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function httpGet(p){return new Promise((res,rej)=>{http.get({host:"127.0.0.1",port:PORT,path:p},(r)=>{let d="";r.on("data",c=>d+=c);r.on("end",()=>res(d));}).on("error",rej);});}
// WebSocket client tối giản (Node không có global WebSocket ở v20).
function wsConnect(wsUrl){return new Promise((resolve,reject)=>{const u=new URL(wsUrl);const key=crypto.randomBytes(16).toString("base64");const sock=net.connect(+u.port,u.hostname,()=>{sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);});let buf=Buffer.alloc(0),hs=false;const h={};const api={send(id,method,params){const pl=Buffer.from(JSON.stringify({id,method,params}));const mask=crypto.randomBytes(4);const len=pl.length;let hd;if(len<126)hd=Buffer.from([0x81,0x80|len]);else if(len<65536){hd=Buffer.alloc(4);hd[0]=0x81;hd[1]=0x80|126;hd.writeUInt16BE(len,2);}else{hd=Buffer.alloc(10);hd[0]=0x81;hd[1]=0x80|127;hd.writeBigUInt64BE(BigInt(len),2);}const m=Buffer.alloc(len);for(let i=0;i<len;i++)m[i]=pl[i]^mask[i%4];sock.write(Buffer.concat([hd,mask,m]));},cmd(id,method,params){return new Promise(r=>{h[id]=r;api.send(id,method,params);});},close(){sock.destroy();}};sock.on("data",(ch)=>{buf=Buffer.concat([buf,ch]);if(!hs){const i=buf.indexOf("\r\n\r\n");if(i<0)return;buf=buf.slice(i+4);hs=true;resolve(api);}while(buf.length>=2){let len=buf[1]&0x7f,off=2;if(len===126){if(buf.length<4)break;len=buf.readUInt16BE(2);off=4;}else if(len===127){if(buf.length<10)break;len=Number(buf.readBigUInt64BE(2));off=10;}if(buf.length<off+len)break;const data=buf.slice(off,off+len);buf=buf.slice(off+len);try{const msg=JSON.parse(data.toString());if(msg.id&&h[msg.id]){h[msg.id](msg);delete h[msg.id];}}catch{}}});sock.on("error",reject);});}
(async () => {
  const chrome = spawn(CHROME,[`--remote-debugging-port=${PORT}`,"--headless=new","--no-first-run","--no-default-browser-check","--user-data-dir=/tmp/chrome-shot-profile","--hide-scrollbars","about:blank"],{stdio:"ignore"});
  try{
    let target;
    for(let i=0;i<60;i++){try{const l=JSON.parse(await httpGet("/json/list"));target=l.find(t=>t.type==="page"&&t.webSocketDebuggerUrl);if(target)break;}catch{}await sleep(300);}
    if(!target) throw new Error("no devtools page target");
    const ws=await wsConnect(target.webSocketDebuggerUrl);let id=1;
    await ws.cmd(id++,"Page.enable",{});
    await ws.cmd(id++,"Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:dpr,mobile,screenWidth:width,screenHeight:height});
    if(mobile) await ws.cmd(id++,"Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:5});
    await ws.cmd(id++,"Page.navigate",{url});
    await sleep(2600);
    const shot=await ws.cmd(id++,"Page.captureScreenshot",{format:"png",captureBeyondViewport:true});
    fs.writeFileSync(out,Buffer.from(shot.result.data,"base64"));
    console.log("saved",out,width+"x"+height,"dpr"+dpr,mobile?"mobile":"");
    ws.close();
  } finally { chrome.kill(); }
})().catch((e)=>{console.error(e);process.exit(1);});
