document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS for animations
  AOS.init({ duration: 1000, once: true });

  // Header Scroll Effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Initialize Supabase Client
  const { createClient } = supabase;
  const supabaseClient = createClient(
    'https://fdpcmuwwbalwofxydsds.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcGNtdXd3YmFsd29meHlkc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA3OTUsImV4cCI6MjA2MjYyNjc5NX0.FmvbrFqPepMcxJbY6eGLeS7oMIfDzXnMPAjdF-8MWGY'
  );

  // Current date and time (SAST, May 29, 2025, 10:23 AM)
  const currentDate = new Date('2025-05-29T10:23:00+02:00');

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
  let roomsData = {};

  // Fetch Rooms from Supabase
  async function fetchRooms() {
    const { data, error } = await supabaseClient
      .from('rooms')
      .select('id, room_type, base_price, max_guests, max_adults, additional_child_price, features');
    if (error) {
      console.error('Error fetching rooms:', error);
      formMessage.textContent = 'Failed to load room data. Please try again.';
      formMessage.classList.add('error');
      return {};
    }
    return data.reduce((acc, room) => {
      acc[room.room_type] = {
        id: room.id,
        basePrice: room.base_price,
        maxGuests: room.max_guests,
        maxAdults: room.max_adults,
        additionalChild: room.additional_child_price,
        features: room.features || {}
      };
      return acc;
    }, {});
  }

  // Populate Room Type Dropdown
  async function populateRoomTypes() {
    roomsData = await fetchRooms();
    roomTypeSelect.innerHTML = '<option value="">Select Room Type</option>';
    Object.keys(roomsData).forEach(roomType => {
      const option = document.createElement('option');
      option.value = roomType;
      option.textContent = roomType;
      roomTypeSelect.appendChild(option);
    });
  }

  // Initialize Flatpickr for Check-In and Check-Out
  const checkInPicker = flatpickr(checkInInput, {
    dateFormat: 'Y-m-d',
    minDate: currentDate,
    onChange: async (selectedDates) => {
      const checkInDate = selectedDates[0];
      if (checkOutPicker.selectedDates[0] <= checkInDate && !halfDayEvent) {
        checkOutPicker.setDate(new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000));
      }
      updateNights();
    }
  });

  const checkOutPicker = flatpickr(checkOutInput, {
    dateFormat: 'Y-m-d',
    minDate: currentDate,
    onChange: updateNights
  });

  // Initialize Calendar
  const calendarPicker = flatpickr('#calendar', {
    mode: 'range',
    dateFormat: 'Y-m-d',
    minDate: currentDate,
    inline: false,
    onDayCreate: async (dObj, dStr, fp, dayElem) => {
      const dateStr = dayElem.dateObj.toISOString().split('T')[0];
      const isBooked = await checkDateAvailability(dateStr);
      if (isBooked) {
        dayElem.classList.add('fully-booked');
        dayElem.style.backgroundColor = '#ff4d4d';
        dayElem.style.color = '#fff';
        dayElem.style.cursor = 'not-allowed';
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
      } else if (selectedDates.length === 1 && halfDayEvent) {
        checkInInput.value = selectedDates[0].toISOString().split('T')[0];
        checkOutInput.value = selectedDates[0].toISOString().split('T')[0];
        checkInPicker.setDate(selectedDates[0]);
        checkOutPicker.setDate(selectedDates[0]);
        updateNights();
        calendarContainer.style.display = 'none';
      }
    }
  });

  viewCalendarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    calendarContainer.style.display = 'block';
    calendarPicker.redraw();
  });

  closeCalendarBtn.addEventListener('click', () => {
    calendarContainer.style.display = 'none';
  });

  // Check Date Availability
  async function checkDateAvailability(dateStr, roomType = null) {
    const query = supabaseClient
      .from('bookings')
      .select('check_in, check_out')
      .lte('check_in', dateStr)
      .gte('check_out', dateStr);
    if (roomType && roomsData[roomType]) {
      query.eq('room_id', roomsData[roomType].id);
    }
    const { data: bookings, error } = await query;
    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }
    return bookings.length > 0;
  }

  // Update Nights field
  function updateNights() {
    const checkInDate = new Date(checkInInput.value);
    const checkOutDate = new Date(checkOutInput.value);
    let nights = halfDayEvent ? 0.5 : Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    nightsInput.value = nights || 1;
    updateMainAvailabilityTable(null, null, null, true);
  }

  halfDayToggle.addEventListener('change', () => {
    halfDayEvent = halfDayToggle.checked;
    nightsInput.readOnly = halfDayEvent;
    nightsInput.value = halfDayEvent ? 0.5 : 1;
    if (halfDayEvent && checkInInput.value) {
      checkOutInput.value = checkInInput.value;
      checkOutPicker.setDate(checkInInput.value);
    }
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

      const checkIn = checkInDate || new Date(currentDate);
      const reserveDate = new Date(checkIn);
      reserveDate.setDate(reserveDate.getDate() + 2);
      const formattedReserveDate = formatDate(reserveDate);

      const features = room.features || {};
      const featureKeys = Object.keys(features);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="room-type">${roomType}</div>
          <p>1 double bed</p>
          <div class="room-features" id="features-${roomType.replace(/\s+/g, '-')}">
            ${featureKeys.map(key => `<span><i class="fas fa-${key === 'wifi' ? 'wifi' : key === 'ac' ? 'snowflake' : key === 'tv' ? 'tv' : 'check'}"></i> ${features[key] === true ? key.charAt(0).toUpperCase() + key.slice(1) : features[key]}</span>`).join('')}
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
            <button type="button" class="decrement-adult" data-room="${roomType}">−</button>
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

    attachTableEventListeners();
  }

  // Attach event listeners for table interactions
  function attachTableEventListeners() {
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

    document.querySelectorAll('.increment-adults').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomType = e.target.dataset.room;
        const input = document.querySelector(`.adults-input[data-room="${roomType}"]`);
        const childrenInput = document.querySelector(`.children-input[data-room="${roomType}"]`);
        const totalGuests = parseInt(input.value) + parseInt(childrenInput.value);
        if (totalGuests < roomsData[roomType].maxGuests) {
          input.value = parseInt(input.value) + 1;
        } else {
          formMessage.textContent = `Maximum guests for ${roomType} is ${roomsData[roomType].maxGuests}.`;
          formMessage.classList.add('error');
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
          formMessage.textContent = `Maximum guests for ${roomType} is ${roomsData[roomType].maxGuests}.`;
          formMessage.classList.add('error');
        }
      });
    });

    document.querySelectorAll('.decrement-adults').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomType = e.target.dataset.room;
        const input = document.querySelector(`.children-input[data-room="${roomType}"]`);
        if (parseInt(input.value) > 0) {
          input.value = parseInt(input.value) - 1;
        }
      });
    });

    document.querySelectorAll('.room-quantity').forEach(select => {
      select.addEventListener('change', (e) => {
        const roomType = e.target.dataset.roomType;
        const quantity = parseInt(e.target.value);
        const priceCell = e.target.closest('tr').querySelector('.price');
        const pricePerRoom = parseFloat(priceCell.dataset.price);
        const totalPrice = pricePerRoom * quantity;
        priceCell.textContent = `ZAR ${totalPrice.toFixed(2)}`;
        priceCell.dataset.price = totalPrice.toFixed(2);
      });
    });

    document.querySelectorAll('.select-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        button.disabled = true;
        const roomType = e.target.dataset.roomType;
        const adultsInput = document.querySelector(`.adults-input[data-room="${roomType}"]`);
        const childrenInput = document.querySelector(`.children-input[data-room="${roomType}"]`);
        const quantitySelect = document.querySelector(`.room-quantity[data-room-type="${roomType}"]`);
        const price = parseFloat(e.target.closest('tr').querySelector('.price').dataset.price);

        const room = roomsData[roomType];
        if (!room) {
          formMessage.textContent = 'Invalid room type.';
          formMessage.classList.add('error');
          button.disabled = false;
          return;
        }

        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);

        // Validate inputs
        if (!checkInInput.value || !checkOutInput.value || !quantitySelect.value || parseInt(quantitySelect.value) === 0) {
          formMessage.textContent = 'Please fill in all required fields and select at least one room.';
          formMessage.classList.add('error');
          button.disabled = false;
          return;
        }

        const totalGuests = parseInt(adultsInput.value) + parseInt(childrenInput.value);
        if (totalGuests > room.maxGuests * parseInt(quantitySelect.value)) {
          formMessage.textContent = `Total guests exceed maximum capacity for ${quantitySelect.value} ${roomType}(s).`;
          formMessage.classList.add('error');
          button.disabled = false;
          return;
        }

        // Check authentication
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) {
          formMessage.textContent = 'Please log in or register to create a booking.';
          formMessage.classList.add('error');
          const params = new URLSearchParams({
            roomType,
            checkIn: checkInInput.value,
            checkOut: checkOutInput.value,
            nights: nightsInput.value,
            adults: adultsInput.value,
            children: childrenInput.value,
            quantity: quantitySelect.value,
            price
          }).toString();
          setTimeout(() => {
            window.location.href = '../register-login.html?' + params;
          }, 2000);
          button.disabled = false;
          return;
        }

        // Check availability before booking
        const isAvailable = await checkAvailability(roomType, checkInDate, checkOutDate, halfDayEvent);
        if (!isAvailable) {
          formMessage.textContent = 'Selected dates are no longer available. Please choose different dates.';
          formMessage.classList.add('error');
          button.disabled = false;
          return;
        }

        const { data, error } = await supabaseClient
          .from('bookings')
          .insert({
            room_id: room.id,
            check_in: checkInInput.value,
            check_out: checkOutInput.value,
            nights: parseFloat(nightsInput.value),
            adults: parseInt(adultsInput.value),
            children: parseInt(childrenInput.value),
            quantity: parseInt(quantitySelect.value),
            total_price: price,
            is_half_day: halfDayEvent,
            user_id: user.id
          })
          .select()
          .single();

        if (error) {
          formMessage.textContent = 'Failed to create booking. Please try again.';
          formMessage.classList.add('error');
          console.error('Booking error:', error);
          button.disabled = false;
        } else {
          formMessage.textContent = 'Booking created successfully!';
          formMessage.classList.add('success');
          formMessage.classList.remove('error');
          const params = new URLSearchParams({
            bookingId: data.id,
            roomType,
            checkIn: checkInInput.value,
            checkOut: checkOutInput.value,
            nights: nightsInput.value,
            adults: adultsInput.value,
            children: childrenInput.value,
            quantity: quantitySelect.value,
            price
          }).toString();
          window.location.href = `rates.html?${params}`;
        }
        button.disabled = false;
      });
    });
  }

  // Check Availability
  async function checkAvailability(roomType, checkInDate, checkOutDate, isHalfDay) {
    const room = roomsData[roomType];
    if (!room) {
      formMessage.textContent = 'Invalid room type.';
      formMessage.classList.add('error');
      return false;
    }

    const { data: bookings, error } = await supabaseClient
      .from('bookings')
      .select('check_in, check_out')
      .eq('room_id', room.id)
      .or(`check_in.lte.${checkOutDate.toISOString().split('T')[0]},check_out.gte.${checkInDate.toISOString().split('T')[0]}`);

    if (error) {
      formMessage.textContent = 'Error checking availability.';
      formMessage.classList.add('error');
      console.error('Availability error:', error);
      return false;
    }

    const bookedDates = [];
    bookings.forEach(booking => {
      let current = new Date(booking.check_in);
      const end = new Date(booking.check_out);
      while (current <= end) {
        bookedDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    let currentDate = new Date(checkInDate);
    let allAvailable = true;
    availabilityTableBody.innerHTML = '';

    if (isHalfDay) {
      const dateStr = checkInDate.toISOString().split('T')[0];
      const isBooked = bookedDates.includes(dateStr);
      const row = document.createElement('tr');
      row.innerHTML = `<td>${dateStr} (Half-Day)</td><td class="${isBooked ? 'booked' : 'available'}"></td>`;
      availabilityTableBody.appendChild(row);
      if (isBooked) allAvailable = false;
    } else {
      while (currentDate < checkOutDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isBooked = bookedDates.includes(dateStr);
        const row = document.createElement('tr');
        row.innerHTML = `<td>${dateStr}</td><td class="${isBooked ? 'booked' : 'available'}"></td>`;
        availabilityTableBody.appendChild(row);
        if (isBooked) allAvailable = false;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    availabilityTable.style.display = 'block';
    formMessage.textContent = allAvailable ? 'Available!' : 'Some dates are booked. Please choose different dates.';
    formMessage.classList.toggle('success', allAvailable);
    formMessage.classList.toggle('error', !allAvailable);

    return allAvailable;
  }

  // Form Submission
  document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomType = roomTypeSelect.value;
    const checkInDate = new Date(checkInInput.value);
    const checkOutDate = new Date(checkOutInput.value);
    halfDayEvent = halfDayToggle.checked;

    if (!roomType || !checkInInput.value || !checkOutInput.value) {
      formMessage.textContent = 'Please fill in all required fields.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
      return;
    }

    if (checkInDate > checkOutDate && !halfDayEvent) {
      formMessage.textContent = 'Check-out date must be after check-in date.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
      return;
    }

    if (halfDayEvent && checkInDate.getTime() !== checkOutDate.getTime()) {
      formMessage.textContent = 'Half-day bookings must have the same check-in and check-out date.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
      return;
    }

    const isAvailable = await checkAvailability(roomType, checkInDate, checkOutDate, halfDayEvent);
    if (isAvailable) {
      updateMainAvailabilityTable(roomType, checkInDate, checkOutDate, true);
    }
  });

  // Initialize
  (async () => {
    await populateRoomTypes();
    updateNights();
    updateMainAvailabilityTable(null, null, null, true);
  })();
});