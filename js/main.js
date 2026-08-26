(function () {
  'use strict';

  /* ---- Mobile Navigation ---- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const menuLinks = navMenu ? navMenu.querySelectorAll('a') : [];

  function closeMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navMenu.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    navMenu.classList.add('is-open');
    document.body.classList.add('nav-open');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        closeMenu();
      }
    });
  }

  /* ---- Active Nav Link by current page ---- */
  const navLinks = document.querySelectorAll('.nav__link');
  const path = window.location.pathname;
  let page = path.substring(path.lastIndexOf('/') + 1);
  if (!page) page = 'index.html';

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    const isHome = (page === 'index.html' || page === '') && href === 'index.html';
    const isMatch = href === page;
    if (isHome || isMatch) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    }
  });

  /* ---- Portfolio Carousel ---- */
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineHoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const prefersReducedMotion = reducedMotionQuery.matches;

  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = track.querySelectorAll('.carousel__slide');
    const carouselEl = track.closest('.carousel');
    const swipeRoot = track.closest('.carousel__viewport') || track;
    let currentIndex = 0;
    let autoplayTimer = null;

    function autoplayInterval() {
      return reducedMotionQuery.matches ? 10000 : 5000;
    }

    slides.forEach(function (slide, i) {
      if (slide.classList.contains('is-active')) currentIndex = i;
      const dot = document.createElement('button');
      dot.classList.add('carousel__dot');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === currentIndex) dot.classList.add('is-active');
      dot.addEventListener('click', function () {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel__dot');

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === currentIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentIndex);
      });
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    prevBtn.addEventListener('click', function () {
      prevSlide();
      resetAutoplay();
    });

    nextBtn.addEventListener('click', function () {
      nextSlide();
      resetAutoplay();
    });

    /* Touch / swipe — clientX is more reliable on iPhone than screenX */
    let touchStartX = 0;
    let touchStartY = 0;

    swipeRoot.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    swipeRoot.addEventListener('touchend', function (e) {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? nextSlide() : prevSlide();
        resetAutoplay();
      }
    }, { passive: true });

    function startAutoplay() {
      if (autoplayTimer) return;
      autoplayTimer = setInterval(nextSlide, autoplayInterval());
    }

    function pauseAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    function resetAutoplay() {
      pauseAutoplay();
      startAutoplay();
    }

    /* Pause on hover/keyboard only on desktop. iPhone can fire mouseenter
       on tap and never mouseleave, which used to freeze autoplay. */
    if (carouselEl && fineHoverQuery.matches) {
      carouselEl.addEventListener('mouseenter', pauseAutoplay);
      carouselEl.addEventListener('mouseleave', startAutoplay);
      carouselEl.addEventListener('focusin', pauseAutoplay);
      carouselEl.addEventListener('focusout', function (e) {
        if (!carouselEl.contains(e.relatedTarget)) startAutoplay();
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pauseAutoplay();
      else startAutoplay();
    });

    goToSlide(currentIndex);
    startAutoplay();
  }

  /* ---- Fade-in on scroll ---- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll([
      '.section__header',
      '.services-preview',
      '.salon-feature',
      '.carousel',
      '.video-grid__item',
      '.teaser-card',
      '.service-card',
      '.training__gallery',
      '.training__photo',
      '.training__block',
      '.course-card',
      '.about-cover',
      '.about__text',
      '.about-portrait',
      '.contact-portrait',
      '.contact-info',
      '.contact-map'
    ].join(', '));

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    revealEls.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 40;
      el.classList.add('reveal');
      if (inView) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
  }

  /* ---- Footer Year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
