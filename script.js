/* ════════════════════════════════
   HOMEPAGE SCRIPTS (index.html)
════════════════════════════════ */

if (document.getElementById('navbar')) {

  /* ── Navbar scroll shadow ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── Hamburger / mobile menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', true);
    });
  });

  /* ── Dropdown keyboard support ── */
  document.querySelectorAll('.nav-drop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Escape') btn.setAttribute('aria-expanded', false);
    });
  });

  /* ── Animated counter for total donations ── */
  function animateCount(el, target, duration = 1800) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); return; }
      el.textContent = Math.floor(start).toLocaleString();
    }, 16);
  }

  const totalEl = document.getElementById('totalNum');
  if (totalEl) {
    const target = parseInt(totalEl.textContent.replace(/,/g, ''));
    totalEl.textContent = '0';
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCount(totalEl, target); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(totalEl);
  }

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.who-card, .service-card, .sidebar-card, .report-card');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    revealObs.observe(el);
  });

} // end homepage guard


/* ════════════════════════════════
   DONATION FORM SCRIPTS (DonationForms.html)
════════════════════════════════ */

if (document.querySelector('.donate-card')) {

  /* ── Preset amounts ── */
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.classList.remove('active');
        b.removeAttribute('aria-pressed');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      document.getElementById('amount').value = btn.dataset.amount;
    });
  });

  /* Typing in amount deselects presets */
  const amountField = document.getElementById('amount');
  if (amountField) {
    amountField.addEventListener('input', function () {
      const val = parseInt(this.value);
      document.querySelectorAll('.preset-btn').forEach(btn => {
        const isMatch = parseInt(btn.dataset.amount) === val;
        btn.classList.toggle('active', isMatch);
        if (isMatch) btn.setAttribute('aria-pressed', 'true');
        else btn.removeAttribute('aria-pressed');
      });
    });
  }

  /* ── Payment method selection ── */
  window.selectPayment = function(btn) {
    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  };

  /* ── Yes/No toggles ── */
  window.handleToggle = function(btn) {
    const group = btn.closest('.toggle-group');
    group.querySelectorAll('.toggle-btn').forEach(b => {
      b.classList.remove('active');
      b.removeAttribute('aria-pressed');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const targetId = btn.dataset.target;
    const isYes = btn.dataset.val === 'yes';
    const field = document.getElementById(targetId);
    if (field) field.classList.toggle('visible', isYes);
  };

  /* ── Anonymous toggle ── */
  window.handleAnonymous = function(btn) {
    const group = btn.closest('.toggle-group');
    group.querySelectorAll('.toggle-btn').forEach(b => {
      b.classList.remove('active');
      b.removeAttribute('aria-pressed');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const isAnon = btn.dataset.val === 'yes';
    const nameRow = document.querySelector('.row-2');
    if (nameRow) {
      nameRow.style.opacity = isAnon ? '0.4' : '1';
      nameRow.querySelectorAll('input').forEach(i => i.disabled = isAnon);
    }
  };

  /* ── Mobile number: digits only ── */
  const mobileInput = document.getElementById('mobile');
  if (mobileInput) {
    mobileInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  /* ── Format peso ── */
  function formatPeso(val) {
    return '₱' + parseFloat(val).toLocaleString('en-PH', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ── Continue / validation ── */
  window.handleContinue = function() {
    const amountInput = document.getElementById('amount');
    const emailInput  = document.getElementById('email');
    const firstInput  = document.getElementById('firstName');
    const lastInput   = document.getElementById('lastName');
    const type        = document.getElementById('donationType').value;
    const paymentBtn  = document.querySelector('.payment-btn.active');
    let valid = true;

    [amountInput, emailInput, firstInput, lastInput].forEach(el => {
      if (el) el.style.borderColor = '';
    });

    if (!amountInput.value || parseFloat(amountInput.value) < 50) {
      amountInput.style.borderColor = '#e24b4a';
      amountInput.focus();
      valid = false;
    }
    if (firstInput && !firstInput.disabled && !firstInput.value.trim()) {
      firstInput.style.borderColor = '#e24b4a';
      if (valid) firstInput.focus();
      valid = false;
    }
    if (lastInput && !lastInput.disabled && !lastInput.value.trim()) {
      lastInput.style.borderColor = '#e24b4a';
      if (valid) lastInput.focus();
      valid = false;
    }
    if (!emailInput.value || !isValidEmail(emailInput.value)) {
      emailInput.style.borderColor = '#e24b4a';
      if (valid) emailInput.focus();
      valid = false;
    }
    if (!valid) return;

    const method = paymentBtn ? paymentBtn.dataset.method : 'gcash';
    const labels = { gcash: 'GCash', maya: 'Maya', bank: 'Bank Transfer', card: 'Debit/Credit Card' };
    alert(
      'Magpapatuloy sa Hakbang 2: Iyong mga Detalye\n\n' +
      'Donasyon: ' + formatPeso(amountInput.value) + ' (' + type + ')\n' +
      'Paraan ng bayad: ' + (labels[method] || method)
    );
  };

} // end donate guard