import time
import cv2
import supervision as sv

CONFIDENCE_THRESHOLD = 0.9
OVERLAP_THRESHOLD = 0.6

bounding_box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()

def run_detection_streamlit(cap, model, frame_placeholder, alert_placeholder, info_placeholder, session_state):
    last_alert_time = 0
    frame_number = 0
    ALERT_COOLDOWN = 3

    while session_state.run_detection:
        ret, frame = cap.read()
        if not ret:
            break

        frame_number += 1

        results = model.infer(
            frame,
            confidence=CONFIDENCE_THRESHOLD,
            iou_threshold=OVERLAP_THRESHOLD
        )[0]

        detections = sv.Detections.from_inference(results)

        if len(detections) > 0:
            current_time = time.time()
            if current_time - last_alert_time >= ALERT_COOLDOWN:
                last_alert_time = current_time
                alert_placeholder.warning(
                    f"🚨 Boar detected in frame {frame_number}! ({len(detections)} detection(s))"
                )
        else:
            alert_placeholder.info("No boar detected.")

        labels = [
            f"{class_name} {confidence:.0%}"
            for class_name, confidence in zip(
                detections["class_name"], detections.confidence
            )
        ]

        annotated_frame = bounding_box_annotator.annotate(scene=frame.copy(), detections=detections)
        annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)
        annotated_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)

        frame_placeholder.image(annotated_frame, channels="RGB", use_container_width=True)
        info_placeholder.write(f"Frame: {frame_number}")