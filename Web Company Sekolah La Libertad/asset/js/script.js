
'use strict';

/* ─────────────────────────────────────────
   NAVBAR — shrink on scroll & active link
   ───────────────────────────────────────── */
(function initNavbar() {
    const navbar  = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    const sections = [...navLinks]
        .map(a => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    function onScroll() {
        // Shrink effect
        if (window.scrollY > 60) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }

        // Active link highlight
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = '#' + section.id;
            }
        });

        navLinks.forEach(a => {
            a.classList.toggle('nav-link--active', a.getAttribute('href') === current);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
})();


const toggle = document.getElementById('menu-toggle');
const menu = document.querySelector('.nav-menu');

toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});
/* ─────────────────────────────────────────
   HERO — staggered entrance
   ───────────────────────────────────────── */
(function initHeroEntrance() {
    const items = document.querySelectorAll(
        '.hero-badge, .hero-title, .hero-subtitle, .hero-welcome-block, .hero-description, .hero-buttons'
    );

    items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
    });

    // Tiny delay so CSS transition actually fires
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            items.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        });
    });
})();


/* ─────────────────────────────────────────
   STATS — animated counter
   ───────────────────────────────────────── */
(function initCounters() {
    const statEls = document.querySelectorAll('.stat-number');
    let triggered = false;

    function parseTarget(text) {
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        const suffix = text.replace(/[0-9.\s]/g, ''); // e.g. "+", "%"
        return { num, suffix };
    }

    function animateCounter(el, target, suffix, duration = 1800) {
        const start = performance.now();
        const isFloat = target % 1 !== 0;

        function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = eased * target;
            el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function runCounters() {
        if (triggered) return;
        triggered = true;
        statEls.forEach(el => {
            const { num, suffix } = parseTarget(el.textContent.trim());
            animateCounter(el, num, suffix);
        });
    }

    // Trigger when stats section enters viewport
    const statsSection = document.querySelector('.stats');
    if (!statsSection) return;

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            runCounters();
            observer.disconnect();
        }
    }, { threshold: 0.4 });

    observer.observe(statsSection);
})();


/* ─────────────────────────────────────────
   SCROLL REVEAL — fade-in on viewport enter
   ───────────────────────────────────────── */
(function initScrollReveal() {
    const SELECTORS = [
        '.tentang-image',
        '.tentang-content',
        '.vmt-content',
        '.vmt-image',
        '.program-card',
        '.berita-featured',
        '.berita-card',
        '.ppdb-left',
        '.ppdb-form-card',
        '.section-label',
        '.stat',
        '.feature-item',
        '.vmt-list li',
        '.ppdb-wave',
        '.footer-brand',
        '.footer-column',
    ];

    const elements = document.querySelectorAll(SELECTORS.join(', '));

    elements.forEach((el, i) => {
        el.dataset.revealIndex = i;
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
        el.style.willChange = 'opacity, transform';
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // Stagger siblings in the same parent
                const siblings = [...el.parentElement.children].filter(
                    c => c.style.opacity === '0'
                );
                const delay = siblings.indexOf(el) * 0.08;
                el.style.transitionDelay = `${delay}s`;
                el.style.opacity  = '1';
                el.style.transform = 'translateY(0)';
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────
   PARALLAX — hero background on scroll
   ───────────────────────────────────────── */
(function initParallax() {
    const heroBg = document.querySelector('.hero-background img');
    if (!heroBg) return;

    function onScroll() {
        const scrolled = window.scrollY;
        // Move background up at half the scroll speed
        heroBg.style.transform = `translateY(${scrolled * 0.35}px)`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─────────────────────────────────────────
   PROGRAM CARDS — subtle 3D tilt on hover
   ───────────────────────────────────────── */
(function initCardTilt() {
    const cards = document.querySelectorAll('.program-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect   = card.getBoundingClientRect();
            const x      = e.clientX - rect.left;
            const y      = e.clientY - rect.top;
            const cx     = rect.width  / 2;
            const cy     = rect.height / 2;
            const rotateX = ((y - cy) / cy) * -6; // max ±6deg
            const rotateY = ((x - cx) / cx) *  6;

            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0,0,0,0.25)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // instant follow during hover
        });
    });
})();


/* ─────────────────────────────────────────
   PPDB FORM — WhatsApp submission (ENHANCED)
   ───────────────────────────────────────── */
(function initPPDBForm() {
    const form     = document.querySelector('.ppdb-form');
    const btn      = document.querySelector('.btn-submit');
    const inputs   = document.querySelectorAll('.form-group input, .form-group select');
    const namaEl   = document.querySelector('input[placeholder*="Nama"]');
    const hpEl     = document.querySelector('input[placeholder*="+62"]');
    const jurusanEl= document.querySelector('select');

    if (!btn) return;

    // ── Validasi real-time ──
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            updateButtonState();
        });

        input.addEventListener('blur', () => {
            validateInput(input);
        });

        input.addEventListener('focus', () => {
            input.parentElement.classList.remove('form-group--error');
        });
    });

    function validateInput(input) {
        const parent = input.parentElement;
        let isValid = true;

        if (input === namaEl) {
            isValid = input.value.trim().length >= 3;
        } else if (input === hpEl) {
            isValid = /^(\+62|62|0)[0-9]{9,12}$/.test(input.value.replace(/[-\s]/g, ''));
        } else if (input === jurusanEl) {
            isValid = input.value !== '';
        }

        if (input.value.trim() === '') {
            parent.classList.remove('form-group--error');
            parent.classList.remove('form-group--success');
        } else if (isValid) {
            parent.classList.remove('form-group--error');
            parent.classList.add('form-group--success');
        } else {
            parent.classList.add('form-group--error');
            parent.classList.remove('form-group--success');
        }

        return isValid;
    }

    function updateButtonState() {
        const namaValid = namaEl.value.trim().length >= 3;
        const hpValid = /^(\+62|62|0)[0-9]{9,12}$/.test(hpEl.value.replace(/[-\s]/g, ''));
        const jurusanValid = jurusanEl.value !== '';

        if (namaValid && hpValid && jurusanValid) {
            btn.classList.add('btn-submit--active');
            btn.disabled = false;
        } else {
            btn.classList.remove('btn-submit--active');
            btn.disabled = true;
        }
    }

    // ── Submit handler ──
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const nama    = namaEl?.value.trim();
        const hp      = hpEl?.value.trim();
        const jurusan = jurusanEl?.value;

        // Tampilkan loading state
        showLoadingState();

        setTimeout(() => {
            // DUMMY MODE — tampilkan notifikasi sukses
            showSuccessToast(nama);

            // Reset form
            form.reset();
            updateButtonState();
            clearValidationStates();

        }, 1200);
    });

    function clearValidationStates() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('form-group--error', 'form-group--success');
        });
    }

    function showLoadingState() {
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.classList.add('btn-submit--loading');
        btn.innerHTML = '<span class="btn-loader"></span>Mengirim...';

        setTimeout(() => {
            btn.classList.remove('btn-submit--loading');
            btn.textContent = originalText;
            btn.disabled = false;
            updateButtonState();
        }, 1200);
    }

    function showSuccessToast(nama) {
        const existing = document.getElementById('ppdb-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'ppdb-toast';
        toast.innerHTML = `
            <div class="toast-body">
                <strong>Permintaan Terikirim!</strong>
                <span>Terima kasih, ${nama}. Tim kami akan menghubungi kamu segera.</span>
            </div>
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('toast--show'));
        });

        setTimeout(() => {
            toast.classList.remove('toast--show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 4000);
    }

    function shakeForm() {
        const card = document.querySelector('.ppdb-form-card');
        card.classList.add('form--shake');
        card.addEventListener('animationend', () => card.classList.remove('form--shake'), { once: true });
    }

    function showFormError(msg) {
        let err = document.querySelector('.form-error');
        if (!err) {
            err = document.createElement('p');
            err.className = 'form-error';
            err.style.cssText = 'color:#e74c3c; font-size:13px; margin-top:-10px; text-align:center; animation: slideDown 0.3s ease;';
            btn.insertAdjacentElement('beforebegin', err);
        }
        err.textContent = msg;
        setTimeout(() => err.remove(), 4000);
    }

    // Initialize button state
    updateButtonState();
})();


/* ─────────────────────────────────────────
   SMOOTH SCROLL — all internal anchor links
   ───────────────────────────────────────── */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navHeight = document.querySelector('.navbar')?.offsetHeight ?? 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();


/* ─────────────────────────────────────────
   CSS INJECTIONS — styles needed by JS
   ───────────────────────────────────────── */
(function injectDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Navbar scrolled state */
        .navbar {
            transition: padding 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .navbar--scrolled {
            padding: 6px 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            background-color: rgba(22, 28, 31, 0.97);
        }

        /* Active nav link */
        .nav-link--active {
            color: var(--color-cta) !important;
        }

        /* Form shake animation */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%       { transform: translateX(-8px); }
            40%       { transform: translateX(8px); }
            60%       { transform: translateX(-5px); }
            80%       { transform: translateX(5px); }
        }
        .form--shake {
            animation: shake 0.45s ease;
        }

        /* Smooth transition for program cards leaving hover */
        .program-card {
            transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        /* ── Success Toast ── */
        #ppdb-toast {
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            background: #ffffff;
            color: #1c282e;
            padding: 18px 22px;
            border-radius: 14px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.18), 0 0 0 3px rgba(54, 255, 94, 0.22);
            max-width: 340px;
            opacity: 0;
            transform: translateY(20px) scale(0.96);
            transition: opacity 0.35s ease, transform 0.35s ease;
            pointer-events: none;
        }
        #ppdb-toast.toast--show {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }
        #ppdb-toast .toast-body {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        #ppdb-toast .toast-body strong {
            font-size: 15px;
            font-weight: 700;
            color: #1c282e;
        }
        #ppdb-toast .toast-body span {
            font-size: 13px;
            color: #555;
            line-height: 1.5;
        }
        @media (max-width: 480px) {
            #ppdb-toast {
                bottom: 16px;
                right: 16px;
                left: 16px;
                max-width: unset;
            }
        }
    `;
    document.head.appendChild(style);
})();

/* FAQ Toggle */
function toggleFaq(el) {
    const item = el.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

 /* Form Submit – kirim via WhatsApp */
// document.getElementById('kontakForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//     const nama     = document.getElementById('nama').value.trim();
//     const telepon  = document.getElementById('telepon').value.trim();
//     const email    = document.getElementById('email').value.trim();
//     const keperluan = document.getElementById('keperluan').value;
//     const pesan    = document.getElementById('pesan').value.trim();

//     const text = `Halo SMK La Libertad,%0A%0ANama: ${nama}%0ATelepon: ${telepon}%0AEmail: ${email}%0AKeperluan: ${keperluan}%0APesan:%0A${pesan}`;
        
// });

/* ─────────────────────────────────────────
   KONTAK FORM — Dummy submit (toast style)
   ───────────────────────────────────────── */
(function initKontakForm() {
    const form      = document.querySelector('#kontakForm');
    const btn       = document.querySelector('.btn-kontak-submit');
    const inputs    = document.querySelectorAll('#kontakForm input, #kontakForm textarea, #kontakForm select');

    const namaEl    = document.getElementById('nama');
    const hpEl      = document.getElementById('telepon');
    const emailEl   = document.getElementById('email');
    const pesanEl   = document.getElementById('pesan');

    if (!form || !btn) return;

    // ── Validasi real-time ──
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            updateButtonState();
        });

        input.addEventListener('blur', () => validateInput(input));

        input.addEventListener('focus', () => {
            input.parentElement.classList.remove('form-group--error');
        });
    });

    function validateInput(input) {
        const parent = input.parentElement;
        let isValid = true;

        if (input === namaEl) {
            isValid = input.value.trim().length >= 3;
        } else if (input === hpEl) {
            if (input.value.trim() === '') return true; // optional
            isValid = /^(\+62|62|0)[0-9]{9,12}$/.test(input.value.replace(/[-\s]/g, ''));
        } else if (input === emailEl) {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        } else if (input === pesanEl) {
            isValid = input.value.trim().length >= 10;
        }

        if (input.value.trim() === '') {
            parent.classList.remove('form-group--error', 'form-group--success');
        } else if (isValid) {
            parent.classList.add('form-group--success');
            parent.classList.remove('form-group--error');
        } else {
            parent.classList.add('form-group--error');
            parent.classList.remove('form-group--success');
        }

        return isValid;
    }

    function updateButtonState() {
        const namaValid  = namaEl.value.trim().length >= 3;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value);
        const pesanValid = pesanEl.value.trim().length >= 10;

        if (namaValid && emailValid && pesanValid) {
            btn.classList.add('btn-submit--active');
            btn.disabled = false;
        } else {
            btn.classList.remove('btn-submit--active');
            btn.disabled = true;
        }
    }

    // ── Submit handler ──
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nama = namaEl.value.trim();

        showLoadingState();

        setTimeout(() => {
            showSuccessToast(nama);

            form.reset();
            updateButtonState();
            clearValidationStates();
        }, 1200);
    });

    function clearValidationStates() {
        document.querySelectorAll('#kontakForm .form-group').forEach(g => {
            g.classList.remove('form-group--error', 'form-group--success');
        });
    }

    function showLoadingState() {
        const original = btn.textContent;

        btn.disabled = true;
        btn.classList.add('btn-submit--loading');
        btn.innerHTML = '<span class="btn-loader"></span>Mengirim...';

        setTimeout(() => {
            btn.classList.remove('btn-submit--loading');
            btn.textContent = original;
            btn.disabled = false;
            updateButtonState();
        }, 1200);
    }

    function showSuccessToast(nama) {
        const existing = document.getElementById('kontak-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'kontak-toast';
        toast.innerHTML = `
            <div class="toast-body">
                <strong>Pesan Terkirim!</strong>
                <span>Makasih, ${nama}. Tim sekolah bakal respon secepatnya.</span>
            </div>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('toast--show'));
        });

        setTimeout(() => {
            toast.classList.remove('toast--show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 4000);
    }

    updateButtonState();
})();