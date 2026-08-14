/**
 * KuroBlob Expression Validator
 * Validates expression definition structure and Canvas2D drawing safety.
 */

import fs from 'fs';
import path from 'path';

export function createMockCanvasContext() {
  const calls = [];
  const handler = {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (...args) => {
        calls.push({ method: prop, args });
      };
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  };

  const mock = {
    canvas: { width: 400, height: 400 },
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    shadowColor: 'transparent',
    shadowBlur: 0,
    save: () => calls.push({ method: 'save' }),
    restore: () => calls.push({ method: 'restore' }),
    beginPath: () => calls.push({ method: 'beginPath' }),
    closePath: () => calls.push({ method: 'closePath' }),
    moveTo: (x, y) => calls.push({ method: 'moveTo', x, y }),
    lineTo: (x, y) => calls.push({ method: 'lineTo', x, y }),
    arc: (x, y, r, sa, ea) => calls.push({ method: 'arc', x, y, r, sa, ea }),
    fill: () => calls.push({ method: 'fill' }),
    stroke: () => calls.push({ method: 'stroke' }),
    roundRect: (x, y, w, h, r) => calls.push({ method: 'roundRect', x, y, w, h, r })
  };

  return { ctx: new Proxy(mock, handler), calls };
}

export function validateExpression(exp) {
  const errors = [];
  const warnings = [];

  if (!exp) return { valid: false, errors: ['Expression object is null or undefined'] };

  // 1. Check ID & Metadata
  if (!exp.id || typeof exp.id !== 'string') errors.push('Missing or invalid "id" (string required)');
  if (!exp.nameZh) warnings.push('Missing "nameZh"');
  if (!exp.nameEn) warnings.push('Missing "nameEn"');
  if (!exp.emoji) warnings.push('Missing "emoji"');

  // 2. Check Body & Colors
  if (exp.body) {
    if (!exp.body.colorStart) errors.push('Missing body.colorStart');
    if (!exp.body.colorEnd) errors.push('Missing body.colorEnd');
    if (typeof exp.body.radiusFormula === 'function') {
      try {
        const testR = exp.body.radiusFormula(0, 1.0, 80);
        if (typeof testR !== 'number' || isNaN(testR)) {
          errors.push('radiusFormula must return a valid number');
        }
      } catch (e) {
        errors.push(`radiusFormula execution failed: ${e.message}`);
      }
    }
  }

  // 3. Check Eyes
  if (exp.eyes) {
    const validStyles = ['PILL', 'CRESCENT', 'STERN', 'CIRCLE', 'STAR'];
    if (exp.eyes.style && !validStyles.includes(exp.eyes.style)) {
      errors.push(`Invalid eye style "${exp.eyes.style}". Allowed: ${validStyles.join(', ')}`);
    }
  }

  // 4. Test drawAccessory function with Mock Context
  if (typeof exp.drawAccessory === 'function') {
    try {
      const { ctx, calls } = createMockCanvasContext();
      exp.drawAccessory(ctx, 1.5);
      const saveCount = calls.filter(c => c.method === 'save').length;
      const restoreCount = calls.filter(c => c.method === 'restore').length;

      if (saveCount !== restoreCount) {
        warnings.push(`Mismatched ctx.save() (${saveCount}) and ctx.restore() (${restoreCount})`);
      }
    } catch (e) {
      errors.push(`drawAccessory crashed on mock Canvas2D execution: ${e.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// CLI Execution Support
if (process.argv[1] && process.argv[1].endsWith('validate_expression.js')) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.log('Usage: node validate_expression.js <path-to-expression-file>');
    process.exit(0);
  }

  const absPath = path.resolve(process.cwd(), targetFile);
  import(`file://${absPath}`).then(mod => {
    const exp = mod.EXPRESSION_DEFINITION || mod.default || mod;
    const res = validateExpression(exp);
    if (res.valid) {
      console.log(`✅ Expression "${exp.id}" is 100% VALID & ready for KuroBlob rendering!`);
      if (res.warnings.length > 0) console.log('⚠️ Warnings:', res.warnings);
      process.exit(0);
    } else {
      console.error(`❌ Validation Failed for "${exp.id}":`, res.errors);
      process.exit(1);
    }
  }).catch(err => {
    console.error('❌ Failed to load expression module:', err.message);
    process.exit(1);
  });
}
