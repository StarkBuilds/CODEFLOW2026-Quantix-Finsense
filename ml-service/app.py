"""Flask API for multi-feature transaction classification.

Accepts JSON arrays of objects: [{"narration": "...", "amount": 100.0, "type": "DEBIT"}]
Returns: ["Shopping", "Food", ...]
"""

from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request

MODEL_DIR = Path(__file__).parent / "models"
PIPELINE_PATH = MODEL_DIR / "xgb_pipeline.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"

# Backward compat — old single-feature artifacts
LEGACY_MODEL_PATH = MODEL_DIR / "xgb_model.pkl"
LEGACY_VECTORIZER_PATH = MODEL_DIR / "vectorizer.pkl"

app = Flask(__name__)

pipeline = None
label_encoder = None
legacy_mode = False  # True if only old artifacts are available


def load_artifacts() -> None:
    global pipeline, label_encoder, legacy_mode

    if PIPELINE_PATH.exists():
        pipeline = joblib.load(PIPELINE_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        legacy_mode = False
        print(f"Loaded multi-feature pipeline from {PIPELINE_PATH}")
    elif LEGACY_MODEL_PATH.exists():
        # Fallback: wrap old model+vectorizer so /classify still works
        model = joblib.load(LEGACY_MODEL_PATH)
        vectorizer = joblib.load(LEGACY_VECTORIZER_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        pipeline = (vectorizer, model)  # tuple signals legacy mode
        legacy_mode = True
        print(f"Loaded legacy (narration-only) model from {LEGACY_MODEL_PATH}")
    else:
        raise FileNotFoundError(
            f"No model artifacts found. Run: python train.py (from ml-service with venv active)"
        )


@app.get("/health")
def health():
    ready = PIPELINE_PATH.exists() or LEGACY_MODEL_PATH.exists()
    mode = "pipeline" if PIPELINE_PATH.exists() else "legacy" if LEGACY_MODEL_PATH.exists() else "none"
    return jsonify({"status": "ok" if ready else "models_missing", "models_ready": ready, "mode": mode})


@app.post("/classify")
def classify():
    if pipeline is None:
        return jsonify({"error": "Models not loaded. Run python train.py first."}), 503

    payload = request.get_json(silent=True)
    if not isinstance(payload, list) or not payload:
        return jsonify({"error": "Expected a JSON array of objects or strings"}), 400

    # ── New format: [{"narration": "...", "amount": 100.0, "type": "DEBIT"}, ...]
    if isinstance(payload[0], dict):
        df = pd.DataFrame(payload)
        # Ensure required columns exist with defaults
        if "narration" not in df.columns:
            return jsonify({"error": "Each object must have a 'narration' field"}), 400
        if "amount" not in df.columns:
            df["amount"] = 0.0
        if "type" not in df.columns:
            df["type"] = "DEBIT"
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)

        if legacy_mode:
            # Use old vectorizer+model with just narration
            vectorizer, model = pipeline
            features = vectorizer.transform(df["narration"].tolist())
            encoded = model.predict(features)
        else:
            encoded = pipeline.predict(df[["narration", "amount", "type"]])

        categories = label_encoder.inverse_transform(encoded).tolist()
        return jsonify(categories)

    # ── Legacy format: ["narration1", "narration2", ...]  (backward compatible)
    texts = [str(n) for n in payload]
    if legacy_mode:
        vectorizer, model = pipeline
        features = vectorizer.transform(texts)
        encoded = model.predict(features)
    else:
        # Wrap strings into DataFrame with defaults
        df = pd.DataFrame({
            "narration": texts,
            "amount": [0.0] * len(texts),
            "type": ["DEBIT"] * len(texts),
        })
        encoded = pipeline.predict(df[["narration", "amount", "type"]])

    categories = label_encoder.inverse_transform(encoded).tolist()
    return jsonify(categories)


@app.post("/train")
def train_model():
    try:
        import train
        train.main()
        load_artifacts()
        return jsonify({"status": "success", "message": "Model retrained successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    load_artifacts()
    app.run(host="0.0.0.0", port=5000, debug=True)
