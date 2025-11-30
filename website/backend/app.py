# backend/app.py
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import csv
import os
from datetime import datetime
from pathlib import Path

# If your frontend lives in ../frontend relative to this backend folder,
# the app will try to serve it. Otherwise it falls back to a small HTML page.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR) if FRONTEND_DIR.exists() else None,
    static_url_path=""  # allow serving index.html at root when static_folder provided
)
CORS(app)

CONTACTS_FILE = 'contacts.csv'
CONTACTS_FIELDS = ['created', 'name', 'details', 'message', 'user_agent', 'source']


def init_contacts_file():
    if not os.path.exists(CONTACTS_FILE):
        with open(CONTACTS_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=CONTACTS_FIELDS)
            writer.writeheader()


@app.route("/", methods=["GET"])
def serve_root():
    """
    Serve frontend/index.html if it exists at ../frontend/index.html.
    Otherwise return a small API landing page explaining available endpoints.
    """
    if FRONTEND_DIR.exists() and (FRONTEND_DIR / "index.html").exists():
        # send the frontend index.html (static_folder was set)
        return send_from_directory(str(FRONTEND_DIR), "index.html")
    # fallback landing HTML
    return """
    <html>
      <head><title>TechPro API</title></head>
      <body style="font-family:system-ui,Arial,sans-serif;line-height:1.5;padding:24px">
        <h2>TechPro Projects — API</h2>
        <p>No frontend found in <code>../frontend</code>. Available endpoints:</p>
        <ul>
          <li><strong>GET</strong> <a href="/api/contacts">/api/contacts</a> — list saved contacts</li>
          <li><strong>POST</strong> <code>/api/contact</code> — accept JSON {name,details,message}</li>
        </ul>
        <p>To serve your existing frontend at this URL, place your frontend files in <code>../frontend</code> relative to this file, or run your frontend separately (e.g. <code>python -m http.server</code>).</p>
      </body>
    </html>
    """


@app.route("/api/contact", methods=["POST"])
def api_contact():
    init_contacts_file()

    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"ok": False, "error": "invalid_json"}), 400

    name = (data.get("name") or "").strip()
    details = (data.get("details") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not details or not message:
        return jsonify({"ok": False, "error": "missing_fields"}), 400

    meta = data.get("meta") or {}
    user_agent = meta.get("userAgent") or request.headers.get("User-Agent", "")
    source = meta.get("source") or "techpro-spa"

    row = {
        "created": datetime.utcnow().isoformat(),
        "name": name,
        "details": details,
        "message": message,
        "user_agent": user_agent,
        "source": source,
    }

    with open(CONTACTS_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CONTACTS_FIELDS)
        writer.writerow(row)

    return jsonify({"ok": True})


@app.route("/api/contacts", methods=["GET"])
def api_contacts():
    init_contacts_file()
    rows = []
    with open(CONTACTS_FILE, mode='r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    return jsonify({"ok": True, "items": rows})


# Optional: serve other frontend static assets (JS/CSS) if frontend exists.
@app.route("/<path:filename>")
def serve_static(filename):
    if FRONTEND_DIR.exists() and (FRONTEND_DIR / filename).exists():
        return send_from_directory(str(FRONTEND_DIR), filename)
    # If not a static file, return 404 to let client-side SPA handle routes when served separately.
    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
