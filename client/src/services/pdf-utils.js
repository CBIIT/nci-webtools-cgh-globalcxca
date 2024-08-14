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
        // Determine the number of columns in the table
        const columnCount = node.querySelector("tr").querySelectorAll("td, th").length;

        // Set widths based on the number of columns
        const widths = Array.from({ length: columnCount }).map((_, index) => {
          if (index === 0) {
            return "70%"; // Set the width of the first column to 70%
          } else {
            return `${30 / (columnCount - 1)}%`; // Distribute the remaining 30% among the other columns
          }
        });

        return {
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20], //margin between tables
          table: {
            headerRows: 0,
            dontBreakRows: true,
            widths: widths,
            body: Array.from(node.querySelectorAll("tr")).map((tr) =>
              Array.from(tr.querySelectorAll("td, th")).map((cell) => {
                const textContent = cell.innerText.trim();
                return {
                  text: textContent === "Placeholder" ? "" : textContent,
                  colSpan: cell.colSpan || 1,
                  style: [...tr.classList, ...cell.classList, cell.tagName],
                };
              })
            ),
          },
        };
      } else {
        const textContent = node.innerText.trim();
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





