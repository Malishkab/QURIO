from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

# 🔥 Initialize Firebase
cred = credentials.Certificate("quriomailfirebase.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 🚀 Initialize Flask
app = Flask(__name__)
CORS(app)  # enable CORS for all routes

# ======================
# 📬 ROUTES
# ======================

@app.route("/emails/<category>", methods=["GET"])
def get_emails(category):
    """Fetch all emails by category (Internship, Event, Hackathon)."""
    try:
        emails_ref = db.collection("emails").where("category", "==", category)
        docs = emails_ref.stream()
        emails = []

        for doc in docs:
            data = doc.to_dict()
            emails.append({
                "id": doc.id,
                "subject": data.get("subject", ""),
                "date": data.get("date", ""),
                "snippet": data.get("snippet", ""),
                "category": data.get("category", "")
            })

        emails.sort(key=lambda x: x["date"], reverse=True)
        return jsonify(emails), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🟢 Default route
@app.route("/")
def home():
    return "QURIO Flask Backend is running "


if __name__ == "__main__":
    app.run(debug=True, port=5000)
