import streamlit as st
import pydeck as pdk
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX

st.title("🐗 Wild Boar Activity Prediction System")

# ---------------------------------
# 1️⃣ Load Trivandrum Forest Locations
# ---------------------------------
locations = pd.read_csv("boar_locations.csv")

# ---------------------------------
# Generate simulated boar movement data
# ---------------------------------
heatmap_data = []

for i in range(100):

    location = locations.sample(1).iloc[0]

    lat = location["lat"] + np.random.normal(0, 0.01)
    lon = location["lon"] + np.random.normal(0, 0.01)

    intensity = np.random.randint(1, 10)

    heatmap_data.append([lat, lon, intensity])

heatmap_df = pd.DataFrame(heatmap_data, columns=["lat", "lon", "intensity"])

# Assign random risk levels (demo)
risk_levels = ["LOW", "MEDIUM", "HIGH"]
locations["risk"] = np.random.choice(risk_levels, len(locations))

# Risk color mapping
risk_colors = {
    "LOW": "green",
    "MEDIUM": "orange",
    "HIGH": "red"
}

locations["color"] = locations["risk"].map(risk_colors)

st.subheader("📍 Wild Boar Monitoring Locations")

st.write(locations)

# Map
st.map(locations.rename(columns={"lat": "latitude", "lon": "longitude"}))

st.subheader("🔥 Wild Boar Movement Heatmap")

heatmap_layer = pdk.Layer(
    "HeatmapLayer",
    data=heatmap_df,
    get_position='[lon, lat]',
    get_weight="intensity",
    radiusPixels=60,
)

view_state = pdk.ViewState(
    latitude=8.7,
    longitude=77.05,
    zoom=9,
    pitch=40,
)

st.pydeck_chart(pdk.Deck(
    layers=[heatmap_layer],
    initial_view_state=view_state,
))

# Show location risk status
st.subheader("📍 Location Risk Levels")

for i, row in locations.iterrows():

    if row["risk"] == "HIGH":
        st.error(f"{row['location']} → HIGH RISK")

    elif row["risk"] == "MEDIUM":
        st.warning(f"{row['location']} → MEDIUM RISK")

    else:
        st.success(f"{row['location']} → LOW RISK")


# ---------------------------------
# 2️⃣ Load Wild Boar Detection Dataset
# ---------------------------------
df = pd.read_csv("data/synthetic_wild_boar_data.csv", parse_dates=["date"])
df.set_index("date", inplace=True)

st.subheader("Dataset Preview")
st.write(df.head())


# ---------------------------------
# 3️⃣ Train-Test Split
# ---------------------------------
train_size = int(len(df) * 0.8)

train = df.iloc[:train_size]
test = df.iloc[train_size:]


# ---------------------------------
# 4️⃣ Train SARIMA Model
# ---------------------------------
model = SARIMAX(
    train["night_detections"],
    order=(1,1,1),
    seasonal_order=(1,1,1,7),
    enforce_stationarity=False,
    enforce_invertibility=False
)

model_fit = model.fit()


# ---------------------------------
# 5️⃣ Forecast
# ---------------------------------
pred = model_fit.get_forecast(steps=len(test))
forecast = pred.predicted_mean


# ---------------------------------
# 6️⃣ Plot Prediction Graph
# ---------------------------------
fig, ax = plt.subplots(figsize=(10,5))

ax.plot(train.index, train["night_detections"], label="Train")
ax.plot(test.index, test["night_detections"], label="Actual")
ax.plot(test.index, forecast, label="Prediction")

ax.set_title("Wild Boar Activity Forecast")
ax.set_xlabel("Date")
ax.set_ylabel("Night Detections")

ax.legend()

st.pyplot(fig)


# ---------------------------------
# 7️⃣ Prediction Alerts
# ---------------------------------
st.subheader("🚨 Activity Alerts")

threshold = 5

for date, value in zip(test.index, forecast):

    if value >= threshold:
        st.error(f"{date.date()} → HIGH RISK ({round(value)})")

    elif value >= 3:
        st.warning(f"{date.date()} → MEDIUM RISK ({round(value)})")

    else:
        st.success(f"{date.date()} → LOW RISK ({round(value)})")