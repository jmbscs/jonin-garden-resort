// Admin guard
(function() {
  const user = JSON.parse(localStorage.getItem('joNinCurrentUser') || 'null');
  if (!user || user.role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = 'homepage_index.html';
  }
})();

async function loadReports() {
  try {
    const res  = await fetch('backend/get_reports.php');
    const data = await res.json();
    if (!data.success) return;

    // Stat cards
    document.getElementById('monthly-revenue').textContent  = '₱' + Number(data.monthly.total_revenue).toLocaleString();
    document.getElementById('total-bookings').textContent   = data.monthly.total_bookings;
    document.getElementById('total-guests').textContent     = data.monthly.total_guests;

    // Revenue by item cards
    const itemsWrap = document.getElementById('items-breakdown');
    if (itemsWrap) {
      itemsWrap.innerHTML = data.byItem.map(item => `
        <div class="report-card report-card-green">
          <h3>${item.item_name}</h3>
          <p>₱${Number(item.revenue).toLocaleString()}</p>
          <small>${item.times_booked} bookings</small>
        </div>
      `).join('');
    }

    // Status breakdown
    const pending   = data.byStatus['pending']   || 0;
    const confirmed = data.byStatus['confirmed'] || 0;
    const cancelled = data.byStatus['cancelled'] || 0;
    const statusEl  = document.getElementById('status-breakdown');
    if (statusEl) {
      statusEl.innerHTML = `
        <tr><td>Pending</td><td>${pending}</td><td><span class="status status-pending">Pending</span></td></tr>
        <tr><td>Confirmed</td><td>${confirmed}</td><td><span class="status status-confirmed">Up</span></td></tr>
        <tr><td>Cancelled</td><td>${cancelled}</td><td><span class="status status-booked">—</span></td></tr>
      `;
    }

    // Recent bookings table
    const recentEl = document.getElementById('recent-tbody');
    if (recentEl) {
      recentEl.innerHTML = data.recent.map(b => {
        const date = new Date(b.booking_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
        return `
          <tr>
            <td>${b.guest_name}</td>
            <td>${b.booking_ref}</td>
            <td>${date}</td>
            <td>₱${Number(b.total_amount).toLocaleString()}</td>
            <td><span class="status status-${b.status === 'confirmed' ? 'confirmed' : 'pending'}">${b.status}</span></td>
          </tr>
        `;
      }).join('');
    }

    // Top dates
    const topDatesEl = document.getElementById('top-dates');
    if (topDatesEl) {
      topDatesEl.innerHTML = data.topDates.map(d => {
        const date = new Date(d.booking_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        return `<li>${date} — <strong>${d.count} booking${d.count > 1 ? 's' : ''}</strong></li>`;
      }).join('');
    }

  } catch (err) {
    console.error('Could not load reports:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadReports);