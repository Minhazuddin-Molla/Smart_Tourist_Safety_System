// Init map
const map = L.map('map').setView([28.6139, 77.2090], 13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OSM contributors &copy; CARTO'
}).addTo(map);

// Tourist marker
let touristMarker = L.marker([28.6139, 77.2090]).addTo(map);

// Restricted zone
const restrictedZone = L.circle([28.63, 77.22], {
  color: "red", fillColor: "#f03", fillOpacity: 0.2, radius: 1000
}).addTo(map).bindPopup("Restricted Zone");

let safetyScore = 100;

// Update timeline
function logEvent(text) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} - ${text}`;
  document.getElementById("timeline").prepend(li);
}

// Save alert to localStorage
function pushAlert(type, message) {
  const alerts = JSON.parse(localStorage.getItem("alerts") || "[]");
  const coords = touristMarker.getLatLng();
  const newAlert = {
    type,
    message,
    time: new Date().toISOString(),
    location: { lat: coords.lat, lng: coords.lng }
  };
  alerts.push(newAlert);
  localStorage.setItem("alerts", JSON.stringify(alerts));
  console.log('pushAlert: Added alert to localStorage:', newAlert);
  console.log('pushAlert: All alerts now:', alerts);
}

// Update safety score UI dynamically: animate circular progress and show status label based on score.
function updateSafetyScoreUI(score) {
  const circle = document.getElementById('scoreCircle');
  const text = document.getElementById('scoreText');
  const status = document.getElementById('scoreStatus');
  if (!circle || !text || !status) return;
  const max = 100;
  const percent = Math.max(0, Math.min(score, max)) / max;
  const circumference = 2 * Math.PI * 44;
  circle.setAttribute('stroke-dasharray', circumference);
  circle.setAttribute('stroke-dashoffset', circumference * (1 - percent));
  text.textContent = score;
  let statusText = '';
  let smiley = '';
  if (score >= 80) {
    statusText = 'Excellent';
    smiley = '<span class="smiley excellent">&#128515;</span>'; // 😃
    status.style.color = '#388e3c';
    circle.setAttribute('stroke', 'url(#scoreGradient)');
    text.setAttribute('fill', '#388e3c');
  } else if (score >= 50) {
    statusText = 'Moderate';
    smiley = '<span class="smiley moderate">&#128528;</span>'; // 😐
    status.style.color = '#fbc02d';
    circle.setAttribute('stroke', '#fbc02d');
    text.setAttribute('fill', '#fbc02d');
  } else {
    statusText = 'Low';
    smiley = '<span class="smiley low">&#128577;</span>'; // 🙁
    status.style.color = '#d32f2f';
    circle.setAttribute('stroke', '#d32f2f');
    text.setAttribute('fill', '#d32f2f');
  }
  status.innerHTML = `${smiley}<span>${statusText}</span>`;
}

// 🚨 SOS Button
document.getElementById("sosBtn").onclick = () => {
  safetyScore -= 20;
  updateSafetyScoreUI(safetyScore);
  logEvent("SOS Triggered!");
  const coords = touristMarker.getLatLng();
  const debugDiv = document.getElementById('sosDebug');
  fetch("http://127.0.0.1:8000/api/sos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Tourist pressed SOS button!",
      lat: coords.lat,
      lng: coords.lng
    })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
      if (!res.ok) {
        alert("SOS failed to send! " + (data && data.detail ? data.detail : res.status));
        if (debugDiv) debugDiv.textContent = 'SOS POST error: ' + JSON.stringify(data);
        console.error("SOS backend error:", data);
        return;
      }
      alert("SOS successfully sent!");
      if (debugDiv) debugDiv.textContent = 'SOS POST success: ' + JSON.stringify(data);
      // Optionally, reload police dashboard if open in another tab
      try {
        window.open('dashboard.html', '_blank');
      } catch(e) {}
      console.log("SOS sent to backend:", data);
    })
    .catch(err => {
      alert("SOS failed to send!");
      if (debugDiv) debugDiv.textContent = 'SOS POST fetch error: ' + err.message;
      console.error("SOS backend error:", err);
    });
};

// Mock tourist movement
let lat = 28.6139, lng = 77.2090;
setInterval(() => {
  lat += (Math.random() - 0.5) * 0.002;
  lng += (Math.random() - 0.5) * 0.002;
  touristMarker.setLatLng([lat, lng]);
  map.panTo([lat, lng]); 

  // Check zone breach
  const dist = map.distance([lat, lng], restrictedZone.getLatLng());
  if (dist < restrictedZone.getRadius()) {
    logEvent("⚠️ Entered Restricted Zone");
    safetyScore -= 5;
    updateSafetyScoreUI(safetyScore);
    pushAlert("Zone Breach", "Tourist entered restricted zone!");
  }
}, 5000);

// Chat mock (Tourist → Police)
function loadChat() {
  fetch('http://127.0.0.1:8000/api/chat/')
    .then(res => res.json())
    .then(chats => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = "";
      let lastMsg = window._lastMsg || "";
      chats.forEach(c => {
        chatBox.innerHTML += `<div class='chat-msg ${c.sender === "Tourist" ? "tourist" : "police"}'><b>${c.sender}:</b> ${c.text}</div>`;
      });
      chatBox.scrollTop = chatBox.scrollHeight;
      // Notification for new police message
      if (chats.length > 0) {
        const latest = chats[chats.length-1];
        if (latest.sender === "Police" && latest.text !== lastMsg) {
          if (window.Notification && Notification.permission === "granted") {
            new Notification("New message from Police", { body: latest.text });
          }
        }
        window._lastMsg = latest.text;
      }
    });
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;
  fetch('http://127.0.0.1:8000/api/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: "Tourist", text: msg })
  })
    .then(() => {
      input.value = "";
      loadChat();
    });
}

window.addEventListener('DOMContentLoaded', loadChat);
if (window.Notification && Notification.permission !== "granted") {
  Notification.requestPermission();
}
setInterval(loadChat, 1000);

// Language switch (basic demo)
const translations = {
  en: { sos: "🚨 SOS" },
  hi: { sos: "🚨 मदद" },
  bn: { sos: "🚨 সাহায্য" }
};
function setLanguage(lang) {
  document.getElementById("sosBtn").textContent = translations[lang].sos;
}

// Render creative ticket-style timeline from past journeys in localStorage
function renderTimelineTickets() {
  // Get user journeys from localStorage (profileUsers)
  const users = JSON.parse(localStorage.getItem('profileUsers') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('currentProfileUser') || 'null');
  let timeline = [];
  if (currentUser && currentUser.timeline) {
    timeline = currentUser.timeline;
  } else if (users.length > 0 && users[0].timeline) {
    timeline = users[0].timeline;
  }
  // Fallback demo timeline if none exists
  if (!timeline || timeline.length === 0) {
    timeline = [
      { date: '2025-09-01', destination: 'Agra', status: 'Completed' },
      { date: '2025-08-15', destination: 'Jaipur', status: 'Completed' },
      { date: '2025-07-10', destination: 'Goa', status: 'Cancelled' }
    ];
  }
  const container = document.getElementById('timelineTickets');
  if (!container) return;
  container.innerHTML = '';
  timeline.forEach(j => {
    const statusClass = j.status === 'Completed' ? 'completed' : (j.status === 'Cancelled' ? 'cancelled' : '');
    container.innerHTML += `
      <div class="ticket-card">
        <div class="ticket-info">
          <span class="ticket-date">${j.date}</span>
          <span class="ticket-destination">${j.destination}</span>
          <span class="ticket-status ${statusClass}">${j.status}</span>
        </div>
        <span class="ticket-arrow">&#8594;</span>
      </div>
    `;
  });
}
window.addEventListener('DOMContentLoaded', function() {
  updateSafetyScoreUI(safetyScore);
  renderTimelineTickets();
  loadChat();
});
