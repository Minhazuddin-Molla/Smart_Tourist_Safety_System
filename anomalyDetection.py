from dotenv import load_dotenv
import os
from google import generativeai
import numpy as np

load_dotenv()
generativeai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = generativeai.GenerativeModel("gemini-2.5-pro")

# Sample travel data: [latitude, longitude, timestamp, time_of_day, previous_location, popular_spots_nearby]
travel_data =  [
    [40.7128, -74.0060, 1, "morning", "None", ["Statue of Liberty", "Central Park"]],
    [40.7130, -74.0062, 2, "afternoon", "40.7128,-74.0060", ["Times Square"]],
    [40.7132, -74.0064, 3, "evening", "40.7130,-74.0062", ["Empire State Building"]],
    [41.0000, -75.0000, 4, "night", "40.7132,-74.0064", []],  # anomaly
]

def detect_anomalies(data, threshold=0.01):
    distances = [np.linalg.norm(np.array(data[i][:2]) - np.array(data[i-1][:2])) for i in range(1, len(data))]
    mean = np.mean(distances)
    std = np.std(distances)
    anomalies = []
    for i, d in enumerate(distances):
        if abs(d - mean) > threshold * std:
            anomalies.append(i+1)  # Index of anomalous point
    return anomalies

anomaly_indices = detect_anomalies(travel_data)

if anomaly_indices:
    anomaly_points = [travel_data[idx] for idx in anomaly_indices]
    anomaly_descriptions = [
        (
            f"Location: {point[0]}, {point[1]}, Time: {point[2]}, "
            f"Time of Day: {point[3]}, Previous Location: {point[4]}, "
            f"Popular Spots Nearby: {', '.join(point[5]) if point[5] else 'None'}"
        )
        for point in anomaly_points
    ]
    prompt = (
        "You are assisting police officers in monitoring tourist safety.\n"
        "The following tourist location data points have been flagged as anomalies, indicating possible distress or deviation from normal travel patterns:\n"
        + "\n".join(anomaly_descriptions) +
        "\n\nFor each anomaly, briefly explain the possible reason and recommend immediate actions for police response to ensure tourist safety."
    )
    response = model.generate_content(prompt)
    print("Anomaly Alert Summary:")
    print(response.text)
else:
    print("No anomalies detected.")