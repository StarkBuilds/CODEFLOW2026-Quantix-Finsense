# FinSense ML Service

## Why setup failed on Fedora (Python 3.14)

`pip install` was building **pandas** from source on Python 3.14 and failed (C++ compile error). This project no longer requires pandas. Prefer **Python 3.12** for pre-built wheels for scikit-learn and xgboost.

## Setup (recommended)

```bash
cd ml-service
rm -rf .venv   # remove broken venv if you already tried 3.14

# Use Python 3.12 if available (dnf install python3.12)
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python train.py
python app.py
```

If only `python3.11` is installed, use that instead of 3.12.

## Verify

```bash
curl http://localhost:5000/health
curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d '["UPI-SWIGGY-BANGALORE"]'
```

`POST /classify` accepts a JSON array of narrations and returns category strings.

## Training data format (`data/transactions.csv`)

Only two columns are required for ML training:

| Column | Purpose |
|--------|---------|
| `narration` | Bank description text (what the model learns from) |
| `category` | Correct label (Food, EMI, Salary, …) |

You do **not** put `transaction id`, `amount`, or `transactionHash` in this file. Those belong in the Java/PostgreSQL layer for security and deduplication, not in the classifier training set.

Add more real labeled rows (50+ recommended), then run `python train.py` again.
