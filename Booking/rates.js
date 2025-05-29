
  document.addEventListener('DOMContentLoaded', async () => {
    // Initialize AOS
    AOS.init({ duration: 1000, once: true });

    // Initialize Supabase Client
    const supabaseClient = supabase.createClient(
      'https://fdpcmuwwbalwofxydsds.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcGNtdXd3YmFsd29meHlkc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA3OTUsImV4cCI6MjA2MjYyNjc5NX0.FmvbrFqPepMcxJbY6eGLeS7oMIfDzXnMPAjdF-8MWGY'
    );

    // Get URL Parameters
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    const roomType = params.get('roomType');
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const nights = params.get('nights');
    const adults = params.get('adults');
    const children = params.get('children');
    const quantity = params.get('quantity');
    const price = params.get('price');

    const confirmationDetails = document.getElementById('confirmation-details');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');

    // Check Authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      confirmationMessage.textContent = 'Please log in or register to confirm your booking.';
      confirmationMessage.classList.add('error');
      const redirectParams = new URLSearchParams({
        bookingId: bookingId || '',
        roomType: roomType || '',
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        nights: nights || '',
        adults: adults || '',
        children: children || '',
        quantity: quantity || '',
        price: price || ''
      }).toString();
      setTimeout(() => {
        window.location.href = '../register-login.html?' + redirectParams;
      }, 2000);
      return;
    }

    // Enable button for authenticated users
    confirmBookingBtn.disabled = false;

    // Format Date for Display
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Display Booking Details
    async function displayBookingDetails() {
      if (!bookingId) {
        confirmationMessage.textContent = 'No booking ID provided. Please return to the booking page.';
        confirmationMessage.classList.add('error');
        confirmBookingBtn.disabled = true;
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabaseClient
        .from('bookings')
        .select(`
          *,
          rooms:room_id (room_type)
        `)
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        confirmationMessage.textContent = 'Booking not found or you do not have access. Please try again.';
        confirmationMessage.classList.add('error');
        console.error('Error fetching booking:', error);
        confirmBookingBtn.disabled = true;
        return;
      }

      if (!data.user_id) {
        confirmationMessage.textContent = 'This booking is not associated with a user. Please log in with the correct account.';
        confirmationMessage.classList.add('error');
        confirmBookingBtn.disabled = true;
        return;
      }

      confirmationDetails.innerHTML = `
        <p><strong>Room:</strong> ${data.rooms.room_type}</p>
        <p><strong>Check-In:</strong> ${formatDate(data.check_in)}</p>
        <p><strong>Check-Out:</strong> ${formatDate(data.check_out)}</p>
        <p><strong>Nights:</strong> ${data.nights}${data.is_half_day ? ' (Half-Day)' : ''}</p>
        <p><strong>Guests:</strong> ${data.adults} Adult${data.adults > 1 ? 's' : ''}, ${data.children} Child${data.children !== 1 ? 'ren' : ''}</p>
        <p><strong>Rooms:</strong> ${data.quantity}</p>
        <p><strong>Total Price:</strong> ZAR ${data.total_price.toFixed(2)}</p>
        ${data.is_half_day ? '<p><strong>Note:</strong> Half-day bookings are for same-day use.</p>' : ''}
      `;
    }

    // Initialize Booking Details
    await displayBookingDetails();

    // Confirm Booking Button
    confirmBookingBtn.addEventListener('click', () => {
      const modal = document.getElementById('rates-modal');
      const modalDetails = document.getElementById('modal-confirmation-details');
      modalDetails.innerHTML = confirmationDetails.innerHTML;
      modal.classList.remove('hidden');
    });

    // Close Modal
    document.getElementById('close-rates-modal').addEventListener('click', () => {
      document.getElementById('rates-modal').classList.add('hidden');
    });

    // Finalize Booking
    document.getElementById('final-confirm-btn').addEventListener('click', async () => {
      // Re-check authentication
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !user) {
        confirmationMessage.textContent = 'Session expired. Please log in again.';
        confirmationMessage.classList.add('error');
        window.location.href = '../register-login.html?' + params.toString();
        return;
      }

      document.getElementById('rates-modal').classList.add('hidden');
      confirmationMessage.textContent = 'Booking finalized successfully! You will receive a confirmation email shortly.';
      confirmationMessage.classList.add('success');
      confirmationMessage.classList.remove('error');
      confirmBookingBtn.disabled = true;

      // Update booking status in Supabase
      const { error } = await supabaseClient
        .from('bookings')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating booking:', error);
        confirmationMessage.textContent = 'Error finalizing booking. Please try again.';
        confirmationMessage.classList.add('error');
        confirmationMessage.classList.remove('success');
        confirmBookingBtn.disabled = false;
        return;
      }

      // TODO: Send confirmation email to user.email (from auth.users)
      // Example: Use SendGrid or Supabase Edge Function to send email to user.email
      // const emailResponse = await fetch('/send-confirmation-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: user.email, bookingId })
      // });
    });
  });
