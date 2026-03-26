import os
import time
import base64
from urllib.parse import quote

import cv2
import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import matplotlib.pyplot as plt
from dotenv import load_dotenv
from roboflow import Roboflow
import supervision as sv
from statsmodels.tsa.statespace.sarimax import SARIMAX

st.set_page_config(page_title="BoarWatch", layout="wide")
st.title("🐗 BoarWatch - Detection and Prediction System")

load_dotenv()
try:
    ROBOFLOW_API_KEY = st.secrets["ROBOFLOW_API_KEY"]
except:
    ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

CONFIDENCE_THRESHOLD = 0.9
OVERLAP_THRESHOLD = 0.6
VIDEO_FILE = "video1.mp4"
AUDIO_FILE = "audio.mp3"

EMERGENCY_CONTACTS = [
    {"name": "Farmer", "number": "+919876543210"},
    {"name": "Forest Officer", "number": "+919123456780"},
    {"name": "Neighbor 1", "number": "+919999999999"},
]

@st.cache_resource
def load_detection_model():
    rf = Roboflow(api_key=ROBOFLOW_API_KEY)
    project = rf.workspace().project("wild-boar-deterrent-pzq5t")
    return project.version(1).model

@st.cache_data
def load_data():
    df = pd.read_csv("data/synthetic_wild_boar_data.csv")
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    df.set_index("date", inplace=True)
    return df

def autoplay_audio(audio_file):
    with open(audio_file, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode()
    audio_html = f"""
    <audio autoplay style="display:none;">
        <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
    </audio>
    <script>
        const audio = document.querySelector("audio");
        if (audio) {{
            audio.play().catch(err => console.log("Autoplay blocked:", err));
        }}
    </script>
    """
    components.html(audio_html, height=0)

def trigger_sms(number, message):
    encoded_message = quote(message)
    sms_html = f"""
    <a id="sms-link" href="sms:{number}?body={encoded_message}" style="display:none;">SMS</a>
    <script>
        const link = document.getElementById("sms-link");
        if (link) {{
            link.click();
        }}
    </script>
    """
    components.html(sms_html, height=0)

def trigger_call(number):
    call_html = f"""
    <a id="call-link" href="tel:{number}" style="display:none;">CALL</a>
    <script>
        const link = document.getElementById("call-link");
        if (link) {{
            link.click();
        }}
    </script>
    """
    components.html(call_html, height=0)

def get_risk_level(value):
    if value >= 5:
        return "HIGH 🚨"
    elif value >= 3:
        return "MODERATE ⚠️"
    else:
        return "LOW ✅"

model = load_detection_model()
bounding_box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()

if "run_detection" not in st.session_state:
    st.session_state.run_detection = False

if "boar_present" not in st.session_state:
    st.session_state.boar_present = False

if "sms_triggered" not in st.session_state:
    st.session_state.sms_triggered = False

if "call_triggered" not in st.session_state:
    st.session_state.call_triggered = False

tab1, tab2 = st.tabs(["📊 Prediction Module", "🎥 Detection Module"])

with tab1:
    st.subheader("📊 Wild Boar Activity Forecast")

    df = load_data()

    st.sidebar.header("SARIMA Settings")
    p = st.sidebar.number_input("p", min_value=0, max_value=5, value=1)
    d = st.sidebar.number_input("d", min_value=0, max_value=2, value=1)
    q = st.sidebar.number_input("q", min_value=0, max_value=5, value=1)

    P = st.sidebar.number_input("Seasonal P", min_value=0, max_value=5, value=1)
    D = st.sidebar.number_input("Seasonal D", min_value=0, max_value=2, value=1)
    Q = st.sidebar.number_input("Seasonal Q", min_value=0, max_value=5, value=1)
    s = st.sidebar.number_input("Season Length", min_value=1, max_value=30, value=7)

    forecast_steps = st.sidebar.slider("Forecast Days", 1, 30, 7)

    try:
        model_sarima = SARIMAX(
            df["night_detections"],
            order=(p, d, q),
            seasonal_order=(P, D, Q, s),
            enforce_stationarity=False,
            enforce_invertibility=False
        )

        model_fit = model_sarima.fit(disp=False)
        forecast = model_fit.forecast(steps=forecast_steps)

        forecast_index = pd.date_range(
            start=pd.Timestamp.today().normalize(),
            periods=forecast_steps,
            freq="D"
        )

        forecast_df = pd.DataFrame({
            "predicted_sightings": forecast.values
        }, index=forecast_index)

        forecast_df["predicted_sightings"] = forecast_df["predicted_sightings"].round(2)

        tomorrow_value = forecast_df["predicted_sightings"].iloc[0]
        tomorrow_risk = get_risk_level(tomorrow_value)

        peak_idx = forecast_df["predicted_sightings"].idxmax()
        peak_value = forecast_df["predicted_sightings"].max()
        peak_day = peak_idx.strftime("%A")

        st.subheader("📌 Forecast Summary")
        c1, c2, c3 = st.columns(3)

        with c1:
            st.metric("Tomorrow Risk", tomorrow_risk)

        with c2:
            st.metric("Peak Day", peak_day)

        with c3:
            st.metric("Expected Sightings", f"{tomorrow_value:.2f}")

        fig, ax = plt.subplots(figsize=(12, 5))
        ax.plot(df.index, df["night_detections"], label="Historical Detections")
        ax.plot(forecast_df.index, forecast_df["predicted_sightings"], label="Forecast")
        ax.set_title("Wild Boar Sightings Forecast")
        ax.set_xlabel("Date")
        ax.set_ylabel("Sightings")
        ax.legend()
        st.pyplot(fig)

        display_df = forecast_df.copy()
        display_df.index = display_df.index.strftime("%d-%b-%Y")

        st.write("### Forecast Output")
        st.dataframe(display_df)

        avg_forecast = forecast_df["predicted_sightings"].mean()

        st.write("### Risk Alert")
        if avg_forecast >= 8:
            st.error("🚨 High risk of wild boar activity in the coming days!")
        elif avg_forecast >= 4:
            st.warning("⚠ Moderate risk of wild boar activity predicted.")
        else:
            st.success("✅ Low risk of wild boar activity predicted.")

    except Exception as e:
        st.error(f"SARIMA model error: {e}")

with tab2:
    st.subheader("🎥 Real-Time / Video Boar Detection")

    source_option = st.radio("Choose Source", ["Live Camera", "Video File"])

    top_col1, top_col2 = st.columns(2)
    with top_col1:
        if st.button("▶ Start Detection", key="start_detection"):
            st.session_state.run_detection = True
            st.session_state.sms_triggered = False
            st.session_state.call_triggered = False

    with top_col2:
        if st.button("⏹ Stop Detection", key="stop_detection"):
            st.session_state.run_detection = False
            st.session_state.boar_present = False
            st.session_state.sms_triggered = False
            st.session_state.call_triggered = False

    st.write("### Emergency Actions")
    st.write("Contacts to alert:")
    for contact in EMERGENCY_CONTACTS:
        st.write(f"📞 {contact['name']}: {contact['number']}")

    action_col1, action_col2 = st.columns(2)

    with action_col1:
        sms_clicked = st.button("💬 Send SMS Alert", key="sms_button_main")

    with action_col2:
        call_clicked = st.button("📞 Call Emergency Contact", key="call_button_main")

    if sms_clicked:
        sms_message = "Wild boar detected nearby. Please stay alert."
        trigger_sms(EMERGENCY_CONTACTS[0]["number"], sms_message)
        st.session_state.sms_triggered = True

    if call_clicked:
        trigger_call(EMERGENCY_CONTACTS[0]["number"])
        st.session_state.call_triggered = True

    if st.session_state.sms_triggered:
        st.success("SMS alert triggered.")

    if st.session_state.call_triggered:
        st.warning("Call action triggered.")

    frame_placeholder = st.empty()
    alert_placeholder = st.empty()
    info_placeholder = st.empty()

    if st.session_state.run_detection:
        if source_option == "Live Camera":
            cap = cv2.VideoCapture(0)
            source_name = "Live Camera"
        else:
            cap = cv2.VideoCapture(VIDEO_FILE)
            source_name = VIDEO_FILE

        if not cap.isOpened():
            st.error(f"Could not open source: {source_name}")
        else:
            frame_number = 0

            while st.session_state.run_detection:
                ret, frame = cap.read()

                if not ret:
                    if source_option == "Video File":
                        st.info("Video playback complete.")
                    else:
                        st.error("Failed to read frame from camera.")
                    break

                frame_number += 1

                results = model.predict(
                    frame,
                    confidence=int(CONFIDENCE_THRESHOLD * 100),
                    overlap=int(OVERLAP_THRESHOLD * 100)
                ).json()

                detections = sv.Detections.from_roboflow(results)

                if len(detections) > 0:
                    if not st.session_state.boar_present:
                        autoplay_audio(AUDIO_FILE)

                    st.session_state.boar_present = True

                    alert_placeholder.markdown(
                        """
                        <style>
                        @keyframes blinkGlow {
                            0% { opacity: 1; box-shadow: 0 0 8px red; }
                            50% { opacity: 0.35; box-shadow: 0 0 25px red; }
                            100% { opacity: 1; box-shadow: 0 0 8px red; }
                        }
                        .boar-alert {
                            background: linear-gradient(90deg, #ffcccc, #ffe6e6);
                            color: #990000;
                            padding: 20px;
                            border: 3px solid #cc0000;
                            border-radius: 14px;
                            text-align: center;
                            font-size: 34px;
                            font-weight: 800;
                            animation: blinkGlow 1s infinite;
                            margin-bottom: 12px;
                        }
                        </style>
                        <div class="boar-alert">🚨 BOAR DETECTED! TAKE ACTION! 🚨</div>
                        """,
                        unsafe_allow_html=True
                    )

                    info_placeholder.write(
                        f"Detected in frame {frame_number} ({len(detections)} detection(s))"
                    )

                else:
                    st.session_state.boar_present = False
                    st.session_state.sms_triggered = False
                    st.session_state.call_triggered = False

                    alert_placeholder.markdown(
                        """
                        <div style="
                            background-color:#ddffdd;
                            color:#006600;
                            padding:14px;
                            border:2px solid #006600;
                            border-radius:10px;
                            text-align:center;
                            font-size:24px;
                            font-weight:bold;">
                            ✅ No Boar Detected
                        </div>
                        """,
                        unsafe_allow_html=True
                    )

                    info_placeholder.write(f"Frame {frame_number}: No boar detected")

                labels = [
                    f"{p['class']} {p['confidence']:.0%}"
                    for p in results.get("predictions", [])
                ]

                annotated_frame = bounding_box_annotator.annotate(
                    scene=frame.copy(),
                    detections=detections
                )

                annotated_frame = label_annotator.annotate(
                    scene=annotated_frame,
                    detections=detections,
                    labels=labels
                )

                annotated_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)

                frame_placeholder.image(
                    annotated_frame,
                    channels="RGB",
                    caption=f"Source: {source_name} | Frame: {frame_number}",
                    use_container_width=True
                )

                time.sleep(0.03)

                if not st.session_state.run_detection:
                    break

            cap.release()
