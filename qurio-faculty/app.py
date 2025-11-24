from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------- HARD-CODED FACULTY DATA ----------
FACULTY_DATA = [
    {
        "name": "Dr. Mehta",
        "department": "Computer Science",
        "office_room": "A-203",
        "available_days": "Mon, Wed, Fri",
        "available_time": "10:00 AM - 1:00 PM"
    },
    {
        "name": "Prof. Sharma",
        "department": "Mechanical Engineering",
        "office_room": "B-110",
        "available_days": "Tue, Thu",
        "available_time": "11:00 AM - 2:00 PM"
    },
    {
        "name": "Dr. Kaur",
        "department": "Electrical Engineering",
        "office_room": "C-305",
        "available_days": "Mon, Tue, Fri",
        "available_time": "9:00 AM - 12:00 PM"
    }
]

# ---------- SEARCH ENDPOINT -----------------
@app.route('/faculty', methods=['GET'])
def search_faculty():
    name_query = request.args.get('name', '').lower()

    for faculty in FACULTY_DATA:
        if name_query in faculty["name"].lower():
            return jsonify(faculty)

    return jsonify({"message": "Faculty not found"}), 404


@app.route('/')
def home():
    return jsonify({"message": "Faculty API running!"})


# ------------ RUN SERVER ----------------
if __name__ == "__main__":
    app.run()

