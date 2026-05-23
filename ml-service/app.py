"""Flask API for transaction narration classification."""

from pathlib import Path

import joblib
from flask import Flask, jsonify, request

MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "xgb_model.pkl"
VECTORIZER_PATH = MODEL_DIR / "vectorizer.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"

app = Flask(__name__)

model = None
vectorizer = None
label_encoder = None


def load_artifacts() -> None:
    global model, vectorizer, label_encoder
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Missing {MODEL_PATH}. Run: python train.py (from ml-service with venv active)"
        )
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)


@app.get("/health")
def health():
    ready = MODEL_PATH.exists()
    return jsonify({"status": "ok" if ready else "models_missing", "models_ready": ready})


@app.post("/classify")
def classify():
    if model is None:
        return jsonify({"error": "Models not loaded. Run python train.py first."}), 503

    narrations = request.get_json(silent=True)
    if not isinstance(narrations, list) or not narrations:
        return jsonify({"error": "Expected a JSON array of narrations"}), 400

    texts = [str(n) for n in narrations]
    features = vectorizer.transform(texts)
    encoded = model.predict(features)
    categories = label_encoder.inverse_transform(encoded).tolist()
    return jsonify(categories)


if __name__ == "__main__":
    load_artifacts()
    app.run(host="0.0.0.0", port=5000, debug=True)
