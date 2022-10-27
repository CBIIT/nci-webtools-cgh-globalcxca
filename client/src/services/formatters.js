import isNumber from 'lodash/isNumber';

export const asNumber = (value) => {
  if ([null, undefined, ""].includes(value))
    return null;
  
  else if (isNumber(+value) && !isNaN(+value))
    return +value;

  return value;
}

export const asLabel = (value, options) => options.find(o => o.value === value)?.label;

export const asPercent = (value, places = 2) => [null, undefined, NaN].includes(value) ? null : `${(+value).toFixed(places)}%`;
