
        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true
        });

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

            // Validate Payment Details
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

                // Basic card number validation (simple check for demo purposes)
                const cardNumberPattern = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
                if (!cardNumberPattern.test(cardNumber)) {
                    confirmationMessage.textContent = 'Invalid card number. Use format: 1234 5678 9012 3456';
                    confirmationMessage.style.color = 'red';
                    return;
                }

                // Expiry date validation (MM/YY)
                const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!expiryPattern.test(cardExpiry)) {
                    confirmationMessage.textContent = 'Invalid expiry date. Use format: MM/YY';
                    confirmationMessage.style.color = 'red';
                    return;
                }

                // CVC validation (3 or 4 digits)
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

            // Check if user is logged in
            const { data: user } = await window.supabase.auth.getUser();
            if (!user.user) {
                confirmationMessage.textContent = 'Please log in to finalize the booking.';
                confirmationMessage.style.color = 'red';
                return;
            }

            // Update the booking in Supabase (assuming it was already inserted with status 'pending')
            const { error } = await window.supabase
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
                confirmationMessage.textContent = 'Booking successfully finalized! Thank you for choosing Paternoster Lodge.';
                confirmationMessage.style.color = 'green';
                document.getElementById('finalize-booking-btn').disabled = true;
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            }
        });
