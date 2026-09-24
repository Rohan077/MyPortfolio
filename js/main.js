// Rohan Saikia — Portfolio interactions
// Progressive enhancement: every element is visible by default in CSS.
// GSAP (if it loads) adds the "from" state at runtime — if the CDN fails,
// the page simply shows everything without animation. Nothing depends on
// JS to become visible.

document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Preloader ----------
  var preloader = document.getElementById('preloader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (preloader) preloader.classList.add('hidden');
    }, reduceMotion ? 0 : 900);
  });
  // Safety net: never let the preloader block the page forever.
  setTimeout(function () { if (preloader) preloader.classList.add('hidden'); }, 3000);

  // ---------- Footer year ----------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Mobile nav ----------
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Dark mode toggle ----------
  var themeToggle = document.getElementById('themeToggle');
  function setThemeIcon() {
    if (!themeToggle) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  setThemeIcon();
  function flipTheme() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    }
    setThemeIcon();
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function (e) {
      // Animate a wipe expanding from the toggle button, using the View
      // Transitions API where available. Falls back to an instant swap.
      if (reduceMotion || !document.startViewTransition) {
        flipTheme();
        return;
      }
      var x = e.clientX, y = e.clientY;
      var endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      var transition = document.startViewTransition(function () { flipTheme(); });
      transition.ready.then(function () {
        document.documentElement.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 650, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    });
  }

  // ---------- Header solid + scroll progress + back to top ----------
  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('scrollProgress');
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('solid', y > 40);
    if (backToTop) backToTop.classList.toggle('visible', y > 480);
    if (progress) {
      var h = document.documentElement;
      var pct = (y / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Active nav link ----------
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-link');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.getAttribute('id');
        var link = document.querySelector('.nav-link[href="#' + id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  // ---------- Typewriter rotating role ----------
  var roles = ['Product Builder', 'MBA Candidate, IIM Raipur', 'Ex-Software Engineer, Cognizant', 'Operator Behind Two Live Products'];
  var typedEl = document.getElementById('typedRole');
  if (typedEl && !reduceMotion) {
    var ri = 0, ci = 0, deleting = false;
    function tick() {
      var word = roles[ri];
      if (!deleting) {
        ci++;
        typedEl.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return; }
      } else {
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    setTimeout(tick, 600);
  } else if (typedEl) {
    typedEl.textContent = roles[0];
  }

  // ---------- Counters ----------
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var start = 0, duration = 1400, startTime = null;
    function frame(t) {
      if (!startTime) startTime = t;
      var progressPct = Math.min((t - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progressPct, 3);
      var value = Math.round(start + (target - start) * eased);
      el.textContent = value + suffix;
      if (progressPct < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('.stat-num');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cObserver.observe(c); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  // ---------- GSAP scroll reveals (progressive enhancement) ----------
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero heading lines
    gsap.from('.hero h1 .line span', {
      yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.12, delay: 0.3
    });
    gsap.from('.hero-eyebrow, .hero-role, .hero-actions', {
      opacity: 0, y: 20, duration: 0.9, ease: 'power2.out', stagger: 0.12, delay: 0.9
    });

    // Generic reveal-on-scroll
    document.querySelectorAll('.reveal').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Showcase media parallax
    document.querySelectorAll('.showcase-media img').forEach(function (img) {
      gsap.to(img, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Off-duty band + testimonial background parallax
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      gsap.to(el, {
        y: 70, ease: 'none',
        scrollTrigger: { trigger: el.closest('.parallax-band, .testimonial-bg-wrap') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  // ---------- Certificate lightbox ----------
  var lightbox = document.getElementById('certLightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  function openLightbox(src, title) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = title || 'Certificate';
    lightboxCaption.textContent = title || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.cert-thumb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLightbox(btn.getAttribute('data-img'), btn.getAttribute('data-title'));
    });
  });
  // Whole-card viewable elements (VibeCode/Tekathon/outreach proof cards).
  document.querySelectorAll('.card-viewable').forEach(function (card) {
    card.addEventListener('click', function () {
      openLightbox(card.getAttribute('data-img'), card.getAttribute('data-title'));
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card.getAttribute('data-img'), card.getAttribute('data-title'));
      }
    });
  });
  // Any other content image (project screenshots, gallery shots) — click to view full-size.
  // Profile photo instances are excluded on purpose.
  document.querySelectorAll('.zoomable').forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLightbox(); closeContactModal(); }
  });

  // ---------- Contact popup modal ----------
  var contactModal = document.getElementById('contactModal');
  var modalClose = document.getElementById('modalClose');
  var popupForm = document.getElementById('popupForm');
  var popupStatus = document.getElementById('popupStatus');
  var popupSubmit = document.getElementById('popupSubmit');

  function openContactModal() {
    if (!contactModal) return;
    contactModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeContactModal() {
    if (!contactModal) return;
    contactModal.hidden = true;
    document.body.style.overflow = '';
    try { sessionStorage.setItem('contactModalSeen', '1'); } catch (e) {}
  }
  if (modalClose) modalClose.addEventListener('click', closeContactModal);
  if (contactModal) contactModal.addEventListener('click', function (e) { if (e.target === contactModal) closeContactModal(); });

  var alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem('contactModalSeen') === '1'; } catch (e) {}
  if (!alreadySeen) {
    setTimeout(openContactModal, reduceMotion ? 800 : 2200);
  }

  if (popupForm) {
    popupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(popupForm);
      var payload = {
        name: data.get('name'),
        phone: data.get('phone'),
        email: data.get('email'),
        message: data.get('message'),
        _subject: 'New message from portfolio site'
      };
      popupSubmit.disabled = true;
      popupSubmit.textContent = 'Sending…';
      popupStatus.className = 'modal-status show';
      popupStatus.textContent = '';

      fetch('https://formsubmit.co/ajax/rohansaikia71@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (result) {
          if (result.ok) {
            popupStatus.className = 'modal-status show ok';
            popupStatus.textContent = "Sent! I'll get back to you soon.";
            popupForm.reset();
            setTimeout(closeContactModal, 1800);
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          popupStatus.className = 'modal-status show err';
          popupStatus.innerHTML = 'Could not send automatically — please email <a href="mailto:rohansaikia71@gmail.com" style="color:inherit;text-decoration:underline;">rohansaikia71@gmail.com</a> directly.';
        })
        .finally(function () {
          popupSubmit.disabled = false;
          popupSubmit.textContent = 'Send Message';
        });
    });
  }

  // ---------- Card tilt on hover (desktop only) ----------
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    document.querySelectorAll('.mini-card, .cert-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(600px) rotateX(' + (y * -6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }
});
