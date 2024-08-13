import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// note that styles are hardcoded instead of being determined by computed css styles
// this is by design, as pdf styles should not necessarily be the same as the web app styles
export const pdfStyles = {
  h5: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 15],
  },
  TH: {
    bold: true,
    margin: [4, 4, 4, 4],
  },
  TD: {
    margin: [4, 4, 4, 4],
  },
  "table-info": {
    fillColor: "#cfe2ff",
  },
  "bg-grey": {
    fillColor: "#ebebeb",
  },
  "bg-info-dark": {
    fillColor: "#0250c5",
  },
  "bg-info": {
    fillColor: "#0d6efd",
  },
  "bg-warning-dark": {
    fillColor: "#8d4002",
  },
  "table-warning": {
    fillColor: "#ffe5d0",
  },
  "bg-danger-dark": {
    fillColor: "#a91e2c",
  },
  "table-danger": {
    fillColor: "#f8d7da",
  },
  "bg-success-dark": {
    fillColor: "#076439",
  },
  "bg-success": {
    fillColor: "#0dab61",
  },
  "text-light": {
    color: "#ffffff",
  },
  "text-end": {
    alignment: "right",
  },
};

export function exportPdf(filename, nodes, config = {}) {
  const doc = {
    content: nodes.map((node) => {
      if (node.tagName === "HR") {
        return { text: "", pageBreak: "after" };
      } else if (node.tagName === "TABLE") {
        return {
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
          table: {
            headerRows: 0, // This controls how many rows are treated as header rows
            dontBreakRows: true, // Prevents rows from splitting across pages
            widths: Array.from(
              node.querySelector("tr").querySelectorAll("td, th")
            ).map(() => "*"),
            body: Array.from(node.querySelectorAll("tr")).map((tr) =>
              Array.from(tr.querySelectorAll("td, th")).map((cell) => {
                console.log("cell.innerText ", cell.innerText)
                const textContent = cell.innerText.trim(); // Trim any whitespace
                return {
                  text: textContent === "Placeholder" ? "" : textContent, // Replace "Placeholder" with an empty string
                  colSpan: cell.colSpan || 1,
                  style: [...tr.classList, ...cell.classList, cell.tagName],
                };
              })
            ),
          },
          // Add custom style to handle the non-repeating header
          headerRows: 0 // Set headerRows to 0 to prevent repeating the header
        };
      } else {
        const textContent = node.innerText.trim(); // Trim any whitespace
        return {
          text: textContent,
          style: [...node.classList, node.tagName],
        };
      }
    }),
    styles: pdfStyles,
    ...config,
  };

  return pdfMake.createPdf(doc).download(filename);
}



