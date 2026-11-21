
from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)


# Homepage
@app.route("/")
def home():
    return render_template("index.html")


# Scan text for sensitive information
@app.route("/scan", methods=["POST"])
def scan():

    data = request.get_json()
    text = data.get("text", "")

    if not isinstance(text, str):
        return jsonify({"error": "Invalid text input"}), 400

    # Detection patterns
    patterns = {
        "Email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',

        "Aadhaar-like Number": r'(?<!\d)(?:\d{4}[\s-]?){2}\d{4}(?!\d)',

        "Phone Number": r'(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)'
    }

    matches = []
    detections = []

    # Find matching information
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

        # Category-specific replacement
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

    return jsonify({
        "detections": detections,
        "total": len(detections),
        "redacted_text": redacted_text
    })


if __name__ == "__main__":
    app.run(debug=True)
