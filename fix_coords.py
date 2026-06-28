#!/usr/bin/env python3
"""Targeted re-geocode for places the first pass got wrong (QA fixes)."""
import json, os, time, urllib.parse, urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "data.json")
BBOX = (40.80, 41.45, 28.40, 29.60)
UA = "enka-istanbul-guide/1.0 (teacher relocation map)"

def geocode(queries):
    for q in queries:
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
            {"q": q, "format": "json", "limit": 1, "countrycodes": "tr"})
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                data = json.load(r)
        except Exception as e:
            print("   ERR", q, e); time.sleep(1.2); continue
        time.sleep(1.2)
        if data:
            lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
            if BBOX[0] <= lat <= BBOX[1] and BBOX[2] <= lon <= BBOX[3]:
                return lat, lon, q, True
            print("   OUT-OF-BBOX", q, lat, lon)
    return None, None, None, False

# place -> better query candidates
FIXES = {
    "stop6": ["Osmanbey, M2 İstasyonu, Şişli, İstanbul", "Osmanbey metro istasyonu, Şişli", "Pangaltı, Şişli, İstanbul"],
}

d = json.load(open(OUT, encoding="utf-8"))
for st in d["stops"]:
    if st["num"] == 6:
        lat, lon, used, ok = geocode(FIXES["stop6"])
        if ok:
            st.update(lat=lat, lon=lon, geocodeUsed=used, geocodeOk=ok)
        print("STOP 6 ->", ok, lat, lon, "<-", used)

# sanity: report any stops sharing identical coords
seen = {}
for st in d["stops"]:
    key = (round(st["lat"], 5), round(st["lon"], 5))
    if key in seen:
        print("DUPLICATE COORDS:", st["num"], "==", seen[key])
    seen[key] = st["num"]

json.dump(d, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("saved")
