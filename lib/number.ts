import BigNumber from 'bignumber.js';

export const isNumber = (value: any) => {
  return typeof value === 'number';
};

BigNumber.config({ EXPONENTIAL_AT: 50, ROUNDING_MODE: 3 });

export const toSol = (num: BigNumber | number | null | undefined, decimals = 9) => {
  if (!num) {
    return num;
  }

  return new BigNumber(num.toString()).div(10 ** decimals).toNumber();
};

export const toDecimals = (num: number | null | undefined, decimals = 0) => {
  if (!num) {
    return num;
  }

  return new BigNumber(num.toString())
    .times(10 ** decimals)
    .integerValue()
    .toNumber(); // @note: convert value toNumber will return an exponent value (Ex: 1e+18)
};

export const toStrDecimals = (num: number | undefined | string, decimals = 0) => {
  if (!num) {
    return '0';
  }

  return new BigNumber(num)
    .times(10 ** decimals)
    .integerValue()
    .toString();
};

export const roundByDecimals = (num: number | undefined | null, decimals = 0) => {
  if (!num) return num;

  const numDecimals = toDecimals(num, decimals);
  return toSol(numDecimals, decimals);
};

export const jsbiToNumber = (num: number | null) => {
  if (!num) return num;

  return new BigNumber(num).toNumber();
};

const SUBSCRIPT_NUMBER_MAP: { [key: number]: string } = {
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
  10: '₁₀',
  11: '₁₁',
  12: '₁₂',
  13: '₁₃',
  14: '₁₄',
  15: '₁₅',
  16: '₁₆',
  17: '₁₇',
  18: '₁₈',
  19: '₁₉',
  20: '₂₀',
  21: '₂₁',
  22: '₂₂',
  23: '₂₃',
  24: '₂₄',
};

const PRECISIONS = [
  { threshold: 0.0000000000000000001, precision: 24 },
  { threshold: 0.000000000000001, precision: 20 },
  { threshold: 0.00000000001, precision: 16 },
  { threshold: 0.000000001, precision: 14 },
  { threshold: 0.0000001, precision: 12 },
  { threshold: 0.00001, precision: 10 },
  { threshold: 0.05, precision: 8 },
  { threshold: 1, precision: 6 },
  { threshold: 10, precision: 4 },
];

export const calcPrecision = (num: number) => {
  if (!num) return 8;

  const absNum = Math.abs(+num);
  for (const { threshold, precision } of PRECISIONS) {
    if (absNum < threshold) {
      return precision;
    }
  }

  return 2;
};

export const formatNumber = (
  num: number | string | null | undefined,
  precision?: number,
  trimZero = true,
) => {
  if (!num) {
    return num;
  }

  if (!isNumber(precision)) {
    precision = calcPrecision(+num);
  }

  let formattedNum = new BigNumber(num).toFormat(precision);

  if (trimZero && formattedNum.match(/\.[0]+$/g)) {
    formattedNum = formattedNum.replace(/\.[0]+$/g, '');
  }

  if (trimZero && formattedNum.match(/\.\d+[0]+$/g)) {
    formattedNum = formattedNum.replace(/[0]+$/g, '');
  }

  if (formattedNum.match(/\.0{4,24}[1-9]+/g)) {
    const match = formattedNum.match(/\.0{4,24}/g)!;
    const matchString = match[0].slice(1);
    formattedNum = formattedNum.replace(
      /\.0{4,24}/g,
      `.0${SUBSCRIPT_NUMBER_MAP[matchString.length]}`,
    );
  }

  return formattedNum;
};

export const abbreviateNumber = (
  num: number | null | undefined,
  precision?: number,
  trimZero = true,
) => {
  if (!num) return num;

  const numAbs = Math.abs(+num);
  let abbrStr: any = '';
  const multiplier = precision === 0 ? 1 : 100;

  if (numAbs > 999 * 1e15) {
    abbrStr = '>999Q';
  } else if (numAbs >= 1e15) {
    abbrStr = (Math.floor((num * multiplier) / 1e15) / multiplier).toString() + 'Q';
  } else if (numAbs >= 1e12) {
    abbrStr = (Math.floor((num * multiplier) / 1e12) / multiplier).toString() + 'T';
  } else if (numAbs >= 1e9) {
    abbrStr = (Math.floor((num * multiplier) / 1e9) / multiplier).toString() + 'B';
  } else if (numAbs >= 1e6) {
    abbrStr = (Math.floor((num * multiplier) / 1e6) / multiplier).toString() + 'M';
  } else if (numAbs >= 1e3) {
    abbrStr = (Math.floor((num * multiplier) / 1e3) / multiplier).toString() + 'K';
  } else {
    abbrStr = formatNumber(num, precision, trimZero)?.toString();
  }

  return abbrStr;
};

const thresholds = [
  { limit: 0.0000000000000000001, precision: 24 },
  { limit: 0.000000000000001, precision: 20 },
  { limit: 0.00000000001, precision: 16 },
  { limit: 0.000000001, precision: 14 },
  { limit: 0.0000001, precision: 12 },
  { limit: 0.00001, precision: 10 },
  { limit: 0.001, precision: 8 },
  { limit: 0.05, precision: 6 },
  { limit: 1, precision: 4 },
  { limit: 20, precision: 3 },
];

export const calcPricePrecision = (num: number) => {
  if (!num) return 8;

  const absNum = Math.abs(+num);
  for (const { limit, precision } of thresholds) {
    if (absNum < limit) return precision;
  }

  return 2;
};

const PRICE_ABBREVIATIONS = [
  { limit: 1e15, symbol: 'Q' },
  { limit: 1e12, symbol: 'T' },
  { limit: 1e9, symbol: 'B' },
  { limit: 1e6, symbol: 'M' },
];

export const formatPrice = (num: any, precision?: number, gr0 = true) => {
  if (!num) {
    return num;
  }

  if (!isNumber(precision)) {
    precision = calcPricePrecision(+num);
  }

  const numAbs = Math.abs(+num);
  let formattedNum;

  if (numAbs > 999 * 1e15) {
    formattedNum = '>999Q';
  } else {
    for (const { limit, symbol } of PRICE_ABBREVIATIONS) {
      if (numAbs >= limit) {
        formattedNum = (Math.floor((num * 100) / limit) / 100).toString() + symbol;
        break;
      }
    }
  }

  if (!formattedNum) {
    formattedNum = new BigNumber(num.toString()).toFormat(precision);
  }

  if (formattedNum.match(/^0\.[0]+$/g)) {
    formattedNum = formattedNum.replace(/\.[0]+$/g, '');
  }

  if (gr0 && formattedNum.match(/\.0{4,24}[1-9]+/g)) {
    const match = formattedNum.match(/\.0{4,24}/g)!;
    const matchString = match[0].slice(1);
    if (SUBSCRIPT_NUMBER_MAP[matchString.length]) {
      formattedNum = formattedNum.replace(
        /\.0{4,24}/g,
        `.0${SUBSCRIPT_NUMBER_MAP[matchString.length]}`,
      );
    }
  }

  return formattedNum;
};

/**
 * Abbreviate percent to K, M, B, T, Q
 * if num >= 10^6 return 1M
 * if num >= 100 precision is 0
 * @param num is any
 * @param precision number | undefined
 * @returns string
 */
export const abbreviatePercent = (num: number | null | undefined, precision?: number) => {
  if (!num) return num;

  const numAbs = Math.abs(+num);
  let abbrStr: any = '';

  if (numAbs > 999 * 1e15) {
    abbrStr = '>999Q';
  } else if (numAbs >= 1e15) {
    abbrStr = Math.floor(num / 1e15).toString() + 'Q';
  } else if (numAbs >= 1e12) {
    abbrStr = Math.floor(num / 1e12).toString() + 'T';
  } else if (numAbs >= 1e9) {
    abbrStr = Math.floor(num / 1e9).toString() + 'B';
  } else if (numAbs >= 1e6) {
    abbrStr = Math.floor(num / 1e6).toString() + 'M';
  } else {
    const newPrecision = numAbs >= 100 ? 0 : precision;
    abbrStr = formatNumber(num, newPrecision)?.toString();
  }

  return abbrStr;
};

const stringNumberRegex = /(-?)([\d,_]*)\.?(\d*)/;
/**
 *
 * @example
 * trimTailingZero('-33.33000000') //=> '-33.33'
 * trimTailingZero('-33.000000') //=> '-33'
 * trimTailingZero('.000000') //=> '0'
 */
export function trimTailingZero(s: string) {
  // no decimal part
  if (!s.includes('.')) return s;

  const [, sign, int, dec] = s.match(stringNumberRegex) ?? [];

  let cleanedDecimalPart = dec;

  while (cleanedDecimalPart.endsWith('0')) {
    cleanedDecimalPart = cleanedDecimalPart.slice(0, cleanedDecimalPart.length - 1);
  }

  return cleanedDecimalPart ? `${sign}${int}.${cleanedDecimalPart}` : `${sign}${int}` || '0';
}

export function toFixedNoRounding(n: number, p: number = 0) {
  let result = n.toFixed(p);
  result =
    Math.abs(+result) <= Math.abs(n)
      ? result
      : (+result - Math.sign(n) * Math.pow(0.1, p)).toFixed(p);

  // if you want negative zeros (-0.00), use this instead:
  // return result;

  // fixes negative zeros:
  if (+result === 0) return (0).toFixed(p);
  else return result;
}
