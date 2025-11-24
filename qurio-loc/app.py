import os
import json
import requests
import time
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, stream_with_context, render_template
from flask_cors import CORS
from queue import Queue
from threading import Lock

load_dotenv()
MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")  # optional

app = Flask(__name__)
CORS(app)

# -----------------------------
# Load campus locations
# -----------------------------
with open("locations.json", "r", encoding="utf-8") as f:
    LOCATIONS = json.load(f)

NAME_INDEX = {loc["name"].lower(): loc for loc in LOCATIONS}

# -----------------------------
# In-memory live tracking
# -----------------------------
tracking_lock = Lock()
latest_positions = {}
sse_queue = Queue(maxsize=1000)

# -----------------------------
# Hardcoded routes (both directions)
# -----------------------------
# -----------------------------
# Hardcoded campus routes (C, B, E, F and related)
# -----------------------------
CUSTOM_PATHS = {
    # --- F ↔ E ---
    ("f_block", "e_block"): {
        "coordinates": [
            [76.372222, 30.354167],
            [76.372171, 30.353659],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.04,
        "duration_min": 0.6,
        "note": "Hardcoded F↔E via campus walkway",
    },
    ("e_block", "f_block"): {
        "coordinates": [
            [76.372222, 30.353333],
            [76.372171, 30.353659],
            [76.372222, 30.354167],
        ],
        "distance_km": 0.04,
        "duration_min": 0.6,
        "note": "Hardcoded E↔F via campus walkway",
    },

    # --- E ↔ B ---
    ("e_block", "b_block"): {
        "coordinates": [
            [76.372222, 30.353333],
            [76.372050, 30.353310],
            [76.371389, 30.353056],
        ],
        "distance_km": 0.06,
        "duration_min": 1.0,
        "note": "Hardcoded E↔B via inner lane",
    },
    ("b_block", "e_block"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.372050, 30.353310],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.06,
        "duration_min": 1.0,
        "note": "Hardcoded B↔E via inner lane",
    },

    # --- F ↔ B (through midpoint same as F↔E) ---
    ("f_block", "b_block"): {
        "coordinates": [
            [76.372222, 30.354167],
            [76.372171, 30.353659],
            [76.371389, 30.353056],
        ],
        "distance_km": 0.07,
        "duration_min": 1.1,
        "note": "Hardcoded F↔B via shared walkway",
    },
    ("b_block", "f_block"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.372171, 30.353659],
            [76.372222, 30.354167],
        ],
        "distance_km": 0.07,
        "duration_min": 1.1,
        "note": "Hardcoded B↔F via shared walkway",
    },

    # --- Main Gate ↔ B ---
    ("main_gate", "b_block"): {
        "coordinates": [
            [76.373611, 30.351944],
            [76.371337, 30.352797],
            [76.371389, 30.353056],
        ],
        "distance_km": 0.25,
        "duration_min": 3.5,
        "note": "Hardcoded Main Gate↔B Block path",
    },
    ("b_block", "main_gate"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.371337, 30.352797],
            [76.373611, 30.351944],
        ],
        "distance_km": 0.25,
        "duration_min": 3.5,
        "note": "Hardcoded B Block↔Main Gate path",
    },

    # --- Main Gate ↔ E ---
    ("main_gate", "e_block"): {
        "coordinates": [
            [76.373611, 30.351944],
            [76.372683, 30.353181],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.27,
        "duration_min": 3.8,
        "note": "Hardcoded Main Gate↔E Block path",
    },
    ("e_block", "main_gate"): {
        "coordinates": [
            [76.372222, 30.353333],
            [76.372683, 30.353181],
            [76.373611, 30.351944],
        ],
        "distance_km": 0.27,
        "duration_min": 3.8,
        "note": "Hardcoded E Block↔Main Gate path",
    },

    # --- Main Gate ↔ F (via E) ---
    ("main_gate", "f_block"): {
        "coordinates": [
            [76.373611, 30.351944],
            [76.372683, 30.353181],
            [76.372222, 30.353333],
            [76.372171, 30.353659],
            [76.372222, 30.354167],
        ],
        "distance_km": 0.33,
        "duration_min": 4.5,
        "note": "Hardcoded Main Gate↔F via E Block",
    },
    ("f_block", "main_gate"): {
        "coordinates": [
            [76.372222, 30.354167],
            [76.372171, 30.353659],
            [76.372222, 30.353333],
            [76.372683, 30.353181],
            [76.373611, 30.351944],
        ],
        "distance_km": 0.33,
        "duration_min": 4.5,
        "note": "Hardcoded F Block↔Main Gate via E Block",
    },
    ("main_gate", "c_block"): {
        "coordinates": [[76.373611, 30.351944], [76.371389, 30.353056], [76.370784, 30.353283]],
        "distance_km": 0.40, "duration_min": 5.0
    },
    ("c_block", "main_gate"): {
        "coordinates": [[76.370784, 30.353283], [76.371389, 30.353056], [76.373611, 30.351944]],
        "distance_km": 0.40, "duration_min": 5.0
    },
    # 🆕 B Block -> Mech Workshop through C Block
    ("b_block", "mech_workshop"): {
        "coordinates": [[76.371389, 30.353056], [76.370784, 30.353283], [76.370833, 30.354444]],
        "distance_km": 0.18, "duration_min": 2.5
    },

    # --- B ↔ C ---
    ("b_block", "c_block"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.370784, 30.353283],
            [76.370556, 30.353333],
        ],
        "distance_km": 0.05,
        "duration_min": 0.8,
        "note": "Hardcoded B↔C internal link",
    },
    ("c_block", "b_block"): {
        "coordinates": [
            [76.370556, 30.353333],
            [76.370784, 30.353283],
            [76.371389, 30.353056],
        ],
        "distance_km": 0.05,
        "duration_min": 0.8,
        "note": "Hardcoded C↔B internal link",
    },

    # --- B ↔ SBP ---
    ("b_block", "sbop"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.371181, 30.352428],
            [76.369722, 30.351944],
        ],
        "distance_km": 0.15,
        "duration_min": 2.0,
        "note": "Hardcoded B↔SBP walkway",
    },
    ("sbop", "b_block"): {
        "coordinates": [
            [76.369722, 30.351944],
            [76.371181, 30.352428],
            [76.371389, 30.353056],
        ],
        "distance_km": 0.15,
        "duration_min": 2.0,
        "note": "Hardcoded SBP↔B walkway",
    },

    # --- B ↔ Library / TAN / Nirvana / Sports Complex ---
    ("b_block", "library"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.370253, 30.352964],
            [76.369945, 30.354409],
        ],
        "distance_km": 0.17,
        "duration_min": 2.2,
        "note": "Hardcoded B↔Library via shared midpoint",
    },
    ("b_block", "tan"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.370253, 30.352964],
            [76.368056, 30.353611],
        ],
        "distance_km": 0.22,
        "duration_min": 3.0,
        "note": "Hardcoded B↔TAN via shared midpoint",
    },
    ("b_block", "nirvana"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.370253, 30.352964],
            [76.366944, 30.352778],
        ],
        "distance_km": 0.3,
        "duration_min": 4.0,
        "note": "Hardcoded B↔Nirvana via shared midpoint",
    },
    ("b_block", "sports_complex"): {
        "coordinates": [
            [76.371389, 30.353056],
            [76.370253, 30.352964],
            [76.369808, 30.354029],
            [76.365763, 30.353669],
            [76.365556, 30.355000],
        ],
        "distance_km": 0.45,
        "duration_min": 6.0,
        "note": "Hardcoded B↔Sports Complex via shared midpoint",
    },

    # --- SBP ↔ C / E / F ---
    ("sbop", "c_block"): {
        "coordinates": [
            [76.369722, 30.351944],
            [76.370784, 30.353264],
            [76.370556, 30.353333],
        ],
        "distance_km": 0.15,
        "duration_min": 2.0,
        "note": "Hardcoded SBP↔C path",
    },
    ("sbop", "e_block"): {
        "coordinates": [
            [76.369722, 30.351944],
            [76.372656, 30.353163],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.28,
        "duration_min": 3.8,
        "note": "Hardcoded SBP↔E path",
    },
    ("sbop", "f_block"): {
        "coordinates": [
            [76.369722, 30.351944],
            [76.372656, 30.353163],
            [76.372222, 30.353333],
            [76.372171, 30.353659],
            [76.372222, 30.354167],
        ],
        "distance_km": 0.32,
        "duration_min": 4.3,
        "note": "Hardcoded SBP↔F via E Block",
    },
}

CUSTOM_PATHS.update({
    # --- C ↔ E ---
    ("c_block", "e_block"): {
        "coordinates": [
            [76.370556, 30.353333],  # C
            [76.371937, 30.353417],  # Midpoint
            [76.372222, 30.353333],  # E
        ],
        "distance_km": 0.07,
        "duration_min": 1.0,
        "note": "Hardcoded C↔E via midpoint (30.353417, 76.371937)",
    },
    ("e_block", "c_block"): {
        "coordinates": [
            [76.372222, 30.353333],
            [76.371937, 30.353417],
            [76.370556, 30.353333],
        ],
        "distance_km": 0.07,
        "duration_min": 1.0,
        "note": "Hardcoded E↔C via midpoint (30.353417, 76.371937)",
    },

    # --- C ↔ F ---
    ("c_block", "f_block"): {
        "coordinates": [
            [76.370556, 30.353333],  # C
            [76.371793, 30.353773],  # Midpoint
            [76.372222, 30.354167],  # F
        ],
        "distance_km": 0.09,
        "duration_min": 1.3,
        "note": "Hardcoded C↔F via midpoint (30.353773, 76.371793)",
    },
    ("f_block", "c_block"): {
        "coordinates": [
            [76.372222, 30.354167],
            [76.371793, 30.353773],
            [76.370556, 30.353333],
        ],
        "distance_km": 0.09,
        "duration_min": 1.3,
        "note": "Hardcoded F↔C via midpoint (30.353773, 76.371793)",
    },

    # --- E ↔ SBP ---
    ("e_block", "sbop"): {
        "coordinates": [
            [76.372222, 30.353333],  # E
            [76.372694, 30.353149],  # Midpoint
            [76.369722, 30.351944],  # SBP
        ],
        "distance_km": 0.30,
        "duration_min": 4.0,
        "note": "Hardcoded E↔SBP via midpoint (30.353149, 76.372694)",
    },
    ("sbop", "e_block"): {
        "coordinates": [
            [76.369722, 30.351944],
            [76.372694, 30.353149],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.30,
        "duration_min": 4.0,
        "note": "Hardcoded SBP↔E via midpoint (30.353149, 76.372694)",
    },

    # --- E ↔ Library (via B) ---
    ("e_block", "library"): {
        "coordinates": [
            [76.372222, 30.353333],  # E
            [76.371389, 30.353056],  # B
            [76.370189, 30.352954],
            [76.369945, 30.354409],  # Library
        ],
        "distance_km": 0.20,
        "duration_min": 3.0,
        "note": "Hardcoded E↔Library via B Block",
    },
    ("library", "e_block"): {
        "coordinates": [
            [76.369945, 30.354409],
            [76.371389, 30.353056],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.20,
        "duration_min": 3.0,
        "note": "Hardcoded Library↔E via B Block",
    },

    # --- E ↔ Mech Workshop (via F) ---
    ("e_block", "mech_workshop"): {
        "coordinates": [
            [76.372222, 30.353333],  # E
            [76.372171, 30.353659],  # mid to F
            [76.372222, 30.354167],  # F
            [76.370833, 30.354444],  # Mech Workshop
        ],
        "distance_km": 0.22,
        "duration_min": 3.2,
        "note": "Hardcoded E↔Mech Workshop via F Block",
    },
    ("mech_workshop", "e_block"): {
        "coordinates": [
            [76.370833, 30.354444],
            [76.372222, 30.354167],
            [76.372171, 30.353659],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.22,
        "duration_min": 3.2,
        "note": "Hardcoded Mech Workshop↔E via F Block",
    },

    # --- E ↔ TAN (via C) ---
    ("e_block", "tan"): {
        "coordinates": [
            [76.372222, 30.353333],
            [76.370556, 30.353333],
            [76.368056, 30.353611],
        ],
        "distance_km": 0.22,
        "duration_min": 3.0,
        "note": "Hardcoded E↔TAN via C Block",
    },
    ("tan", "e_block"): {
        "coordinates": [
            [76.368056, 30.353611],
            [76.370556, 30.353333],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.22,
        "duration_min": 3.0,
        "note": "Hardcoded TAN↔E via C Block",
    },

    # --- E ↔ Nirvana (via midpoint) ---
    ("e_block", "nirvana"): {
        "coordinates": [
            [76.372222, 30.353333],
            [76.372694, 30.353149],
            [76.366944, 30.352778],
        ],
        "distance_km": 0.4,
        "duration_min": 5.0,
        "note": "Hardcoded E↔Nirvana via midpoint (30.353149, 76.372694)",
    },
    ("nirvana", "e_block"): {
        "coordinates": [
            [76.366944, 30.352778],
            [76.372694, 30.353149],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.4,
        "duration_min": 5.0,
        "note": "Hardcoded Nirvana↔E via midpoint (30.353149, 76.372694)",
    },

    # --- E ↔ Sports Complex (via B path chain) ---
    ("e_block", "sports_complex"): {
        "coordinates": [
            [76.372222, 30.353333],  # E
            [76.371389, 30.353056],  # B
            [76.370253, 30.352964],
            [76.369808, 30.354029],
            [76.365763, 30.353669],
            [76.365556, 30.355000],
        ],
        "distance_km": 0.47,
        "duration_min": 6.5,
        "note": "Hardcoded E↔Sports Complex via B Block route",
    },
    ("sports_complex", "e_block"): {
        "coordinates": [
            [76.365556, 30.355000],
            [76.365763, 30.353669],
            [76.369808, 30.354029],
            [76.370253, 30.352964],
            [76.371389, 30.353056],
            [76.372222, 30.353333],
        ],
        "distance_km": 0.47,
        "duration_min": 6.5,
        "note": "Hardcoded Sports Complex↔E via B Block route",
    },
})

for (src, dst), info in list(CUSTOM_PATHS.items()):
    reverse_key = (dst, src)
    if reverse_key not in CUSTOM_PATHS:
        CUSTOM_PATHS[reverse_key] = {
            "coordinates": list(reversed(info["coordinates"])),
            "distance_km": info["distance_km"],
            "duration_min": info["duration_min"],
            "note": f"Auto-reverse of {src}->{dst}"
        }
# -----------------------------
# Helper
# -----------------------------
def get_custom_path(src_key, dst_key):
    return CUSTOM_PATHS.get((src_key, dst_key))


# -----------------------------
# Endpoints
# -----------------------------
@app.route("/locations", methods=["GET"])
def get_locations():
    return jsonify([loc["name"] for loc in LOCATIONS])


@app.route("/location", methods=["GET"])
def get_location():
    q = request.args.get("place", "").strip().lower()
    if not q:
        return jsonify({"message": "Please provide ?place=NAME"}), 400
    if q in NAME_INDEX:
        return jsonify(NAME_INDEX[q])
    return jsonify({"message": "Location not found"}), 404


@app.route("/route", methods=["POST"])
def route():
    body = request.get_json() or {}
    src_name = (body.get("src") or "").strip().lower()
    dst_name = (body.get("dst") or "").strip().lower()

    if not src_name or not dst_name:
        return jsonify({"message": "Provide both 'src' and 'dst'"}), 400

    if src_name not in NAME_INDEX or dst_name not in NAME_INDEX:
        return jsonify({"message": "Unknown source or destination"}), 404

    src = NAME_INDEX[src_name]
    dst = NAME_INDEX[dst_name]

    # 1️⃣ Custom path
    custom = get_custom_path(src_name, dst_name)
    if custom:
        return jsonify({
            "src": {"lat": src["latitude"], "lng": src["longitude"]},
            "dst": {"lat": dst["latitude"], "lng": dst["longitude"]},
            "geometry": {"type": "LineString", "coordinates": custom["coordinates"]},
            "distance_km": custom["distance_km"],
            "duration_min": custom["duration_min"],
            "note": "Custom campus route"
        })

    # 2️⃣ Mapbox walking route (if available)
    if MAPBOX_TOKEN:
        try:
            url = (
                "https://api.mapbox.com/directions/v5/mapbox/walking/"
                f"{src['longitude']},{src['latitude']};{dst['longitude']},{dst['latitude']}"
                f"?geometries=geojson&overview=full&access_token={MAPBOX_TOKEN}"
            )
            resp = requests.get(url, timeout=8)
            resp.raise_for_status()
            data = resp.json()
            if data.get("routes"):
                r = data["routes"][0]
                return jsonify({
                    "src": {"lat": src["latitude"], "lng": src["longitude"]},
                    "dst": {"lat": dst["latitude"], "lng": dst["longitude"]},
                    "geometry": r["geometry"],
                    "distance_km": round(r["distance"] / 1000, 2),
                    "duration_min": round(r["duration"] / 60, 1),
                    "note": "Generated using Mapbox walking"
                })
        except requests.RequestException as e:
            app.logger.warning("Mapbox failed: %s", str(e))

    # 3️⃣ OSRM fallback
    try:
        osrm_url = (
            "http://router.project-osrm.org/route/v1/walking/"
            f"{src['longitude']},{src['latitude']};{dst['longitude']},{dst['latitude']}"
            "?overview=full&geometries=geojson"
        )
        resp2 = requests.get(osrm_url, timeout=8)
        resp2.raise_for_status()
        d2 = resp2.json()
        if d2.get("routes"):
            r2 = d2["routes"][0]
            return jsonify({
                "src": {"lat": src["latitude"], "lng": src["longitude"]},
                "dst": {"lat": dst["latitude"], "lng": dst["longitude"]},
                "geometry": r2["geometry"],
                "distance_km": round(r2["distance"] / 1000, 2),
                "duration_min": round(r2["duration"] / 60, 1),
                "note": "Generated using OSRM walking (fallback)"
            })
        return jsonify({"message": "No route found by Mapbox or OSRM"}), 404
    except requests.RequestException as e:
        app.logger.error("OSRM request failed: %s", str(e))
        return jsonify({"message": "Error fetching route from routing services"}), 500


# -----------------------------
# Live tracking
# -----------------------------
@app.route("/track/update", methods=["POST"])
def track_update():
    data = request.get_json() or {}
    client_id = data.get("client_id", "anonymous")
    lat = data.get("lat")
    lng = data.get("lng")
    if lat is None or lng is None:
        return jsonify({"message": "Provide JSON {client_id, lat, lng}"}), 400
    try:
        lat, lng = float(lat), float(lng)
    except:
        return jsonify({"message": "lat/lng must be numeric"}), 400
    with tracking_lock:
        latest_positions[client_id] = {"lat": lat, "lng": lng, "ts": time.time()}
    try:
        sse_queue.put_nowait(json.dumps({
            "client_id": client_id, "lat": lat, "lng": lng, "ts": time.time()
        }))
    except:
        pass
    return jsonify({"status": "ok", "client_id": client_id})


@app.route("/track/stream")
def track_stream():
    def event_stream():
        while True:
            item = sse_queue.get()
            yield f"data: {item}\n\n"
    return Response(stream_with_context(event_stream()), mimetype='text/event-stream')


# -----------------------------
# Serve frontend
# -----------------------------
@app.route("/")
def home():
    return render_template("map.html")


# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run()
