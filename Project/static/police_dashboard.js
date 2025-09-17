function loadAlerts() {
  // Rebuild: Always show latest 10 alerts (SOS/Zone Breach) with coordinates
  const list = document.getElementById("alertsList");
  if (!list) return;
  list.innerHTML = "";
  fetch('http://127.0.0.1:8000/api/sos/')
    .then(res => {
      if (!res.ok) {
        throw new Error('HTTP error ' + res.status);
      }
      return res.json();
    })
    .then(alerts => {
      list.innerHTML = "";
      // Debug: Show raw response
      const debugDiv = document.getElementById('alertsDebug');
      if (debugDiv) {
        debugDiv.textContent = 'Raw response: ' + JSON.stringify(alerts);
      }
      if (!alerts || alerts.length === 0) {
        const li = document.createElement("li");
        li.textContent = 'No alerts yet.';
        list.appendChild(li);
        return;
      }
      alerts.forEach(a => {
        let timeStr = a.timestamp;
        if (timeStr && timeStr.includes('T')) {
          try {
            timeStr = new Date(timeStr).toLocaleString();
          } catch (e) {}
        }
        const li = document.createElement("li");
        li.innerHTML = `<b>SOS</b> at <span style='color:#2563eb'>${timeStr}</span><br>
          <span>${a.message}</span><br>
          <span style='font-size:0.95em;color:#555'>Coordinates: ${a.lat?.toFixed(5)}, ${a.lng?.toFixed(5)}</span>`;
        list.appendChild(li);
        // Show SOS location on map
        if (a.lat && a.lng) {
          window.showSOSLocation(a.lat, a.lng);
        }
      });
    })
    .catch(err => {
      list.innerHTML = '<li style="color:red">Error loading alerts: ' + err.message + '</li>';
      const debugDiv = document.getElementById('alertsDebug');
      if (debugDiv) {
        debugDiv.textContent = 'Fetch error: ' + err.message;
      }
      console.error('Error fetching alerts:', err);
    });
}
// ...existing code...
function loadChat() {
  fetch('http://127.0.0.1:8000/api/chat/')
    .then(res => res.json())
    .then(chats => {
      const chatBox = document.getElementById("chatBox");
      if (!chatBox) return;
      chatBox.innerHTML = "";
      let lastMsg = window._lastMsg || "";
      chats.forEach(c => {
        chatBox.innerHTML += `<div class='chat-msg ${c.sender === "Tourist" ? "tourist" : "police"}'><b>${c.sender}:</b> ${c.text}</div>`;
      });
      chatBox.scrollTop = chatBox.scrollHeight;
      // Notification for new tourist message
      if (chats.length > 0) {
        const latest = chats[chats.length-1];
        if (latest.sender === "Tourist" && latest.text !== lastMsg) {
          if (window.Notification && Notification.permission === "granted") {
            new Notification("New message from Tourist", { body: latest.text });
          }
        }
        window._lastMsg = latest.text;
      }
    });
}

function sendReply() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;
  fetch('http://127.0.0.1:8000/api/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: "Police", text: msg })
  })
    .then(() => {
      input.value = "";
      loadChat();
    });
}

// Auto-refresh every 3s
setInterval(() => {
  loadAlerts();
  loadChat();
}, 3000);
window.addEventListener('DOMContentLoaded', function() {
  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  setInterval(loadChat, 1000);
  // Listen for localStorage changes (cross-tab)
  window.addEventListener('storage', function(e) {
    if (e.key === 'alerts' || e.key === 'sosAlertTrigger') {
      loadAlerts();
      pollSOSLocation();
    }
  });
  // Initialize Leaflet map
  let map = L.map('map').setView([0, 0], 2); // Default view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  let sosMarker = null;

  // Function to update SOS location and coordinates
  window.showSOSLocation = function(lat, lng) {
    // Update coordinates display
    document.getElementById('sos-coordinates').textContent = `Coordinates: ${lat}, ${lng}`;
    // Set map view
    map.setView([lat, lng], 15);
    // Add or move marker
    if (sosMarker) {
      sosMarker.setLatLng([lat, lng]);
    } else {
      sosMarker = L.marker([lat, lng]).addTo(map).bindPopup('SOS Triggered Here').openPopup();
    }
  }

  // Initial load
  loadAlerts();
  loadChat();

  // Auto-refresh every 1s for alerts
  setInterval(() => {
    loadAlerts();
  }, 1000);
});