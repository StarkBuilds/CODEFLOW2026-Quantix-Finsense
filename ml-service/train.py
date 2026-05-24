"""Train XGBoost on bank statement narrations (from bankstatements.csv)."""

import csv
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

BANK_DATA_PATH = Path(__file__).parent / "data" / "bankstatements.csv"
LEGACY_DATA_PATH = Path(__file__).parent / "data" / "transactions.csv"
MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "xgb_model.pkl"
VECTORIZER_PATH = MODEL_DIR / "vectorizer.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"


def build_narration(mode: str, name: str) -> str:
    mode = (mode or "").strip()
    name = (name or "").strip()
    if mode and name:
        return f"{mode} {name}"
    return name or mode or "BANK TRANSACTION"


def infer_category(mode: str, name: str, drcr: str) -> str:
    text = f"{mode} {name}".upper()
    drcr = (drcr or "").strip().lower()

    if "SBINT" in text or "INTEREST" in text:
        return "Income"
    if drcr.startswith("cr") and ("NEFT" in text or "ECS" in text) and not name.strip():
        return "Salary"
    if "EMI" in text or "LOAN" in text or "CREDIT CARD" in text:
        return "EMI"
    if "FLIPKART" in text or "AMAZON" in text or "MYNTRA" in text or "GOASELEC" in text:
        return "Shopping"
    if "SWIGGY" in text or "ZOMATO" in text or "DOMINOS" in text:
        return "Food"
    if "UBER" in text or "OLA" in text or "RAPIDO" in text or "METRO" in text:
        return "Transport"
    if "NETFLIX" in text or "SPOTIFY" in text or "PVR" in text or "BOOKMYSHOW" in text:
        return "Entertainment"
    if "APOLLO" in text or "PHARMACY" in text or "HOSPITAL" in text or "1MG" in text:
        return "Healthcare"
    if "BESCOM" in text or "JIO" in text or "AIRTEL" in text or "ELECTRICITY" in text:
        return "Utilities"
    if "ATM" in text:
        return "Cash"
    if "DEBIT CARD ANNUAL" in text:
        return "Banking"
    if "PHONEPE" in text:
        return "Utilities"
    if "STATEBAN" in text or "UPI" in text and drcr.startswith("db"):
        return "Transfer"
    if drcr.startswith("cr"):
        return "Income"
    return "Shopping"


def load_from_bank_csv() -> tuple[list[str], list[str]]:
    narrations: list[str] = []
    categories: list[str] = []
    with BANK_DATA_PATH.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            narration = build_narration(row.get("mode", ""), row.get("name", ""))
            category = infer_category(row.get("mode", ""), row.get("name", ""), row.get("DrCr", ""))
            narrations.append(narration)
            categories.append(category)
    return narrations, categories


def load_labeled_csv(path: Path) -> tuple[list[str], list[str]]:
    narrations: list[str] = []
    categories: list[str] = []
    with path.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            narration = (row.get("narration") or "").strip()
            category = (row.get("category") or "").strip()
            if narration and category:
                narrations.append(narration)
                categories.append(category)
    return narrations, categories


def export_training_csv(narrations: list[str], categories: list[str]) -> None:
    out = LEGACY_DATA_PATH
    with out.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["narration", "category"])
        writer.writerows(zip(narrations, categories, strict=True))
    print(f"Wrote {len(narrations)} training rows to {out}")


def main() -> None:
    if BANK_DATA_PATH.exists():
        narrations, categories = load_from_bank_csv()
        export_training_csv(narrations, categories)
    elif LEGACY_DATA_PATH.exists():
        narrations, categories = load_labeled_csv(LEGACY_DATA_PATH)
    else:
        raise FileNotFoundError(f"No training data at {BANK_DATA_PATH} or {LEGACY_DATA_PATH}")

    print(f"Training on {len(narrations)} labeled narrations, {len(set(categories))} categories")

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(categories)

    vectorizer = TfidfVectorizer(max_features=8000, ngram_range=(1, 2), min_df=1)
    X = vectorizer.fit_transform(narrations)

    model = XGBClassifier(
        n_estimators=120,
        max_depth=8,
        learning_rate=0.1,
        random_state=42,
    )

    min_samples_for_holdout = 50
    if len(narrations) >= min_samples_for_holdout:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        model.fit(X_train, y_train)
        accuracy = model.score(X_test, y_test)
        print(f"Hold-out validation accuracy: {accuracy:.2%}")
    else:
        model.fit(X, y)
        accuracy = model.score(X, y)
        print(f"Training accuracy (all data): {accuracy:.2%}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)
    print(f"Saved model artifacts to {MODEL_DIR}/")


if __name__ == "__main__":
    main()
