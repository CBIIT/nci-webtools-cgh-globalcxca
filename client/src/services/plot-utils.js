export function exportSvg(selector, filename) {
  console.log("selector", selector);
  console.log("filename", filename);
  const chartElement = document.querySelector(selector);
  if (!chartElement) {
    console.error(`Element with selector '${selector}' not found.`);
    return;
  }
  const svgString = new XMLSerializer().serializeToString(
    document.querySelector(selector)
  );
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
