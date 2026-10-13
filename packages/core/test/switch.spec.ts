import { describe, expect, it } from 'vitest';

import { SWITCH_SIZES, resolveSwitchOptions } from '../src/switch.js';

describe('resolveSwitchOptions', () => {
  it('maps binary state to the switch accessibility contract', () => {
    expect(resolveSwitchOptions().ariaChecked).toBe('false');
    expect(resolveSwitchOptions({ checked: true }).ariaChecked).toBe('true');
  });

  it('marks disabled switches non-interactive', () => {
    expect(resolveSwitchOptions({ disabled: true }).interactive).toBe(false);
  });

  it('exposes stable sizes', () => {
    expect(SWITCH_SIZES).toEqual(['sm', 'md', 'lg']);
  });
});
