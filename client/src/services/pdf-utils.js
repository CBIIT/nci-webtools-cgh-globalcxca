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
  "bg-info": {
    fillColor: "#0d6efd",
  },
  "bg-warning": {
    fillColor: "#fd7e14",
  },
  "table-warning": {
    fillColor: "#ffe5d0",
  },
  "bg-danger": {
    fillColor: "#dc3545",
  },
  "table-danger": {
    fillColor: "#f8d7da",
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
            headerRows: 1,
            widths: Array.from(
              node.querySelector("tr").querySelectorAll("td, th")
            ).map((v) => "*"),
            body: Array.from(node.querySelectorAll("tr")).map((tr) =>
              Array.from(tr.querySelectorAll("td, th")).map((cell) => ({
                text: cell.innerText,
                colSpan: cell.colSpan || 1,
                style: [...tr.classList, ...cell.classList, cell.tagName],
              }))
            ),
          },
        };
      } else {
        return {
          text: node.innerText,
          style: [...node.classList, node.tagName],
        };
      }
    }),
    styles: pdfStyles,
    ...config,
  };

  //console.log(doc);

  return pdfMake.createPdf(doc).download(filename);
}
