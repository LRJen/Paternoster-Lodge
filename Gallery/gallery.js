
        document.addEventListener('DOMContentLoaded', () => {
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

            // Initialize LightGallery for gallery section
            if (typeof lightGallery !== 'undefined') {
                lightGallery(document.getElementById('lightgallery'), {
                    speed: 500,
                    download: false
                });
            } else {
                console.warn('LightGallery library not loaded.');
            }

            // Auto-scroll and arrow navigation for gallery section
            const galleryGrid = document.querySelector('.gallery-grid');
            const leftArrow = document.querySelector('.gallery-arrow-left');
            const rightArrow = document.querySelector('.gallery-arrow-right');
            if (galleryGrid && galleryGrid.scrollWidth > galleryGrid.clientWidth) {
                let scrollPosition = 0;
                const scrollSpeed = 1;
                const scrollAmountDesktop = 300;
                const scrollAmountMobile = 200;
                const isMobile = window.innerWidth <= 768;
                const scrollAmount = isMobile ? scrollAmountMobile : scrollAmountDesktop;
                let isScrolling = true;
                let isLooping = false;

                function autoScroll() {
                    if (isScrolling && !isLooping) {
                        scrollPosition += scrollSpeed;
                        if (scrollPosition >= galleryGrid.scrollWidth - galleryGrid.clientWidth - scrollSpeed) {
                            isLooping = true;
                            galleryGrid.style.transition = 'opacity 0.3s ease';
                            galleryGrid.style.opacity = '0';
                            setTimeout(() => {
                                scrollPosition = 0;
                                galleryGrid.scrollTo({
                                    left: scrollPosition,
                                    behavior: 'auto'
                                });
                                galleryGrid.style.opacity = '1';
                                isLooping = false;
                            }, 300);
                        } else {
                            galleryGrid.scrollTo({
                                left: scrollPosition,
                                behavior: 'smooth'
                            });
                        }
                        requestAnimationFrame(autoScroll);
                    }
                }

                autoScroll();

                galleryGrid.addEventListener('mouseenter', () => {
                    isScrolling = false;
                });
                galleryGrid.addEventListener('mouseleave', () => {
                    isScrolling = true;
                    autoScroll();
                });

                leftArrow.addEventListener('click', () => {
                    isScrolling = false;
                    scrollPosition = Math.max(0, scrollPosition - scrollAmount);
                    galleryGrid.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                    });
                    setTimeout(() => {
                        isScrolling = true;
                        autoScroll();
                    }, 10000);
                });

                rightArrow.addEventListener('click', () => {
                    isScrolling = false;
                    scrollPosition = Math.min(
                        galleryGrid.scrollWidth - galleryGrid.clientWidth,
                        scrollPosition + scrollAmount
                    );
                    galleryGrid.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                    });
                    setTimeout(() => {
                        isScrolling = true;
                        autoScroll();
                    }, 10000);
                });

                window.addEventListener('resize', () => {
                    const newIsMobile = window.innerWidth <= 768;
                    scrollAmount = newIsMobile ? scrollAmountMobile : scrollAmountDesktop;
                });
            } else {
                console.warn('Gallery grid not scrollable or not found.');
                if (leftArrow) leftArrow.style.display = 'none';
                if (rightArrow) rightArrow.style.display = 'none';
            }
        });
    