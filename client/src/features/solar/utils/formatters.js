/**
 * client/src/features/solar/utils/formatters.js
 *
 * Formats numbers into Indian numbering system (e.g. 1,45,000)
 * without relying on Intl.NumberFormat which behaves inconsistently on Android Hermes.
 */

export function formatInr(num, showSymbol = true) {
  if (num === null || num === undefined || isNaN(Number(num))) {
    return showSymbol ? '₹0' : '0';
  }

  const rawNum = Math.round(Number(num));
  const isNegative = rawNum < 0;
  const absStr = Math.abs(rawNum).toString();

  let formatted = '';
  if (absStr.length <= 3) {
    formatted = absStr;
  } else {
    const lastThree = absStr.substring(absStr.length - 3);
    const otherDigits = absStr.substring(0, absStr.length - 3);
    formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';
  return `${prefix}${symbol}${formatted}`;
}

export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  const factor = Math.pow(10, decimals);
  return (Math.round(Number(num) * factor) / factor).toFixed(decimals).replace(/\.0+$/, '');
}
