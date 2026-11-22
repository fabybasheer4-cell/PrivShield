
from flask import Flask, render_template, request, jsonify

from detector import scan_text


app = Flask(__name__)

# Maximum upload size: 2 MB
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024


# Homepage
@app.route("/")
def home():
    return render_template("index.html")

# Results page
@app.route("/results")
def results():
    return render_template("results.html")

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
        text = file_content.decode("utf-8-sig")

    except UnicodeDecodeError:

        try:
            text = file_content.decode("cp1252")

        except UnicodeDecodeError:
            return jsonify({"error": "Unable to read this text file"}), 400

    if "\x00" in text:
        return jsonify({
            "error": "The selected file does not appear to be a text file"
        }), 400

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
