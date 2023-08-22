import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useTranslation } from "react-i18next";

export const defaultLayout = {
  width: 400,
  height: 250,
};

export default function BarChart({
  id,
  data,
  layout = defaultLayout,
  color,
  barWidth,
}) {
  const ref = useRef(null);
  const { t, i18n } = useTranslation(); // Add this line
  const translatedLabels = {
    noDataAvailable: t("general.noDataAvailable"),
    // ... other labels you need ...
  };

  useEffect(() => {
    if (ref.current && data && layout) {
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }
      if (data.every((item) => item.value === 0)) {
        // const noDataText = document.createElement("p");
        // noDataText.textContent = t("general.noDataAvailable");
        // noDataText.style.display = "flex";
        // noDataText.style.justifyContent = "center";
        // noDataText.style.alignItems = "center";
        // noDataText.style.height = "100%";
        // noDataText.style.color = "red"; // Set the text color to red
        // ref.current.appendChild(noDataText);
        const noDataContainer = document.createElement("div");
        noDataContainer.style.display = "flex";
        noDataContainer.style.justifyContent = "center";
        noDataContainer.style.alignItems = "center";
        noDataContainer.style.height = `${layout.height}px`; // Set the height from the layout object
        ref.current.appendChild(noDataContainer);

        const noDataText = document.createElement("p");
        noDataText.textContent = t("general.noDataAvailable");
        noDataText.style.color = "gray"; // Set the text color to red
        noDataText.style.fontWeight = "bold";
        noDataContainer.appendChild(noDataText);
      } else {
        ref.current.appendChild(
          d3BarChart(data, {
            x: (d) => d.label,
            y: (d) => d.value,
            yFormat: ",.0f",
            yLabel: "Counts",
            width: layout.width, // Use the width from the layout object
            height: layout.height, // Use the height from the layout object
            color: color || "#0DAB61", // Use the provided color or default to green
            labels: translatedLabels,
            t: t,
            language: i18n.language,
            barWidth: barWidth || 20, // Use the provided bar width or default to 20
          })
        );
      }
    }
  }, [data, layout, color, barWidth]);

  return <div className="" ref={ref} id={id} />;
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
    marginLeft = 100, // the left margin, in pixels
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
    singleBarWidth = width / 5, // set a custom width for single data bar
    language,
    xLabelRotation = 0, // Default rotation angle
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
  // Compute formats based on language.
  yFormat = language === "es" ? ".0f" : ",.0f";

  const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

  // Check if the language is Spanish and set the x-axis label rotation
  if (language === "es" && xLabelRotation === 0) {
    xLabelRotation = 30; // Rotate by 30 degrees for Spanish language
  }

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
        .attr("y", 12)
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
  // .selectAll(".tick text") // Select all x-axis tick labels
  // .style("text-anchor", "start")
  // .attr("dx", "-0.8em")
  // .attr("dy", "0.15em")
  // .attr("transform", `rotate(${xLabelRotation})`); // Rotate the labels

  return svg.node();
}
