const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        document.body.style.overflow = isExpanded ? 'hidden' : 'auto';
    });

    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    });

    window.addEventListener('load', () => {
        if (window.innerWidth < 1024) {
            mobileNav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    });
} else {
    console.warn('Navigation elements (hamburger or mobile-nav) not found.');
}

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});