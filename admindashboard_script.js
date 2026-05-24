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

async function loadRecentBookings() {
  try {
    const res  = await fetch('backend/get_bookings.php');
    const data = await res.json();

    if (!data.success) return;

    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">No bookings yet</td></tr>';
      return;
    }

    data.bookings.forEach(booking => {
      const date     = new Date(booking.booking_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      const items    = booking.selectedItems.map(i => i.item_name).join(', ') || '—';
      const status   = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
      const statusClass = booking.status === 'confirmed' ? 'status-confirmed' :
                          booking.status === 'cancelled' ? 'status-cancelled' : 'status-pending';

      const actionBtn = booking.status === 'pending'
        ? `<button class="table-btn" onclick="confirmBooking(${booking.id})">Confirm</button>`
        : `<button class="table-btn" onclick="viewBooking(${booking.id})">Details</button>`;

      tbody.innerHTML += `
        <tr data-booking-id="${booking.id}">
          <td>${booking.guest_name}</td>
          <td>${items}</td>
          <td>${date}</td>
          <td><span class="${statusClass}">${status}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
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
    if (data.success) {
      loadRecentBookings();
      loadAdminStats();
    }
  } catch (err) {
    console.error('Could not confirm booking:', err);
  }
}

function viewBooking(bookingId) {
  alert('Booking ID: ' + bookingId);
}

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStats();
  loadRecentBookings();
  // Refresh every 30 seconds
  setInterval(() => {
    loadAdminStats();
    loadRecentBookings();
  }, 30000);
});