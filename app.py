
from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

# Maximum upload size: 2 MB
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024


# Homepage
@app.route("/")
def home():
    return render_template("index.html")


# Common function to detect and redact sensitive information
def scan_text(text):

    patterns = {
        "Email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',

        "Aadhaar-like Number": r'(?<!\d)(?:\d{4}[\s-]?){2}\d{4}(?!\d)',

        "Phone Number": r'(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)'
    }

    matches = []
    detections = []

    # Find sensitive information
    for category, pattern in patterns.items():

        for match in re.finditer(pattern, text):

            matches.append({
                "category": category,
                "value": match.group(),
                "start": match.start(),
                "end": match.end()
            })

    # Sort matches by position
    matches.sort(key=lambda item: item["start"])

    # Avoid overlapping detections
    valid_matches = []
    last_end = 0

    for item in matches:

        if item["start"] >= last_end:
            valid_matches.append(item)
            last_end = item["end"]

    # Create protected text
    redacted_text = ""
    last_end = 0

    for item in valid_matches:

        redacted_text += text[last_end:item["start"]]

        if item["category"] == "Email":
            replacement = "[EMAIL HIDDEN]"

        elif item["category"] == "Phone Number":
            replacement = "[PHONE NUMBER HIDDEN]"

        else:
            replacement = "[AADHAAR NUMBER HIDDEN]"

        redacted_text += replacement
        last_end = item["end"]

        detections.append({
            "category": item["category"],
            "value": item["value"]
        })

    redacted_text += text[last_end:]

    return {
        "detections": detections,
        "total": len(detections),
        "redacted_text": redacted_text
    }


# Scan pasted text
@app.route("/scan", methods=["POST"])
def scan():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request"}), 400

    text = data.get("text", "")

    if not isinstance(text, str):
        return jsonify({"error": "Invalid text input"}), 400

    return jsonify(scan_text(text))


# Upload and scan TXT file
@app.route("/scan-file", methods=["POST"])
def scan_file():

    uploaded_file = request.files.get("file")

    if not uploaded_file or uploaded_file.filename == "":
        return jsonify({"error": "Please select a TXT file"}), 400

    # Check file extension
    if not uploaded_file.filename.lower().endswith(".txt"):
        return jsonify({"error": "Only TXT files are allowed"}), 400

    file_content = uploaded_file.read()

    if not file_content:
        return jsonify({"error": "The uploaded file is empty"}), 400

    try:
        # Read UTF-8 files, including files with a BOM
        text = file_content.decode("utf-8-sig")

    except UnicodeDecodeError:
        # Try another common text encoding
        try:
            text = file_content.decode("cp1252")
        except UnicodeDecodeError:
            return jsonify({"error": "Unable to read this text file"}), 400

    if "\x00" in text:
        return jsonify({"error": "The selected file does not appear to be a text file"}), 400

    if not text.strip():
        return jsonify({"error": "The uploaded file contains no text"}), 400

    return jsonify(scan_text(text))


# Handle files larger than the upload limit
@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "File is too large. Maximum allowed size is 2 MB."
    }), 413


if __name__ == "__main__":
    app.run(debug=True)
