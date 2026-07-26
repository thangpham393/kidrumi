# Kiểm tương tác bằng CDP (kéo / chạm / tính sao / modal)

Dùng lại **WS client** trong `scripts/cdp-shot.js` (copy phần `httpGet` + `wsConnect`).
Sau khi có `ws` và `cmd(method,params)`:

```js
const ev  = async (e) => (await cmd("Runtime.evaluate",{expression:e,returnByValue:true})).result.result.value;
await cmd("Page.enable",{}); await cmd("Runtime.enable",{});
await cmd("Emulation.setDeviceMetricsOverride",{width:1280,height:940,deviceScaleFactor:1,mobile:false,screenWidth:1280,screenHeight:940});
await cmd("Page.navigate",{url:"http://localhost:3000/math/sort"}); await sleep(2600);

// Input.dispatchMouseEvent (mouse) → React nhận cả pointerdown/up.
const tap = async (x,y) => { await cmd("Input.dispatchMouseEvent",{type:"mousePressed",x,y,button:"left",buttons:1,clickCount:1}); await sleep(35);
                             await cmd("Input.dispatchMouseEvent",{type:"mouseReleased",x,y,button:"left",buttons:1,clickCount:1}); await sleep(220); };
const drag = async (x0,y0,x1,y1) => { await cmd("Input.dispatchMouseEvent",{type:"mousePressed",x:x0,y:y0,button:"left",buttons:1,clickCount:1}); await sleep(30);
  for(let i=1;i<=6;i++){ await cmd("Input.dispatchMouseEvent",{type:"mouseMoved",x:x0+(x1-x0)*i/6,y:y0+(y1-y0)*i/6,buttons:1}); await sleep(25); }
  await cmd("Input.dispatchMouseEvent",{type:"mouseReleased",x:x1,y:y1,button:"left",buttons:1,clickCount:1}); await sleep(300); };

// Đọc trạng thái qua DOM (đổi selector theo trò).
const snap = `(()=>{const stars=[...document.querySelectorAll('.lt-star')].filter(s=>s.textContent.trim()==='⭐').length;
  const chips=[...document.querySelectorAll('.sort-chip')].map(b=>{const r=b.getBoundingClientRect();return{label:b.getAttribute('aria-label'),x:r.x+r.width/2,y:r.y+r.height/2};});
  const baskets=[...document.querySelectorAll('.sort-col')].map(b=>{const r=b.getBoundingClientRect();return{label:b.getAttribute('aria-label'),x:r.x+r.width/2,y:r.y+r.height/2};});
  const done=!!document.querySelector('.modal-back .lt-result');
  return {stars,tray:chips.length,chips,baskets,done};})()`;
```

## Mẫu auto-player (không cần biết đáp án)
Với trò phân loại 2 đích: thử đích A, nếu vật vẫn còn thì thử đích B → tự sắp đúng.
Kiểm được các bất biến quan trọng mà không hard-code nhãn:

```js
let s = await ev(snap), guard=0, starMidRound=false, wrongSeen=false;
while(!s.done && guard++<80){
  if(s.tray===0){ await sleep(1600); s=await ev(snap); continue; } // chờ chuyển lượt
  const c=s.chips[0], before=s;
  await tap(c.x,c.y); await tap(s.baskets[0].x,s.baskets[0].y);     // chọn vật → thử A
  let after=await ev(snap);
  if(after.tray===before.tray){ wrongSeen=true; await tap(s.baskets[1].x,s.baskets[1].y); after=await ev(snap); } // A sai → B
  if(after.tray>0 && after.stars>before.stars) starMidRound=true;   // sao KHÔNG được rơi giữa lượt
  s=after;
}
```

## Bẫy đã gặp
- **Sao tăng trong lúc chuyển lượt** (có `setTimeout` ~450ms sau khi đầy khay). Nếu
  đo `stars` ngay sau cú thả cuối sẽ thấy chưa tăng → chờ ~1600ms mới snapshot; hoặc
  chỉ khẳng định "không có sao rơi khi `tray>0`" + "tổng sao cuối đúng".
- `/json/new` ở Chrome mới đòi PUT → **dùng `/json/list`** lấy target `type==="page"`
  (Chrome mở sẵn tab `about:blank` từ dòng lệnh).
- Node v20 **không có global WebSocket** → dùng WS client tối giản trong `cdp-shot.js`.
- Đọc PNG bằng công cụ Read để soi layout; đọc trả về JSON để assert số sao/khay/modal.
