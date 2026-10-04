import Decimal from 'decimal.js';
// Configure globally
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
export function sapCeil(v) {
    const whole = v.floor();
    const frac = v.minus(whole);
    if (frac.gte(new Decimal('0.50'))) {
        return whole.plus(1);
    }
    return whole;
}
export function sapTruncHalf(v) {
    return sapCeil(v);
}
export function pfRound(v) {
    return sapTruncHalf(v);
}
export function esiCeil(v) {
    return v.ceil();
}
export function toDecimal(v) {
    if (v === null || v === undefined) {
        return new Decimal(0);
    }
    try {
        const s = String(v).replace(/,/g, '').trim();
        if (s === '') {
            return new Decimal(0);
        }
        return new Decimal(s);
    }
    catch {
        return new Decimal(0);
    }
}
//# sourceMappingURL=math.js.map