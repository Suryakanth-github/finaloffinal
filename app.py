from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sklearn.preprocessing import LabelEncoder
import torch

from huggingface_hub import login
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")



# print(HUGGINGFACE_TOKEN)  # Test if the token loads correctly


app = Flask(__name__)
CORS(app)

# ---------------- Load models & tokenizer ----------------
# Use tiny BERT for fast emotion detection
model_name = "prajjwal1/bert-tiny"
tokenizer = AutoTokenizer.from_pretrained(model_name)
emotion_model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Label encoder from training
labels = [
    "afraid", "angry", "annoyed", "anxious", "apprehensive", "confident",
    "content", "devastated", "disappointed", "embarrassed", "excited",
    "grateful", "guilty", "hopeful", "impressed", "jealous", "joyful",
    "lonely", "nostalgic", "prepared", "proud", "sad", "sentimental", "surprised"
]
le = LabelEncoder()
le.fit(labels)

# DialoGPT for response
reply_gen = pipeline("text-generation", model="microsoft/DialoGPT-medium")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
emotion_model.to(device)


# ---------------- Logic functions ----------------

def detect_text_emotion(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(device)
    with torch.no_grad():
        logits = emotion_model(**inputs).logits
    pred = torch.argmax(logits, dim=1).item()
    return le.classes_[pred]

def generate_empathetic_reply(user_text, emotion):
    prompt = (
        "You are a caring and supportive AI friend.\n"
        f"The user feels {emotion}.\n"
        f"The user says: \"{user_text}\"\n"
        "Your empathetic response:"
    )

    response = reply_gen(
        prompt,
        max_new_tokens=100,
        temperature=0.8,
        top_p=0.95,
        do_sample=True
    )[0]["generated_text"]

    # Trim after prompt
    if "empathetic response:" in response:
        reply = response.split("empathetic response:")[-1].strip()
    else:
        reply = response.strip()

    return reply if reply else "I'm here for you. You're not alone."


# ---------------- API endpoint ----------------

@app.route("/api/respond", methods=["POST"])
def respond():
    data = request.get_json()
    user_text = data.get("text", "")
    
    if not user_text:
        return jsonify({"error": "No text provided"}), 400

    emotion = detect_text_emotion(user_text)
    reply = generate_empathetic_reply(user_text, emotion)

    return jsonify({
        "emotion": emotion,
        "reply": reply
    })

@app.route("/health", methods=["GET"])
def health_check():
    try:
        # Check emotion detection model
        _ = tokenizer("Test", return_tensors="pt").to(device)
        _ = emotion_model.to(device)
        
        # Check LabelEncoder
        assert len(le.classes_) > 0

        # Check DialoGPT pipeline
        test_prompt = "The user feels sad.\nThe user says: 'I'm tired'\nYour empathetic response:"
        _ = reply_gen(test_prompt, max_new_tokens=5)

        return jsonify({"status": "ok", "message": "All models loaded successfully"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ---------------- Run server ----------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
