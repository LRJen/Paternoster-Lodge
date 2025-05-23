document.addEventListener('DOMContentLoaded', () => {
// Initialize AOS
AOS.init();



// Modal Functionality
const viewButtons = document.querySelectorAll('.view-btn');
const modal = document.querySelector('.room-modal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.querySelector('.modal-title');
const modalDescription = document.querySelector('.modal-description');
const modalMainImage = document.querySelector('.modal-main-image');
const modalThumbnails = document.querySelectorAll('.modal-thumbnails img');

const roomData = {
    'queen-deluxe': {
        title: 'Queen Deluxe Room',
        description: 'Indulge in our deluxe double room with en-suite, offering a semi-self-catering experience. This room features a convenient kitchenette equipped with a microwave, mini-fridge, and basin. Enjoy modern comforts with air conditioning, a Smart TV featuring selected DStv channels, and complimentary Wi-Fi. The en-suite includes a walk-in shower, and guests have exclusive access to the refreshing plunge pool.',
        images: [
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/14736_5_3_1_bed-2048x1152.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/14736_5_3_11_shower-2048x1152.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/14736_5_3_3_seating-area-2048x1152.jpg'
        ]
    },
    'family': {
        title: 'Family Room',
        description: 'Double family room with en-suite. A luxury coach can be converted into a bunk for children. Camping cot subject to availability. All rooms come with air-conditioning and Smart TV with selected DStv channels and have access to Plunge Pool.',
        images: [
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_142038-2048x946.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_142622-2048x946.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_142554-2048x946.jpg'
        ]
    },
    'standard': {
        title: 'Standard Rooms',
        description: 'Embrace tranquility in our comfortable double room with en-suite shower. Enjoy the convenience of a camping cot, subject to availability, ensuring a restful stay. All our rooms feature air conditioning, a Smart TV with selected DStv channels, and a shared patio with a captivating view over Paternoster Beach, plus exclusive access to our plunge pool.',
        images: [
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/14736_4_2_1_bed-2048x709.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_141617-2048x946.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_140955-2048x946.jpg'
        ]
    },
    'honeymoon': {
        title: 'Honeymoon Suite',
        description: 'Celebrate your love in our enchanting Honeymoon En-Suite, designed for an intimate escape. This room features a semi-self-catering experience with a kitchenette, including a microwave, mini-fridge, and basin. Enjoy air conditioning, a Smart TV with DStv channels, and Wi-Fi. Revel in a double walk-in shower and the private plunge pool for a magical stay.',
        images: [
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_1420381-2048x946.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_142135-2048x946.jpg',
            'https://paternosterlodge.co.za/wp/wp-content/uploads/2022/09/20220628_142200-2048x946.jpg'
        ]
    }
};

viewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault(); // No longer needed with button, but kept for consistency
        const roomType = button.closest('.room-section').getAttribute('data-room-type');
        const room = roomData[roomType];

        modalTitle.textContent = room.title;
        modalDescription.textContent = room.description;
        modalMainImage.src = room.images[0];
        modalThumbnails.forEach((thumbnail, index) => {
            if (room.images[index]) {
                thumbnail.src = room.images[index];
                thumbnail.style.display = 'block';
            } else {
                thumbnail.style.display = 'none';
            }
        });

        modal.classList.remove('hidden');
    });
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

modalThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
        modalMainImage.src = thumbnail.src;
    });
});
});