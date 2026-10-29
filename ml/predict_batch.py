import joblib
import numpy as np
import sys
import json
import os

def load_or_train_model(model_path: str):
    if os.path.exists(model_path):
        return joblib.load(model_path)

    import pandas as pd
    from sklearn.linear_model import LogisticRegression

    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "dataset.csv")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(
            f"Model not found at {model_path} and dataset.csv missing at {dataset_path}"
        )

    data = pd.read_csv(dataset_path)
    X = data[["progress", "lessonsCompleted", "loginCount", "daysInactive"]]
    y = data["dropout"]

    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    joblib.dump(model, model_path)
    return model

# locate model file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "dropout_model.pkl")

model = load_or_train_model(model_path)

# read JSON input from Node
data_json = sys.stdin.read()
data = json.loads(data_json)

X = np.array([
    [
        item["progress"],
        item["lessonsCompleted"],
        item["loginCount"],
        item["daysInactive"]
    ]
    for item in data
])

predictions = model.predict_proba(X)

results = []

for i, item in enumerate(data):
    risk = predictions[i][1]

    results.append({
        "studentId": item["studentId"],
        "courseId": item["courseId"],
        "risk": float(risk)
    })

print(json.dumps(results))