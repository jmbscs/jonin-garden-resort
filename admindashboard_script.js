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
