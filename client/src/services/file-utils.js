
export async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function getTimestamp(d = new Date()) {
  const padDateValue = val => String(val).padStart(2, '0');
  return [
    [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(padDateValue).join(''),
    [d.getHours(), d.getMinutes(), d.getSeconds()].map(padDateValue).join(''),
  ].join('_')
}
