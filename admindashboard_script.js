async function loadAdminStats() {
  const res  = await fetch('backend/get_stats.php');
  const data = await res.json();

  if (data.success) {
    document.getElementById('total-bookings').textContent = data.totals.total_bookings;
    document.getElementById('total-revenue').textContent  = '₱' + Number(data.totals.total_revenue).toLocaleString();
    document.getElementById('total-guests').textContent   = data.totals.total_guests;
  }
}

document.addEventListener('DOMContentLoaded', loadAdminStats);