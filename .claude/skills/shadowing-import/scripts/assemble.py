#!/usr/bin/env python3
# Lắp ráp / gộp video vào app/shadowing/videos.generated.json.
# Ghép: playlist.json (id,title,dur) + raw/<id>.json ([{t,text}]) + anno/<id>.json
#   ({emoji, segments:[{tr, words:[{w,ph,mean}]}]}) → mỗi video 1 GeneratedVideo.
# MERGE theo youtubeId: video đã có (cùng youtubeId) sẽ được thay, video mới thì thêm.
#
# Dùng:
#   assemble.py --base <BASE_DIR> --out <videos.generated.json> \
#               --source "Little Fox" --level l1 --lang zh --id-prefix lf1
# --level: de|mid|hard|l1  (l1 = "Level 1"). --id-prefix: tiền tố slug id (để URL không đụng nhau).
import argparse, json, os, re

def clean_title(t):
    t = t.split("|")[0].strip()
    t = re.sub(r"^\[4K\]\s*", "", t).strip()
    return t

def fmt_dur(sec):
    if not sec: return "0:00"
    m, s = divmod(int(sec), 60)
    return f"{m}:{s:02d}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--source", required=True)
    ap.add_argument("--level", default="l1", choices=["de", "mid", "hard", "l1", "l2", "kelly", "ft1", "ft2"])
    ap.add_argument("--lang", default="zh", choices=["zh", "en"])
    ap.add_argument("--id-prefix", default="")
    a = ap.parse_args()

    playlist = json.load(open(os.path.join(a.base, "playlist.json")))
    existing = []
    if os.path.exists(a.out):
        try: existing = json.load(open(a.out))
        except Exception: existing = []
    by_yt = {v.get("youtubeId"): v for v in existing}

    built, missing_raw, missing_anno = 0, [], []
    for e in playlist:
        vid = e["id"]
        rawp = os.path.join(a.base, "raw", f"{vid}.json")
        annop = os.path.join(a.base, "anno", f"{vid}.json")
        if not os.path.exists(rawp): missing_raw.append(vid); continue
        if not os.path.exists(annop): missing_anno.append(vid); continue
        raw = json.load(open(rawp)); anno = json.load(open(annop))
        aseg = anno.get("segments", [])
        segments = []
        for i, s in enumerate(raw):
            adata = aseg[i] if i < len(aseg) else {}
            words = [{"w": w["w"], "ph": w.get("ph", ""), "mean": w["mean"]}
                     for w in (adata.get("words") or []) if w.get("w") and w.get("mean")]
            seg = {"t": int(s["t"]), "text": s["text"], "tr": adata.get("tr", "")}
            if words: seg["words"] = words
            segments.append(seg)
        prefix = (a.id_prefix + "-") if a.id_prefix else ""
        by_yt[vid] = {
            "id": f"{prefix}{vid}",
            "lang": a.lang,
            "title": clean_title(e.get("title", "")),
            "source": a.source,
            "level": a.level,
            "dur": fmt_dur(e.get("dur")),
            "emoji": anno.get("emoji") or ("🀄" if a.lang == "zh" else "🎬"),
            "youtubeId": vid,
            "segments": segments,
        }
        built += 1

    out = list(by_yt.values())
    json.dump(out, open(a.out, "w"), ensure_ascii=False, indent=2)
    open(a.out, "a").write("\n")
    print(f"Assembled {built} video(s); file now has {len(out)} total → {a.out}")
    if missing_raw: print(f"  MISSING raw ({len(missing_raw)}):", ", ".join(missing_raw))
    if missing_anno: print(f"  MISSING anno ({len(missing_anno)}):", ", ".join(missing_anno))

if __name__ == "__main__":
    main()
