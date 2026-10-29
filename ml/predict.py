import os
import sys

import joblib
import numpy as np


def load_or_train_model(model_path: str):
    """
    Ensure the model exists. If missing, train from dataset.csv next to this file.
    """
    if os.path.exists(model_path):
        return joblib.load(model_path)

    # Lazy import so prediction can still work when model exists.
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

# Get current file directory
current_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(current_dir, "dropout_model.pkl")

model = load_or_train_model(model_path)

# Read inputs
progress = float(sys.argv[1])
lessonsCompleted = float(sys.argv[2])
loginCount = float(sys.argv[3])
daysInactive = float(sys.argv[4])

data = np.array([[progress, lessonsCompleted, loginCount, daysInactive]])

prediction = model.predict_proba(data)

risk = prediction[0][1]

print(risk)