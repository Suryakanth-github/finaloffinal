from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

DATABRICKS_TOKEN = os.getenv("dapie72d1da7d09196e0545ab16ee51cd515")
ENDPOINT_URL = "https://adb-1068208383722178.18.azuredatabricks.net/serving-endpoints/mindmatever/invocations"

@app.route("/api/respond", methods=["POST"])
def respond():
    data = request.get_json()
    user_text = data.get("text")
    if not user_text:
        return jsonify({"error": "No input text"}), 400

    headers = {
        "Authorization": f"Bearer dapie72d1da7d09196e0545ab16ee51cd515",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": {
            "text": [user_text]
        }
    }

    try:
        response = requests.post(ENDPOINT_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
