document.addEventListener('DOMContentLoaded', () => {
    // Supabase Initialization

    const supabaseUrl = 'https://fdpcmuwwbalwofxydsds.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcGNtdXd3YmFsd29meHlkc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA3OTUsImV4cCI6MjA2MjYyNjc5NX0.FmvbrFqPepMcxJbY6eGLeS7oMIfDzXnMPAjdF-8MWGY';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.supabase = supabase;
    if (typeof window.Supabase !== 'undefined' && supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
        supabase = window.Supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.warn('Supabase not initialized. Ensure Supabase client is included and valid URL/key are provided.');
    }

    // Navigation: Hamburger Menu and Smooth Scroll
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const navUl = document.querySelector('nav ul');

    if (hamburger && nav && navUl) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.classList.toggle('active');
            nav.classList.toggle('active');
            navUl.classList.toggle('active');
            setTimeout(() => navUl.classList.toggle('visible'), 10);
            hamburger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        });

        navUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', e => {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                navUl.classList.remove('active');
                navUl.classList.remove('visible');
                hamburger.setAttribute('aria-expanded', 'false');

                const href = link.getAttribute('href');
                if (href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    } else {
        console.warn('Navigation elements (hamburger, nav, or nav ul) not found.');
    }

    // Room Category Filtering
    const tabButtons = document.querySelectorAll('.tab-btn');
    const roomCards = document.querySelectorAll('.room-card');

    if (tabButtons.length && roomCards.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                roomCards.forEach(card => {
                    const isVisible = category === 'all' || card.dataset.type === category;
                    card.style.opacity = isVisible ? '1' : '0';
                    card.style.transform = isVisible ? 'translateY(0)' : 'translateY(20px)';
                    card.style.display = isVisible ? 'block' : 'none';
                    if (isVisible) {
                        setTimeout(() => {
                            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        }, 100);
                    }
                });
            });
        });
    } else {
        console.warn('Room category elements (tab-btn or room-card) not found.');
    }

    // Booking Modal and Form
    const bookingModal = document.querySelector('.booking-modal');
    const closeModal = document.querySelector('.close-modal');
    const bookButtons = document.querySelectorAll('.cta-btn, .book-room-btn, .room-btn');

    async function checkAuth() {
        if (!supabase) return null;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session;
        } catch (error) {
            console.error('Auth check failed:', error);
            return null;
        }
    }

    function showModal(roomType = '') {
        if (bookingModal) {
            bookingModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            if (roomType) {
                const roomSelect = bookingModal.querySelector('#room-type');
                if (roomSelect) {
                    roomSelect.value = roomType;
                }
            }
        }
    }

    function hideModal() {
        if (bookingModal) {
            bookingModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    if (bookButtons.length) {
        bookButtons.forEach(button => {
            button.addEventListener('click', async e => {
                e.preventDefault();
                const roomType = button.dataset.room || '';
                if (supabase) {
                    const session = await checkAuth();
                    if (!session) {
                        alert('Please log in to book. (Note: Add login modal logic here)');
                        return;
                    }
                }
                showModal(roomType);
            });
        });
    } else {
        console.warn('Booking buttons (cta-btn, book-room-btn, room-btn) not found.');
    }

    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    } else {
        console.warn('Close modal button not found.');
    }

    if (bookingModal) {
        bookingModal.addEventListener('click', e => {
            if (e.target === bookingModal) {
                hideModal();
            }
        });
    } else {
        console.warn('Booking modal not found.');
    }

    // Booking Form Submission (Modal)
    const bookingFormModal = document.querySelector('.booking-modal form');
    if (bookingFormModal) {
        bookingFormModal.addEventListener('submit', async e => {
            e.preventDefault();
            const nameInput = bookingFormModal.querySelector('#name');
            const emailInput = bookingFormModal.querySelector('#email');
            const checkInInput = bookingFormModal.querySelector('#check-in-modal');
            const checkOutInput = bookingFormModal.querySelector('#check-out-modal');
            const roomTypeSelect = bookingFormModal.querySelector('#room-type');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const checkIn = checkInInput ? checkInInput.value : '';
            const checkOut = checkOutInput ? checkOutInput.value : '';
            const roomType = roomTypeSelect ? roomTypeSelect.value : '';

            if (!name || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                alert('Please enter a valid name and email.');
                return;
            }
            if (!checkIn || !checkOut || !roomType) {
                alert('Please fill in all fields (check-in, check-out, room type).');
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            let nights = 1;
            if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
                const diffTime = checkOutDate - checkInDate;
                nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                alert('Check-out date must be after check-in date.');
                return;
            }

            const bookingDetails = { name, email, check_in_date: checkIn, check_out_date: checkOut, room_type: roomType, nights };
            if (supabase) {
                const session = await checkAuth();
                if (!session) {
                    alert('Please log in to book.');
                    return;
                }
                try {
                    const { error } = await supabase.from('bookings').insert({
                        user_id: session.user.id,
                        room_type: roomType,
                        check_in_date: checkIn,
                        check_out_date: checkOut,
                        nights: nights
                    });
                    if (error) {
                        alert('Booking failed: ' + error.message);
                    } else {
                        alert('Booking request submitted! We will confirm soon.');
                        bookingFormModal.reset();
                        hideModal();
                    }
                } catch (error) {
                    alert('Booking failed: ' + error.message);
                }
            } else {
                console.log('Booking submitted (fallback):', bookingDetails);
                alert('Booking request submitted! Check console for details.');
                bookingFormModal.reset();
                hideModal();
            }
        });
    } else {
        console.warn('Booking modal form not found.');
    }

    // Booking Form Submission (booking.html)
    const bookingFormPage = document.querySelector('#booking-form');
    if (bookingFormPage) {
        bookingFormPage.addEventListener('submit', e => {
            e.preventDefault();
            const checkInInput = bookingFormPage.querySelector('#check-in');
            const checkOutInput = bookingFormPage.querySelector('#check-out');
            const nightsInput = bookingFormPage.querySelector('#nights');

            const checkIn = checkInInput ? checkInInput.value : '';
            const checkOut = checkOutInput ? checkOutInput.value : '';

            if (!checkIn || !checkOut) {
                alert('Please select check-in and check-out dates.');
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            let nights = 1;
            if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
                const diffTime = checkOutDate - checkInDate;
                nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else {
                alert('Check-out date must be after check-in date.');
                return;
            }

            alert(`Availability check: ${nights} night(s) from ${checkIn} to ${checkOut}. Please select a room below.`);
            nightsInput.value = nights;
        });
    } else {
        console.warn('Booking page form not found.');
    }

    // Update Nights Display (Both Forms)
    const checkInInputs = document.querySelectorAll('#check-in, #check-in-modal');
    const checkOutInputs = document.querySelectorAll('#check-out, #check-out-modal');
    const nightsInputs = document.querySelectorAll('#nights, #nights-modal');

    if (checkInInputs.length && checkOutInputs.length && nightsInputs.length) {
        function updateNights(checkInInput, checkOutInput, nightsInput) {
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);
            if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
                const diffTime = checkOutDate - checkInDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                nightsInput.value = diffDays;
            } else {
                nightsInput.value = 1;
            }
        }

        checkInInputs.forEach((checkInInput, index) => {
            checkInInput.addEventListener('change', () => {
                updateNights(checkInInput, checkOutInputs[index], nightsInputs[index]);
            });
        });
        checkOutInputs.forEach((checkOutInput, index) => {
            checkOutInput.addEventListener('change', () => {
                updateNights(checkInInputs[index], checkOutInput, nightsInputs[index]);
            });
        });
    } else {
        console.warn('Nights calculation inputs (check-in, check-out, or nights) not found.');
    }

    // View Calendar Button
    const viewCalendarBtn = document.querySelector('.view-calendar-btn');
    if (viewCalendarBtn) {
        viewCalendarBtn.addEventListener('click', () => {
            alert('Calendar functionality coming soon. Please select dates using the form.');
        });
    }

    // Newsletter Form Validation
    const newsletterForm = document.querySelector('.footer-subscribe form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
                alert('Please enter a valid email address.');
                return;
            }
            alert('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        });
    } else {
        console.warn('Newsletter form not found.');
    }

    // Lazy Loading Images
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    // Smooth Page Transitions
    document.querySelectorAll('a:not([href^="#"]):not(.book-btn):not(.cta-btn):not(.room-btn):not(.book-room-btn)').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const href = link.getAttribute('href');
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    // Fade In on Page Load
    window.addEventListener('load', () => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    });

    // Testimonial Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    if (testimonialSlides.length && testimonialDots.length) {
        let currentSlide = 0;

        function showSlide(n) {
            testimonialSlides.forEach(slide => slide.classList.remove('active'));
            testimonialDots.forEach(dot => dot.classList.remove('active'));
            testimonialSlides[n].classList.add('active');
            testimonialDots[n].classList.add('active');
            currentSlide = n;
        }

        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });

        const testimonialInterval = setInterval(() => {
            let nextSlide = (currentSlide + 1) % testimonialSlides.length;
            showSlide(nextSlide);
        }, 6000);

        window.addEventListener('beforeunload', () => {
            clearInterval(testimonialInterval);
        });
    } else {
        console.warn('Testimonial elements (slides or dots) not found.');
    }

    // Initialize AOS
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true
    });
} else {
    console.warn('AOS library not loaded.');
    document.body.classList.add('aos-fallback');
}
});

// Header Scroll Effect
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
} else {
    console.warn('Header element not found.');
}

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button');
        const formMessage = contactForm.querySelector('#form-message');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const fields = {
                name: contactForm.querySelector('#full-name').value.trim(),
                email: contactForm.querySelector('#email').value.trim(),
                phone: contactForm.querySelector('#phone').value.trim(),
                message: contactForm.querySelector('#message').value.trim()
            };

            if (!fields.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || !fields.phone || !fields.message) {
                throw new Error('Please fill in all fields with valid data.');
            }

            if (supabase) {
                const { error } = await supabase.from('contacts').insert(fields);
                if (error) throw new Error(error.message);
            }

            formMessage.className = 'form-message success';
            formMessage.textContent = 'Message sent successfully!';
            contactForm.reset();
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = `Error: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
}
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true
    });
} else {
    console.warn('AOS library not loaded.');
    document.body.classList.add('aos-fallback');
}