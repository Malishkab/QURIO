# app.py (diagnostic + robust fetch version)
from flask import Flask, jsonify, session, redirect, request
from flask_cors import CORS
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from firebase_admin import credentials, firestore, initialize_app
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import os
import re
import traceback

# -------------------------------
# CONFIG / FILE PATHS
# -------------------------------
FIREBASE_KEY = "quriomailfirebase.json"  # your Firebase service account
GOOGLE_CLIENT_SECRETS = "credentials.json"
TOKEN_PATH = "token.json"  # saved Gmail credentials (created after OAuth)
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

# -------------------------------
# FIREBASE INIT
# -------------------------------
if not os.path.exists(FIREBASE_KEY):
    raise FileNotFoundError(f"Firebase service account file not found: {FIREBASE_KEY}")

cred = credentials.Certificate(FIREBASE_KEY)
initialize_app(cred)
db = firestore.client()

# -------------------------------
# FLASK INIT
# -------------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET", "qurio-secret")
CORS(app, supports_credentials=True)

# Allow local insecure OAuth for dev (remove for prod)
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# -------------------------------
# HELPER: serialize / persist creds
# -------------------------------
def save_token(creds: Credentials):
    try:
        with open(TOKEN_PATH, "w", encoding="utf-8") as t:
            t.write(creds.to_json())
    except Exception:
        print("❌ Failed to save token.json")
        traceback.print_exc()

def load_creds():
    try:
        if not os.path.exists(TOKEN_PATH):
            return None
        return Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    except Exception:
        print("❌ Failed to load credentials")
        traceback.print_exc()
        return None

def refresh_creds_if_needed(creds: Credentials):
    try:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            save_token(creds)
        return creds
    except Exception:
        print("❌ Error refreshing credentials")
        traceback.print_exc()
        return None

# -------------------------------
# GOOGLE OAUTH WEB FLOW
# -------------------------------
def creds_to_dict(creds: Credentials):
    return {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }

@app.route("/authorize")
def authorize():
    flow = Flow.from_client_secrets_file(
        GOOGLE_CLIENT_SECRETS,
        scopes=SCOPES,
        redirect_uri=request.host_url.rstrip("/") + "/oauth2callback",
    )
    auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline", include_granted_scopes="true")
    return redirect(auth_url)

@app.route("/oauth2callback")
def oauth2callback():
    try:
        flow = Flow.from_client_secrets_file(
            GOOGLE_CLIENT_SECRETS,
            scopes=SCOPES,
            redirect_uri=request.host_url.rstrip("/") + "/oauth2callback",
        )
        flow.fetch_token(authorization_response=request.url)
        creds = flow.credentials
        session["creds"] = creds_to_dict(creds)
        save_token(creds)
        return jsonify({"message": "Gmail linked successfully!"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "OAuth callback failed", "details": str(e)}), 500

# -------------------------------
# EMAIL CATEGORY CLASSIFIER
# -------------------------------
CATEGORY_KEYWORDS = {
    "Internship": [r"internship", r"\bintern\b", r"hiring", r"job opening", r"recruitment", r"placement", r"career opportunity"],
    "Hackathon": [r"hackathon", r"hackfest", r"code challenge", r"coding contest",r"competition",r"challenge"],
    "Placement": [r"placement", r"campus drive", r"career opportunity"],
    "College": [r"college", r"notice", r"event", r"seminar"],
}

def classify_email(text: str) -> str:
    text = (text or "").lower()
    keyword_pairs = []
    for cat, words in CATEGORY_KEYWORDS.items():
        for w in words:
            keyword_pairs.append((cat, w))
    keyword_pairs.sort(key=lambda x: len(x[1]), reverse=True)
    for cat, kw in keyword_pairs:
        if re.search(kw, text, re.IGNORECASE):
            return cat
    return "Other"

# -------------------------------
# FETCH EMAILS
# -------------------------------
# def fetch_emails_internal(days_back: int = 7):
#     creds = load_creds()
#     if creds is None:
#         return {"status": "no_creds", "message": "No Gmail credentials found. Please link Gmail via /authorize."}
#     creds = refresh_creds_if_needed(creds)
#     if creds is None:
#         return {"status": "error", "message": "Failed to refresh credentials."}
#     try:
#         service = build("gmail", "v1", credentials=creds)
#         date_7 = (datetime.datetime.utcnow() - datetime.timedelta(days=days_back)).strftime("%Y/%m/%d")
#         query = f"after:{date_7}"
#         results = service.users().messages().list(userId="me", q=query, maxResults=50).execute()
#         messages = results.get("messages", [])
#         if not messages:
#             return {"status": "ok", "message": "No new emails."}
#         for msg in messages:
#             try:
#                 m = service.users().messages().get(userId="me", id=msg["id"]).execute()
#                 snippet = m.get("snippet", "")
#                 headers = m.get("payload", {}).get("headers", [])
#                 subject = next((h["value"] for h in headers if h["name"] == "Subject"), "")
#                 date = next((h["value"] for h in headers if h["name"] == "Date"), "")
#                 from_head = next((h["value"] for h in headers if h["name"] == "From"), "")
#                 full_text = f"{subject} {snippet} {from_head}"
#                 category = classify_email(full_text)
#                 db.collection("emails").document(msg["id"]).set({
#                     "id": msg["id"],
#                     "subject": subject,
#                     "snippet": snippet,
#                     "date": date,
#                     "from": from_head,
#                     "category": category,
#                     "created_at": firestore.SERVER_TIMESTAMP,
#                 }, merge=True)
#             except Exception:
#                 print(f"❌ Failed to process message id={msg.get('id')}")
#                 traceback.print_exc()
#         return {"status": "ok", "message": f"Synced {len(messages)} emails."}
#     except Exception:
#         print("❌ Error fetching emails from Gmail API")
#         traceback.print_exc()
#         return {"status": "error", "message": "Exception while fetching emails."}

from email.utils import parsedate_to_datetime

def fetch_emails_internal(days_back: int = 15):
    creds = load_creds()
    if creds is None:
        return {"status": "no_creds", "message": "No Gmail credentials found. Please link Gmail via /authorize."}

    creds = refresh_creds_if_needed(creds)
    if creds is None:
        return {"status": "error", "message": "Failed to refresh credentials."}

    try:
        service = build("gmail", "v1", credentials=creds)

        # Date filter
        date_7 = (datetime.datetime.utcnow() - datetime.timedelta(days=days_back)).strftime("%Y/%m/%d")
        query = f"after:{date_7}"

        # Fetch list
        results = service.users().messages().list(userId="me", q=query, maxResults=50).execute()
        messages = results.get("messages", [])

        if not messages:
            return {"status": "ok", "message": "No new emails."}

        for msg in messages:
            try:
                m = service.users().messages().get(userId="me", id=msg["id"]).execute()

                snippet = m.get("snippet", "")
                headers = m.get("payload", {}).get("headers", [])

                subject = next((h["value"] for h in headers if h["name"] == "Subject"), "")
                date_raw = next((h["value"] for h in headers if h["name"] == "Date"), "")
                from_head = next((h["value"] for h in headers if h["name"] == "From"), "")

                full_text = f"{subject} {snippet} {from_head}"
                category = classify_email(full_text)

                # Convert Gmail date string → python datetime → Firestore timestamp
                try:
                    parsed_date = parsedate_to_datetime(date_raw) if date_raw else None
                except:
                    parsed_date = None

                # Save to Firestore
                db.collection("emails").document(msg["id"]).set({
                    "id": msg["id"],
                    "subject": subject,
                    "snippet": snippet,
                    "date": parsed_date,                 # Timestamp stored properly
                    "from": from_head,
                    "category": category,
                    "created_at": firestore.SERVER_TIMESTAMP,
                }, merge=True)

            except Exception:
                print(f"❌ Failed to process message id={msg.get('id')}")
                traceback.print_exc()

        return {"status": "ok", "message": f"Synced {len(messages)} emails."}

    except Exception:
        print("❌ Error fetching emails from Gmail API")
        traceback.print_exc()
        return {"status": "error", "message": "Exception while fetching emails."}

@app.route("/fetch-emails")
def fetch_emails():
    res = fetch_emails_internal(days_back=7)
    status_code = 200
    if res["status"] == "no_creds":
        status_code = 401
    elif res["status"] == "error":
        status_code = 500
    return jsonify(res), status_code

@app.route("/api/emails/<category>")
def get_email_category(category):
    try:
        docs = db.collection("emails").where("category", "==", category).stream()
        return jsonify([d.to_dict() for d in docs])
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/emails/<email_id>", methods=["DELETE"])
def delete_email(email_id):
    try:
        db.collection("emails").document(email_id).delete()
        return jsonify({"status": "ok", "message": f"Email {email_id} deleted."})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------------------
# AUTO SYNC
# -------------------------------
def auto_sync():
    with app.app_context():
        print("⏳ Auto-sync running...", datetime.datetime.utcnow().isoformat())
        res = fetch_emails_internal(days_back=7)
        print("⏳ Auto-sync result:", res)

scheduler = BackgroundScheduler()
scheduler.add_job(func=auto_sync, trigger="interval", seconds=60)
scheduler.start()

# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    print("🚀 Starting QURIO Gmail backend...")
    app.run()
