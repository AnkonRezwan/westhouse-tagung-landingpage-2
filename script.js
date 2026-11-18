(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var logic = window.WesthouseInquiry;

  /* 1. Sticky / Transparent-to-White header */
  var header = doc.getElementById('site-header');
  if (header) {
    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* 2. Mobile navigation */
  var nav = doc.getElementById('primary-nav');
  var navToggle = doc.getElementById('nav-toggle');
  if (nav && navToggle) {
    var closeNav = function (returnFocus) {
      if (navToggle.getAttribute('aria-expanded') !== 'true') return;
      nav.classList.remove('is-open');
      if (header) header.classList.remove('is-menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
      if (returnFocus) navToggle.focus();
    };

    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      if (header) header.classList.toggle('is-menu-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav(false);
    });

    doc.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') closeNav(true);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeNav(false);
    });
  }

  /* 3. Hero Mini Carousel */
  var carouselApi = window.WesthouseHeroCarousel;
  var heroCarousel = doc.getElementById('hero-carousel');
  var heroPrev = doc.getElementById('hero-carousel-prev');
  var heroNext = doc.getElementById('hero-carousel-next');
  var heroLink = doc.getElementById('hero-carousel-link');
  var heroImg = doc.getElementById('hero-carousel-img');
  var heroTitle = doc.getElementById('hero-carousel-title');
  var heroCounter = doc.getElementById('hero-carousel-counter');
  var heroSubtitle = doc.getElementById('hero-carousel-subtitle');
  var heroMeta = doc.getElementById('hero-carousel-meta');

  if (carouselApi && heroCarousel && heroPrev && heroNext && heroLink) {
    var heroSlides = carouselApi.DEFAULT_SLIDES;
    var heroIndex = 0;

    var renderHeroSlide = function (nextIndex) {
      heroIndex = carouselApi.wrapIndex(nextIndex, heroSlides.length);
      var slide = heroSlides[heroIndex];
      if (!slide) return;

      if (heroImg) {
        heroImg.src = slide.image;
        heroImg.alt = slide.imageAlt;
      }
      if (heroTitle) heroTitle.textContent = slide.title;
      if (heroSubtitle) heroSubtitle.textContent = slide.subtitle;
      if (heroMeta) heroMeta.textContent = slide.meta;
      if (heroCounter) {
        heroCounter.textContent = carouselApi.formatCounter(heroIndex, heroSlides.length);
      }

      heroLink.setAttribute('href', slide.href);
    };

    renderHeroSlide(0);

    heroPrev.addEventListener('click', function () {
      renderHeroSlide(carouselApi.stepSlide(heroIndex, -1, heroSlides.length));
    });

    heroNext.addEventListener('click', function () {
      renderHeroSlide(carouselApi.stepSlide(heroIndex, 1, heroSlides.length));
    });

    heroCarousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        renderHeroSlide(carouselApi.stepSlide(heroIndex, -1, heroSlides.length));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        renderHeroSlide(carouselApi.stepSlide(heroIndex, 1, heroSlides.length));
      }
    });
  }

  /* 3c. Hotel Image Carousel */
  var hotelCarousel = doc.getElementById('hotel-carousel');
  var hotelPrevBtn = doc.getElementById('hotel-carousel-prev');
  var hotelNextBtn = doc.getElementById('hotel-carousel-next');
  var hotelProgressBar = doc.getElementById('hotel-carousel-progress');

  if (hotelCarousel && hotelPrevBtn && hotelNextBtn) {
    var hotelSlides = Array.prototype.slice.call(hotelCarousel.querySelectorAll('.hotel__slide'));
    var hotelIndex = 0;
    var HOTEL_DURATION_MS = 5000;
    var hotelElapsedMs = 0;
    var hotelLastTick = 0;
    var hotelPaused = false;
    var hotelRafId = null;
    var hotelMotionQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    var hotelCanAuto = !(hotelMotionQuery && hotelMotionQuery.matches);

    var renderHotelProgress = function (ratio) {
      if (!hotelProgressBar) return;
      var clamped = Math.max(0, Math.min(1, ratio));
      hotelProgressBar.style.transform = 'scaleX(' + clamped.toFixed(4) + ')';
    };

    var showHotelSlide = function (nextIndex) {
      if (!hotelSlides.length) return;
      hotelIndex = (nextIndex + hotelSlides.length) % hotelSlides.length;
      hotelSlides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === hotelIndex);
      });
    };

    var resetHotelTimer = function () {
      hotelElapsedMs = 0;
      hotelLastTick = window.performance ? window.performance.now() : Date.now();
      renderHotelProgress(0);
    };

    var tickHotelAuto = function (now) {
      if (!hotelCanAuto) return;
      if (!hotelPaused && !doc.hidden) {
        var delta = now - hotelLastTick;
        hotelLastTick = now;
        if (delta > 0 && delta < HOTEL_DURATION_MS) {
          hotelElapsedMs += delta;
        }
        if (hotelElapsedMs >= HOTEL_DURATION_MS) {
          hotelElapsedMs = 0;
          showHotelSlide(hotelIndex + 1);
        }
        renderHotelProgress(hotelElapsedMs / HOTEL_DURATION_MS);
      } else {
        hotelLastTick = now;
      }
      hotelRafId = window.requestAnimationFrame(tickHotelAuto);
    };

    var pauseHotelAuto = function () {
      hotelPaused = true;
    };

    var resumeHotelAuto = function () {
      hotelPaused = false;
      hotelLastTick = window.performance ? window.performance.now() : Date.now();
    };

    hotelPrevBtn.addEventListener('click', function () {
      showHotelSlide(hotelIndex - 1);
      resetHotelTimer();
    });

    hotelNextBtn.addEventListener('click', function () {
      showHotelSlide(hotelIndex + 1);
      resetHotelTimer();
    });

    hotelCarousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showHotelSlide(hotelIndex - 1);
        resetHotelTimer();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showHotelSlide(hotelIndex + 1);
        resetHotelTimer();
      }
    });

    hotelCarousel.addEventListener('mouseenter', pauseHotelAuto);
    hotelCarousel.addEventListener('mouseleave', resumeHotelAuto);
    hotelCarousel.addEventListener('focusin', pauseHotelAuto);
    hotelCarousel.addEventListener('focusout', function (e) {
      if (!hotelCarousel.contains(e.relatedTarget)) resumeHotelAuto();
    });

    doc.addEventListener('visibilitychange', function () {
      hotelLastTick = window.performance ? window.performance.now() : Date.now();
    });

    if (hotelCanAuto && window.requestAnimationFrame) {
      resetHotelTimer();
      hotelRafId = window.requestAnimationFrame(tickHotelAuto);
    }
  }

  /* 5. Accessible FAQ Accordion */
  var faqButtons = Array.prototype.slice.call(doc.querySelectorAll('.faq-trigger'));
  if (faqButtons.length) {
    faqButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        if (!item) return;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        item.classList.toggle('is-open', !expanded);
      });
    });
  }

  /* 6. Footer year */
  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* 7. Inquiry Form Validation & Deduplicated Lead Tracking */
  var form = doc.getElementById('anfrage-form');
  if (!form || !logic) return;

  var statusBox = doc.getElementById('form-status');
  var recipient = 'info@westhouse-augsburg.de';
  var deduplicator = logic.createLeadDeduplicator();
  window.dataLayer = window.dataLayer || [];

  var fields = {
    name: doc.getElementById('f-name'),
    company: doc.getElementById('f-company'),
    email: doc.getElementById('f-email'),
    phone: doc.getElementById('f-phone'),
    date: doc.getElementById('f-date'),
    attendees: doc.getElementById('f-attendees'),
    type: doc.getElementById('f-type'),
    notes: doc.getElementById('f-notes'),
    privacy: doc.getElementById('f-privacy')
  };

  var fieldWrap = function (input) {
    return input ? input.closest('.field') : null;
  };

  var setError = function (input, message) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    var error = wrap.querySelector('.field__error');
    if (error) error.textContent = message;
  };

  var clearError = function (input) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    var error = wrap.querySelector('.field__error');
    if (error) error.textContent = '';
  };

  var readPayload = function () {
    var checked = Array.prototype.slice
      .call(form.querySelectorAll('fieldset input[type="checkbox"]:checked'))
      .map(function (input) {
        return input.value;
      });

    return {
      name: fields.name ? fields.name.value : '',
      company: fields.company ? fields.company.value : '',
      email: fields.email ? fields.email.value : '',
      phone: fields.phone ? fields.phone.value : '',
      date: fields.date ? fields.date.value : '',
      attendees: fields.attendees ? fields.attendees.value : '',
      type: fields.type ? fields.type.value : '',
      extras: checked,
      notes: fields.notes ? fields.notes.value : '',
      privacy: fields.privacy ? fields.privacy.checked : false
    };
  };

  var validateSingle = function (key) {
    var input = fields[key];
    if (!input) return true;
    var msg = logic.validateField(key, input.value || '', Boolean(input.checked));
    if (msg) {
      setError(input, msg);
      return false;
    }
    clearError(input);
    return true;
  };

  var liveKeys = ['name', 'company', 'email', 'phone', 'date', 'attendees', 'type', 'privacy'];
  liveKeys.forEach(function (key) {
    var input = fields[key];
    if (!input) return;

    input.addEventListener('blur', function () {
      validateSingle(key);
    });

    input.addEventListener('input', function () {
      var wrap = fieldWrap(input);
      if (wrap && wrap.classList.contains('has-error')) {
        validateSingle(key);
      }
    });

    if (key === 'type' || key === 'privacy') {
      input.addEventListener('change', function () {
        validateSingle(key);
      });
    }
  });

  var submitBtn = form.querySelector('button[type="submit"]');
  var isSubmitting = false;

  var renderStatus = function (options) {
    if (!statusBox) return;
    statusBox.textContent = '';
    statusBox.classList.toggle('form-status--error', Boolean(options.isError));

    var heading = doc.createElement('strong');
    heading.textContent = options.heading;
    statusBox.appendChild(heading);

    if (options.detail) {
      var detail = doc.createElement('span');
      detail.textContent = ' ' + options.detail;
      statusBox.appendChild(detail);
    }

    if (options.mail) {
      var intro = doc.createElement('span');
      intro.textContent = ' Direkter Versand über ';
      var mailLink = doc.createElement('a');
      mailLink.href = options.mail.href;
      mailLink.textContent = recipient;

      var actions = doc.createElement('div');
      actions.className = 'form-status__actions';

      var copyBtn = doc.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'form-status__copy';
      copyBtn.textContent = 'Angaben kopieren';
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(options.mail.body).then(function () {
            copyBtn.textContent = 'Kopiert';
          });
        }
      });

      actions.appendChild(copyBtn);
      statusBox.appendChild(intro);
      statusBox.appendChild(mailLink);
      statusBox.appendChild(doc.createTextNode('.'));
      statusBox.appendChild(actions);
    }

    statusBox.hidden = false;
    statusBox.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest'
    });
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isSubmitting) return;

    var payload = logic.normalizeInquiryPayload(readPayload());
    var validation = logic.validateInquiry(payload);

    liveKeys.forEach(function (key) {
      var input = fields[key];
      if (!input) return;
      if (validation.errors[key]) {
        setError(input, validation.errors[key]);
      } else {
        clearError(input);
      }
    });

    if (!validation.valid) {
      if (statusBox) statusBox.hidden = true;
      var firstErrorKey = liveKeys.find(function (key) {
        return Boolean(validation.errors[key]);
      });
      var firstInvalid = firstErrorKey ? fields[firstErrorKey] : null;
      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      }
      return;
    }

    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;

    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok || !result.data || !result.data.ok) {
          if (result.data && result.data.errors) {
            liveKeys.forEach(function (key) {
              var input = fields[key];
              if (!input) return;
              if (result.data.errors[key]) {
                setError(input, result.data.errors[key]);
              }
            });
          }
          renderStatus({
            isError: true,
            heading: 'Anfrage konnte nicht gesendet werden.',
            detail:
              (result.data && result.data.message) ||
              'Bitte prüfen Sie Ihre Angaben oder kontaktieren Sie uns telefonisch.',
            mail: logic.buildMailtoUrl(recipient, payload)
          });
          return;
        }

        var leadResult = deduplicator.recordOnce(payload, function (eventObj) {
          window.dataLayer.push(eventObj);
        });
        var refText = result.data.referenceId ? ' (Referenz: ' + result.data.referenceId + ')' : '';

        if (result.data.deliveryStatus === 'forwarded') {
          renderStatus({
            isError: false,
            heading: leadResult.recorded
              ? 'Vielen Dank – Ihre Tagungsanfrage wurde übermittelt' + refText + '.'
              : 'Ihre Tagungsanfrage liegt bereits vor' + refText + '.',
            detail: 'Unser Veranstaltungsteam meldet sich kurzfristig mit einem passenden Angebot bei Ihnen.'
          });
        } else {
          renderStatus({
            isError: false,
            heading: leadResult.recorded
              ? 'Vielen Dank – Ihre Tagungsanfrage ist vorgemerkt' + refText + '.'
              : 'Ihre Angaben sind unverändert vorgemerkt' + refText + '.',
            detail:
              'Die automatische CRM-Anbindung befindet sich noch in Abstimmung.',
            mail: logic.buildMailtoUrl(recipient, payload)
          });
        }
      })
      .catch(function () {
        renderStatus({
          isError: true,
          heading: 'Verbindungsfehler beim Senden.',
          detail: 'Bitte versuchen Sie es erneut oder nutzen Sie den direkten E-Mail-Versand.',
          mail: logic.buildMailtoUrl(recipient, payload)
        });
      })
      .finally(function () {
        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
      });
  });

  /* 8. Natural Scroll Reveal, Metric Count-Up & Subtle Hero Depth */
  var motionApi = window.WesthouseMotion;
  var revealEnabled = doc.documentElement.classList.contains('reveal-ready') && !reduceMotion;

  var animateMetricValue = function (el) {
    if (!motionApi || el.dataset.counted === 'true') return;
    var parsed = motionApi.parseMetricText(el.textContent || '');
    if (!parsed || parsed.target <= 0) return;
    el.dataset.counted = 'true';

    var duration = 850;
    var start = window.performance ? window.performance.now() : Date.now();
    var step = function (now) {
      var progress = Math.min((now - start) / duration, 1);
      el.textContent = motionApi.interpolateMetric(parsed, progress);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = motionApi.interpolateMetric(parsed, 1);
      }
    };
    window.requestAnimationFrame(step);
  };

  if (revealEnabled) {
    var singleRevealSelectors = [
      '.rooms__intro-lead',
      '.rooms__intro-copy',
      '.rooms__subblock-copy',
      '.metrics-band__head',
      '.room-showcase__head',
      '.capacity-split__copy',
      '.table-wrap',
      '.hotel__content',
      '.packages .section-head',
      '.references__card',
      '.arrival__content',
      '.faq__intro',
      '.inquiry__intro',
      '.inquiry__card'
    ];

    var imageRevealSelectors = [
      '.rooms__media-aside',
      '.rooms__subblock-media',
      '.hotel__gallery',
      '.brochure-banner',
      '.arrival__card'
    ];

    var staggerGroupSelectors = [
      '.stat-grid > .stat-tile',
      '.room-cards > .room-card',
      '.package-grid > .package-card',
      '.clients-band__logos > li',
      '.arrival__row',
      '.faq-list > .faq-item'
    ];

    var tagged = [];
    var markReveal = function (el, kind, delayMs) {
      if (!el || el.hasAttribute('data-reveal')) return;
      el.setAttribute('data-reveal', kind || 'up');
      if (delayMs > 0) {
        el.style.setProperty('--reveal-delay', delayMs + 'ms');
      }
      tagged.push(el);
    };

    singleRevealSelectors.forEach(function (sel) {
      Array.prototype.forEach.call(doc.querySelectorAll(sel), function (el) {
        markReveal(el, 'up', 0);
      });
    });

    imageRevealSelectors.forEach(function (sel) {
      Array.prototype.forEach.call(doc.querySelectorAll(sel), function (el) {
        markReveal(el, 'image', 0);
      });
    });

    staggerGroupSelectors.forEach(function (sel) {
      Array.prototype.forEach.call(doc.querySelectorAll(sel), function (el, idx) {
        var delay = motionApi ? motionApi.computeStaggerDelay(idx, 75, 300) : Math.min(idx * 75, 300);
        markReveal(el, 'up', delay);
      });
    });

    var metricsBand = doc.querySelector('.metrics-band');
    var revealElement = function (el) {
      if (!el || el.classList.contains('is-revealed')) return;
      el.classList.add('is-revealed');
      if (metricsBand && (el.closest('.metrics-band') === metricsBand || el === metricsBand)) {
        Array.prototype.forEach.call(metricsBand.querySelectorAll('.stat-tile__value'), animateMetricValue);
      }
    };

    var viewH = window.innerHeight || 900;
    tagged.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top <= viewH * 0.96) {
        revealElement(el);
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.08
      }
    );

    tagged.forEach(function (el) {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    var revealUpToViewport = function () {
      var vh = window.innerHeight || 900;
      tagged.forEach(function (el) {
        if (el.classList.contains('is-revealed')) return;
        var rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.98) {
          revealElement(el);
          observer.unobserve(el);
        }
      });
    };

    window.addEventListener('hashchange', function () {
      window.setTimeout(revealUpToViewport, 80);
    });
    window.addEventListener('scroll', revealUpToViewport, { passive: true });
  }

  /* Subtle hero background parallax on desktop fine-pointer devices */
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var heroMediaImg = doc.querySelector('.hero__media img');
  var heroFrame = doc.querySelector('.hero__frame');
  if (!reduceMotion && finePointer && heroMediaImg && heroFrame) {
    var parallaxTicking = false;
    var updateHeroParallax = function () {
      parallaxTicking = false;
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var frameH = heroFrame.offsetHeight || 800;
      if (scrollY <= frameH + 80) {
        var offset = Math.min(36, Math.max(0, scrollY * 0.06));
        heroMediaImg.style.setProperty('--hero-parallax', offset.toFixed(1) + 'px');
      }
    };
    window.addEventListener(
      'scroll',
      function () {
        if (!parallaxTicking) {
          parallaxTicking = true;
          window.requestAnimationFrame(updateHeroParallax);
        }
      },
      { passive: true }
    );
  }
})();

