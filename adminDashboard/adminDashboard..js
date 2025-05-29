
        document.addEventListener('DOMContentLoaded', () => {
            AOS.init({ duration: 1000, once: true });

            // Navigation toggle
            const hamburger = document.querySelector('.hamburger');
            const mobileNav = document.querySelector('.mobile-nav');
            if (hamburger && mobileNav) {
                hamburger.addEventListener('click', () => {
                    hamburger.classList.toggle('active');
                    mobileNav.classList.toggle('active');
                    mobileNav.classList.toggle('hidden');
                    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                    hamburger.setAttribute('aria-expanded', !isExpanded);
                });
                document.querySelectorAll('.mobile-nav a').forEach(link => {
                    link.addEventListener('click', () => {
                        hamburger.classList.remove('active');
                        mobileNav.classList.remove('active');
                        mobileNav.classList.add('hidden');
                        hamburger.setAttribute('aria-expanded', 'false');
                    });
                });
            }

            // Tab switching
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab).classList.add('active');
                });
            });

            // Dummy data
            let bookings = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    user_id: '1',
                    user_name: 'John Doe',
                    room_type: 'Deluxe King Room',
                    check_in: '2025-05-31',
                    check_out: '2025-06-05',
                    quantity: 1,
                    adults: 2,
                    children: 0,
                    total_price: 1200,
                    status: 'pending',
                    payment_date: '2025-05-24'
                },
                {
                    id: '223e4567-e89b-12d3-a456-426614174001',
                    user_id: '2',
                    user_name: 'Jane Smith',
                    room_type: 'Honeymoon Suite',
                    check_in: '2025-06-10',
                    check_out: '2025-06-15',
                    quantity: 1,
                    adults: 2,
                    children: 1,
                    total_price: 3750,
                    status: 'confirmed',
                    payment_date: '2025-06-01'
                }
            ];

            let users = [
                {
                    id: '1',
                    full_name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    is_admin: false
                },
                {
                    id: '2',
                    full_name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1234567891',
                    is_admin: true
                },
                {
                    id: '3',
                    full_name: 'Alice Johnson',
                    email: 'alice.johnson@example.com',
                    phone: '+1234567892',
                    is_admin: false
                }
            ];

            let rooms = [
                {
                    id: '123',
                    type: 'Deluxe King Room',
                    image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=150&h=100',
                    specs: ['1 double bed', 'AC', 'TV', '18 m²', 'WiFi', 'Bathroom', 'Kitchenette'],
                    price_per_night: 1200
                },
                {
                    id: '124',
                    type: 'Honeymoon Suite',
                    image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=150&h=100',
                    specs: ['1 king bed', 'AC', 'TV', '25 m²', 'WiFi', 'Ensuite', 'Balcony'],
                    price_per_night: 2500
                },
                {
                    id: '125',
                    type: 'Standard Room',
                    image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=150&h=100',
                    specs: ['2 single beds', 'WiFi', 'Bathroom', '15 m²'],
                    price_per_night: 800
                }
            ];

            // Format date
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
            };

            // Render Bookings
            const renderBookings = () => {
                const tableBody = document.getElementById('admin-bookings-table-body');
                const errorElement = document.getElementById('bookings-error');
                errorElement.style.display = 'none';
                tableBody.innerHTML = '';
                bookings.forEach(booking => {
                    const row = document.createElement('tr');
                    const guests = `${booking.quantity} room${booking.quantity > 1 ? 's' : ''}, ${booking.adults} adult${booking.adults > 1 ? 's' : ''}${booking.children ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}` : ''}`;
                    row.innerHTML = `
                        <td>${booking.id.slice(0, 8)}...</td>
                        <td>${booking.user_name}</td>
                        <td>${booking.room_type}</td>
                        <td>${formatDate(booking.check_in)}</td>
                        <td>${formatDate(booking.check_out)}</td>
                        <td>${guests}</td>
                        <td>ZAR ${booking.total_price.toFixed(2)}</td>
                        <td>${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</td>
                        <td><button class="action-btn" onclick="window.openEditBookingModal('${booking.id}')">Edit</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            };

            // Render Users
            const renderUsers = () => {
                const tableBody = document.getElementById('users-table-body');
                const errorElement = document.getElementById('users-error');
                errorElement.style.display = 'none';
                tableBody.innerHTML = '';
                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${user.is_admin ? 'Yes' : 'No'}</td>
                        <td><button class="action-btn" onclick="window.openEditUserModal('${user.id}')">Edit</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            };

            // Render Rooms
            const renderRooms = () => {
                const tableBody = document.getElementById('rooms-table-body');
                const errorElement = document.getElementById('rooms-error');
                errorElement.style.display = 'none';
                tableBody.innerHTML = '';
                rooms.forEach(room => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${room.type}</td>
                        <td>ZAR ${room.price_per_night.toFixed(2)}</td>
                        <td>${room.specs.join(', ')}</td>
                        <td>
                            <button class="action-btn" onclick="window.editRoomType('${room.id}')">Edit</button>
                            <button class="action-btn cancel-btn" onclick="window.deleteRoom('${room.id}')">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            };

            // Render Analytics
            const renderAnalytics = () => {
                const errorElement = document.getElementById('analytics-error');
                errorElement.style.display = 'none';
                const totalBookings = bookings.length;
                const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
                const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
                document.getElementById('total-bookings').textContent = totalBookings;
                document.getElementById('total-revenue').textContent = `ZAR ${totalRevenue.toFixed(2)}`;
                document.getElementById('active-bookings').textContent = activeBookings;
            };

            // Edit Booking Modal
            window.openEditBookingModal = (bookingId) => {
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    const modal = document.getElementById('edit-booking-modal');
                    const roomTypeSelect = document.getElementById('edit-room-type');
                    roomTypeSelect.innerHTML = rooms.map(r => `<option value="${r.type}" ${r.type === booking.room_type ? 'selected' : ''}>${r.type}</option>`).join('');
                    document.getElementById('edit-booking-id').value = booking.id;
                    document.getElementById('edit-room-type').value = booking.room_type;
                    document.getElementById('edit-check-in').value = booking.check_in;
                    document.getElementById('edit-check-out').value = booking.check_out;
                    document.getElementById('edit-adults').value = booking.adults;
                    document.getElementById('edit-children').value = booking.children;
                    document.getElementById('edit-status').value = booking.status;

                    document.getElementById('edit-booking-form').onsubmit = (e) => {
                        e.preventDefault();
                        const updatedBooking = {
                            ...booking,
                            room_type: document.getElementById('edit-room-type').value,
                            check_in: document.getElementById('edit-check-in').value,
                            check_out: document.getElementById('edit-check-out').value,
                            adults: parseInt(document.getElementById('edit-adults').value),
                            children: parseInt(document.getElementById('edit-children').value),
                            status: document.getElementById('edit-status').value
                        };
                        bookings = bookings.map(b => b.id === bookingId ? updatedBooking : b);
                        renderBookings();
                        renderAnalytics();
                        window.closeModal('edit-booking-modal');
                        alert('Booking updated successfully');
                    };

                    modal.style.display = 'flex';
                }
            };

            // Edit User Modal
            window.openEditUserModal = (userId) => {
                const user = users.find(u => u.id === userId);
                if (user) {
                    const modal = document.getElementById('edit-user-modal');
                    document.getElementById('edit-user-id').value = user.id;
                    document.getElementById('edit-user-name').value = user.full_name;
                    document.getElementById('edit-user-email').value = user.email;
                    document.getElementById('edit-user-phone').value = user.phone || '';
                    document.getElementById('edit-user-is-admin').checked = user.is_admin;

                    document.getElementById('edit-user-form').onsubmit = (e) => {
                        e.preventDefault();
                        const updatedUser = {
                            ...user,
                            full_name: document.getElementById('edit-user-name').value,
                            email: document.getElementById('edit-user-email').value,
                            phone: document.getElementById('edit-user-phone').value || null,
                            is_admin: document.getElementById('edit-user-is-admin').checked
                        };
                        users = users.map(u => u.id === userId ? updatedUser : u);
                        bookings = bookings.map(b => b.user_id === userId ? { ...b, user_name: updatedUser.full_name } : b);
                        renderUsers();
                        renderBookings();
                        window.closeModal('edit-user-modal');
                        alert('User updated successfully');
                    };

                    modal.style.display = 'flex';
                }
            };

            // Add/Edit Room
            window.editRoomType = (roomId) => {
                const room = rooms.find(r => r.id === roomId);
                if (room) {
                    document.getElementById('room-id').value = room.id;
                    document.getElementById('room-type').value = room.type;
                    document.getElementById('room-price').value = room.price_per_night;
                    document.getElementById('room-specs').value = room.specs.join(', ');
                    document.getElementById('room-image-url').value = room.image_url || '';
                }
            };

            document.getElementById('room-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('room-id').value;
                const type = document.getElementById('room-type').value;
                const price = parseFloat(document.getElementById('room-price').value);
                const specs = document.getElementById('room-specs').value.split(',').map(s => s.trim()).filter(Boolean);
                const imageUrl = document.getElementById('room-image-url').value || 'https://images.unsplash.com/photo-1580587771528-78b7b3c7c22f?w=150&h=100';

                if (id) {
                    rooms = rooms.map(r => r.id === id ? { ...r, type, price_per_night: price, specs, image_url: imageUrl } : r);
                    alert('Room updated successfully');
                } else {
                    const newRoom = {
                        id: String(Date.now()),
                        type,
                        image_url: imageUrl,
                        specs,
                        price_per_night: price
                    };
                    rooms.push(newRoom);
                    alert('Room added successfully');
                }
                document.getElementById('room-form').reset();
                document.getElementById('room-id').value = '';
                renderRooms();
            });

            // Delete Room
            window.deleteRoom = (id) => {
                if (confirm('Are you sure you want to delete this room?')) {
                    rooms = rooms.filter(r => r.id !== id);
                    renderRooms();
                    alert('Room deleted successfully');
                }
            };

            // Close Modal
            window.closeModal = (modalId) => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                    if (modalId === 'edit-user-modal') {
                        document.getElementById('edit-user-form').reset();
                    } else if (modalId === 'edit-booking-modal') {
                        document.getElementById('edit-booking-form').reset();
                    }
                }
            };

            // Logout (simulated)
            const logoutBtn = document.getElementById('logout-btn');
            const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    window.location.href = './register-login.html';
                    alert('Logged out');
                });
            }
            if (mobileLogoutBtn) {
                mobileLogoutBtn.addEventListener('click', () => {
                    window.location.href = './register-login.html';
                    alert('Logged out');
                });
            }

            // Initial render
            renderBookings();
            renderUsers();
            renderRooms();
            renderAnalytics();
        });
   