import { useRef, useEffect } from "react";
import * as d3 from "d3";

export const defaultLayout = {
  width: 450,
};

export default function BarChart({ id, data, layout = defaultLayout }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && data && layout) {
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }
      if (data.every((item) => item.value === 0)) {
        const noDataText = document.createElement("p");
        noDataText.textContent = "NO DATA AVAILABLE";
        noDataText.style.display = "flex";
        noDataText.style.justifyContent = "center";
        noDataText.style.alignItems = "center";
        noDataText.style.height = "100%";
        noDataText.style.color = "red"; // Set the text color to red
        ref.current.appendChild(noDataText);
      } else {
        ref.current.appendChild(
          d3BarChart(data, {
            x: (d) => d.label,
            y: (d) => d.value,
            yFormat: ",.0f",
            yLabel: "Counts",
            width: 500,
            height: 500,
            color: "#0DAB61",
          })
        );
      }
    }
  });

  return <div className="img-fluid p-2" ref={ref} id={id} />;
}
function d3BarChart(
  data,
  {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = (d) => d, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    marginTop = 30, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 30, // the bottom margin, in pixels
    marginLeft = 70, // the left margin, in pixels
    width = 640, // the outer width of the chart, in pixels
    height = 400, // the outer height of the chart, in pixels
    xDomain, // an array of (ordinal) x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor", // bar fill color
    singleBarWidth = 140, // set a custom width for single data bar
  } = {}
) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);

  // Compute default domains, and unique the x-domain.
  if (xDomain === undefined) xDomain = X;
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  xDomain = new d3.InternSet(xDomain);

  // Omit any data not present in the x-domain.
  const I = d3.range(X.length).filter((i) => xDomain.has(X[i]));

  // Construct scales, axes, and formats.
  const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

  // Compute titles.
  if (title === undefined) {
    const formatValue = yScale.tickFormat(100, yFormat);
    title = (i) => `${X[i]}\n${formatValue(Y[i])}`;
  } else {
    const O = d3.map(data, (d) => d);
    const T = title;
    title = (i) => T(O[i], i, data);
  }

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(yAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -marginLeft)
        .attr("y", 15)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-size", "1rem")
        .text(yLabel)
    );

  const barWidth = data.length > 1 ? xScale.bandwidth() : singleBarWidth; // determine the bar width

  const bar = svg
    .append("g")
    .attr("fill", color)
    .selectAll("rect")
    .data(I)
    .join("rect")
    .attr("x", (i) => xScale(X[i]))
    .attr("y", (i) => yScale(Y[i]))
    .attr("height", (i) => yScale(0) - yScale(Y[i]))
    //.attr("width", xScale.bandwidth())
    .attr("width", barWidth)
    .attr("title", (d) => d.label);

  if (data.length === 1) {
    bar.attr("transform", `translate(${(xRange[1] - barWidth) / 3.5}, 0)`);
  }

  svg
    .append("g")
    .attr("font-family", "system-ui, sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(I)
    .join("text")
    .attr(
      "transform",
      (d) =>
        `translate(${xScale(X[d]) + xScale.bandwidth() / 2},${
          yScale(Y[d]) - 6
        })`
    )
    .attr("font-size", "1rem")
    .attr("text-anchor", "middle")
    .text((i) => yScale.tickFormat(100, yFormat)(Y[i]));

  if (title) bar.append("title").text(title).attr("font-size", "1rem");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis);

  return svg.node();
}
