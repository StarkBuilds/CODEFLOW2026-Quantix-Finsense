# FinSense ML Service

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train.py
python app.py
```

`POST /classify` accepts a JSON array of narrations and returns category strings.
