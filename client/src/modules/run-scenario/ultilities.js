// Utility function to get the maximum value from an array
export const getMaxValue = (arr) => {
  if (!arr || arr.length === 0) return null;
  return Math.max(...arr);
};
