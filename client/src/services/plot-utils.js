import * as d3 from "d3";
import { defaultLayout } from "../modules/run-scenario/pie-chart";
import { saveAs } from "file-saver";

export function exportSvg(selector, filename) {
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

//export chart to PNG
export function saveChartAsPNG(chartId, filename, chartTitle) {
  var chartSVG = d3.select("#" + chartId).select("svg");

  // Set the background color of the SVG element to white
  chartSVG.style("background-color", "white");

  // Create a new SVG element to hold the chart with the title
  var svgWithTitle = d3
    .create("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", chartSVG.attr("width"))
    .attr("height", +chartSVG.attr("height") + 40); // Adjust height for title and spacing

  // Append a white background rectangle to ensure the entire area is white
  svgWithTitle
    .append("rect")
    .attr("width", chartSVG.attr("width"))
    .attr("height", +chartSVG.attr("height") + 40)
    .attr("fill", "white");

  // Append a group element for applying the transform
  var chartGroup = svgWithTitle
    .append("g")
    .attr("transform", "translate(0, 40)"); // Adjust vertical translation

  // Append the original chart SVG to the new SVG, within the group element
  chartGroup.append(() => chartSVG.node().cloneNode(true));

  // Append the title to the new SVG
  svgWithTitle
    .append("text")
    .attr("x", chartSVG.attr("width") / 2)
    .attr("y", 30) // Adjust y-coordinate for title position
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .text(chartTitle);

  var svgString = getSVGString(svgWithTitle.node());

  svgString2Image(
    svgString,
    2 * defaultLayout.width,
    2 * defaultLayout.height + 120, // Adjust height for title and spacing
    "png",
    save
  );

  function save(dataBlob, filesize) {
    saveAs(dataBlob, filename);
  }
}

export async function saveChartAsPNGForZip(chartId, chartTitle) {
  var chartSVG = d3.select("#" + chartId).select("svg");

  // Set the background color of the SVG element to white
  chartSVG.style("background-color", "white");

  // Create a new SVG element to hold the chart with the title
  var svgWithTitle = d3
    .create("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", chartSVG.attr("width"))
    .attr("height", +chartSVG.attr("height") + 40); // Adjust height for title and spacing

  // Append a white background rectangle to ensure the entire area is white
  svgWithTitle
    .append("rect")
    .attr("width", chartSVG.attr("width"))
    .attr("height", +chartSVG.attr("height") + 40)
    .attr("fill", "white");

  console.log("svgWithTitle", svgWithTitle);

  // Append a group element for applying the transform
  var chartGroup = svgWithTitle
    .append("g")
    .attr("transform", "translate(0, 40)"); // Adjust vertical translation

  // Append the original chart SVG to the new SVG, within the group element
  chartGroup.append(() => chartSVG.node().cloneNode(true));

  // Append the title to the new SVG
  svgWithTitle
    .append("text")
    .attr("x", chartSVG.attr("width") / 2)
    .attr("y", 30) // Adjust y-coordinate for title position
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .text(chartTitle);

  var svgString = getSVGString(svgWithTitle.node());


  return new Promise((resolve) => {
    svgString2Image(
      svgString,
      2 * defaultLayout.width,
      2 * defaultLayout.height + 120, // Adjust height for title and spacing
      "png",
      (dataBlob) => {
        resolve(dataBlob);
      }
    );
  });
}

export function getSVGString(svgNode) {
  svgNode.setAttribute("xlink", "http://www.w3.org/1999/xlink");
  var cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
  svgString = svgString.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix

  return svgString;

  function getCSSStyles(parentElement) {
    var selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push("#" + parentElement.id);
    for (var c = 0; c < parentElement.classList.length; c++)
      if (!contains("." + parentElement.classList[c], selectorTextArr))
        selectorTextArr.push("." + parentElement.classList[c]);

    // Add Children element Ids and Classes to the list
    var nodes = parentElement.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].id;
      if (!contains("#" + id, selectorTextArr)) selectorTextArr.push("#" + id);

      var classes = nodes[i].classList;
      for (var c = 0; c < classes.length; c++)
        if (!contains("." + classes[c], selectorTextArr))
          selectorTextArr.push("." + classes[c]);
    }

    // Extract CSS Rules
    var extractedCSSText = "";
    for (var i = 0; i < document.styleSheets.length; i++) {
      var s = document.styleSheets[i];

      try {
        if (!s.cssRules) continue;
      } catch (e) {
        if (e.name !== "SecurityError") throw e; // for Firefox
        continue;
      }

      var cssRules = s.cssRules;
      for (var r = 0; r < cssRules.length; r++) {
        if (includes(cssRules[r].selectorText, selectorTextArr))
          extractedCSSText += cssRules[r].cssText;
      }
    }

    return extractedCSSText;

    function contains(str, arr) {
      return arr.indexOf(str) === -1 ? false : true;
    }
  }

  function appendCSS(cssText, element) {
    var styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = cssText;
    var refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
}

function includes(str, arr) {
  if ("undefined" !== typeof str) {
    for (var q = 0; q < arr.length; q++) {
      if (str.indexOf(arr[q]) !== -1) {
        return true;
      }
    }
  }
}

export function svgString2Image(svgString, width, height, format, callback) {
  var format = format ? format : "png";

  var imgsrc =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  var image = new Image();
  image.onload = function () {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(function (blob) {
      if (blob) {
        var filesize = Math.round(blob.size / 1024) + " KB";
        if (callback) callback(blob, filesize);
      } else {
        console.error("Error creating blob object.");
      }
    });
  };

  image.src = imgsrc;
}
