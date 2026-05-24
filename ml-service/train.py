"""
Train multi-feature XGBoost with ColumnTransformer pipeline.

Features used:
  - narration (text)  -> TfidfVectorizer
  - amount   (float)  -> StandardScaler
  - type     (str)    -> OneHotEncoder (CREDIT/DEBIT)

The entire pipeline is saved as a single xgb_pipeline.pkl.
"""

import csv
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

BANK_DATA_PATH = Path(__file__).parent / "data" / "bankstatements.csv"
LEGACY_DATA_PATH = Path(__file__).parent / "data" / "transactions.csv"
MODEL_DIR = Path(__file__).parent / "models"
PIPELINE_PATH = MODEL_DIR / "xgb_pipeline.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"

# ── Keep backward compat artifacts ──
LEGACY_MODEL_PATH = MODEL_DIR / "xgb_model.pkl"
LEGACY_VECTORIZER_PATH = MODEL_DIR / "vectorizer.pkl"


# ──────────────────────────────────────────────────────────────
# 1. Data ingestion helpers
# ──────────────────────────────────────────────────────────────

def build_narration(mode: str, name: str) -> str:
    mode = (mode or "").strip()
    name = (name or "").strip()
    if mode and name:
        return f"{mode} {name}"
    return name or mode or "BANK TRANSACTION"


def resolve_type(drcr: str) -> str:
    """Map DrCr column to CREDIT/DEBIT."""
    drcr = (drcr or "").strip().lower()
    if drcr.startswith("cr"):
        return "CREDIT"
    return "DEBIT"


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
    if ("STATEBAN" in text or "UPI" in text) and drcr.startswith("db"):
        return "Transfer"
    if drcr.startswith("cr"):
        return "Income"
    return "Shopping"


# ──────────────────────────────────────────────────────────────
# 2. Data loading
# ──────────────────────────────────────────────────────────────

def load_from_bank_csv() -> pd.DataFrame:
    """Load bankstatements.csv → DataFrame(narration, amount, type, category)."""
    records = []
    with BANK_DATA_PATH.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            narration = build_narration(row.get("mode", ""), row.get("name", ""))
            amount = float(row.get("amount", 0) or 0)
            txn_type = resolve_type(row.get("DrCr", ""))
            category = infer_category(row.get("mode", ""), row.get("name", ""), row.get("DrCr", ""))
            records.append({
                "narration": narration,
                "amount": amount,
                "type": txn_type,
                "category": category,
            })
    return pd.DataFrame(records)


def load_labeled_csv(path: Path) -> pd.DataFrame:
    """Load a previously exported transactions.csv."""
    df = pd.read_csv(path, encoding="utf-8")
    required = {"narration", "category"}
    if not required.issubset(df.columns):
        raise ValueError(f"{path} must have columns: {required}")
    df = df.dropna(subset=["narration", "category"])
    df = df[df["narration"].str.strip() != ""]
    # Backfill missing columns for legacy data
    if "amount" not in df.columns:
        df["amount"] = 0.0
    if "type" not in df.columns:
        df["type"] = "DEBIT"
    return df[["narration", "amount", "type", "category"]]


def export_training_csv(df: pd.DataFrame) -> None:
    df.to_csv(LEGACY_DATA_PATH, index=False, encoding="utf-8")
    print(f"Wrote {len(df)} training rows to {LEGACY_DATA_PATH}")


# ──────────────────────────────────────────────────────────────
# 3. Pipeline construction & training
# ──────────────────────────────────────────────────────────────

def build_pipeline() -> Pipeline:
    """
    Multi-feature pipeline:
      narration → TfidfVectorizer (text features)
      amount    → StandardScaler  (numerical)
      type      → OneHotEncoder   (categorical: CREDIT/DEBIT)
    All combined via ColumnTransformer → XGBClassifier
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ("text", TfidfVectorizer(max_features=8000, ngram_range=(1, 2), min_df=1), "narration"),
            ("num",  StandardScaler(), ["amount"]),
            ("cat",  OneHotEncoder(handle_unknown="ignore"), ["type"]),
        ],
        remainder="drop",
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", XGBClassifier(
            n_estimators=150,
            max_depth=8,
            learning_rate=0.1,
            random_state=42,
            eval_metric="mlogloss",
        )),
    ])
    return pipeline


def main() -> None:
    # ── Load data ──
    if BANK_DATA_PATH.exists():
        df = load_from_bank_csv()
        export_training_csv(df)
    elif LEGACY_DATA_PATH.exists():
        df = load_labeled_csv(LEGACY_DATA_PATH)
    else:
        raise FileNotFoundError(f"No training data at {BANK_DATA_PATH} or {LEGACY_DATA_PATH}")

    n_categories = df["category"].nunique()
    print(f"Training on {len(df)} samples, {n_categories} categories")
    print(f"  Features: narration (text), amount (float), type (CREDIT/DEBIT)")
    print(f"  Category distribution:\n{df['category'].value_counts().to_string()}\n")

    # ── Encode labels ──
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["category"])

    # ── Build pipeline ──
    pipeline = build_pipeline()

    # ── Train + evaluate ──
    min_samples_for_holdout = 50
    if len(df) >= min_samples_for_holdout:
        X_train, X_test, y_train, y_test = train_test_split(
            df[["narration", "amount", "type"]], y,
            test_size=0.2, random_state=42, stratify=y,
        )
        pipeline.fit(X_train, y_train)
        accuracy = pipeline.score(X_test, y_test)
        print(f"Hold-out validation accuracy: {accuracy:.2%}")

        # Cross-validation for extra credibility
        if len(df) >= 100:
            cv_scores = cross_val_score(pipeline, df[["narration", "amount", "type"]], y, cv=5, scoring="accuracy")
            print(f"5-fold CV accuracy: {cv_scores.mean():.2%} (±{cv_scores.std():.2%})")
    else:
        pipeline.fit(df[["narration", "amount", "type"]], y)
        accuracy = pipeline.score(df[["narration", "amount", "type"]], y)
        print(f"Training accuracy (all data): {accuracy:.2%}")

    # ── Save ──
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, PIPELINE_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)
    print(f"\nSaved pipeline → {PIPELINE_PATH}")
    print(f"Saved label encoder → {LABEL_ENCODER_PATH}")


if __name__ == "__main__":
    main()
