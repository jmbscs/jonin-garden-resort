let authModal = null;

function authToast(message, type = 'success') {
  if (typeof showToast === 'function') {
    showToast(message, type);
  } else {
    alert(message); // fallback
  }
}

// Replace getCurrentUser() with this
function getCurrentUser() {
  try {
    const stored = localStorage.getItem('joNinCurrentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    return null;
  }
}

// Add this — called when register form is submitted
async function registerUser(name, email, password) {
  const res    = await fetch('backend/register.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email, password })
  });
  const data = await res.json();

  if (data.success) {
    // Save to localStorage so they're "logged in" right away
    localStorage.setItem('joNinCurrentUser', JSON.stringify(data.user));
    showToast('Account created! Welcome, ' + data.user.name);
    closeModal();
    location.reload();
  } else {
    showToast(data.message, 'error');
  }
}

// Add this — called when login form is submitted
async function loginUser(email, password) {
  const res  = await fetch('backend/login.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (data.success) {
    localStorage.setItem('joNinCurrentUser', JSON.stringify(data.user));
    showToast('Welcome back, ' + data.user.name + '!');
    closeModal();
    location.reload();
  } else {
    showToast(data.message, 'error');
  }
}

// Logout
function logout() {
  localStorage.removeItem('joNinCurrentUser');
  window.location.href = 'homepage_index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  authModal = document.getElementById('auth-modal');

  if (authModal) {
    authModal.addEventListener('click', (event) => {
      if (event.target === authModal) {
        closeModal();
      }
    });
  }

  initOTP();
});

function openModal() {
  const user = getCurrentUser();
  // user can be null now, so check for null first
  if (user && user.name !== 'Guest') {
    window.location.href = 'booking_index.html';
    return;
  }

  if (!authModal) {
    authModal = document.getElementById('auth-modal');
  }
  if (!authModal) return;

  authModal.classList.add('active');
  document.body.classList.add('modal-open');
  switchCard('login');
}

function switchCard(name) {
  ['login', 'register', 'otp', 'admin'].forEach((id) => {
    const card = document.getElementById('card-' + id);
    if (card) card.classList.remove('visible');
  });
  const target = document.getElementById('card-' + name);
  if (target) target.classList.add('visible');
}

function initOTP() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, index) => {
    box.addEventListener('input', () => {
      if (box.value && index < boxes.length - 1) {
        boxes[index + 1].focus();
      }
    });
    box.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !box.value && index > 0) {
        boxes[index - 1].focus();
      }
    });
  });
}

function closeModal() {
  if (!authModal) {
    authModal = document.getElementById('auth-modal');
  }
  if (!authModal) return;

  authModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function checkLoginAndBook() {
  const user = getCurrentUser();
  // user can be null now
  if (!user || user.name === 'Guest') {
    openModal();
  } else {
    window.location.href = 'booking_index.html';
  }
}

function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    authToast('Please fill in all fields.', 'error');
    return;
  }
  loginUser(email, password);
}

function handleRegister() {
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName  = document.getElementById('reg-lastname').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-password').value;

  if (!firstName || !lastName || !email || !password) {
    authToast('Please fill in all fields.', 'error');
    return;
  }

  const fullName = firstName + ' ' + lastName;
  registerUser(fullName, email, password);
}