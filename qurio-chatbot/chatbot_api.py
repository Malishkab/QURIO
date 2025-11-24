# =============================
# 💬 FLASK CHATBOT ENDPOINT
# =============================
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")

        # 🔹 Store the user message in Firestore
        doc_ref = db.collection("chat_history").document()
        doc_ref.set({
            "user_message": user_message,
            "bot_reply": None,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        # 🔹 Generate a dummy bot reply (you can replace this later with AI logic)
        bot_reply = f"Hello! You said: {user_message}"

        # 🔹 Update Firestore with bot reply
        doc_ref.update({"bot_reply": bot_reply})

        return jsonify({"reply": bot_reply})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"reply": "Sorry, I’m having trouble connecting right now."})

if __name__ == "__main__":
    print("🚀 Starting Flask chatbot API...")
    app.run(debug=True)
