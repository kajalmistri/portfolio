'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Footer year ───────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ── 2. Sticky nav & Scroll Spy ───────────────────────────────
  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[data-section]');

  function onScroll() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }
    updateActiveNav();
  }

  function updateActiveNav() {
    if (!sections.length || !navLinks.length) return;
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let active = null;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollMid) active = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === active);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── 3. Hamburger toggle ──────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      navMobile.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on link click
    navMobile.querySelectorAll('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── 4. Smooth scroll for anchor links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav ? nav.offsetHeight + 12 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── 5. Intersection Observer – Entrance Animations ───────────
  const fadeEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in');
  if ('IntersectionObserver' in window && fadeEls.length) {
    const fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10px 0px' });
    
    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  // ── 6. Contact Form ──────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const cfSubmit    = document.getElementById('cf-submit');

  if (contactForm && formSuccess && cfSubmit) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const name    = document.getElementById('cf-name').value.trim();
      const email   = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !message) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('cf-email').focus();
        return;
      }

      cfSubmit.disabled = true;
      const originalText = cfSubmit.innerHTML;
      cfSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: new FormData(contactForm),
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          formSuccess.classList.add('visible');
          contactForm.reset();
          setTimeout(() => formSuccess.classList.remove('visible'), 6000);
        } else {
          alert('Oops! There was a problem submitting your form.');
        }
      } catch (error) {
        alert('Oops! There was a problem submitting your form.');
      } finally {
        cfSubmit.disabled = false;
        cfSubmit.innerHTML = originalText;
      }
    });
  }

  // ── 7. Skill pill keyboard accessibility ─────────────────────
  document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.setAttribute('tabindex', '0');
  });

  // ── 8. Custom Cursor Implementation ──────────────────────────
  initCustomCursor();
});

function initCustomCursor() {
  // Only initialize on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';

  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.appendChild(trail);
  
  document.body.classList.add('has-custom-cursor');

  // Mouse state
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  
  // Ring physics state
  let ringX = mouseX;
  let ringY = mouseY;
  
  // Trail physics state
  let trailX = mouseX;
  let trailY = mouseY;

  let isHovering = false;
  let isHoveringBtn = false;
  let isClicking = false;

  // Update mouse coordinates
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Handle click states
  window.addEventListener('mousedown', () => {
    isClicking = true;
    updateCursorClasses();
  });
  
  window.addEventListener('mouseup', () => {
    isClicking = false;
    updateCursorClasses();
  });

  // Handle hover states on interactive elements
  const interactives = document.querySelectorAll('a, button, [role="button"], input, textarea, select, label, .skill-pill, .offer-card, .timeline-card, .testi-card, .edu-card');
  
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      if (el.classList.contains('btn') || el.tagName.toLowerCase() === 'button') {
        isHoveringBtn = true;
      }
      updateCursorClasses();
    });
    
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      isHoveringBtn = false;
      updateCursorClasses();
    });
  });

  function updateCursorClasses() {
    if (isHovering) {
      dot.classList.add('is-hovering');
      ring.classList.add('is-hovering');
      if (isHoveringBtn) {
        ring.classList.add('is-on-btn');
      } else {
        ring.classList.remove('is-on-btn');
      }
    } else {
      dot.classList.remove('is-hovering');
      ring.classList.remove('is-hovering', 'is-on-btn');
    }

    if (isClicking) {
      dot.classList.add('is-clicking');
      ring.classList.add('is-clicking');
    } else {
      dot.classList.remove('is-clicking');
      ring.classList.remove('is-clicking');
    }
  }

  // Render loop
  function render() {
    // Dot follows exactly
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    
    // Ring follows with slight lag (lerp)
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    
    // Trail follows with more lag
    trailX += (mouseX - trailX) * 0.08;
    trailY += (mouseY - trailY) * 0.08;
    trail.style.transform = `translate(${trailX}px, ${trailY}px)`;

    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);
}
