
export async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function getTimestamp(d = new Date()) {
  return [
    [d.getFullYear(), d.getMonth() + 1, d.getDate()].join(''),
    [d.getHours(), d.getMinutes(), d.getSeconds()].join(''),
  ].join('_')
}
