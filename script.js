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

  /* 3. Interactive Room Showcase Tabs */
  var roomTabs = Array.prototype.slice.call(doc.querySelectorAll('.room-row[role="tab"]'));
  var roomPanels = Array.prototype.slice.call(doc.querySelectorAll('.room-panel[role="tabpanel"]'));
  var activateRoomById = null;

  if (roomTabs.length && roomPanels.length) {
    var activateRoom = function (targetTab, focusTab) {
      var targetId = targetTab.getAttribute('aria-controls');
      roomTabs.forEach(function (tab) {
        var active = tab === targetTab;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      roomPanels.forEach(function (panel) {
        var active = panel.id === targetId;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
      if (focusTab) targetTab.focus();
    };

    activateRoomById = function (roomKey) {
      var matchingTab = roomTabs.find(function (tab) {
        return tab.getAttribute('data-room') === roomKey;
      });
      if (matchingTab) activateRoom(matchingTab, false);
    };

    roomTabs.forEach(function (tab, index) {
      tab.tabIndex = tab.classList.contains('is-active') ? 0 : -1;
      tab.addEventListener('click', function () {
        activateRoom(tab, false);
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          activateRoom(roomTabs[(index + 1) % roomTabs.length], true);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          activateRoom(roomTabs[(index - 1 + roomTabs.length) % roomTabs.length], true);
        }
      });
    });
  }

  /* 3b. Hero Mini Carousel */
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
      if (slide.roomTab) {
        heroLink.setAttribute('data-room-target', slide.roomTab);
      } else {
        heroLink.removeAttribute('data-room-target');
      }
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

    heroLink.addEventListener('click', function () {
      var targetRoom = heroLink.getAttribute('data-room-target');
      if (targetRoom && activateRoomById) {
        activateRoomById(targetRoom);
      }
    });
  }

  /* 3c. Hotel Image Carousel */
  var hotelCarousel = doc.getElementById('hotel-carousel');
  var hotelPrevBtn = doc.getElementById('hotel-carousel-prev');
  var hotelNextBtn = doc.getElementById('hotel-carousel-next');

  if (hotelCarousel && hotelPrevBtn && hotelNextBtn) {
    var hotelSlides = Array.prototype.slice.call(hotelCarousel.querySelectorAll('.hotel__slide'));
    var hotelIndex = 0;
    var hotelTimer = null;
    var hotelMotionQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    var hotelCanAuto = !(hotelMotionQuery && hotelMotionQuery.matches);

    var showHotelSlide = function (nextIndex) {
      if (!hotelSlides.length) return;
      hotelIndex = (nextIndex + hotelSlides.length) % hotelSlides.length;
      hotelSlides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === hotelIndex);
      });
    };

    var stopHotelAuto = function () {
      if (hotelTimer) {
        window.clearInterval(hotelTimer);
        hotelTimer = null;
      }
    };

    var startHotelAuto = function () {
      if (!hotelCanAuto) return;
      stopHotelAuto();
      hotelTimer = window.setInterval(function () {
        showHotelSlide(hotelIndex + 1);
      }, 5000);
    };

    hotelPrevBtn.addEventListener('click', function () {
      showHotelSlide(hotelIndex - 1);
      startHotelAuto();
    });

    hotelNextBtn.addEventListener('click', function () {
      showHotelSlide(hotelIndex + 1);
      startHotelAuto();
    });

    hotelCarousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showHotelSlide(hotelIndex - 1);
        startHotelAuto();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showHotelSlide(hotelIndex + 1);
        startHotelAuto();
      }
    });

    hotelCarousel.addEventListener('mouseenter', stopHotelAuto);
    hotelCarousel.addEventListener('mouseleave', startHotelAuto);
    hotelCarousel.addEventListener('focusin', stopHotelAuto);
    hotelCarousel.addEventListener('focusout', function (e) {
      if (!hotelCarousel.contains(e.relatedTarget)) startHotelAuto();
    });

    startHotelAuto();
  }

  /* 4. Verifizierter Kundenhinweis */
  var quoteSlides = Array.prototype.slice.call(doc.querySelectorAll('.quote-slide'));
  var quoteCounter = doc.getElementById('quote-counter');
  var quotePrev = doc.getElementById('quote-prev');
  var quoteNext = doc.getElementById('quote-next');


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

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var payload = readPayload();
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

    var mail = logic.buildMailtoUrl(recipient, payload);
    var leadResult = deduplicator.recordOnce(payload, function (eventObj) {
      window.dataLayer.push(eventObj);
    });

    if (statusBox) {
      statusBox.textContent = '';

      var heading = doc.createElement('strong');
      heading.textContent = leadResult.recorded
        ? 'Vielen Dank – Ihre Tagungsanfrage ist vorbereitet.'
        : 'Ihre Angaben sind unverändert vorbereitet.';

      var intro = doc.createElement('span');
      intro.textContent =
        ' Bitte senden Sie die Zusammenfassung per E-Mail an ';

      var mailLink = doc.createElement('a');
      mailLink.href = mail.href;
      mailLink.textContent = recipient;

      var actions = doc.createElement('div');
      actions.className = 'form-status__actions';

      var copyBtn = doc.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'form-status__copy';
      copyBtn.textContent = 'Angaben kopieren';
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(mail.body).then(function () {
            copyBtn.textContent = 'Kopiert';
          });
        }
      });

      actions.appendChild(copyBtn);

      statusBox.appendChild(heading);
      statusBox.appendChild(intro);
      statusBox.appendChild(mailLink);
      statusBox.appendChild(doc.createTextNode('.'));
      statusBox.appendChild(actions);
      statusBox.hidden = false;

      statusBox.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest'
      });
    }
  });
})();
