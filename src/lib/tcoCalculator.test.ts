import { describe, expect, it } from 'vitest';
import { calculateTco } from './tcoCalculator';

describe('calculateTco', () => {
  it('matches the default values shown in the TcoCalculator UI', () => {
    const result = calculateTco(25000, 38);
    expect(result.annualSpend).toBe(300000);
    expect(result.savings).toBe(114000);
    expect(result.newAnnualSpend).toBe(186000);
  });

  it('returns zeroed results for zero spend', () => {
    const result = calculateTco(0, 38);
    expect(result).toEqual({ annualSpend: 0, savings: 0, newAnnualSpend: 0 });
  });

  it('treats NaN inputs as 0, same as the original || 0 fallback', () => {
    const result = calculateTco(Number.NaN, Number.NaN);
    expect(result).toEqual({ annualSpend: 0, savings: 0, newAnnualSpend: 0 });
  });

  it('applies 100% efficiency as zero remaining spend', () => {
    const result = calculateTco(10000, 100);
    expect(result.annualSpend).toBe(120000);
    expect(result.savings).toBe(120000);
    expect(result.newAnnualSpend).toBe(0);
  });

  it('applies 0% efficiency as no savings', () => {
    const result = calculateTco(10000, 0);
    expect(result.savings).toBe(0);
    expect(result.newAnnualSpend).toBe(result.annualSpend);
  });
});
