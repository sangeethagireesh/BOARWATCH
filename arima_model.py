import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import adfuller
from sklearn.metrics import mean_squared_error

# ----------------------------
# 1️⃣ Load Dataset
# ----------------------------
df = pd.read_csv("data/synthetic_wild_boar_data.csv", parse_dates=["date"])
df.set_index("date", inplace=True)

print("First 5 rows:")
print(df.head())

# ----------------------------
# 2️⃣ Check Stationarity (ADF Test)
# ----------------------------
result = adfuller(df["night_detections"])

print("\nADF Statistic:", result[0])
print("p-value:", result[1])

if result[1] > 0.05:
    print("Data is NOT stationary → Differencing handled in SARIMA.")
else:
    print("Data is stationary.")

# ----------------------------
# 3️⃣ Train-Test Split
# ----------------------------
train_size = int(len(df) * 0.8)
train = df.iloc[:train_size]
test = df.iloc[train_size:]

print(f"\nTraining Data Size: {len(train)}")
print(f"Testing Data Size: {len(test)}")

# ----------------------------
# 4️⃣ Build SARIMA Model
# order = (p,d,q)
# seasonal_order = (P,D,Q,s)
# s = 7 → weekly seasonality
# ----------------------------
model = SARIMAX(train["night_detections"],
                order=(1,1,1),
                seasonal_order=(1,1,1,7),
                enforce_stationarity=False,
                enforce_invertibility=False)

model_fit = model.fit()

print("\nModel Summary:")
print(model_fit.summary())

# ----------------------------
# 5️⃣ Forecast with Confidence Interval
# ----------------------------
pred = model_fit.get_forecast(steps=len(test))

forecast = pred.predicted_mean
conf_int = pred.conf_int()

# ----------------------------
# 🚨 Wild Boar Activity Alerts
# ----------------------------
print("\nWild Boar Activity Alerts:")

threshold = 5   # activity level considered dangerous

for date, value in zip(test.index, forecast):

    if value >= threshold:
        print(f"{date.date()} → ⚠ HIGH RISK: Wild boar activity expected ({round(value)})")
    
    elif value >= 3:
        print(f"{date.date()} → ⚠ MEDIUM RISK: Moderate activity expected ({round(value)})")
    
    else:
        print(f"{date.date()} → LOW RISK ({round(value)})")

# ----------------------------
# 6️⃣ Evaluation
# ----------------------------
rmse = np.sqrt(mean_squared_error(test["night_detections"], forecast))
print("\nSARIMA RMSE:", rmse)

# ----------------------------
# 7️⃣ Plot Results
# ----------------------------
plt.figure(figsize=(12,6))

plt.plot(train.index, train["night_detections"], label="Train")
plt.plot(test.index, test["night_detections"], label="Test")
plt.plot(test.index, forecast, label="SARIMA Forecast")

# Confidence interval shading
plt.fill_between(test.index,
                 conf_int.iloc[:,0],
                 conf_int.iloc[:,1],
                 color="lightgreen",
                 alpha=0.3,
                 label="Confidence Interval")

plt.title("Wild Boar Activity Prediction using SARIMA")
plt.xlabel("Date")
plt.ylabel("Night Detections")
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()