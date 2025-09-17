// profile-edit.js
// Handles edit profile page logic

document.addEventListener('DOMContentLoaded', function() {
  // Load existing profile data from localStorage
  const nameInput = document.getElementById('editName');
  const phoneInput = document.getElementById('editPhone');
  const emailInput = document.getElementById('editEmail');

  const profile = JSON.parse(localStorage.getItem('profile')) || {};
  nameInput.value = profile.name || '';
  phoneInput.value = profile.phone || '';
  emailInput.value = profile.email || '';

  // Save changes
  document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const updatedProfile = {
      name: nameInput.value,
      phone: phoneInput.value,
      email: emailInput.value
    };
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    window.location.href = 'profile.html'; // Go back to profile page
  });

  // Back button
  document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'profile.html';
  });
});
