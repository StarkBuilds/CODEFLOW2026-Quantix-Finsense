"""Train XGBoost transaction category classifier (no pandas — Python 3.12+ friendly)."""

import csv
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

DATA_PATH = Path(__file__).parent / "data" / "transactions.csv"
MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "xgb_model.pkl"
VECTORIZER_PATH = MODEL_DIR / "vectorizer.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"


def load_training_data() -> tuple[list[str], list[str]]:
    narrations: list[str] = []
    categories: list[str] = []
    with DATA_PATH.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            narration = (row.get("narration") or "").strip()
            category = (row.get("category") or "").strip()
            if narration and category:
                narrations.append(narration)
                categories.append(category)
    if not narrations:
        raise ValueError("Training data must include 'narration' and 'category' rows")
    return narrations, categories


def main() -> None:
    narrations, categories = load_training_data()

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(categories)

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X = vectorizer.fit_transform(narrations)

    model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
    )

    # With few rows, a random 20% hold-out can leave out whole categories and break XGBoost.
    min_samples_for_holdout = 50
    if len(narrations) >= min_samples_for_holdout:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        model.fit(X_train, y_train)
        accuracy = model.score(X_test, y_test)
        print(f"Hold-out validation accuracy: {accuracy:.2%}")
    else:
        print(
            f"Small dataset ({len(narrations)} rows): training on all samples "
            "(add more rows to transactions.csv for a proper hold-out split)."
        )
        model.fit(X, y)
        accuracy = model.score(X, y)
        print(f"Training accuracy (same data): {accuracy:.2%}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)
    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved vectorizer to {VECTORIZER_PATH}")
    print(f"Saved label encoder to {LABEL_ENCODER_PATH}")


if __name__ == "__main__":
    main()
