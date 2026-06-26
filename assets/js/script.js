/* ============================================================
   LUMIÈRE ESTÉTICA AVANÇADA — SCRIPT PRINCIPAL
   Módulos:
     1. Header scroll
     2. Menu mobile
     3. Smooth scroll + active link
     4. Reveal on scroll (IntersectionObserver)
     5. Contador animado (stats)
     6. Carrossel de depoimentos
     7. Formulário (máscara + validação + toast)
     8. Botão voltar ao topo
     9. Atualização automática do ano no rodapé
   ============================================================ */

(() => {
  'use strict';

  /* ===== Utilitários ===== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileNav();
    initSmoothScroll();
    initRevealOnScroll();
    initStatsCounter();
    initCarousel();
    initContactForm();
    initBackToTop();
    initFooterYear();
  });


  /* ============================================================
     1. HEADER — efeito glassmorphism ao rolar
     ============================================================ */
  function initHeaderScroll() {
    const header = $('#header');
    if (!header) return;

    const toggleScrolled = () => {
      header.classList.toggle('scrolled', window.scrollY > 80);
    };

    toggleScrolled();
    window.addEventListener('scroll', toggleScrolled, { passive: true });
  }


  /* ============================================================
     2. MENU MOBILE — toggle com overlay
     ============================================================ */
  function initMobileNav() {
    const toggle  = $('#navToggle');
    const close   = $('#navClose');
    const nav     = $('#nav');
    const overlay = $('#navOverlay');
    if (!toggle || !nav) return;

    const openNav = () => {
      nav.classList.add('open');
      overlay.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    };

    const closeNav = () => {
      nav.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('open') ? closeNav() : openNav();
    });
    close?.addEventListener('click', closeNav);
    overlay?.addEventListener('click', closeNav);

    // Fechar ao clicar em qualquer link do menu
    $$('.nav__link, .nav__cta', nav).forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Fechar com ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }


  /* ============================================================
     3. SMOOTH SCROLL + LINK ATIVO BASEADO NA SEÇÃO
     ============================================================ */
  function initSmoothScroll() {
    // Smooth scroll fallback (CSS já faz, mas garante para navegadores antigos)
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    // Destacar link da seção visível
    const sections = $$('section[id]');
    const navLinks = $$('.nav__link');
    if (!sections.length || !navLinks.length) return;

    const setActive = () => {
      const scrollY = window.scrollY + 120;
      let current = '';
      sections.forEach(sec => {
        if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
          current = sec.id;
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    };

    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }


  /* ============================================================
     4. REVEAL ON SCROLL (IntersectionObserver)
     ============================================================ */
  function initRevealOnScroll() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    items.forEach(el => io.observe(el));
  }


  /* ============================================================
     5. CONTADOR ANIMADO — stats da seção Sobre
     ============================================================ */
  function initStatsCounter() {
    const nums = $$('.stat__number[data-target]');
    if (!nums.length) return;

    const animate = el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const value = Math.floor(eased * target);

        // Formatação para milhares
        el.textContent = target >= 1000
          ? value.toLocaleString('pt-BR')
          : value;

        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target >= 1000 ? target.toLocaleString('pt-BR') : target;
      };

      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      nums.forEach(animate);
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach(el => io.observe(el));
  }


  /* ============================================================
     6. CARROSSEL DE DEPOIMENTOS — sem libs externas
     ============================================================ */
  function initCarousel() {
    const track = $('#carrosselTrack');
    const prev  = $('#carrosselPrev');
    const next  = $('#carrosselNext');
    const dotsC = $('#carrosselDots');
    const wrap  = $('#carrossel');
    if (!track || !prev || !next || !dotsC) return;

    const slides = $$('.depoimento', track);
    const total  = slides.length;
    let perView  = getPerView();
    let index    = 0;
    let autoTimer;

    function getPerView() {
      const w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    function maxIndex() { return Math.max(0, total - perView); }

    function render() {
      const slideW = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      track.style.transform = `translateX(-${index * (slideW + gap)}px)`;

      $$('.carrossel__dot', dotsC).forEach((d, i) => {
        d.classList.toggle('active', i === index);
        d.setAttribute('aria-selected', i === index);
      });
    }

    function buildDots() {
      dotsC.innerHTML = '';
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'carrossel__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
        dot.addEventListener('click', () => { index = i; render(); restartAuto(); });
        dotsC.appendChild(dot);
      }
    }

    function goNext() { index = index >= maxIndex() ? 0 : index + 1; render(); }
    function goPrev() { index = index <= 0 ? maxIndex() : index - 1; render(); }

    prev.addEventListener('click', () => { goPrev(); restartAuto(); });
    next.addEventListener('click', () => { goNext(); restartAuto(); });

    function startAuto() { autoTimer = setInterval(goNext, 5000); }
    function stopAuto()  { clearInterval(autoTimer); }
    function restartAuto() { stopAuto(); startAuto(); }

    // Pausa no hover
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);

    // Touch swipe (mobile)
    let startX = 0, dx = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchmove',  e => { dx = e.touches[0].clientX - startX; }, { passive: true });
    track.addEventListener('touchend',   () => {
      if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
      dx = 0;
      startAuto();
    });

    // Recalcula no resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        perView = getPerView();
        index = Math.min(index, maxIndex());
        buildDots();
        render();
      }, 150);
    });

    buildDots();
    render();
    startAuto();
  }


  /* ============================================================
     7. FORMULÁRIO — máscara, validação, toast
     ============================================================ */
  function initContactForm() {
    const form = $('#contatoForm');
    if (!form) return;

    const phone = $('#fTel');
    const toast = $('#toast');

    /* Máscara de telefone (00) 00000-0000 */
    phone?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      else if (v.length > 0) v = `(${v}`;
      e.target.value = v;
    });

    /* Helpers de validação */
    const setError = (field, msg) => {
      const wrap = field.closest('.form__field') || field.parentElement;
      wrap.classList.add('error');
      const err = wrap.querySelector('.form__error');
      if (err) err.textContent = msg;
    };
    const clearError = field => {
      const wrap = field.closest('.form__field') || field.parentElement;
      wrap.classList.remove('error');
      const err = wrap.querySelector('.form__error');
      if (err) err.textContent = '';
    };

    /* Limpa erro ao digitar */
    $$('input, select, textarea', form).forEach(el => {
      el.addEventListener('input', () => clearError(el));
    });

    /* Submissão */
    form.addEventListener('submit', e => {
      e.preventDefault();

      const nome   = $('#fNome');
      const email  = $('#fEmail');
      const tel    = $('#fTel');
      const lgpd   = $('#fLgpd');

      let valid = true;

      if (!nome.value.trim() || nome.value.trim().length < 3) {
        setError(nome, 'Informe seu nome completo.');
        valid = false;
      }

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) {
        setError(email, 'Informe um e-mail válido.');
        valid = false;
      }

      const telDigits = tel.value.replace(/\D/g, '');
      if (telDigits.length < 10) {
        setError(tel, 'Informe um WhatsApp válido.');
        valid = false;
      }

      if (!lgpd.checked) {
        setError(lgpd, 'Você precisa aceitar a política de privacidade.');
        valid = false;
      }

      if (!valid) {
        // Foca no primeiro campo com erro
        const firstErr = form.querySelector('.error input, .error select, .error textarea');
        firstErr?.focus();
        return;
      }

      /* SIMULAÇÃO DE ENVIO — Substituir por integração real (Formspree, EmailJS, fetch para backend) */
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

      setTimeout(() => {
        // Mostra toast
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);

        // Reset
        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;
      }, 1200);
    });
  }


  /* ============================================================
     8. BOTÃO VOLTAR AO TOPO
     ============================================================ */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    const toggleVisible = () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    };
    toggleVisible();
    window.addEventListener('scroll', toggleVisible, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ============================================================
     9. ANO DINÂMICO NO RODAPÉ
     ============================================================ */
  function initFooterYear() {
    const yEl = $('#year');
    if (yEl) yEl.textContent = new Date().getFullYear();
  }

})();
