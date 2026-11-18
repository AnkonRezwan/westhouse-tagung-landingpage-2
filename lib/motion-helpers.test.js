const test = require('node:test');
const assert = require('node:assert/strict');
const motion = require('./motion-helpers');

test('parseMetricText extracts numeric targets and unit suffixes cleanly', () => {
  assert.deepEqual(motion.parseMetricText('480'), { target: 480, suffix: '' });
  assert.deepEqual(motion.parseMetricText('450 m²'), { target: 450, suffix: ' m²' });
  assert.deepEqual(motion.parseMetricText(' 73 '), { target: 73, suffix: '' });
  assert.equal(motion.parseMetricText('Saal'), null);
});

test('easeOutCubic clamps out-of-range inputs and decelerates smoothly', () => {
  assert.equal(motion.easeOutCubic(-0.2), 0);
  assert.equal(motion.easeOutCubic(0), 0);
  assert.ok(motion.easeOutCubic(0.5) > 0.8);
  assert.equal(motion.easeOutCubic(1), 1);
  assert.equal(motion.easeOutCubic(1.5), 1);
});

test('interpolateMetric formats eased metric frames with original suffix', () => {
  const area = motion.parseMetricText('450 m²');
  assert.equal(motion.interpolateMetric(area, 0), '0 m²');
  assert.equal(motion.interpolateMetric(area, 1), '450 m²');
  assert.ok(motion.interpolateMetric(area, 0.5).endsWith(' m²'));
});

test('computeStaggerDelay applies step increment and caps at maxMs', () => {
  assert.equal(motion.computeStaggerDelay(0, 75, 300), 0);
  assert.equal(motion.computeStaggerDelay(2, 75, 300), 150);
  assert.equal(motion.computeStaggerDelay(10, 75, 300), 300);
});
