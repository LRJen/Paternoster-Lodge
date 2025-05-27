
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize AOS for animations
            AOS.init({ duration: 1000, once: true });

            // Header Scroll Effect
            window.addEventListener('scroll', () => {
                const header = document.querySelector('header');
                header.classList.toggle('scrolled', window.scrollY > 50);
            });

            // Hamburger Menu Toggle
            // const hamburger = document.querySelector('.hamburger');
            // const navUl = document.querySelector('nav ul');
            // hamburger.addEventListener('click', () => {
            //     hamburger.classList.toggle('active');
            //     navUl.classList.toggle('active');
            // });

            // Room data
            const roomsData = {
                'Deluxe King Room': { basePrice: 1892, additionalChild: 0, maxGuests: 2, maxAdults: 2 },
                'Family Room': { basePrice: 6080, additionalChild: 0, maxGuests: 4, maxAdults: 4 },
                'Honeymoon Suite': { basePrice: 2000, additionalChild: 0, maxGuests: 2, maxAdults: 2 },
                'Standard Double Room': { basePrice: 1720, additionalChild: 0, maxGuests: 2, maxAdults: 2 }
            };

            // Current date and time (11:34 AM SAST, May 22, 2025)
            const currentDate = new Date('2025-05-22T11:34:00+02:00');
            const fullyBookedDates = ['2025-05-15', '2025-05-16', '2025-05-20', '2025-05-21', '2025-05-22', '2025-05-23', '2025-05-30', '2025-05-31'];

            // Booking Form Elements
            const checkInInput = document.getElementById('check-in');
            const checkOutInput = document.getElementById('check-out');
            const nightsInput = document.getElementById('nights');
            const halfDayToggle = document.getElementById('half-day-event');
            const roomTypeSelect = document.getElementById('room-type');
            const formMessage = document.getElementById('form-message');
            const availabilityTable = document.getElementById('availability-table');
            const availabilityTableBody = document.getElementById('availability-table-body');
            const mainTableBody = document.getElementById('main-availability-table-body');
            const calendarContainer = document.getElementById('calendar-container');
            const viewCalendarBtn = document.querySelector('.view-calendar-btn');
            const closeCalendarBtn = document.getElementById('close-calendar-btn');

            let halfDayEvent = false;

            // Initialize Flatpickr for Check-In and Check-Out
            const checkInPicker = flatpickr(checkInInput, {
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
                onChange: updateNights
            });

            // Initialize Calendar
            const calendarPicker = flatpickr("#calendar", {
                mode: "range",
                dateFormat: "Y-m-d",
                minDate: currentDate,
                disable: fullyBookedDates.map(date => ({ from: date, to: date })),
                inline: false,
                onDayCreate: (dObj, dStr, fp, dayElem) => {
                    if (fullyBookedDates.includes(dStr)) {
                        dayElem.classList.add('fully-booked');
                        dayElem.style.backgroundColor = '#ccc';
                        dayElem.style.color = '#666';
                    } else {
                        dayElem.style.backgroundColor = '#e6ffe6';
                    }
                },
                onChange: (selectedDates) => {
                    if (selectedDates.length === 2) {
                        checkInInput.value = selectedDates[0].toISOString().split('T')[0];
                        checkOutInput.value = selectedDates[1].toISOString().split('T')[0];
                        checkInPicker.setDate(selectedDates[0]);
                        checkOutPicker.setDate(selectedDates[1]);
                        updateNights();
                        calendarContainer.style.display = 'none';
                    }
                }
            });

            viewCalendarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                calendarContainer.style.display = 'block';
                calendarPicker.redraw(); // Force redraw to ensure visibility
            });

            closeCalendarBtn.addEventListener('click', () => {
                calendarContainer.style.display = 'none';
            });

            // Update Nights field
            function updateNights() {
                const checkInDate = new Date(checkInInput.value);
                const checkOutDate = new Date(checkOutInput.value);
                let nights = halfDayEvent ? 0.5 : Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                nightsInput.value = nights || 1;
                updateMainAvailabilityTable(null, null, null, true); // Refresh table with new nights
            }

            halfDayToggle.addEventListener('change', () => {
                halfDayEvent = halfDayToggle.checked;
                nightsInput.readOnly = halfDayEvent;
                nightsInput.value = halfDayEvent ? 0.5 : 1;
                updateNights();
            });

            // Format date for display
            function formatDate(date) {
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                return new Date(date).toLocaleDateString('en-US', options);
            }

            // Update Main Availability Table
            function updateMainAvailabilityTable(selectedRoomType, checkInDate, checkOutDate, allAvailable) {
                mainTableBody.innerHTML = '';

                const roomTypes = Object.keys(roomsData);
                const filteredRooms = allAvailable === false ? [] : (selectedRoomType ? [selectedRoomType] : roomTypes);
                const roomsToDisplay = filteredRooms.length > 0 ? filteredRooms : roomTypes;

                roomsToDisplay.forEach(roomType => {
                    const room = roomsData[roomType];
                    const nights = parseFloat(nightsInput.value) || 1;
                    let pricePerRoom = room.basePrice * nights;
                    if (nights > 3 && !halfDayEvent) pricePerRoom *= 0.9;

                    // Calculate dynamic dates for choices
                    const checkIn = checkInDate || new Date(currentDate);
                    const reserveDate = new Date(checkIn);
                    reserveDate.setDate(reserveDate.getDate() + 2);
                    const formattedReserveDate = formatDate(reserveDate);

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="room-type">${roomType}</div>
                            <p>1 double bed</p>
                            <div class="room-features" id="features-${roomType.replace(/\s+/g, '-')}">
                                <span><i class="fas fa-ruler-combined"></i> 18 m²</span>
                                <span><i class="fas fa-kitchen-set"></i> Private kitchenette</span>
                                <span><i class="fas fa-bath"></i> Private bathroom</span>
                                <span><i class="fas fa-snowflake"></i> Air conditioning</span>
                                <span><i class="fas fa-tv"></i> Flat-screen TV</span>
                                <span><i class="fas fa-wifi"></i> Free WiFi</span>
                                ${roomType === 'Honeymoon Suite' ? `
                                    <span><i class="fas fa-toilet-paper"></i> Free toiletries</span>
                                    <span><i class="fas fa-shower"></i> Shower</span>
                                    <span><i class="fas fa-toilet"></i> Toilet</span>
                                    <span><i class="fas fa-tshirt"></i> Towels</span>
                                    <span><i class="fas fa-tshirt"></i> Linen</span>
                                    <span><i class="fas fa-snowflake"></i> Refrigerator</span>
                                ` : ''}
                            </div>
                            <a href="#" class="more-link" data-room="${roomType.replace(/\s+/g, '-')}">MORE</a>
                        </td>
                        <td>
                            <div class="guest-counter">
                                <span>Adults</span>
                                <button type="button" class="decrement-adults" data-room="${roomType}">−</button>
                                <input type="number" class="adults-input" data-room="${roomType}" value="${room.maxGuests === 4 ? 4 : 2}" min="1" readonly>
                                <button type="button" class="increment-adults" data-room="${roomType}">+</button>
                                <span>Children (0-5)</span>
                                <button type="button" class="decrement-children" data-room="${roomType}">−</button>
                                <input type="number" class="children-input" data-room="${roomType}" value="0" min="0" readonly>
                                <button type="button" class="increment-children" data-room="${roomType}">+</button>
                            </div>
                        </td>
                        <td>
                            <div class="price" data-price="${pricePerRoom.toFixed(2)}">ZAR ${pricePerRoom.toFixed(2)}</div>
                            <div class="price-note">includes taxes and charges</div>
                        </td>
                        <td>
                            <div class="choices">
                                <label class="green">
                                    <input type="checkbox" class="free-cancellation" data-room="${roomType}" checked>
                                    Free cancellation before ${formattedReserveDate}
                                </label>
                                <label>
                                    <input type="checkbox" class="pay-later" data-room="${roomType}">
                                    Pay nothing until ${formattedReserveDate}
                                </label>
                            </div>
                        </td>
                        <td>
                            <div class="guest-counter">
                                <select class="room-quantity" data-room-type="${roomType}">
                                    <option value="0">0</option>
                                    <option value="1" selected>1 room</option>
                                    <option value="2">2 rooms</option>
                                    <option value="3">3 rooms</option>
                                </select>
                            </div>
                            <button class="select-btn" data-room-type="${roomType}">I'll reserve</button>
                        </td>
                    `;
                    mainTableBody.appendChild(row);
                });

                // Attach event listeners for interactive elements
                attachTableEventListeners();
            }

            // Attach event listeners for table interactions
            function attachTableEventListeners() {
                // More/Less toggle
                document.querySelectorAll('.more-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const roomId = e.target.dataset.room;
                        const features = document.getElementById(`features-${roomId}`);
                        const isVisible = features.classList.contains('show');
                        features.classList.toggle('show');
                        e.target.textContent = isVisible ? 'MORE' : 'LESS';
                    });
                });

                // Guest counters
                document.querySelectorAll('.increment-adults').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const roomType = e.target.dataset.room;
                        const input = document.querySelector(`.adults-input[data-room="${roomType}"]`);
                        const childrenInput = document.querySelector(`.children-input[data-room="${roomType}"]`);
                        const totalGuests = parseInt(input.value) + parseInt(childrenInput.value);
                        if (totalGuests < roomsData[roomType].maxGuests) {
                            input.value = parseInt(input.value) + 1;
                        } else {
                            alert(`Maximum guests for ${roomType} is ${roomsData[roomType].maxGuests}.`);
                        }
                    });
                });

                document.querySelectorAll('.decrement-adults').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const roomType = e.target.dataset.room;
                        const input = document.querySelector(`.adults-input[data-room="${roomType}"]`);
                        if (parseInt(input.value) > 1) {
                            input.value = parseInt(input.value) - 1;
                        }
                    });
                });

                document.querySelectorAll('.increment-children').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const roomType = e.target.dataset.room;
                        const input = document.querySelector(`.children-input[data-room="${roomType}"]`);
                        const adultsInput = document.querySelector(`.adults-input[data-room="${roomType}"]`);
                        const totalGuests = parseInt(adultsInput.value) + parseInt(input.value);
                        if (totalGuests < roomsData[roomType].maxGuests) {
                            input.value = parseInt(input.value) + 1;
                        } else {
                            alert(`Maximum guests for ${roomType} is ${roomsData[roomType].maxGuests}.`);
                        }
                    });
                });

                document.querySelectorAll('.decrement-children').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const roomType = e.target.dataset.room;
                        const input = document.querySelector(`.children-input[data-room="${roomType}"]`);
                        if (parseInt(input.value) > 0) {
                            input.value = parseInt(input.value) - 1;
                        }
                    });
                });

                // Room quantity and price update
                document.querySelectorAll('.room-quantity').forEach(select => {
                    select.addEventListener('change', (e) => {
                        const roomType = e.target.dataset.roomType;
                        const quantity = parseInt(e.target.value);
                        const priceCell = e.target.closest('tr').querySelector('.price');
                        const pricePerRoom = parseFloat(priceCell.dataset.price);
                        const totalPrice = pricePerRoom * quantity;
                        priceCell.textContent = `ZAR ${totalPrice.toFixed(2)}`;
                    });
                });

                // Redirect to rates-page.html with query parameters
                document.querySelectorAll('.select-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        const roomType = e.target.dataset.roomType;
                        const adultsInput = document.querySelector(`.adults-input[data-room="${roomType}"]`);
                        const childrenInput = document.querySelector(`.children-input[data-room="${roomType}"]`);
                        const quantitySelect = document.querySelector(`.room-quantity[data-room-type="${roomType}"]`);
                        const price = e.target.closest('tr').querySelector('.price').textContent.replace('ZAR ', '');

                        const params = new URLSearchParams({
                            roomType,
                            checkIn: checkInInput.value || '',
                            checkOut: checkOutInput.value || '',
                            nights: nightsInput.value || '1',
                            adults: adultsInput.value,
                            children: childrenInput.value,
                            quantity: quantitySelect.value,
                            price
                        }).toString();
                        window.location.href = `rates-page.html?${params}`;
                    });
                });
            }

            // Check Availability and Update Availability Table
            document.getElementById('booking-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const roomType = roomTypeSelect.value;
                const checkInDate = new Date(checkInInput.value);
                const checkOutDate = new Date(checkOutInput.value);

                if (!roomType || !checkInInput.value || !checkOutInput.value) {
                    formMessage.textContent = 'Please fill in all required fields.';
                    formMessage.classList.add('error');
                    formMessage.classList.remove('success');
                    return;
                }

                if (checkInDate >= checkOutDate && !halfDayEvent) {
                    formMessage.textContent = 'Check-out date must be after check-in date.';
                    formMessage.classList.add('error');
                    formMessage.classList.remove('success');
                    return;
                }

                // Check availability
                let currentDate = new Date(checkInDate);
                let allAvailable = true;
                availabilityTableBody.innerHTML = '';

                while (currentDate < checkOutDate && !halfDayEvent) {
                    const dateStr = currentDate.toISOString().split('T')[0];
                    const isBooked = fullyBookedDates.includes(dateStr);
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${dateStr}</td><td class="${isBooked ? 'booked' : 'available'}">${isBooked ? 'Booked' : 'Available'}</td>`;
                    availabilityTableBody.appendChild(row);
                    if (isBooked) allAvailable = false;
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                if (halfDayEvent) {
                    const dateStr = checkInDate.toISOString().split('T')[0];
                    const isBooked = fullyBookedDates.includes(dateStr);
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${dateStr} (Half-Day)</td><td class="${isBooked ? 'booked' : 'available'}">${isBooked ? 'Booked' : 'Available'}</td>`;
                    availabilityTableBody.appendChild(row);
                    if (isBooked) allAvailable = false;
                }

                availabilityTable.style.display = 'table';
                formMessage.textContent = allAvailable ? 'Dates are available!' : 'Some dates are booked. Please choose different dates.';
                formMessage.classList.toggle('success', allAvailable);
                formMessage.classList.toggle('error', !allAvailable);

                // Update main availability table
                updateMainAvailabilityTable(roomType, checkInDate, checkOutDate, allAvailable);
            });

            // Initialize
            updateNights();
            updateMainAvailabilityTable(null, null, null, true);
        });
