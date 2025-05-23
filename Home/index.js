
    // Google Maps initialization
    function initMap() {
        if (!window.google) {
            console.error('Google Maps API failed to load. Please ensure a valid API key is provided.');
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                mapContainer.innerHTML = '<p class="text-gray-500 text-sm">Unable to load map. Please try again later.</p>';
            }
            return;
        }
        console.log('Google Maps initialized with API key');
    }

     // Initialize Supabase client
    let supabase;
    try {
        setTimeout(() => {
            if (typeof createClient === 'function') {
                const supabaseUrl = 'https://fdpcmuwwbalwofxydsds.supabase.co';
                const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcGNtdXd3YmFsd29meHlkc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA3OTUsImV4cCI6MjA2MjYyNjc5NX0.FmvbrFqPepMcxJbY6eGLeS7oMIfDzXnMPAjdF-8MWGY';
                supabase = createClient(supabaseUrl, supabaseAnonKey);
                console.log('Supabase client initialized successfully');
                fetchReviews();
            } else {
                console.error('createClient is not defined after script load');
                const slider = document.getElementById('review-slider');
                if (slider) {
                    slider.innerHTML = '<p class="text-gray-500 text-sm">Failed to load review system. Please try again later.</p>';
                }
            }
        }, 100);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        const slider = document.getElementById('review-slider');
        if (slider) {
            slider.innerHTML = '<p class="text-gray-500 text-sm">Failed to load review system. Please try again later.</p>';
        }
    }

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
    });

    // Hero Carousel Logic
    const carousel = document.getElementById('carousel');
    const carouselContainer = document.getElementById('carousel-container');
    let currentIndex = 0;
    let isPaused = false;
    let slideInterval = setInterval(nextSlide, 5000);

    function slideTo(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    function nextSlide() {
        if (!isPaused) {
            if (currentIndex < 6) slideTo(currentIndex + 1);
            else slideTo(0);
        }
    }

    carouselContainer.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        isPaused = !isPaused;
        carouselContainer.setAttribute('aria-label', isPaused ? 'Play slideshow' : 'Pause slideshow');
    });

    // Review Slider Logic
    let currentReviewIndex = 0;
    let reviewInterval;

    function showReviewSlide(index, slides, dots) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentReviewIndex = index;
    }

    function nextReviewSlide() {
        const slides = document.querySelectorAll('.review-slide');
        const dots = document.querySelectorAll('.review-dot');
        if (slides.length === 0) return;
        currentReviewIndex = (currentReviewIndex + 1) % slides.length;
        showReviewSlide(currentReviewIndex, slides, dots);
    }

    function setupReviewSlider() {
        const slides = document.querySelectorAll('.review-slide');
        const dotsContainer = document.getElementById('review-dots');
        if (slides.length === 0) return;
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('review-dot');
            dot.setAttribute('data-slide', i);
            if (i === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        });
        const dots = document.querySelectorAll('.review-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                clearInterval(reviewInterval);
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                showReviewSlide(slideIndex, slides, dots);
                reviewInterval = setInterval(nextReviewSlide, 7000);
            });
        });
        clearInterval(reviewInterval);
        reviewInterval = setInterval(nextReviewSlide, 7000);
    }

    function setupReadMore() {
        document.querySelectorAll('.read-more').forEach(button => {
            button.addEventListener('click', () => {
                const container = button.previousElementSibling;
                if (container.classList.contains('expanded')) {
                    container.classList.remove('expanded');
                    button.textContent = 'Read more';
                } else {
                    container.classList.add('expanded');
                    button.textContent = 'Hide';
                }
            });
        });
    }

    // Fetch Reviews from Supabase
    async function fetchReviews() {
        const slider = document.getElementById('review-slider');
        if (!supabase) {
            slider.innerHTML = '<p class="text-gray-500 text-sm">Unable to connect to the review system.</p>';
            return;
        }

        try {
            const { data: reviews, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reviews:', error.message);
                slider.innerHTML = '<p class="text-gray-500 text-sm">Error loading reviews. Please try again later.</p>';
                return;
            }

            slider.innerHTML = '';
            if (reviews.length === 0) {
                slider.innerHTML = '<p class="text-gray-500 text-sm">No reviews yet. Be the first to share your experience!</p>';
                return;
            }

            reviews.forEach((review, index) => {
                const slide = document.createElement('div');
                slide.classList.add('review-slide');
                if (index === 0) slide.classList.add('active');
                const stars = Array(5).fill().map((_, i) => 
                    `<img src="https://cdn.trustindex.io/assets/platform/Tripadvisor/star/${i < review.rating ? 'f' : 'e'}.svg" alt="Star" class="w-3 h-3">`
                ).join('');
                slide.innerHTML = `
                    <div class="review-card bg-white p-4 rounded-lg shadow-sm">
                        <div class="flex items-start">
                            <img src="https://cdn.trustindex.io/assets/platform/Tripadvisor/icon.svg" alt="Tripadvisor" class="w-4 h-4 mr-2 mt-1">
                            <div class="flex items-center">
                                <img src="https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/e8/5b/default-avatar-2020-61.jpg" alt="${review.name}" class="w-8 h-8 rounded-full mr-2">
                                <div>
                                    <div class="font-bold text-primary text-sm">${review.name}</div>
                                    <div class="text-xs text-gray-500">${new Date(review.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                        <div class="flex mt-2">${stars}</div>
                        <div class="review-container mt-2 text-gray-700 text-sm font-['Open_Sans']">
                            <strong>${review.review.slice(0, 20)}...</strong><br>
                            ${review.review}
                        </div>
                        <span class="read-more text-secondary cursor-pointer mt-2 inline-block text-xs font-['Open_Sans']" role="button">Read more</span>
                    </div>
                `;
                slider.appendChild(slide);
            });

            setupReviewSlider();
            setupReadMore();
        } catch (error) {
            console.error('Unexpected error fetching reviews:', error);
            slider.innerHTML = '<p class="text-gray-500 text-sm">Unable to load reviews at this time.</p>';
        }
    }

    // Submit Review to Supabase
    document.getElementById('review-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageDiv = document.getElementById('submission-message');
        const name = document.getElementById('review-name').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const review = document.getElementById('review-text').value;

        if (!name || !rating || !review) {
            messageDiv.textContent = 'Please fill in all fields.';
            messageDiv.className = 'submission-message error';
            setTimeout(() => { messageDiv.className = 'submission-message'; messageDiv.textContent = ''; }, 5000);
            return;
        }

        if (!supabase) {
            messageDiv.textContent = 'Cannot submit review: Database connection failed.';
            messageDiv.className = 'submission-message error';
            setTimeout(() => { messageDiv.className = 'submission-message'; messageDiv.textContent = ''; }, 5000);
            return;
        }

        try {
            const { error } = await supabase
                .from('reviews')
                .insert([{ name, rating: parseInt(rating), review }]);

            if (error) {
                console.error('Error submitting review:', error.message);
                messageDiv.textContent = 'Error submitting review. Please try again.';
                messageDiv.className = 'submission-message error';
                setTimeout(() => { messageDiv.className = 'submission-message'; messageDiv.textContent = ''; }, 5000);
                return;
            }

            messageDiv.textContent = 'Review submitted successfully!';
            messageDiv.className = 'submission-message success';
            setTimeout(() => { messageDiv.className = 'submission-message'; messageDiv.textContent = ''; }, 5000);

            document.getElementById('review-form').reset();
            document.querySelectorAll('.star-label').forEach(label => label.style.color = '#d1d5db');
            fetchReviews();
        } catch (error) {
            console.error('Unexpected error submitting review:', error);
            messageDiv.textContent = 'Failed to submit review. Please try again later.';
            messageDiv.className = 'submission-message error';
            setTimeout(() => { messageDiv.className = 'submission-message'; messageDiv.textContent = ''; }, 5000);
        }
    });

    document.querySelectorAll('.star-input').forEach(star => {
        star.addEventListener('change', () => {
            const value = parseInt(star.value);
            document.querySelectorAll('.star-label').forEach((label, index) => {
                label.style.color = index < value ? '#d4af37' : '#d1d5db';
            });
        });
    });

    // Amenities Slider Logic
    function initAmenitiesSlider() {
        console.log('Initializing Amenities Slider...');
        const slides = document.querySelectorAll('.amenities-slider .slide');
        const thumbnails = document.querySelectorAll('.amenities-slider .thumbnail');
        const prevBtn = document.querySelector('.amenities-slider .prev-btn');
        const nextBtn = document.querySelector('.amenities-slider .next-btn');
        const slideDesc = document.getElementById('slide-description');

        if (!slides.length || !thumbnails.length || !prevBtn || !nextBtn || !slideDesc) {
            console.error('One or more slider elements not found. Aborting initialization.');
            return;
        }

        const slideContent = [
            "Luxury amenities offer every pleasure and convenience. The villa is at once state-of-the-art and discreetly in harmony with your natural surroundings.",
            "Experience the perfect blend of indoor and outdoor living with expansive glass walls that frame breathtaking ocean views.",
            "Cool off in the infinity pool with panoramic views that stretch to the horizon. Perfect for relaxing or entertaining guests.",
            "Elegantly appointed bedroom spaces feature premium linens and thoughtful design elements that ensure ultimate comfort."
        ];

        let currentAmenityIndex = 0;

        function updateAmenitySlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            thumbnails.forEach(thumbnail => thumbnail.classList.remove('active'));
            slides[index].classList.add('active');
            thumbnails[index].classList.add('active');
            slideDesc.textContent = slideContent[index];
            currentAmenityIndex = index;
        }

        thumbnails.forEach((thumbnail, idx) => {
            thumbnail.addEventListener('click', () => updateAmenitySlide(idx));
        });

        prevBtn.addEventListener('click', () => {
            let newIndex = (currentAmenityIndex - 1 + slides.length) % slides.length;
            updateAmenitySlide(newIndex);
        });

        nextBtn.addEventListener('click', () => {
            let newIndex = (currentAmenityIndex + 1) % slides.length;
            updateAmenitySlide(newIndex);
        });

        updateAmenitySlide(0);
    }

   

    // Run the slider initialization and fetch reviews after the DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initAmenitiesSlider();
            fetchReviews();
        } catch (error) {
            console.error('Error during initialization:', error);
            const slider = document.getElementById('review-slider');
            if (slider) {
                slider.innerHTML = '<p class="text-gray-500 text-sm">Failed to load reviews due to an initialization error.</p>';
            }
        }
    });/////////

    // Room Modal Handlers
    function closeRoomModal(roomId) {
        document.getElementById(`${roomId}-modal`).classList.add('hidden');
    }

    document.querySelectorAll('.room-card').forEach(card => {
        card.addEventListener('click', () => {
            const roomId = card.querySelector('h3').textContent.toLowerCase().replace(' ', '-');
            document.getElementById(`${roomId}-modal`).classList.remove('hidden');
        });
    });

    document.querySelectorAll('.close-room-modal, .close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.room-modal, .booking-modal').classList.add('hidden');
        });
    });

    // Booking Modal Night Calculation
    const checkIn = document.getElementById('check-in');
    const checkOut = document.getElementById('check-out');
    const nights = document.getElementById('nights');

    checkIn.addEventListener('change', calculateNights);
    checkOut.addEventListener('change', calculateNights);

    function calculateNights() {
        if (checkIn.value && checkOut.value) {
            const checkInDate = new Date(checkIn.value);
            const checkOutDate = new Date(checkOut.value);
            const diffTime = Math.abs(checkOutDate - checkInDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            nights.value = diffDays;
        } else {
            nights.value = '';
        }
    }
