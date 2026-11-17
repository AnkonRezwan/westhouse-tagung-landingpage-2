(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WesthouseHeroCarousel = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var DEFAULT_SLIDES = [
    {
      id: 'saal',
      title: 'Saal Anna Maria',
      subtitle: '450 m² · bis 480 Personen',
      meta: 'Reihe & Parlamentarisch',
      image: 'assets/images/saal-anna-maria.webp',
      imageAlt: 'Der Saal Anna Maria im westhouse Augsburg mit Reihenbestuhlung',
      href: '#raeume',
      roomTab: 'saal'
    },
    {
      id: 'konferenz',
      title: 'Konferenzraum',
      subtitle: 'Plenum & Tagungstechnik',
      meta: 'Flexible Bestuhlungsformate',
      image: 'assets/images/konferenzraum.jpg',
      imageAlt: 'Moderner Konferenzraum im westhouse Augsburg',
      href: '#raeume',
      roomTab: 'seminar'
    },
    {
      id: 'seminar',
      title: 'Seminarräume',
      subtitle: '8 Räume · kombinierbar',
      meta: 'Workshops & Schulungen',
      image: 'assets/images/seminarraum.jpg',
      imageAlt: 'Heller Seminarraum im westhouse Augsburg mit U-Bestuhlung',
      href: '#raeume',
      roomTab: 'seminar'
    },
    {
      id: 'hotel-catering',
      title: 'Catering & Hotel im Haus',
      subtitle: 'Meikes Schmeckerei · 73 Zimmer',
      meta: 'Übernachtung im Hotel einsmehr',
      image: 'assets/images/catering.jpg',
      imageAlt: 'Catering-Arrangement von Meikes Schmeckerei im westhouse Augsburg',
      href: '#hotel',
      roomTab: null
    }
  ];

  function wrapIndex(index, total) {
    if (!total || total <= 0) return 0;
    var mod = index % total;
    return mod < 0 ? mod + total : mod;
  }

  function stepSlide(currentIndex, delta, total) {
    return wrapIndex(currentIndex + delta, total);
  }

  function formatCounter(index, total) {
    if (!total || total <= 0) return '00 / 00';
    var current = wrapIndex(index, total) + 1;
    var pad = function (n) {
      return n < 10 ? '0' + n : String(n);
    };
    return pad(current) + ' / ' + pad(total);
  }

  return {
    DEFAULT_SLIDES: DEFAULT_SLIDES,
    wrapIndex: wrapIndex,
    stepSlide: stepSlide,
    formatCounter: formatCounter
  };
});
