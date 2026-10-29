import pandas as pd
import numpy as np

rows = 200

data = {
    "progress": np.random.randint(0, 100, rows),
    "lessonsCompleted": np.random.randint(0, 20, rows),
    "loginCount": np.random.randint(0, 30, rows),
    "daysInactive": np.random.randint(0, 30, rows),
}  

df = pd.DataFrame(data) 
# Rule to simulate dropout behavior 
df["dropout"] = (
    (df["progress"] < 40) &
    (df["daysInactive"] > 10)
).astype(int)

df.to_csv("dataset.csv", index=False)


print("Dataset created successfully") 