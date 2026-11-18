(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WesthouseMotion = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp01(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0;
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
  }

  function easeOutCubic(t) {
    var clamped = clamp01(t);
    return 1 - Math.pow(1 - clamped, 3);
  }

  function parseMetricText(text) {
    if (typeof text !== 'string') return null;
    var trimmed = text.trim();
    var match = trimmed.match(/^(\d+)(.*)$/);
    if (!match) return null;
    return {
      target: Number(match[1]),
      suffix: match[2] || ''
    };
  }

  function interpolateMetric(parsed, progress) {
    if (!parsed || typeof parsed.target !== 'number') return '';
    var eased = easeOutCubic(progress);
    var current = Math.round(parsed.target * eased);
    return String(current) + (parsed.suffix || '');
  }

  function computeStaggerDelay(index, stepMs, maxMs) {
    var safeIndex = Math.max(0, Number(index) || 0);
    var step = typeof stepMs === 'number' && stepMs >= 0 ? stepMs : 75;
    var cap = typeof maxMs === 'number' && maxMs >= 0 ? maxMs : 300;
    return Math.min(safeIndex * step, cap);
  }

  return {
    easeOutCubic: easeOutCubic,
    parseMetricText: parseMetricText,
    interpolateMetric: interpolateMetric,
    computeStaggerDelay: computeStaggerDelay
  };
});
