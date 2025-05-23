
        // Initialize EmailJS with your User ID
        (function() {
            emailjs.init("zsFfl2EelqcjuPTDz"); // Your EmailJS User ID
        })();
 
        // Modal Elements
        const modal = document.getElementById('form-modal');
        const modalContent = document.getElementById('modal-content');
        const modalMessage = document.getElementById('modal-message');
        const modalClose = document.getElementById('modal-close');
 
        // Function to show modal
        function showModal(message, isSuccess) {
            modalMessage.textContent = message;
            modalContent.className = 'modal-content'; // Reset classes
            modalContent.classList.add(isSuccess ? 'success' : 'error');
            modal.style.display = 'flex';
        }
 
        // Close modal on button click
        modalClose.addEventListener('click', function() {
            modal.style.display = 'none';
        });
 
        // Close modal when clicking outside
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
 
        document.getElementById('contact-form').addEventListener('submit', function(event) {
            event.preventDefault();
 
            const formData = {
                'first-name': document.getElementById('first-name').value,
                'last-name': document.getElementById('last-name').value,
                'email': document.getElementById('email').value,
                'phone': document.getElementById('phone').value,
                'message': document.getElementById('message').value
            };
 
            // Send email using EmailJS
            emailjs.send("service_lu0fwop", "template_l5ix3q8", formData)
                .then(function(response) {
                    showModal('Thank you! Your message has been sent.', true);
                    document.getElementById('contact-form').reset();
                }, function(error) {
                    showModal('Oops! Something went wrong. Please try again.', false);
                });
        });
 
        // Initialize AOS
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
