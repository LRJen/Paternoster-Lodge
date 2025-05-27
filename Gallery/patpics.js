
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize LightGallery for pat-pictures section
            const patGallery = document.getElementById('pat-gallery');
            if (typeof lightGallery !== 'undefined' && patGallery) {
                try {
                    const galleryInstance = lightGallery(patGallery, {
                        selector: '.masonry-item a',
                        speed: 500,
                        download: false,
                        thumbnail: true,
                        zoom: true,
                        subHtmlSelectorRelative: true,
                        mode: 'lg-slide',
                        addClass: 'lg-content',
                        prevHtml: '<i class="fas fa-chevron-left"></i>',
                        nextHtml: '<i class="fas fa-chevron-right"></i>',
                        getCaptionFromTitleOrAlt: true,
                        preload: 2,
                        showMaximizeIcon: true,
                        loadErrorMessage: 'Unable to load image. Please check the URL or try again later.',
                        onInit: () => {
                            console.log('Pat-gallery LightGallery initialized');
                        },
                        onBeforeOpen: () => {
                            console.log('Pat-gallery LightGallery opening');
                        },
                        onAfterOpen: () => {
                            console.log('Pat-gallery LightGallery opened');
                        },
                        onError: (err) => {
                            console.error('Pat-gallery LightGallery error:', err);
                        }
                    });

                    // Refresh LightGallery after filtering
                    patGallery.addEventListener('lgAfterOpen', () => {
                        galleryInstance.refresh();
                    });
                } catch (error) {
                    console.error('Pat-gallery LightGallery initialization failed:', error);
                }
            } else {
                console.warn('LightGallery library or pat-gallery element not found.');
            }

            // Filter functionality for pat-pictures
            const filterButtons = document.querySelectorAll('.filter-btn');
            const galleryItems = document.querySelectorAll('.masonry-item');

            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filter = button.getAttribute('data-filter');
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    // Filter items
                    galleryItems.forEach(item => {
                        const category = item.getAttribute('data-category');
                        if (filter === 'all' || category === filter) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, 50);
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });

                    // Refresh LightGallery after filtering
                    if (typeof lightGallery !== 'undefined' && patGallery) {
                        const galleryInstance = lightGallery(patGallery);
                        if (galleryInstance) {
                            galleryInstance.refresh();
                        }
                    }
                });
            });
        });
    