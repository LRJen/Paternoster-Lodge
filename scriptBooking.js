// Initialize AOS for animations
AOS.init({
    duration: 1000,
    once: true
});

// Initialize Supabase (replace with your actual Supabase URL and anon key)
const supabaseUrl = 'https://fdpcmuwwbalwofxydsds.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcGNtdXd3YmFsd29meHlkc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA3OTUsImV4cCI6MjA2MjYyNjc5NX0.FmvbrFqPepMcxJbY6eGLeS7oMIfDzXnMPAjdF-8MWGY'; // Replace with your Supabase anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Room data for pricing
const roomsData = {
    'Ocean View Suite': { basePrice: 2150, additionalAdult: 500, additionalChild: 0, maxGuests: 2, maxAdults: 2 },
    'Family Cottage': { basePrice: 3000, additionalAdult: 600, additionalChild: 0, maxGuests: 4, maxAdults: 4 }
};

// Current date and time (11:57 AM SAST, May 15, 2025)
const currentDate = new Date('2025-05-15T11:57:00+02:00');
const fullyBookedDates = ['2025-05-15', '2025-05-16', '2025-05-20', '2025-05-21', '2025-05-22', '2025-05-23', '2025-05-30', '2025-05-31'];

// Booking Form Functions (booking.html)
function initializeBookingForm() {
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    const nightsInput = document.getElementById('nights');
    const halfDayToggle = document.getElementById('half-day-event');
    let halfDayEvent = false;

    flatpickr(checkInInput, {
        dateFormat: "Y-m-d",
        minDate: currentDate,
        disable: fullyBookedDates,
        onChange: (selectedDates) => {
            const checkInDate = selectedDates[0];
            if (checkOutPicker.selectedDates[0] <= checkInDate) {
                checkOutPicker.setDate(new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000));
            }
            updateNights();
        }
    });

    const checkOutPicker = flatpickr(checkOutInput, {
        dateFormat: "Y-m-d",
        minDate: currentDate,
        disable: fullyBookedDates,
        onChange: () => updateNights()
    });

    function updateNights() {
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);
        const timeDiff = checkOutDate - checkInDate;
        let nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (halfDayEvent) nights = 0.5;
        nightsInput.value = nights;
    }

    halfDayToggle.addEventListener('change', () => {
        halfDayEvent = halfDayToggle.checked;
        updateNights();
    });

    // Calendar
    const calendarContainer = document.getElementById('calendar-container');
    const viewCalendarBtn = document.querySelector('.view-calendar-btn');
    const closeCalendarBtn = document.getElementById('close-calendar-btn');

    flatpickr("#calendar", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: currentDate,
        disable: fullyBookedDates.map(date => ({ from: date, to: date })),
        onDayCreate: (dObj, dStr, fp, dayElem) => {
            if (fullyBookedDates.includes(dStr)) {
                dayElem.classList.add('fully-booked');
            }
        },
        defaultDate: [checkInInput.value, checkOutInput.value],
        onChange: (selectedDates) => {
            if (selectedDates.length === 2) {
                checkInInput.value = selectedDates[0].toISOString().split('T')[0];
                checkOutInput.value = selectedDates[1].toISOString().split('T')[0];
                updateNights();
            }
        }
    });

    viewCalendarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        calendarContainer.style.display = 'block';
    });

    closeCalendarBtn.addEventListener('click', () => {
        calendarContainer.style.display = 'none';
    });

    // Check Availability
    document.getElementById('booking-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const roomType = document.getElementById('room-type').value;
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);
        const availabilityTable = document.getElementById('availability-table');
        const availabilityTableBody = document.getElementById('availability-table-body');

        if (!roomType) {
            document.getElementById('form-message').textContent = 'Please select a room type.';
            document.getElementById('form-message').style.color = 'red';
            return;
        }

        availabilityTableBody.innerHTML = '';
        let currentDate = new Date(checkInDate);
        let allAvailable = true;

        while (currentDate < checkOutDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const isBooked = fullyBookedDates.includes(dateStr);
            const row = document.createElement('tr');
            row.innerHTML = `<td>${dateStr}</td><td class="${isBooked ? 'booked' : 'available'}">${isBooked ? 'Booked' : 'Available'}</td>`;
            availabilityTableBody.appendChild(row);
            if (isBooked) allAvailable = false;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        availabilityTable.style.display = 'table';
        document.getElementById('form-message').textContent = allAvailable ? 'Dates are available!' : 'Some dates are booked. Please choose different dates.';
        document.getElementById('form-message').style.color = allAvailable ? 'green' : 'red';
    });

    // Rates Modal
    const ratesModal = document.getElementById('rates-modal');
    const bookRoomButtons = document.querySelectorAll('.book-room-btn');
    const closeRatesModal = document.querySelector('.close-rates-modal');
    let currentRoomType = '';
    let adults = 2;
    let children = 0;

    bookRoomButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            currentRoomType = button.getAttribute('data-room-type');
            adults = currentRoomType === 'Ocean View Suite' ? 2 : 4;
            children = 0;

            document.getElementById('rates-room-type').textContent = currentRoomType;
            document.getElementById('rates-check-in').textContent = checkInInput.value;
            document.getElementById('rates-check-out').textContent = checkOutInput.value;
            document.getElementById('rates-nights').textContent = nightsInput.value;
            document.getElementById('rates-adults').value = adults;
            document.getElementById('rates-children').value = children;

            updateRates();
            ratesModal.style.display = 'flex';
        });
    });

    function updateRates() {
        const roomData = roomsData[currentRoomType];
        const nights = parseFloat(nightsInput.value);
        const additionalAdults = Math.max(0, adults - (currentRoomType === 'Ocean View Suite' ? 2 : 4));
        let pricePerNight = roomData.basePrice + (additionalAdults * roomData.additionalAdult);
        let totalPrice = pricePerNight * nights;
        let discount = 0;

        if (nights > 3 && !halfDayToggle.checked) {
            discount = totalPrice * 0.1;
            totalPrice -= discount;
        }

        document.getElementById('rates-price-per-night').textContent = `R${pricePerNight.toFixed(2)}`;
        document.getElementById('rates-discount').textContent = `R${discount.toFixed(2)}`;
        document.getElementById('rates-total').textContent = `R${totalPrice.toFixed(2)}`;
    }

    document.getElementById('rates-adults-increment').addEventListener('click', () => {
        const totalGuests = adults + children;
        if (totalGuests < roomsData[currentRoomType].maxGuests) {
            adults++;
            document.getElementById('rates-adults').value = adults;
            updateRates();
        } else {
            alert(`Maximum guests for ${currentRoomType} is ${roomsData[currentRoomType].maxGuests}.`);
        }
    });

    document.getElementById('rates-adults-decrement').addEventListener('click', () => {
        if (adults > 1) {
            adults--;
            document.getElementById('rates-adults').value = adults;
            updateRates();
        }
    });

    document.getElementById('rates-children-increment').addEventListener('click', () => {
        const totalGuests = adults + children;
        if (totalGuests < roomsData[currentRoomType].maxGuests) {
            children++;
            document.getElementById('rates-children').value = children;
            updateRates();
        } else {
            alert(`Maximum guests for ${currentRoomType} is ${roomsData[currentRoomType].maxGuests}.`);
        }
    });

    document.getElementById('rates-children-decrement').addEventListener('click', () => {
        if (children > 0) {
            children--;
            document.getElementById('rates-children').value = children;
            updateRates();
        }
    });

    closeRatesModal.addEventListener('click', () => {
        ratesModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === ratesModal) {
            ratesModal.style.display = 'none';
        }
    });

    // Booking Modal
    const bookingModal = document.getElementById('booking-modal');
    const bookNowBtn = document.getElementById('book-now-btn');
    const closeBookingModal = bookingModal.querySelector('.close-modal');
    let selectedRooms = [];

    bookNowBtn.addEventListener('click', () => {
        selectedRooms = [{
            roomType: currentRoomType,
            adults: parseInt(document.getElementById('rates-adults').value),
            children: parseInt(document.getElementById('rates-children').value)
        }];

        renderRoomSelections();
        document.getElementById('modal-check-in').value = checkInInput.value;
        document.getElementById('modal-check-out').value = checkOutInput.value;
        document.getElementById('modal-nights').value = nightsInput.value;
        document.getElementById('modal-total').value = document.getElementById('rates-total').textContent;

        ratesModal.style.display = 'none';
        bookingModal.style.display = 'flex';
    });

    function renderRoomSelections() {
        const roomSelections = document.getElementById('room-selections');
        roomSelections.innerHTML = '';
        selectedRooms.forEach((room, index) => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room-selection';
            roomDiv.innerHTML = `
                <h4>${room.roomType} (Room ${index + 1})</h4>
                <div class="guest-counter">
                    <span>Adults</span>
                    <button type="button" class="decrement-adults" data-index="${index}">-</button>
                    <input type="number" class="adults-input" value="${room.adults}" min="1" readonly>
                    <button type="button" class="increment-adults" data-index="${index}">+</button>
                    <span>Children (Age 0-5)</span>
                    <button type="button" class="decrement-children" data-index="${index}">-</button>
                    <input type="number" class="children-input" value="${room.children}" min="0" readonly>
                    <button type="button" class="increment-children" data-index="${index}">+</button>
                </div>
                <button class="remove-room" style="color: red; font-size: 0.9rem;" data-index="${index}">Remove Room</button>
            `;
            roomSelections.appendChild(roomDiv);
        });

        document.querySelectorAll('.increment-adults').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const room = selectedRooms[index];
                const totalGuests = room.adults + room.children;
                if (totalGuests < roomsData[room.roomType].maxGuests) {
                    room.adults++;
                    renderRoomSelections();
                    updateBookingTotal();
                } else {
                    alert(`Maximum guests for ${room.roomType} is ${roomsData[room.roomType].maxGuests}.`);
                }
            });
        });

        document.querySelectorAll('.decrement-adults').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const room = selectedRooms[index];
                if (room.adults > 1) {
                    room.adults--;
                    renderRoomSelections();
                    updateBookingTotal();
                }
            });
        });

        document.querySelectorAll('.increment-children').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const room = selectedRooms[index];
                const totalGuests = room.adults + room.children;
                if (totalGuests < roomsData[room.roomType].maxGuests) {
                    room.children++;
                    renderRoomSelections();
                    updateBookingTotal();
                } else {
                    alert(`Maximum guests for ${room.roomType} is ${roomsData[room.roomType].maxGuests}.`);
                }
            });
        });

        document.querySelectorAll('.decrement-children').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const room = selectedRooms[index];
                if (room.children > 0) {
                    room.children--;
                    renderRoomSelections();
                    updateBookingTotal();
                }
            });
        });

        document.querySelectorAll('.remove-room').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                selectedRooms.splice(index, 1);
                renderRoomSelections();
                updateBookingTotal();
            });
        });
    }

    document.querySelector('.add-room-btn').addEventListener('click', () => {
        selectedRooms.push({
            roomType: currentRoomType,
            adults: currentRoomType === 'Ocean View Suite' ? 2 : 4,
            children: 0
        });
        renderRoomSelections();
        updateBookingTotal();
    });

    function updateBookingTotal() {
        let totalPrice = 0;
        const nights = parseFloat(nightsInput.value);
        selectedRooms.forEach(room => {
            const roomData = roomsData[room.roomType];
            const additionalAdults = Math.max(0, room.adults - (room.roomType === 'Ocean View Suite' ? 2 : 4));
            let pricePerNight = roomData.basePrice + (additionalAdults * roomData.additionalAdult);
            let roomTotal = pricePerNight * nights;
            if (nights > 3 && !halfDayToggle.checked) {
                roomTotal *= 0.9;
            }
            totalPrice += roomTotal;
        });
        document.getElementById('modal-total').value = `R${totalPrice.toFixed(2)}`;
    }

    closeBookingModal.addEventListener('click', () => {
        bookingModal.style.display = 'none';
        document.getElementById('modal-message').textContent = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.style.display = 'none';
            document.getElementById('modal-message').textContent = '';
        }
    });

    document.getElementById('confirm-booking-btn').addEventListener('click', () => {
        const termsCheckbox = document.getElementById('terms-checkbox');
        const modalMessage = document.getElementById('modal-message');
        if (!termsCheckbox.checked) {
            modalMessage.textContent = 'Please accept the terms and conditions.';
            modalMessage.style.color = 'red';
            return;
        }

        const firstName = document.getElementById('first-name').value;
        const surname = document.getElementById('surname').value;
        const email = document.getElementById('email').value;
        const retypeEmail = document.getElementById('retype-email').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const specialRequests = document.getElementById('special-requests').value;
        const paymentMethod = document.getElementById('payment-method').value;

        if (!firstName || !surname || !email || !retypeEmail || !phoneNumber || !paymentMethod) {
            modalMessage.textContent = 'Please fill in all required fields.';
            modalMessage.style.color = 'red';
            return;
        }

        if (email !== retypeEmail) {
            modalMessage.textContent = 'Emails do not match.';
            modalMessage.style.color = 'red';
            return;
        }

        const bookingDetails = {
            checkIn: checkInInput.value,
            checkOut: checkOutInput.value,
            nights: nightsInput.value,
            total: document.getElementById('modal-total').value.replace('R', ''),
            roomType: selectedRooms.map(r => r.roomType).join(', '),
            adults: selectedRooms.map(r => r.adults).join(', '),
            children: selectedRooms.map(r => r.children).join(', '),
            firstName: firstName,
            surname: surname,
            email: email,
            phoneNumber: phoneNumber,
            specialRequests: specialRequests,
            paymentMethod: paymentMethod,
            rooms: JSON.stringify(selectedRooms)
        };

        const queryString = new URLSearchParams(bookingDetails).toString();
        window.location.href = `register-login.html?${queryString}`;
    });
}

// Register/Login Functions (register-login.html)
function initializeRegisterLogin() {
    // Tab Switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Populate Booking Details
    const urlParams = new URLSearchParams(window.location.search);
    const bookingData = {
        checkIn: urlParams.get('checkIn') || 'N/A',
        checkOut: urlParams.get('checkOut') || 'N/A',
        nights: urlParams.get('nights') || 'N/A',
        total: urlParams.get('total') || 'N/A',
        roomType: urlParams.get('roomType') || 'N/A',
        adults: urlParams.get('adults') || 'N/A',
        children: urlParams.get('children') || 'N/A',
        firstName: urlParams.get('firstName') || 'N/A',
        surname: urlParams.get('surname') || 'N/A',
        email: urlParams.get('email') || 'N/A',
        phoneNumber: urlParams.get('phoneNumber') || 'N/A',
        specialRequests: urlParams.get('specialRequests') || 'None',
        paymentMethod: urlParams.get('paymentMethod') || 'N/A',
        rooms: JSON.parse(urlParams.get('rooms') || '[]')
    };

    document.getElementById('summary-room-type').textContent = bookingData.roomType;
    document.getElementById('summary-check-in').textContent = bookingData.checkIn;
    document.getElementById('summary-check-out').textContent = bookingData.checkOut;
    document.getElementById('summary-nights').textContent = bookingData.nights;
    document.getElementById('summary-adults').textContent = bookingData.adults;
    document.getElementById('summary-children').textContent = bookingData.children;
    document.getElementById('summary-total').textContent = bookingData.total;

    // Save Booking to Supabase
    async function saveBooking(userId) {
        const { error } = await supabase.from('bookings').insert({
            user_id: userId,
            room_type: bookingData.roomType,
            check_in_date: bookingData.checkIn,
            check_out_date: bookingData.checkOut,
            nights: bookingData.nights,
            total: bookingData.total,
            adults: bookingData.adults,
            children: bookingData.children,
            first_name: bookingData.firstName,
            surname: bookingData.surname,
            email: bookingData.email,
            phone_number: bookingData.phoneNumber,
            special_requests: bookingData.specialRequests,
            payment_method: bookingData.paymentMethod,
            rooms: bookingData.rooms,
            status: 'pending',
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error saving booking:', error.message);
        }
    }

    // Login Functionality
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const loginError = document.getElementById('login-error');

        if (!email || !password) {
            loginError.textContent = 'Please fill in all fields.';
            loginError.style.display = 'block';
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
        } else {
            loginError.style.display = 'none';
            const userId = data.user.id;
            await saveBooking(userId);
            const queryString = new URLSearchParams({ ...bookingData, userId }).toString();
            window.location.href = `booking-confirmation.html?${queryString}`;
        }
    });

    // Register Functionality
    document.getElementById('register-btn').addEventListener('click', async () => {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const registerError = document.getElementById('register-error');

        if (!name || !email || !password || !confirmPassword) {
            registerError.textContent = 'Please fill in all fields.';
            registerError.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match.';
            registerError.style.display = 'block';
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name } }
        });

        if (error) {
            registerError.textContent = error.message;
            registerError.style.display = 'block';
        } else if (data.user) {
            registerError.style.display = 'none';
            const userId = data.user.id;
            await saveBooking(userId);
            const queryString = new URLSearchParams({ ...bookingData, userId }).toString();
            window.location.href = `booking-confirmation.html?${queryString}`;
        } else {
            registerError.textContent = 'Please check your email to confirm registration.';
            registerError.style.display = 'block';
        }
    });
}

// Booking Confirmation Functions (booking-confirmation.html)
function initializeBookingConfirmation() {
    // Populate booking and personal information from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingData = {
        roomType: urlParams.get('roomType') || 'N/A',
        checkIn: urlParams.get('checkIn') || 'N/A',
        checkOut: urlParams.get('checkOut') || 'N/A',
        nights: urlParams.get('nights') || 'N/A',
        adults: urlParams.get('adults') || 'N/A',
        children: urlParams.get('children') || 'N/A',
        total: urlParams.get('total') || 'N/A',
        firstName: urlParams.get('firstName') || 'N/A',
        surname: urlParams.get('surname') || 'N/A',
        email: urlParams.get('email') || 'N/A',
        phoneNumber: urlParams.get('phoneNumber') || 'N/A',
        specialRequests: urlParams.get('specialRequests') || 'None',
        paymentMethod: urlParams.get('paymentMethod') || 'N/A',
        userId: urlParams.get('userId') || null
    };

    // Populate Booking Summary
    document.getElementById('summary-room-type').textContent = bookingData.roomType;
    document.getElementById('summary-check-in').textContent = bookingData.checkIn;
    document.getElementById('summary-check-out').textContent = bookingData.checkOut;
    document.getElementById('summary-nights').textContent = bookingData.nights;
    document.getElementById('summary-adults').textContent = bookingData.adults;
    document.getElementById('summary-children').textContent = bookingData.children;
    document.getElementById('summary-total').textContent = bookingData.total;

    // Populate Personal Information
    document.getElementById('info-first-name').textContent = bookingData.firstName;
    document.getElementById('info-surname').textContent = bookingData.surname;
    document.getElementById('info-email').textContent = bookingData.email;
    document.getElementById('info-phone-number').textContent = bookingData.phoneNumber;
    document.getElementById('info-special-requests').textContent = bookingData.specialRequests;

    // Show Payment Method and Form
    const paymentMethod = bookingData.paymentMethod;
    document.getElementById('selected-payment-method').textContent = paymentMethod === 'credit_card' ? 'Credit Card' : 'Bank Transfer';
    if (paymentMethod === 'credit_card') {
        document.getElementById('credit-card-form').style.display = 'block';
    } else if (paymentMethod === 'bank_transfer') {
        document.getElementById('bank-transfer-form').style.display = 'block';
    }

    // Payment Form Validation and Finalization
    document.getElementById('finalize-booking-btn').addEventListener('click', async () => {
        const confirmationMessage = document.getElementById('confirmation-message');

        if (paymentMethod === 'credit_card') {
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvc = document.getElementById('card-cvc').value;
            const cardholderName = document.getElementById('cardholder-name').value;

            if (!cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
                confirmationMessage.textContent = 'Please fill in all credit card details.';
                confirmationMessage.style.color = 'red';
                return;
            }

            const cardNumberPattern = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
            if (!cardNumberPattern.test(cardNumber)) {
                confirmationMessage.textContent = 'Invalid card number. Use format: 1234 5678 9012 3456';
                confirmationMessage.style.color = 'red';
                return;
            }

            const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryPattern.test(cardExpiry)) {
                confirmationMessage.textContent = 'Invalid expiry date. Use format: MM/YY';
                confirmationMessage.style.color = 'red';
                return;
            }

            const cvcPattern = /^\d{3,4}$/;
            if (!cvcPattern.test(cardCvc)) {
                confirmationMessage.textContent = 'Invalid CVC. Must be 3 or 4 digits.';
                confirmationMessage.style.color = 'red';
                return;
            }
        } else if (paymentMethod === 'bank_transfer') {
            const accountHolder = document.getElementById('account-holder').value;
            const accountNumber = document.getElementById('account-number').value;
            const bankName = document.getElementById('bank-name').value;
            const branchCode = document.getElementById('branch-code').value;

            if (!accountHolder || !accountNumber || !bankName || !branchCode) {
                confirmationMessage.textContent = 'Please fill in all bank transfer details.';
                confirmationMessage.style.color = 'red';
                return;
            }
        }

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
            confirmationMessage.textContent = 'Please log in to finalize the booking.';
            confirmationMessage.style.color = 'red';
            return;
        }

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('user_id', bookingData.userId)
            .eq('room_type', bookingData.roomType)
            .eq('check_in_date', bookingData.checkIn)
            .eq('check_out_date', bookingData.checkOut);

        if (error) {
            confirmationMessage.textContent = 'Error finalizing booking: ' + error.message;
            confirmationMessage.style.color = 'red';
        } else {
            confirmationMessage.textContent = 'Booking successfully finalized! Thank you for choosing Coastal Lodge.';
            confirmationMessage.style.color = 'green';
            document.getElementById('finalize-booking-btn').disabled = true;
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }
    });
}

// Initialize appropriate functions based on page
if (document.getElementById('booking-form')) {
    initializeBookingForm();
} else if (document.getElementById('login-btn') || document.getElementById('register-btn')) {
    initializeRegisterLogin();
} else if (document.getElementById('finalize-booking-btn')) {
    initializeBookingConfirmation();
}