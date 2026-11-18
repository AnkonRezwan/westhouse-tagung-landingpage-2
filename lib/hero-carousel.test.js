'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var carousel = require('./hero-carousel.js');

test('DEFAULT_SLIDES matches the three landing page room showcase cards', function () {
  assert.ok(Array.isArray(carousel.DEFAULT_SLIDES));
  assert.equal(carousel.DEFAULT_SLIDES.length, 3);
  assert.deepEqual(
    carousel.DEFAULT_SLIDES.map(function (s) {
      return s.title;
    }),
    ['Saal Anna Maria', 'Seminarräume', 'Foyer & Terrasse']
  );
  carousel.DEFAULT_SLIDES.forEach(function (slide) {
    assert.ok(slide.title);
    assert.ok(slide.subtitle);
    assert.ok(slide.meta);
    assert.ok(slide.image);
    assert.ok(slide.href);
  });
});

test('stepSlide wraps seamlessly forward and backward across 3 slides', function () {
  assert.equal(carousel.stepSlide(0, 1, 3), 1);
  assert.equal(carousel.stepSlide(2, 1, 3), 0);
  assert.equal(carousel.stepSlide(0, -1, 3), 2);
  assert.equal(carousel.stepSlide(1, -1, 3), 0);
});

test('formatCounter zero-pads indices correctly for 3 slides', function () {
  assert.equal(carousel.formatCounter(0, 3), '01 / 03');
  assert.equal(carousel.formatCounter(2, 3), '03 / 03');
  assert.equal(carousel.formatCounter(-1, 3), '03 / 03');
});
