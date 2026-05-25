// Store bookings in localStorage
let userBookings = [];
let currentQRCode = null;
let currentBookingData = null;

// Load saved bookings from localStorage
async function loadBookingsFromServer() {
  try {
    const response = await fetch('backend/get_bookings.php');
    const result   = await response.json();

    if (result.success) {
      userBookings = result.bookings; // your existing variable
      // renderBookingsList called after load
    }
  } catch (err) {
    console.error('Could not load bookings:', err);
  }
}

// Call it on page load instead of loadBookings()
document.addEventListener('DOMContentLoaded', () => {
  loadBookingsFromServer();
});

// Save bookings to localStorage
async function submitBookingToServer(bookingData) {
  try {
    const response = await fetch('backend/create_booking.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(bookingData)
    });

    const result = await response.json();

    if (result.success) {
      // Use the real booking ref from the server
      bookingData.id  = result.bookingRef;
      bookingData.qrData = result.qrData;

      showToast('Booking confirmed! Ref: ' + result.bookingRef, 'success');
      // Continue with your QR code generation here...
      return result;

    } else {
      showToast('Booking failed: ' + result.message, 'error');
      return null;
    }

  } catch (err) {
    showToast('Network error. Please try again.', 'error');
    console.error(err);
    return null;
  }
}

// Get current user (using localStorage for demo)
function getCurrentUser() {
    let user = localStorage.getItem('joNinCurrentUser');
    if (!user) {
        user = {
            id: 'guest_' + Math.random().toString(36).substr(2, 9),
            name: 'Guest',
            email: ''
        };
        localStorage.setItem('joNinCurrentUser', JSON.stringify(user));
    } else {
        user = JSON.parse(user);
    }
    return user;
}

// Update guest name display
function updateGuestDisplay() {
    const user = getCurrentUser();
    const guestNameSpan = document.getElementById('guestNameDisplay');
    if (guestNameSpan && user.name) {
        guestNameSpan.textContent = user.name;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.background = type === 'success' ? '#1B6B3A' : '#BE2130';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Generate QR Code
function generateQRCode(data) {
    return new Promise((resolve) => {
        const qrContainer = document.createElement('div');
        new QRCode(qrContainer, {
            text: data,
            width: 200,
            height: 200,
            colorDark: "#2C1A0E",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.L
        });
        setTimeout(() => {
            const qrImage = qrContainer.querySelector('img');
            if (qrImage) {
                resolve(qrImage.src);
            } else {
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    resolve(canvas.toDataURL());
                }
            }
        }, 100);
    });
}

// Set active menu item
function setActive(el) {
    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.classList.remove('active');
    });
    el.classList.add('active');
}

// Search filter
document.addEventListener('DOMContentLoaded', function() {
    loadBookingsFromServer();
    updateGuestDisplay();
    
    // Initialize calendar
    flatpickr("#date-picker", {
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            // Filter available items based on date (for demo, just show availability)
            filterAvailability(dateStr);
        }
    });
    
    // Initialize calendar in modal
    flatpickr("#b-date", {
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            updateTotalPrice();
        }
    });
    
    // Search filter
    var searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            var query = this.value.toLowerCase();
            document.querySelectorAll('.listing-card').forEach(function(card) {
                var text = card.innerText.toLowerCase();
                card.style.display = text.includes(query) ? '' : 'none';
            });
            updateSectionCounts();
        });
    }
    
    // Guest count filter
    const guestCountInput = document.getElementById('guest-count');
    if (guestCountInput) {
        guestCountInput.addEventListener('input', function() {
            filterByGuestCount(this.value);
        });
    }
    
    // Book Now / Add On buttons
    document.querySelectorAll('.book-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = btn.closest('.listing-card');
            const isSelected = card.classList.contains('card-selected');

            if (isSelected) {
                btn.textContent = btn.innerText === 'Add On' ? 'Add On' : 'Book Now';
                btn.style.background = '';
                btn.style.color = '';
                card.classList.remove('card-selected');
            } else {
                btn.textContent = '✓ Selected';
                btn.style.background = '#1B6B3A';
                btn.style.color = 'white';
                card.classList.add('card-selected');
            }
            updateTotalPrice();
        });
    });
    
    // Close modals on backdrop click
    var bmodal = document.getElementById('booking-modal');
    if (bmodal) {
        bmodal.addEventListener('click', function(e) {
            if (e.target === bmodal) closeBookingModal();
        });
    }
    
    var confModal = document.getElementById('confirmation-modal');
    if (confModal) {
        confModal.addEventListener('click', function(e) {
            if (e.target === confModal) closeConfirmationModal();
        });
    }
    
    var bookingsModal = document.getElementById('bookings-modal');
    if (bookingsModal) {
        bookingsModal.addEventListener('click', function(e) {
            if (e.target === bookingsModal) closeBookingsModal();
        });
    }
    
    updateSectionCounts();
});

// Filter availability by date
function filterAvailability(date) {
    // For demo, just log. In production, you'd check database
}

// Filter by guest count
function filterByGuestCount(count) {
    const guestNum = parseInt(count) || 0;
    document.querySelectorAll('.listing-card').forEach(function(card) {
        const maxGuests = parseInt(card.dataset.maxGuests) || 999;
        if (guestNum > 0 && guestNum > maxGuests) {
            card.style.display = 'none';
        } else {
            if (card.style.display !== 'none') {
                card.style.display = '';
            }
        }
    });
    updateSectionCounts();
}

// Update section counts based on visible cards
function updateSectionCounts() {
    const sections = ['passes', 'cottages', 'rooms', 'events'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
            const visibleCards = sectionElement.querySelectorAll('.listing-card:not([style*="display: none"])').length;
            const countSpan = sectionElement.querySelector('.listing-count');
            if (countSpan) {
                countSpan.textContent = `${visibleCards} available`;
            }
        }
    });
}

// Calculate total price based on selected items
function calculateTotalPrice() {
    let total = 0;
    const selectedCards = document.querySelectorAll('.listing-card.card-selected');
    
    selectedCards.forEach(card => {
        const priceText = card.querySelector('.card-price').innerText;
        let price = 0;
        const priceMatch = priceText.match(/₱(\d+)/);
        if (priceMatch) {
            price = parseInt(priceMatch[1]);
        }
        total += price;
    });
    
    const guests = parseInt(document.getElementById('b-guests')?.value) || 1;
    const guestCount = parseInt(document.getElementById('guest-count')?.value) || 1;
    
    // For passes, multiply by number of guests
    const hasPass = Array.from(document.querySelectorAll('.listing-card.card-selected')).some(card => 
        card.classList.contains('card-pass')
    );
    
    if (hasPass) {
        const passPrice = 150;
        total = (passPrice * guests) + (total - passPrice);
    }
    
    return total;
}

// Update total price display
function updateTotalPrice() {
    const total = calculateTotalPrice();
    const totalEl = document.getElementById('b-total');
    if (totalEl) {
        totalEl.textContent = `₱${total}`;
    }
}

// Open booking modal
function openBookingModal() {
    const selectedCards = document.querySelectorAll('.listing-card.card-selected');
    const itemsList = document.getElementById('b-selected-items');
    const totalEl = document.getElementById('b-total');
    
    if (selectedCards.length === 0) {
        showToast('Please select at least one item by clicking "Book Now" or "Add On" on your chosen options.', 'error');
        return;
    }
    
    let items = [];
    selectedCards.forEach(function(card) {
        const title = card.querySelector('h3').innerText;
        const priceText = card.querySelector('.card-price').innerText;
        items.push('✓ ' + title + ' — ' + priceText);
    });
    
    itemsList.innerHTML = items.join('<br>');
    
    const total = calculateTotalPrice();
    totalEl.textContent = `₱${total}`;
    
    // Set default date
    const datePicker = document.getElementById('b-date');
    if (datePicker && !datePicker.value) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
    }
    
    document.getElementById('booking-modal').classList.add('active');
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.remove('active');
    currentQRCode = null;
    currentBookingData = null;
}

function closeBookingsModal() {
    document.getElementById('bookings-modal').classList.remove('active');
}

// Submit booking
async function submitBooking(method) {
    const name = document.getElementById('b-name').value.trim();
    const email = document.getElementById('b-email').value.trim();
    const phone = document.getElementById('b-phone').value.trim();
    const datePicker = document.getElementById('b-date');
    const date = datePicker._flatpickr ? datePicker._flatpickr.selectedDates[0] ? 
    datePicker._flatpickr.selectedDates[0].toISOString().split('T')[0] : 
    datePicker.value : datePicker.value;
    const guests = document.getElementById('b-guests').value;
    const specialRequests = document.getElementById('b-notes').value;
    

    if (!date || date.length !== 10) {
    showToast('Please select a valid date.', 'error');
    return;
    }
    if (!name || !email || !date || !guests) {
        showToast('Please fill in your name, email, date of visit, and number of guests.', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }
    
    // Get selected items
    const selectedCards = document.querySelectorAll('.listing-card.card-selected');
    const selectedItems = [];
    selectedCards.forEach(card => {
        selectedItems.push({
            name: card.querySelector('h3').innerText,
            type: card.dataset.type || 'unknown',
            price: parseInt(card.querySelector('.card-price').innerText.match(/₱(\d+)/)?.[1] || 0)
        });
    });
    
    const totalAmount = calculateTotalPrice();
    const paymentMethod = method === 'online' ? 'Online (GCash/Bank Transfer)' : (method === 'visit' ? 'Pay at Resort' : 'To be confirmed');
    const paymentStatus = method === 'online' ? 'pending' : (method === 'visit' ? 'pending_payment' : 'pending');
    
    // Generate unique booking ID
    const bookingId = 'JN' + new Date().getTime() + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Create booking object
    const booking = {
        id: bookingId,
        name: name,
        email: email,
        phone: phone,
        date: date,
        guests: parseInt(guests),
        selectedItems: selectedItems,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        status: 'pending',
        specialRequests: specialRequests,
        createdAt: new Date().toISOString(),
        qrData: `${bookingId}|${name}|${date}|${totalAmount}`
    };
    
    
    // Save to server
    const serverResult = await submitBookingToServer({
        name:            name,
        email:           email,
        phone:           phone,
        date:            date,
        guests:          parseInt(guests),
        selectedItems:   selectedItems,
        totalAmount:     totalAmount,
        paymentMethod:   method === 'online' ? 'gcash' : 'cash',
        paymentStatus:   'unpaid',
        specialRequests: specialRequests
    });

    if (!serverResult) return; // stop if server failed

    // Use server-generated booking ref
    booking.id     = serverResult.bookingRef;
    booking.qrData = serverResult.qrData;
    userBookings.push(booking);
    
    // Update current user info
    const user = getCurrentUser();
    user.name = name;
    user.email = email;
    localStorage.setItem('joNinCurrentUser', JSON.stringify(user));
    updateGuestDisplay();
    
    // Generate QR code
    const qrData = serverResult.bookingRef;
    const qrImageData = await generateQRCode(qrData);

    function renderBookingsList() {
}
    
    // Show confirmation with QR code
    showConfirmationModal(booking, qrImageData);
    
    // Close booking modal
    closeBookingModal();
    
    // Reset selections
    document.querySelectorAll('.listing-card.card-selected').forEach(card => {
        const btn = card.querySelector('.book-btn');
        if (btn) {
            btn.textContent = btn.innerText === 'Add On' ? 'Add On' : 'Book Now';
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
            card.classList.remove('card-selected');
        }
    });
}

// Show confirmation modal with QR code
function showConfirmationModal(booking, qrImageData) {
    const modal = document.getElementById('confirmation-modal');
    const qrContainer = document.getElementById('qr-code-display');
    const summaryDetails = document.getElementById('booking-summary-details');
    const messageEl = document.getElementById('confirmation-message');
    
    currentBookingData = booking;
    
    messageEl.innerHTML = `Your booking has been successfully created!<br>Booking ID: <strong>${booking.id}</strong>`;
    
    // Clear and add QR code
    qrContainer.innerHTML = '';
    const qrImg = document.createElement('img');
    qrImg.src = qrImageData;
    qrImg.style.width = '200px';
    qrImg.style.height = '200px';
    qrContainer.appendChild(qrImg);
    
    // Build summary
    summaryDetails.innerHTML = `
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Items:</strong> ${booking.selectedItems.map(i => i.name).join(', ')}</p>
        <p><strong>Total Amount:</strong> ₱${booking.totalAmount}</p>
        <p><strong>Payment:</strong> ${booking.paymentMethod}</p>
    `;
    
    modal.classList.add('active');
}

// Download QR code
function downloadQRCode() {
    const qrImg = document.querySelector('#qr-code-display img');
    if (qrImg) {
        const link = document.createElement('a');
        link.download = `jo-nin-booking-${currentBookingData?.id || 'qr'}.png`;
        link.href = qrImg.src;
        link.click();
        showToast('QR Code downloaded!', 'success');
    } else {
        showToast('Unable to download QR code.', 'error');
    }
}

// Show my bookings
async function showMyBookings() {
    const user = getCurrentUser();
    if (!user || !user.email) {
        document.getElementById('bookings-list').innerHTML = 
            '<p style="text-align:center;color:#888">Please log in to view your bookings.</p>';
        document.getElementById('bookings-modal').classList.add('active');
        return;
    }

    document.getElementById('bookings-list').innerHTML = 
        '<p style="text-align:center;color:#888">Loading your bookings...</p>';
    document.getElementById('bookings-modal').classList.add('active');

    try {
        const res  = await fetch('backend/get_bookings.php');
        const data = await res.json();

        if (!data.success) throw new Error('Failed to load');

        // Filter by logged-in user email
        const myBookings = data.bookings.filter(b => b.guest_email === user.email);

        const bookingsList = document.getElementById('bookings-list');

        if (myBookings.length === 0) {
            bookingsList.innerHTML = 
                '<p style="text-align:center;color:#888">You don\'t have any bookings yet.</p>';
            return;
        }

        bookingsList.innerHTML = myBookings.map(booking => {
            const items   = booking.selectedItems.map(i => i.item_name).join(', ') || '—';
            const date    = new Date(booking.booking_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
            const status  = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
            const checkin = booking.checkin_status === 'checked_in'  ? '✅ Checked In' :
                            booking.checkin_status === 'checked_out' ? '🚪 Checked Out' : '⏳ Not yet arrived';

            return `
                <div class="booking-item">
                    <div class="booking-info">
                        <h4>${items}</h4>
                        <p>📅 ${date} | 👥 ${booking.num_guests} guests</p>
                        <p>💰 ₱${Number(booking.total_amount).toLocaleString()} | ${booking.payment_method}</p>
                        <p>🆔 ${booking.booking_ref}</p>
                        <p>${checkin}</p>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                        <span class="booking-status status-${booking.status === 'confirmed' ? 'confirmed' : 'pending'}">
                            ${status}
                        </span>
                        <button class="booking-view-qr" onclick="viewBookingQR('${booking.booking_ref}')">View QR</button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        document.getElementById('bookings-list').innerHTML = 
            '<p style="text-align:center;color:#888">Could not load bookings. Try again.</p>';
        console.error(err);
    }
}

// View QR code from saved booking
async function viewBookingQR(bookingRef) {
    const qrImageData = await generateQRCode(bookingRef);

    // Build a minimal booking object that showConfirmationModal can handle
    const fakeBooking = {
        id:            bookingRef,
        name:          getCurrentUser().name,
        date:          '',
        guests:        '',
        selectedItems: [],
        totalAmount:   '',
        paymentMethod: ''
    };

    showConfirmationModal(fakeBooking, qrImageData);
    closeBookingsModal();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('joNinCurrentUser');
        window.location.href = 'hompage_index.html';
    }
}

// Update total price when guests change
document.addEventListener('DOMContentLoaded', function() {
    const guestInput = document.getElementById('b-guests');
    if (guestInput) {
        guestInput.addEventListener('input', updateTotalPrice);
    }
    
    const mainGuestInput = document.getElementById('guest-count');
    if (mainGuestInput) {
        mainGuestInput.addEventListener('input', updateTotalPrice);
    }
});