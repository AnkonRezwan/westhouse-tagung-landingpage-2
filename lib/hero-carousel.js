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
      meta: 'Parlamentarisch bis 198 Personen',
      image: 'assets/images/saal-anna-maria.webp',
      imageAlt: 'Der Saal Anna Maria im westhouse Augsburg mit Reihenbestuhlung und Holzdecke',
      href: '#room-showcase'
    },
    {
      id: 'seminar',
      title: 'Seminarräume',
      subtitle: '8, kombinierbar · bis 100 Personen',
      meta: 'Reihe, U-Form, Block',
      image: 'assets/images/seminarraum.jpg',
      imageAlt: 'Heller Seminarraum im westhouse Augsburg mit U-Bestuhlung vor großen Fenstern',
      href: '#room-showcase'
    },
    {
      id: 'foyer',
      title: 'Foyer & Terrasse',
      subtitle: '140 m² · bis 126 Personen',
      meta: 'direkt zur Terrasse',
      image: 'assets/images/terrasse.webp',
      imageAlt: 'Terrasse des westhouse Augsburg mit Sitzkissen für Pausen und Empfänge',
      href: '#room-showcase'
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
