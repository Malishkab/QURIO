from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------- HARD-CODED FACULTY DATA ----------
FACULTY_DATA = [
    {"name": "Dr. Inderveer Chana", "department": "Computer Science and Engineering", "office_room": "CSED-212", "available_days": "Mon, Tue, Thu", "available_time": "10:00 AM - 12:30 PM"},
    {"name": "Dr. Neeraj Kumar", "department": "Computer Science and Engineering", "office_room": "CSED-305", "available_days": "Wed, Fri", "available_time": "2:00 PM - 5:00 PM"},
    {"name": "Dr. Seema Bawa", "department": "Computer Science and Engineering", "office_room": "CSED-119", "available_days": "Mon, Thu", "available_time": "11:00 AM - 1:00 PM"},
    {"name": "Dr. Rajinder Sandhu", "department": "Computer Science and Engineering", "office_room": "CSED-214", "available_days": "Tue, Fri", "available_time": "9:30 AM - 12:00 PM"},
    {"name": "Dr. Harjit Kaur", "department": "Computer Science and Engineering", "office_room": "CSED-108", "available_days": "Mon, Wed", "available_time": "1:00 PM - 3:00 PM"},

    {"name": "Dr. Shweta Goyal", "department": "Civil Engineering", "office_room": "CED-108", "available_days": "Mon, Wed", "available_time": "11:00 AM - 1:00 PM"},
    {"name": "Dr. Rakesh Kumar", "department": "Civil Engineering", "office_room": "CED-204", "available_days": "Tue, Thu", "available_time": "2:00 PM - 4:00 PM"},
    {"name": "Dr. Amandeep Singh", "department": "Civil Engineering", "office_room": "CED-115", "available_days": "Mon, Fri", "available_time": "10:00 AM - 12:00 PM"},
    {"name": "Dr. Priya Verma", "department": "Civil Engineering", "office_room": "CED-307", "available_days": "Wed, Thu", "available_time": "9:30 AM - 11:30 AM"},
    {"name": "Dr. Yuvraj Malhotra", "department": "Civil Engineering", "office_room": "CED-118", "available_days": "Tue, Fri", "available_time": "3:00 PM - 5:00 PM"},

    {"name": "Dr. Manoj Baranwal", "department": "Biotechnology", "office_room": "BTD-210", "available_days": "Tue, Thu", "available_time": "9:30 AM - 12:00 PM"},
    {"name": "Dr. M. S. Reddy", "department": "Biotechnology", "office_room": "BTD-304", "available_days": "Mon, Wed", "available_time": "10:00 AM - 12:00 PM"},
    {"name": "Dr. Ruchi Arora", "department": "Biotechnology", "office_room": "BTD-118", "available_days": "Thu, Fri", "available_time": "1:00 PM - 3:00 PM"},
    {"name": "Dr. Vikas Kaushal", "department": "Biotechnology", "office_room": "BTD-207", "available_days": "Mon, Tue", "available_time": "2:00 PM - 4:00 PM"},
    {"name": "Dr. Neha Sharma", "department": "Biotechnology", "office_room": "BTD-130", "available_days": "Wed, Fri", "available_time": "11:00 AM - 1:00 PM"},

    {"name": "Dr. Sunil Kumar Singla", "department": "Electrical & Instrumentation Engineering", "office_room": "EIED-115", "available_days": "Mon, Fri", "available_time": "10:00 AM - 1:00 PM"},
    {"name": "Dr. V. K. Jain", "department": "Electrical & Instrumentation Engineering", "office_room": "EIED-211", "available_days": "Tue, Thu", "available_time": "9:00 AM - 11:00 AM"},
    {"name": "Dr. Karan Arora", "department": "Electrical & Instrumentation Engineering", "office_room": "EIED-320", "available_days": "Mon, Wed", "available_time": "2:00 PM - 4:00 PM"},
    {"name": "Dr. Simranjit Kaur", "department": "Electrical & Instrumentation Engineering", "office_room": "EIED-107", "available_days": "Thu, Fri", "available_time": "12:00 PM - 2:00 PM"},
    {"name": "Dr. Abhinav Mehta", "department": "Electrical & Instrumentation Engineering", "office_room": "EIED-223", "available_days": "Tue, Fri", "available_time": "1:00 PM - 4:00 PM"},

    {"name": "Dr. S. K. Mohapatra", "department": "Mechanical Engineering", "office_room": "MED-204", "available_days": "Tue, Wed", "available_time": "1:00 PM - 4:00 PM"},
    {"name": "Dr. R. K. Aggarwal", "department": "Mechanical Engineering", "office_room": "MED-110", "available_days": "Mon, Thu", "available_time": "10:00 AM - 12:00 PM"},
    {"name": "Dr. Jatin Bansal", "department": "Mechanical Engineering", "office_room": "MED-305", "available_days": "Wed, Fri", "available_time": "11:00 AM - 1:00 PM"},
    {"name": "Dr. Lavanya Kapoor", "department": "Mechanical Engineering", "office_room": "MED-122", "available_days": "Tue, Thu", "available_time": "2:00 PM - 5:00 PM"},
    {"name": "Dr. Hemant Goyal", "department": "Mechanical Engineering", "office_room": "MED-213", "available_days": "Mon, Tue", "available_time": "9:00 AM - 11:00 AM"},

    {"name": "Dr. Bhupendra Chudasama", "department": "Physics and Materials Science", "office_room": "SPMS-310", "available_days": "Mon, Thu", "available_time": "3:00 PM - 5:00 PM"},
    {"name": "Dr. S. P. Singh", "department": "Physics and Materials Science", "office_room": "SPMS-112", "available_days": "Tue, Wed", "available_time": "10:00 AM - 12:00 PM"},
    {"name": "Dr. Leena Arora", "department": "Physics and Materials Science", "office_room": "SPMS-220", "available_days": "Thu, Fri", "available_time": "1:00 PM - 3:00 PM"},
    {"name": "Dr. Tarun Khanna", "department": "Physics and Materials Science", "office_room": "SPMS-305", "available_days": "Mon, Wed", "available_time": "9:30 AM - 11:30 AM"},
    {"name": "Dr. Sudesh Kaul", "department": "Physics and Materials Science", "office_room": "SPMS-118", "available_days": "Tue, Thu", "available_time": "2:00 PM - 4:00 PM"},

    {"name": "Dr. Poonam Syal", "department": "Mathematics", "office_room": "SMCA-118", "available_days": "Tue, Fri", "available_time": "9:00 AM - 11:00 AM"},
    {"name": "Dr. Arvind Gupta", "department": "Mathematics", "office_room": "SMCA-207", "available_days": "Mon, Wed", "available_time": "11:00 AM - 1:00 PM"},
    {"name": "Dr. Kavita Mahajan", "department": "Mathematics", "office_room": "SMCA-309", "available_days": "Thu, Fri", "available_time": "2:00 PM - 4:00 PM"},
    {"name": "Dr. Deepak Bhalla", "department": "Mathematics", "office_room": "SMCA-124", "available_days": "Mon, Thu", "available_time": "10:00 AM - 12:00 PM"},
    {"name": "Dr. Anjali Sharma", "department": "Mathematics", "office_room": "SMCA-220", "available_days": "Wed, Fri", "available_time": "3:00 PM - 5:00 PM"},

    {"name": "Dr. Reema Chopra", "department": "Chemistry", "office_room": "CHEM-112", "available_days": "Tue, Thu", "available_time": "10:00 AM - 12:00 PM"},
    {"name": "Dr. Kunal Sethi", "department": "Chemistry", "office_room": "CHEM-215", "available_days": "Mon, Wed", "available_time": "1:00 PM - 3:00 PM"},
    {"name": "Dr. Sheetal Mahotra", "department": "Chemistry", "office_room": "CHEM-307", "available_days": "Thu, Fri", "available_time": "9:30 AM - 11:30 AM"},
    {"name": "Dr. Nitin Chaudhary", "department": "Chemistry", "office_room": "CHEM-118", "available_days": "Mon, Tue", "available_time": "2:00 PM - 4:00 PM"},
    {"name": "Dr. Vandana Joshi", "department": "Chemistry", "office_room": "CHEM-121", "available_days": "Wed, Fri", "available_time": "1:00 PM - 3:00 PM"},

    {"name": "Dr. Yashpal Singh", "department": "Humanities and Social Sciences", "office_room": "HSS-105", "available_days": "Tue, Thu", "available_time": "11:00 AM - 1:00 PM"},
    {"name": "Dr. Ritu Sharma", "department": "Humanities and Social Sciences", "office_room": "HSS-203", "available_days": "Mon, Wed", "available_time": "2:00 PM - 4:00 PM"},
    {"name": "Dr. Vipul Mehta", "department": "Humanities and Social Sciences", "office_room": "HSS-310", "available_days": "Thu, Fri", "available_time": "9:00 AM - 11:00 AM"},
    {"name": "Dr. Meenakshi Bansal", "department": "Humanities and Social Sciences", "office_room": "HSS-119", "available_days": "Mon, Tue", "available_time": "1:00 PM - 3:00 PM"},
    {"name": "Dr. Rajeev Kapoor", "department": "Humanities and Social Sciences", "office_room": "HSS-220", "available_days": "Wed, Fri", "available_time": "2:00 PM - 5:00 PM"},

    {"name": "Dr. Mehta", "department": "Computer Science", "office_room": "A-203", "available_days": "Mon, Wed, Fri", "available_time": "10:00 AM - 1:00 PM"},
    {"name": "Prof. Sharma", "department": "Mechanical Engineering", "office_room": "B-110", "available_days": "Tue, Thu", "available_time": "11:00 AM - 2:00 PM"},
    {"name": "Dr. Kaur", "department": "Electrical Engineering", "office_room": "C-305", "available_days": "Mon, Tue, Fri", "available_time": "9:00 AM - 12:00 PM"},

    {"name": "Dr. Prashant Singh Rana", "department": "Computer Science and Engineering", "office_room": "CSED-217", "available_days": "Mon, Wed, Fri", "available_time": "10:00 AM - 12:00 PM"}
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
    app.run(port=5001, debug=True)
