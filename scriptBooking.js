const supabaseUrl = 'https://fdpcmuwwbalwofxydsds.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcGNtdXd3YmFsd29meHlkc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA3OTUsImV4cCI6MjA2MjYyNjc5NX0.FmvbrFqPepMcxJbY6eGLeS7oMIfDzXnMPAjdF-8MWGY'; // Replace with your Supabase anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Export supabase for use in HTML scripts
window.supabase = supabase;

// Calculate nights between check-in and check-out dates
function calculateNights(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate - checkInDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Check room availability
async function checkAvailability(roomType, checkIn, checkOut) {
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_type', roomType)
        .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`);

    if (error) {
        console.error('Error checking availability:', error);
        return false;
    }
    return bookings.length === 0;
}

// Fetch and display user bookings
async function displayUserBookings() {
    const bookingsList = document.getElementById('bookings-list');
    if (!bookingsList) return;

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('check_in_date', { ascending: true });

    if (error) {
        console.error('Error fetching bookings:', error);
        bookingsList.innerHTML = '<p>Error loading bookings.</p>';
        return;
    }

    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <h3>${booking.room_type}</h3>
            <p>Check-In: ${booking.check_in_date}</p>
            <p>Check-Out: ${booking.check_out_date}</p>
            <p>Nights: ${booking.nights}</p>
            <p>Booked on: ${new Date(booking.created_at).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// Update nights field dynamically
function updateNights(checkInId, checkOutId, nightsId) {
    const checkIn = document.getElementById(checkInId).value;
    const checkOut = document.getElementById(checkOutId).value;
    if (checkIn && checkOut) {
        const nights = calculateNights(checkIn, checkOut);
        document.getElementById(nightsId).value = nights > 0 ? nights : 1;
        updateTotal();
    }
}

// Update total based on nights and guests
function updateTotal() {
    const nights = parseInt(document.getElementById('modal-nights').value);
    const adults = parseInt(document.getElementById('modal-adults').value);
    const children = parseInt(document.getElementById('modal-children').value);
    const roomType = document.getElementById('modal-room-type').value;
    let baseRate = roomType === 'Ocean View Suite' ? 2150.00 : 3000.00;
    const totalGuests = adults + children;
    const maxGuests = roomType === 'Ocean View Suite' ? 2 : 4;

    if (totalGuests > maxGuests) {
        document.getElementById('modal-adults').value = maxGuests;
        document.getElementById('modal-children').value = 0;
        alert(`Maximum guests for ${roomType} is ${maxGuests}.`);
    }

    const rate = baseRate * nights;
    document.getElementById('modal-rate').textContent = `R${baseRate.toFixed(2)}`;
    document.getElementById('modal-total').value = `R${rate.toFixed(2)}`;
}

// Handle booking modal form submission
async function handleBookingModalSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('booking-modal-form');
    const message = document.getElementById('modal-message');
    const checkIn = document.getElementById('modal-check-in').value;
    const checkOut = document.getElementById('modal-check-out').value;
    const roomType = document.getElementById('modal-room-type').value;
    const nights = parseInt(document.getElementById('modal-nights').value);
    const termsCheckbox = document.getElementById('terms-checkbox');

    if (!termsCheckbox.checked) {
        message.textContent = 'Please accept the terms and conditions.';
        message.style.color = 'red';
        return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
        message.textContent = 'Check-out date must be after check-in date.';
        message.style.color = 'red';
        return;
    }

    const isAvailable = await checkAvailability(roomType, checkIn, checkOut);
    if (!isAvailable) {
        message.textContent = 'Sorry, this room is not available for the selected dates.';
        message.style.color = 'red';
        return;
    }

    const { error } = await supabase
        .from('bookings')
        .insert({
            room_type: roomType,
            check_in_date: checkIn,
            check_out_date: checkOut,
            nights: nights
        });

    if (error) {
        message.textContent = 'Error creating booking: ' + error.message;
        message.style.color = 'red';
    } else {
        message.textContent = 'Booking successful!';
        message.style.color = 'green';
        displayUserBookings();
        form.reset();
        document.getElementById('modal-nights').value = 1;
        document.getElementById('modal-adults').value = 2;
        document.getElementById('modal-children').value = 0;
        updateTotal();
        document.getElementById('booking-modal').classList.remove('active');
    }
}

// Handle booking form submission
document.getElementById('booking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formMessage = document.getElementById('form-message');
    const roomType = document.getElementById('room-type').value;
    const checkIn = document.getElementById('check-in').value;
    const checkOut = document.getElementById('check-out').value;
    const nights = parseInt(document.getElementById('nights').value);

    if (new Date(checkIn) >= new Date(checkOut)) {
        formMessage.textContent = 'Check-out date must be after check-in date.';
        formMessage.style.color = 'red';
        return;
    }

    const isAvailable = await checkAvailability(roomType, checkIn, checkOut);
    if (!isAvailable) {
        formMessage.textContent = 'Sorry, this room is not available for the selected dates.';
        formMessage.style.color = 'red';
        return;
    }

    const { error } = await supabase
        .from('bookings')
        .insert({
            room_type: roomType,
            check_in_date: checkIn,
            check_out_date: checkOut,
            nights
        });

    if (error) {
        formMessage.textContent = 'Error creating booking: ' + error.message;
        formMessage.style.color = 'red';
    } else {
        formMessage.textContent = 'Booking successful!';
        formMessage.style.color = 'green';
        displayUserBookings();
        document.getElementById('booking-form').reset();
        document.getElementById('nights').value = 1;
    }
});

// Update nights field dynamically for booking form
document.getElementById('check-in')?.addEventListener('change', () => updateNights('check-in', 'check-out', 'nights'));
document.getElementById('check-out')?.addEventListener('change', () => updateNights('check-in', 'check-out', 'nights'));

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS safely
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
        });
    } else {
        console.warn('AOS library not loaded. Animations disabled.');
    }

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav ul');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Sticky header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Booking modal
    const bookButtons = document.querySelectorAll('.book-room-btn');
    const bookingModal = document.getElementById('booking-modal');
    const closeModal = bookingModal.querySelector('.close-modal');

    bookButtons.forEach(button => {
        button.addEventListener('click', () => {
            const roomType = button.getAttribute('data-room-type');
            document.getElementById('modal-room-type').value = roomType;
            document.getElementById('modal-check-in').value = '2025-05-09';
            document.getElementById('modal-check-out').value = '2025-05-10';
            document.getElementById('modal-nights').value = 1;
            document.getElementById('modal-adults').value = 2;
            document.getElementById('modal-children').value = 0;
            updateTotal();
            bookingModal.classList.add('active');
        });
    });

    closeModal.addEventListener('click', () => {
        bookingModal.classList.remove('active');
    });

    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('active');
        }
    });

    document.getElementById('booking-modal-form').addEventListener('submit', handleBookingModalSubmit);

    // Guest counter
    document.getElementById('modal-adults-decrement').addEventListener('click', () => {
        const adults = document.getElementById('modal-adults');
        if (parseInt(adults.value) > 1) adults.value = parseInt(adults.value) - 1;
        updateTotal();
    });

    document.getElementById('modal-adults-increment').addEventListener('click', () => {
        const adults = document.getElementById('modal-adults');
        if (parseInt(adults.value) < 4) adults.value = parseInt(adults.value) + 1;
        updateTotal();
    });

    document.getElementById('modal-children-decrement').addEventListener('click', () => {
        const children = document.getElementById('modal-children');
        if (parseInt(children.value) > 0) children.value = parseInt(children.value) - 1;
        updateTotal();
    });

    document.getElementById('modal-children-increment').addEventListener('click', () => {
        const children = document.getElementById('modal-children');
        if (parseInt(children.value) < 4) children.value = parseInt(children.value) + 1;
        updateTotal();
    });

    // Update nights for modal
    document.getElementById('modal-check-in').addEventListener('change', () => updateNights('modal-check-in', 'modal-check-out', 'modal-nights'));
    document.getElementById('modal-check-out').addEventListener('change', () => updateNights('modal-check-in', 'modal-check-out', 'modal-nights'));

    // Initialize AOS and other existing scripts
    updateNights('check-in', 'check-out', 'nights');
});



// AOS Initialization
AOS.init({
    duration: 1000,
    once: true
});

// Common Functions (to be called from HTML)
function updateRates(roomData, nights, adults, children) {
    const totalGuests = parseInt(adults) + parseInt(children);
    if (totalGuests > roomData.maxGuests) {
        alert(`Maximum guests for ${roomData.roomType} is ${roomData.maxGuests}.`);
        adults = roomData.maxGuests - children;
        if (adults < 1) adults = 1;
    }
    const totalPrice = roomData.pricePerNight * parseInt(nights);
    return {
        pricePerNight: roomData.pricePerNight,
        total: totalPrice.toFixed(2),
        adults: adults,
        children: children
    };
}

   
    
        