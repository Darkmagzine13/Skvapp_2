import Decimal from 'decimal.js';

// Configure globally
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function sapCeil(v: Decimal): Decimal {
  const whole = v.floor();
  const frac = v.minus(whole);
  if (frac.gte(new Decimal('0.50'))) {
    return whole.plus(1);
  }
  return whole;
}

export function sapTruncHalf(v: Decimal): Decimal {
  return sapCeil(v);
}

export function pfRound(v: Decimal): Decimal {
  return sapTruncHalf(v);
}

export function esiCeil(v: Decimal): Decimal {
  return v.ceil();
}

export function toDecimal(v: unknown): Decimal {
  if (v === null || v === undefined) {
    return new Decimal(0);
  }
  try {
    const s = String(v).replace(/,/g, '').trim();
    if (s === '') {
      return new Decimal(0);
    }
    return new Decimal(s);
  } catch {
    return new Decimal(0);
  }
}
