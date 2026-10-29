import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib
import os

# Load dataset
current_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(current_dir, "dataset.csv")
data = pd.read_csv(dataset_path)

# Features (input data)
X = data[["progress", "lessonsCompleted", "loginCount", "daysInactive"]]

# Target (prediction label)
y = data["dropout"]

# Split dataset into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create model
model = LogisticRegression()

# Train model
model.fit(X_train, y_train)

# Test model
predictions = model.predict(X_test)

# Evaluate accuracy
accuracy = accuracy_score(y_test, predictions)
print("Model Accuracy:", accuracy)

# Save trained model
model_path = os.path.join(current_dir, "dropout_model.pkl")
joblib.dump(model, model_path)

print("Model trained and saved successfully")