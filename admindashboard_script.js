async function loadAdminStats() {
  try {
    const res  = await fetch('backend/get_stats.php');
    const data = await res.json();
    if (data.success) {
      document.getElementById('total-bookings').textContent = data.totals.total_bookings;
      document.getElementById('total-revenue').textContent  = '₱' + Number(data.totals.total_revenue).toLocaleString();
      document.getElementById('total-guests').textContent   = data.totals.total_guests;
    }
  } catch (err) {
    console.error('Could not load stats:', err);
  }
}

async function loadAttendanceSummary() {
  try {
    const res  = await fetch('backend/get_bookings.php');
    const data = await res.json();
    if (!data.success) return;
    const checkedIn  = data.bookings.filter(b => b.checkin_status === 'checked_in').length;
    const checkedOut = data.bookings.filter(b => b.checkin_status === 'checked_out').length;
    const el = document.getElementById('attendance-summary');
    if (el) el.innerHTML = `✅ <strong>${checkedIn}</strong> checked in &nbsp;|&nbsp; 🚪 <strong>${checkedOut}</strong> checked out`;
  } catch (err) {
    console.error('Could not load attendance:', err);
  }
}

async function loadRecentBookings() {
  try {
    const res  = await fetch('backend/get_bookings.php');
    const data = await res.json();
    if (!data.success) return;
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (data.bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#888">No bookings yet</td></tr>';
      return;
    }
    data.bookings.forEach(booking => {
      const date      = new Date(booking.booking_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
      const items     = booking.selectedItems?.map(i => i.item_name).join(', ') || '—';
      const status    = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
      const statusClass = booking.status === 'confirmed' ? 'status-confirmed' :
                          booking.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
      const checkinBadge = booking.checkin_status === 'checked_in'  ? '<span style="color:#1B6B3A;font-weight:600">✅ In</span>' :
                           booking.checkin_status === 'checked_out' ? '<span style="color:#1a4a8a;font-weight:600">🚪 Out</span>' :
                           '<span style="color:#888">⏳ —</span>';
      const actionBtn = booking.status === 'pending'
        ? `<button class="table-btn" onclick="confirmBooking(${booking.id})">Confirm</button>`
        : `<button class="table-btn" onclick="viewBooking(${booking.id}, '${booking.booking_ref}', '${booking.guest_name}', '${items}', '${date}', '${booking.total_amount}', '${booking.payment_method}', '${booking.status}')">Details</button>`;
      tbody.innerHTML += `
        <tr data-booking-id="${booking.id}">
          <td>${booking.guest_name}</td>
          <td>${items}</td>
          <td>${date}</td>
          <td>${checkinBadge}</td>
          <td><span class="${statusClass}">${status}</span></td>
          <td>${actionBtn}</td>
        </tr>`;
    });
  } catch (err) {
    console.error('Could not load bookings:', err);
  }
}

async function confirmBooking(bookingId) {
  try {
    const res  = await fetch('backend/update_booking.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bookingId, status: 'confirmed' })
    });
    const data = await res.json();
    if (data.success) { loadRecentBookings(); loadAdminStats(); }
  } catch (err) {
    console.error('Could not confirm booking:', err);
  }
}

function viewBooking(id, ref, guest, items, date, amount, payment, status) {
  const modal   = document.getElementById('admin-modal');
  const content = document.getElementById('admin-modal-content');
  content.innerHTML = `
    <h2 style="margin-bottom:16px">Booking Details</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px;color:#888;width:40%">Booking Ref</td><td style="padding:8px"><strong>${ref}</strong></td></tr>
      <tr><td style="padding:8px;color:#888">Guest</td><td style="padding:8px">${guest}</td></tr>
      <tr><td style="padding:8px;color:#888">Items</td><td style="padding:8px">${items}</td></tr>
      <tr><td style="padding:8px;color:#888">Date</td><td style="padding:8px">${date}</td></tr>
      <tr><td style="padding:8px;color:#888">Total</td><td style="padding:8px">₱${Number(amount).toLocaleString()}</td></tr>
      <tr><td style="padding:8px;color:#888">Payment</td><td style="padding:8px">${payment}</td></tr>
      <tr><td style="padding:8px;color:#888">Status</td><td style="padding:8px">${status}</td></tr>
    </table>
    <div style="margin-top:16px;display:flex;gap:8px">
      ${status === 'pending' ? `<button class="table-btn" onclick="confirmBooking(${id});closeAdminModal()">Confirm Booking</button>` : ''}
      <button class="table-btn" onclick="cancelBooking(${id})">Cancel Booking</button>
    </div>`;
  modal.classList.add('active');
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    const res  = await fetch('backend/update_booking.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bookingId, status: 'cancelled' })
    });
    const data = await res.json();
    if (data.success) { closeAdminModal(); loadRecentBookings(); loadAdminStats(); }
  } catch (err) {
    console.error('Could not cancel booking:', err);
  }
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.remove('active');
}

function viewReports() {
  window.location.href = 'admin_reports_index.html';
}

function logout() {
  localStorage.removeItem('joNinCurrentUser');
  window.location.href = 'homepage_index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStats();
  loadRecentBookings();
  loadAttendanceSummary();
  setInterval(() => {
    loadAdminStats();
    loadRecentBookings();
    loadAttendanceSummary();
  }, 30000);
});

/* ── LIVE CHAT PANEL ── */
let activeChatSession = null;
let adminChatPollInterval = null;
let adminLastMessageId = 0;

async function loadChatSessions() {
  try {
    const res  = await fetch('backend/chat_sessions.php');
    const data = await res.json();
    if (!data.success) return;

    const pending = data.sessions.filter(s => s.status === 'pending' || s.status === 'active');

    // Update notification badge
    const badge = document.getElementById('chat-notif-badge');
    if (badge) {
      badge.textContent = pending.length;
      badge.style.display = pending.length > 0 ? 'inline-block' : 'none';
    }

    // Render session list
    const list = document.getElementById('chat-sessions-list');
    if (!list) return;

    if (pending.length === 0) {
      list.innerHTML = '<p style="color:#888;font-size:13px;text-align:center;padding:16px">No active chat requests</p>';
      return;
    }

    list.innerHTML = pending.map(s => `
      <div onclick="openAdminChat(${s.id}, '${s.guest_name}', '${s.guest_email}')"
           style="padding:12px;border-radius:8px;cursor:pointer;border:1px solid #eee;margin-bottom:8px;background:${s.status==='pending'?'#fff8f0':'#f0fff4'}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="font-size:14px">${s.guest_name}</strong>
          <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${s.status==='pending'?'#BE2130':'#1B6B3A'};color:white">
            ${s.status === 'pending' ? '⏳ Waiting' : '🟢 Active'}
          </span>
        </div>
        <p style="font-size:12px;color:#888;margin-top:4px">${s.guest_email}</p>
        <p style="font-size:12px;color:#555;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${s.last_message || 'No messages yet'}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Could not load chat sessions:', err);
  }
}

function openAdminChat(sessionId, guestName, guestEmail) {
  activeChatSession = sessionId;
  adminLastMessageId = 0;

  const panel = document.getElementById('admin-chat-panel');
  if (panel) panel.style.display = 'flex';

  document.getElementById('admin-chat-guest-name').textContent  = guestName;
  document.getElementById('admin-chat-guest-email').textContent = guestEmail;
  document.getElementById('admin-chat-messages').innerHTML = '';

  if (adminChatPollInterval) clearInterval(adminChatPollInterval);
  adminChatPollInterval = setInterval(pollAdminChat, 2000);
  pollAdminChat();
}

async function pollAdminChat() {
  if (!activeChatSession) return;
  try {
    const res  = await fetch(`backend/chat_poll.php?session_id=${activeChatSession}&after=${adminLastMessageId}`);
    const data = await res.json();
    if (!data.success) return;

    data.messages.forEach(m => {
      appendAdminChatMessage(m.sender, m.message);
      if (parseInt(m.id) > adminLastMessageId) adminLastMessageId = parseInt(m.id);
    });

    if (data.status === 'closed') {
      clearInterval(adminChatPollInterval);
      appendAdminChatMessage('system', 'Chat session was closed.');
    }
  } catch (err) {
    console.error('Poll error:', err);
  }
}

function appendAdminChatMessage(sender, text) {
  const container = document.getElementById('admin-chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.style.cssText = `max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;word-break:break-word;margin-bottom:6px;` +
    (sender === 'admin'  ? 'align-self:flex-end;background:#1B6B3A;color:white;border-bottom-right-radius:3px' :
     sender === 'guest'  ? 'align-self:flex-start;background:#f0f0f0;color:#333;border-bottom-left-radius:3px' :
                           'align-self:center;color:#888;font-style:italic;font-size:12px');
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendAdminMessage() {
  const input = document.getElementById('admin-chat-input');
  const msg   = input.value.trim();
  if (!msg || !activeChatSession) return;
  input.value = '';

  appendAdminChatMessage('admin', msg);

  await fetch('backend/chat_send.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: activeChatSession, token: '', sender: 'admin', message: msg })
  });
}

async function closeAdminChat() {
  if (!activeChatSession) return;
  await fetch('backend/chat_close.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: activeChatSession })
  });
  clearInterval(adminChatPollInterval);
  activeChatSession = null;
  adminLastMessageId = 0;
  const panel = document.getElementById('admin-chat-panel');
  if (panel) panel.style.display = 'none';
  loadChatSessions();
}
