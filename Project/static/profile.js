// profile.js
// Robust Bootstrap modal and event handling

document.addEventListener('DOMContentLoaded', function() {
  // User data setup
  let users = JSON.parse(localStorage.getItem('profileUsers') || '[]');
  let currentUser = JSON.parse(localStorage.getItem('currentProfileUser') || 'null');
  if (!users.some(u => u.username === 'Codetale')) {
    users.push({ username: 'Codetale', password: '12345678', name: 'Codetale', phone: '', email: '', profilePic: '', timeline: [
      { date: '2025-09-01', destination: 'Agra', status: 'Completed' },
      { date: '2025-08-15', destination: 'Jaipur', status: 'Completed' },
      { date: '2025-07-10', destination: 'Goa', status: 'Cancelled' }
    ] });
    localStorage.setItem('profileUsers', JSON.stringify(users));
  }
  if (!currentUser) {
    currentUser = users.find(u => u.username === 'Codetale');
    localStorage.setItem('currentProfileUser', JSON.stringify(currentUser));
  }

  function saveUsers() {
    localStorage.setItem('profileUsers', JSON.stringify(users));
    localStorage.setItem('currentProfileUser', JSON.stringify(currentUser));
  }

  function updateProfileUI() {
    document.getElementById('profileName').textContent = currentUser.name || currentUser.username;
    document.getElementById('userName').textContent = currentUser.name || '-';
    document.getElementById('userPhone').textContent = currentUser.phone || '-';
    document.getElementById('userEmail').textContent = currentUser.email || '-';
    if (currentUser.profilePic) {
      document.getElementById('profilePic').src = currentUser.profilePic;
    } else {
      document.getElementById('profilePic').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.username)}`;
    }
  }

  // Profile picture upload
  const profilePicInput = document.getElementById('profilePicInput');
  const choosePicBtn = document.getElementById('choosePicBtn');
  const chosenPicName = document.getElementById('chosenPicName');
  const picActions = document.getElementById('picActions');
  const editPicBtn = document.getElementById('editPicBtn');
  const removePicBtn = document.getElementById('removePicBtn');

  function updatePicUI() {
    if (currentUser.profilePic) {
      choosePicBtn.style.display = 'none';
      picActions.style.display = 'block';
    } else {
      choosePicBtn.style.display = 'inline-block';
      picActions.style.display = 'none';
    }
  }

  if (choosePicBtn && profilePicInput) {
    choosePicBtn.addEventListener('click', function() {
      profilePicInput.click();
    });
    profilePicInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Hide filename
        chosenPicName.textContent = '';
        chosenPicName.style.display = 'none';
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentUser.profilePic = evt.target.result;
          saveUsers();
          updateProfileUI();
          updatePicUI(); // Ensure choosePicBtn is hidden after choosing
        };
        reader.readAsDataURL(file);
      } else {
        chosenPicName.textContent = '';
        chosenPicName.style.display = 'none';
        updatePicUI(); // Ensure choosePicBtn is shown if no file
      }
    });
  }
  if (editPicBtn && profilePicInput) {
    editPicBtn.addEventListener('click', function() {
      profilePicInput.click();
    });
  }
  if (removePicBtn) {
    removePicBtn.addEventListener('click', function() {
      currentUser.profilePic = '';
      saveUsers();
      updateProfileUI();
      updatePicUI(); // Ensure choosePicBtn is shown after removal
    });
  }

  // Only keep logout button and initial UI update
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      currentUser = null;
      saveUsers();
      localStorage.removeItem('currentProfileUser');
      window.location.href = 'login.html'; // Redirect to login page
    });
  }
  updateProfileUI();
  updatePicUI();
});
