document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════
  // 1. NAV SCROLL EFFECT
  // ═══════════════════════════════════════
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ═══════════════════════════════════════
  // 2. CURSOR GLOW
  // ═══════════════════════════════════════
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function animGlow() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      requestAnimationFrame(animGlow);
    })();
  }

  // ═══════════════════════════════════════
  // 3. GRID PARALLAX
  // ═══════════════════════════════════════
  const gridBg = document.querySelector('.grid-bg');
  if (gridBg) {
    window.addEventListener('scroll', () => {
      gridBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }, { passive: true });
  }

  // ═══════════════════════════════════════
  // 4. SMOOTH SCROLL
  // ═══════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ═══════════════════════════════════════
  // 5. MAGNETIC BUTTONS
  // ═══════════════════════════════════════
  document.querySelectorAll('.btn-primary, .btn-ghost, .submit-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.15;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.15;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // ═══════════════════════════════════════
  // 6. SCROLL REVEAL — ONE UNIFIED SYSTEM
  // ═══════════════════════════════════════
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const index = parseInt(el.getAttribute('data-delay') || '0');
      const delay = index * 130 + 80;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ═══════════════════════════════════════
  // 7. CAPABILITY CARD 3D TILT
  // ═══════════════════════════════════════
  document.querySelectorAll('.cap-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform =
        `perspective(600px) rotateY(${dx * 3}deg) rotateX(${-dy * 3}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform  = '';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });

  // ═══════════════════════════════════════
  // 8. LAYER NODE GLOW (System section)
  // ═══════════════════════════════════════
  document.querySelectorAll('.layer-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      node.style.boxShadow = '0 0 12px rgba(59,130,246,0.2)';
    });
    node.addEventListener('mouseleave', () => {
      node.style.boxShadow = '';
    });
  });

  // ═══════════════════════════════════════
  // 9. BEFORE/AFTER SLIDER
  // ═══════════════════════════════════════
  const baWrap   = document.getElementById('baSlider');
  const baAfter  = document.getElementById('baAfter');
  const baHandle = document.getElementById('baHandle');

  if (baWrap && baAfter && baHandle) {
    let dragging = false;

    function setSlider(x) {
      const r   = baWrap.getBoundingClientRect();
      const pct = Math.min(95, Math.max(5, ((x - r.left) / r.width) * 100));
      baAfter.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      baHandle.style.left    = pct + '%';
    }

    baWrap.addEventListener('mousedown',  e => { dragging = true; setSlider(e.clientX); });
    baWrap.addEventListener('touchstart', e => { dragging = true; setSlider(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mousemove',  e => { if (dragging) setSlider(e.clientX); });
    window.addEventListener('touchmove',  e => { if (dragging) setSlider(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup',    () => dragging = false);
    window.addEventListener('touchend',   () => dragging = false);

    // auto-demo when slider scrolls into view
    let demoDone = false;
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !demoDone) {
        demoDone = true;
        let p = 50, dir = -1;
        const demo = setInterval(() => {
          p += dir * 1.2;
          const r = baWrap.getBoundingClientRect();
          setSlider(r.left + (p / 100) * r.width);
          if (p <= 20) dir = 1;
          if (p >= 50 && dir === 1) clearInterval(demo);
        }, 16);
      }
    }, { threshold: 0.5 }).observe(baWrap);
  }

  // ═══════════════════════════════════════
  // 10. TESTIMONIALS CAROUSEL
  // ═══════════════════════════════════════
  const track = document.getElementById('carouselTrack');

  if (track) {
    const slides      = track.querySelectorAll('.test-slide');
    const prevBtn     = document.getElementById('prevBtn');
    const nextBtn     = document.getElementById('nextBtn');
    const dotsWrap    = document.getElementById('navDots');
    const progressBar = document.getElementById('progressBar');
    const autoplayBtn = document.getElementById('autoplayBtn');
    const autoLabel   = document.getElementById('autoplayLabel');
    const totalEl     = document.getElementById('totalSlides');

    const TOTAL    = slides.length;
    const INTERVAL = 4500;
    let current    = 0;
    let autoTimer  = null;
    let isPlaying  = true;

    if (totalEl) totalEl.textContent = TOTAL;

    // build dots
    const dots = [];
    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement('button');
      d.className = 'nav-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); if (isPlaying) resetAuto(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    }

    function goTo(n) {
      current = (n + TOTAL) % TOTAL;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      if (progressBar) progressBar.style.width = ((current + 1) / TOTAL * 100) + '%';
      const mainCounter = document.getElementById('currentSlide');
      if (mainCounter) mainCounter.textContent = current + 1;
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      autoTimer = setInterval(next, INTERVAL);
      isPlaying = true;
      if (autoplayBtn) { autoplayBtn.classList.add('playing'); }
      if (autoLabel)   { autoLabel.textContent = 'Auto'; }
    }
    function stopAuto() {
      clearInterval(autoTimer);
      isPlaying = false;
      if (autoplayBtn) { autoplayBtn.classList.remove('playing'); }
      if (autoLabel)   { autoLabel.textContent = 'Paused'; }
    }
    function resetAuto() { stopAuto(); startAuto(); }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); if (isPlaying) resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); if (isPlaying) resetAuto(); });
    if (autoplayBtn) autoplayBtn.addEventListener('click', () => { isPlaying ? stopAuto() : startAuto(); });

    // touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); if (isPlaying) resetAuto(); }
    });

    // keyboard — scoped to only fire when carousel is in view
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { next(); if (isPlaying) resetAuto(); }
      if (e.key === 'ArrowLeft')  { prev(); if (isPlaying) resetAuto(); }
    });

    // pause on hover
    track.addEventListener('mouseenter', () => { if (isPlaying) clearInterval(autoTimer); });
    track.addEventListener('mouseleave', () => {
      if (isPlaying) { clearInterval(autoTimer); autoTimer = setInterval(next, INTERVAL); }
    });

    goTo(0);
    startAuto();
  }

  // ═══════════════════════════════════════
  // 11. CONTACT FORM
  // ═══════════════════════════════════════
  const form = document.getElementById('contactForm');

  if (form) {
    const submitBtn      = document.getElementById('submitBtn');
    const successOverlay = document.getElementById('successOverlay');
    const errorOverlay   = document.getElementById('errorOverlay');
    const errorMsg       = document.getElementById('errorMsg');
    const msgEl          = document.getElementById('fmsg');
    const countEl        = document.getElementById('charCount');

    // char counter
    if (msgEl && countEl) {
      msgEl.addEventListener('input', () => {
        countEl.textContent = msgEl.value.length;
        countEl.style.color = msgEl.value.length > 900 ? '#f59e0b' : '';
      });
    }

    // form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const type    = form.projectType.value;
      const message = form.message.value.trim();

      if (!name || !email || !type || !message) { shakeForm(); return; }
      if (!email.includes('@'))                  { shakeForm(); return; }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Sending...';

      try {
        const res  = await fetch('/api/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            name, email,
            projectType: form.projectType.value,
            budget:      form.budget.value || 'Not specified',
            message
          })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          successOverlay.classList.add('active');
        } else {
          throw new Error(data.error || 'Server error');
        }
      } catch (err) {
        errorMsg.textContent = err.message.includes('fetch')
          ? 'Could not reach the server. Please email boluwatifeafolayan82@gmail.com directly.'
          : err.message;
        errorOverlay.classList.add('active');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <span class="btn-icon">→</span>';
      }
    });

    // reset / retry
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      successOverlay.classList.remove('active');
      form.reset();
      if (countEl) countEl.textContent = '0';
    });
    document.getElementById('retryBtn')?.addEventListener('click', () => {
      errorOverlay.classList.remove('active');
    });

    // shake animation
    function shakeForm() {
      const wrap = document.querySelector('.contact-form-wrap');
      if (!wrap) return;
      wrap.style.animation = 'none';
      wrap.offsetHeight;
      wrap.style.animation = 'shake 0.4s ease';
    }

    // inject shake keyframes once
    if (!document.getElementById('shakeStyle')) {
      const s = document.createElement('style');
      s.id = 'shakeStyle';
      s.textContent = `
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }`;
      document.head.appendChild(s);
    }
  }

  // Video hover effect for before/after slider
document.querySelectorAll('.ba-before, .ba-after,.proj-mockup').forEach(side => {
  const video = side.querySelector('.proj-video');
  const thumb = side.querySelector('.proj-thumb');
  const hint  = side.querySelector('.proj-hint');

  if (!video) return;

  side.addEventListener('mouseenter', () => {
    video.play();
    video.style.opacity = '1';
    thumb.style.opacity = '0';
    if (hint) hint.style.opacity = '0';
  });

  side.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime   = 0;
    video.style.opacity = '0';
    thumb.style.opacity = '1';
    if (hint) hint.style.opacity = '1';
  });
});

}); // ← end DOMContentLoaded — everything lives inside here