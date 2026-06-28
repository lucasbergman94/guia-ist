#!/usr/bin/env python3
"""Geocode ENKA map places via OpenStreetMap Nominatim (free, no key).
Respects Nominatim policy: <=1 req/sec, custom User-Agent. Validates against an
Istanbul bounding box so obvious mis-hits are flagged, not silently placed."""
import json, os, time, urllib.parse, urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "data_src.json")
OUT = os.path.join(BASE, "data.json")
# minlat, maxlat, minlon, maxlon  (greater Istanbul)
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
            print("   ERR", q, "->", e)
            time.sleep(1.2)
            continue
        time.sleep(1.2)
        if data:
            lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
            if BBOX[0] <= lat <= BBOX[1] and BBOX[2] <= lon <= BBOX[3]:
                return lat, lon, q, True
            print("   OUT-OF-BBOX", q, lat, lon)
    return None, None, None, False


def qlist(item):
    g = item.get("geoQuery")
    return [g] if isinstance(g, str) else (g or [])


src = json.load(open(SRC, encoding="utf-8"))

s = src["school"]
s["lat"], s["lon"], s["geocodeUsed"], s["geocodeOk"] = geocode(qlist(s))
print("SCHOOL", s["geocodeOk"], s["lat"], s["lon"], "<-", s["geocodeUsed"])

for st in src["stops"]:
    st["lat"], st["lon"], st["geocodeUsed"], st["geocodeOk"] = geocode(qlist(st))
    print(f"STOP {st['num']:>2} {st['name']:<28}", st["geocodeOk"], st["lat"], st["lon"])

miss = []
for n in src["neighborhoods"]:
    n["lat"], n["lon"], n["geocodeUsed"], n["geocodeOk"] = geocode(qlist(n))
    if not n["geocodeOk"]:
        miss.append(n["name"])
    print(f"N  {n['name']:<28}", n["geocodeOk"], n["lat"], n["lon"])

json.dump(src, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("\nMISSING:", miss if miss else "none",
      f"({len(miss)}/{len(src['neighborhoods'])})")
print("WROTE", OUT)
