let authModal = null;
let pendingRegistration = null;

// Safe toast wrapper — works even if showToast loads late
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

// ─── REGISTER → sends OTP first ───────────────────────────────
async function registerUser(name, email, password) {
  pendingRegistration = { name, email, password };

  try {
    const res  = await fetch('backend/send_otp.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email })
    });
    const data = await res.json();

    if (data.success) {
      authToast('OTP sent to ' + email);
      switchCard('otp');
      startResendCooldown();
    } else {
      authToast(data.message, 'error');
    }
  } catch (err) {
    authToast('Server error. Make sure XAMPP is running.', 'error');
    console.error(err);
  }
}

// ─── VERIFY OTP → creates account ─────────────────────────────
async function verifyOTP() {
  if (!pendingRegistration) {
    authToast('Session expired. Please register again.', 'error');
    switchCard('register');
    return;
  }

  const boxes = document.querySelectorAll('.otp-box');
  const otp   = Array.from(boxes).map(b => b.value).join('');

  if (otp.length < 6) {
    authToast('Enter the full 6-digit code.', 'error');
    return;
  }

  try {
    const res  = await fetch('backend/verify_otp.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email:    pendingRegistration.email,
        otp:      otp,
        name:     pendingRegistration.name,
        password: pendingRegistration.password
      })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('joNinCurrentUser', JSON.stringify(data.user));
      pendingRegistration = null;
      authToast('Welcome, ' + data.user.name + '!');
      closeModal();
      location.reload();
    } else {
      authToast(data.message, 'error');
    }
  } catch (err) {
    authToast('Server error. Try again.', 'error');
    console.error(err);
  }
}

// ─── RESEND OTP ────────────────────────────────────────────────
async function resendOTP() {
  if (!pendingRegistration) return;
  await registerUser(
    pendingRegistration.name,
    pendingRegistration.email,
    pendingRegistration.password
  );
}

function startResendCooldown() {
  const btn = document.getElementById('resend-otp-btn');
  if (!btn) return;
  let seconds = 60;
  btn.disabled = true;
  btn.textContent = 'Resend in ' + seconds + 's';
  const interval = setInterval(() => {
    seconds--;
    btn.textContent = 'Resend in ' + seconds + 's';
    if (seconds <= 0) {
      clearInterval(interval);
      btn.disabled = false;
      btn.textContent = 'Resend OTP';
    }
  }, 1000);
}

// ─── LOGIN ─────────────────────────────────────────────────────
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
    authToast('Server error. Make sure XAMPP is running.', 'error');
    console.error(err);
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('joNinCurrentUser');
  window.location.href = 'homepage_index.html';
}

// ─── FORM HANDLERS ────────────────────────────────────────────
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

// ─── MODAL CONTROLS ─────────────────────────