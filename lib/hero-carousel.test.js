'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var carousel = require('./hero-carousel.js');

test('DEFAULT_SLIDES contains valid westhouse room and offer slides', function () {
  assert.ok(Array.isArray(carousel.DEFAULT_SLIDES));
  assert.equal(carousel.DEFAULT_SLIDES.length, 4);
  carousel.DEFAULT_SLIDES.forEach(function (slide) {
    assert.ok(slide.title);
    assert.ok(slide.subtitle);
    assert.ok(slide.meta);
    assert.ok(slide.image);
    assert.ok(slide.href);
  });
});

test('stepSlide wraps seamlessly forward and backward', function () {
  assert.equal(carousel.stepSlide(0, 1, 4), 1);
  assert.equal(carousel.stepSlide(3, 1, 4), 0);
  assert.equal(carousel.stepSlide(0, -1, 4), 3);
  assert.equal(carousel.stepSlide(2, -1, 4), 1);
});

test('formatCounter zero-pads indices correctly', function () {
  assert.equal(carousel.formatCounter(0, 4), '01 / 04');
  assert.equal(carousel.formatCounter(3, 4), '04 / 04');
  assert.equal(carousel.formatCounter(-1, 4), '04 / 04');
});
