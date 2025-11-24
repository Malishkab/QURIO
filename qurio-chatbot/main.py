from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import os
import pickle
import time
import firebase_admin
from firebase_admin import credentials, firestore

# =============================
# 🔥 FIREBASE SETUP
# =============================
cred = credentials.Certificate("quriomailfirebase.json")  # your downloaded Firebase key file
firebase_admin.initialize_app(cred)
db = firestore.client()

# =============================
# 📧 GMAIL SETUP
# =============================
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def connect_gmail():
    creds = None
    if os.path.exists('token.pkl'):
        with open('token.pkl', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=8080)
        with open('token.pkl', 'wb') as token:
            pickle.dump(creds, token)
    service = build('gmail', 'v1', credentials=creds)
    print("Gmail Connected Successfully!")
    return service


# =============================
# 📬 EMAIL FETCH + FIREBASE SAVE
# =============================
def get_latest_emails(service):
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=10).execute()
    messages = results.get('messages', [])

    for msg in messages:
        msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
        headers = msg_data['payload']['headers']

        # Extract metadata
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "")
        date = next((h['value'] for h in headers if h['name'] == 'Date'), "No Date Available")
        snippet = msg_data.get('snippet', "")

        # Categorize emails
        category = None
        if any(word in subject.lower() for word in ['internship', 'placement', 'hiring', 'career']):
            category = "Internship"
        elif any(word in subject.lower() for word in ['event', 'webinar', 'workshop', 'conference']):
            category = "Event"
        elif any(word in subject.lower() for word in ['hackathon', 'competition', 'challenge']):
            category = "Hackathon"

        # Store categorized mail in Firebase
        if category:
            print(f"{category.upper()}: {subject} — 🗓️ {date}")
            doc_ref = db.collection("emails").document(msg['id'])
            doc_ref.set({
                "category": category,
                "id": msg['id'],
                "subject": subject,
                "date": date,
                "snippet": snippet,
                "timestamp": firestore.SERVER_TIMESTAMP
            }, merge=True)

    return messages


# =============================
# 🚀 MAIN LOOP
# =============================
if __name__ == "__main__":
    print("Fetching and uploading emails once...")
    service = connect_gmail()
    get_latest_emails(service)
    print("Done! Emails uploaded to Firestore.")







# from google_auth_oauthlib.flow import InstalledAppFlow
# from googleapiclient.discovery import build
# from google.auth.transport.requests import Request
# import os
# import pickle
# import time

# SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# def connect_gmail():
#     creds = None
#     # Load saved token if exists
#     if os.path.exists('token.pkl'):
#         with open('token.pkl', 'rb') as token:
#             creds = pickle.load(token)
#     if not creds or not creds.valid:
#         if creds and creds.expired and creds.refresh_token:
#             creds.refresh(Request())
#         else:
#             flow = InstalledAppFlow.from_client_secrets_file(
#                 'credentials.json', SCOPES
#             )
#             creds = flow.run_local_server(port=8080)
#         # Save token
#         with open('token.pkl', 'wb') as token:
#             pickle.dump(creds, token)
#     service = build('gmail', 'v1', credentials=creds)
#     print("✅ Gmail Connected Successfully!")
#     return service

# def get_latest_emails(service):
#     results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=30).execute()
#     messages = results.get('messages', [])
#     for msg in messages:
#         msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
#         headers = msg_data['payload']['headers']

#         # Extract Subject
#         subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "")

#         # Extract Date
#         date = next((h['value'] for h in headers if h['name'] == 'Date'), "No Date Available")

#         # Email snippet (preview)
#         snippet = msg_data.get('snippet', "")

#         # Filter for important keywords
#         if any(word in subject.lower() for word in ['internship', 'placement', 'hiring', 'career']):
#             print(f"🌟 INTERNSHIPS: {subject} — 🗓️ {date}")
#         elif any(word in subject.lower() for word in ['event', 'webinar', 'workshop', 'conference']):
#             print(f"🌟 EVENTS: {subject} — 🗓️ {date}")
#         elif any(word in subject.lower() for word in ['hackathon', 'competition', 'challenge']):
#             print(f"🌟 HACKATHONS: {subject} — 🗓️ {date}")

#     return messages

# # def get_latest_emails(service):
# #     results = service.users().messages().list(
# #         userId='me', labelIds=['INBOX'], maxResults=30
# #     ).execute()
# #     messages = results.get('messages', [])

# #     for msg in messages:
# #         msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
# #         headers = msg_data['payload']['headers']
# #         subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "")
# #         snippet = msg_data.get('snippet', "")

# #         # Filter for important keywords
# #         if any(word in subject.lower() for word in ['internship', 'placement', 'hiring', 'career']):
# #             print(f"🌟 INTERNSHIPS: {subject}")
# #         elif any(word in subject.lower() for word in ['event', 'webinar', 'workshop', 'conference']):
# #             print(f"🌟 EVENTS: {subject}")
# #         elif any(word in subject.lower() for word in ['hackathon', 'competition', 'challenge']):
# #             print(f"🌟 HACKATHONS: {subject}")
# #         # else:
# #             # print(f"📩 General: {subject}")

# #     return messages


# if __name__ == "__main__":
#     service = connect_gmail()
#     seen_ids = set()

#     while True:
#         print("\n🔄 Checking new emails...")
#         messages = get_latest_emails(service)
#         for msg in messages:
#             seen_ids.add(msg['id'])
#         time.sleep(120)  # check every 2 minutes


