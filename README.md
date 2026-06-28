# ENKA Istanbul — Housing & Commute Map

An interactive map for **new teachers moving to ENKA Schools Istanbul**: the 9 service-bus
stops, the most liveable neighborhoods around each stop, and **live routes** (home → your
stop, and stop → school).

**Live site:** https://lucasbergman94.github.io/enka-istanbul-guide/

## What it does
- Map of the school + 9 bus stops (Europe / Asia) + ~36 neighborhoods, colored by price tier.
- Tap a neighborhood for details and one-tap Google Maps routes.
- "Plan from my location" finds your nearest stop.
- Filters: price, stop, walk-to-school; plus search.

## How to edit the data
All neighborhoods/stops live in **`data.json`**. Add or edit entries in `data_src.json`
(human-friendly source), then re-run `python3 geocode.py` to refresh coordinates, or edit
`data.json` directly if you already have lat/lon.

## Notes
- No API keys: map tiles are OpenStreetMap; routing uses Google Maps deep links.
- Pin locations are auto-geocoded (OpenStreetMap) and may be slightly off — verify before deciding.
- Bus schedule/times: confirm with the school. This tool maps the stops, not the timetable.

Built with Leaflet. Data from the ENKA service-bus document and new-teacher experiences.
