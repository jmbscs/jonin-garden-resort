let authModal = null;
let pendingRegistration = null;

function authToast(message, type = 'success') {
  if (typeof showToast === 'function') {
    showToast(message, type);
  } else {
    alert(message);
  }
}

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('joNinCurrentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    return null;
  }
}

async function registerUser(name, email, password) {
  try {
    const res  = await fetch('backend/register.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('joNinCurrentUser', JSON.stringify(data.user));
      authToast('Account created! Welcome, ' + data.user.name + '!');
      closeModal();
      location.reload();
    } else {
      authToast(data.message, 'error');
    }
  } catch (err) {
    authToast('Server error. Please try again.', 'error');
    console.error(err);
  }
}

async function loginUser(email, password) {
  try {
    const res  = await fetch('backend/login.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('joNinCurrentUser', JSON.stringify(data.user));
      authToast('Welcome back, ' + data.user.name + '!');
      closeModal();
      location.reload();
    } else {
      authToast(data.message, 'error');
    }
  } catch (err) {
    authToast('Server error. Please try again.', 'error');
    console.error(err);
  }
}

function logout() {
  localStorage.removeItem('joNinCurrentUser');
  window.location.href = 'homepage_index.html';
}

function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { authToast('Please fill in all fields.', 'error'); return; }
  loginUser(email, password);
}

function handleRegister() {
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName  = document.getElementById('reg-lastname').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-password').value;
  if (!firstName || !lastName || !email || !password) { authToast('Please fill in all fields.', 'error'); return; }
  registerUser(firstName + ' ' + lastName, email, password);
}

function openModal() {
  const user = getCurrentUser();
  if (user && user.name !== 'Guest') { window.location.href = 'booking_index.html'; return; }
  if (!authModal) authModal = document.getElementById('auth-modal');
  if (!authModal) return;
  authModal.classList.add('active');
  document.body.classList.add('modal-open');
  switchCard('login');
}

function closeModal() {
  if (!authModal) authModal = document.getElementById('auth-modal');
  if (!authModal) return;
  authModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function switchCard(name) {
  ['login', 'register', 'otp', 'admin'].forEach((id) => {
    const card = document.getElementById('card-' + id);
    if (card) card.classList.remove('visible');
  });
  const target = document.getElementById('card-' + name);
  if (target) target.classList.add('visible');
}

function checkLoginAndBook() {
  const user = getCurrentUser();
  if (!user || user.name === 'Guest') { openModal(); } else { window.location.href = 'booking_index.html'; }
}

function initOTP() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, index) => {
    box.addEventListener('input', () => { if (box.value && index < boxes.length - 1) boxes[index + 1].focus(); });
    box.addEventListener('keydown', (event) => { if (event.key === 'Backspace' && !box.value && index > 0) boxes[index - 1].focus(); });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  authModal = document.getElementById('auth-modal');
  if (authModal) { authModal.addEventListener('click', (event) => { if (event.target === authModal) closeModal(); }); }
  initOTP();
});

async function handleAdminLogin() {
  const email    = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  if (!email || !password) { authToast('Please enter email and password.', 'error'); return; }
  try {
    const res  = await fetch('backend/admin_login.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('joNinCurrentUser', JSON.stringify(data.user));
      authToast('Welcome, ' + data.user.name + '!');
      closeModal();
      window.location.href = 'admindashboard_index.html';
    } else {
      authToast(data.message, 'error');
    }
  } catch (err) {
    authToast('Server error. Try again.', 'error');
  }
}
