/* ════════════════════════════════
   FMC株式会社 — Site Scripts
════════════════════════════════ */

(function () {
  'use strict';

  /* ── Hamburger Menu ── */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    nav.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Header scroll shadow ── */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ── Fade-in on scroll ── */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings: find index among parent's fade-in children
          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll('.fade-in')
          );
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 240); // max 240ms stagger

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -32px 0px'
    });

    fadeEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach((el) => el.classList.add('visible'));
  }

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks  = document.querySelectorAll('#nav a[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.style.color = '';
            link.style.fontWeight = '';
          });
          const id = entry.target.getAttribute('id');
          const active = document.querySelector(`#nav a[href="#${id}"]`);
          if (active) {
            active.style.color = 'var(--navy)';
            active.style.fontWeight = '600';
          }
        }
      });
    }, { threshold: 0.4 });

    sections.forEach((s) => sectionObserver.observe(s));
  }

})();
