import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { useTranslation } from "react-i18next";

export const defaultLayout = {
  //width: 400,
  height: 250,
  margin: 40,
};

export default function BarChart({
  id,
  data,
  layout = defaultLayout,
  color,
  barWidth,
  yTickValues = [0, 0.2, 0.4, 0.6, 0.8], // Array of y-axis tick values for "no data" mode
}) {
  const ref = useRef(null);
  const { t, i18n } = useTranslation(); // Add this line
  const translatedLabels = {
    noDataAvailable: t("general.noData"),
    // ... other labels you need ...
  };

  const [isDataZero, setIsDataZero] = useState(false); // New state variable
  const [chartWidth, setChartWidth] = useState(layout.width); // New state variable for chart width

  const updateChartWidth = useCallback(() => {
    const containerWidth = ref.current.clientWidth; // Get the container width
    const newChartWidth = containerWidth - layout.margin * 2; // Adjust for margins
    setChartWidth(newChartWidth);
  }, [layout.margin]);

  useEffect(() => {
    updateChartWidth(); // Update the chart width initially
    console.log("Initial chart width:", chartWidth);

    const handleResize = () => {
      updateChartWidth(); // Update the chart width when the window is resized
      console.log("Updated chart width:", chartWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup the event listener on component unmount
    };
  }, [updateChartWidth, chartWidth]);

  useEffect(() => {
    if (data) {
      setIsDataZero(data.every((item) => item.value === 0)); // Update isDataZero state
    }

    if (ref.current && data && layout) {
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }
      if (data.every((item) => item.value === 0)) {
        const svg = d3
          .create("svg")
          .attr("width", chartWidth)
          //.attr("width", layout.width)
          .attr("height", layout.height);

        // Append y axis line (vertical)
        // svg
        //   .append("line")
        //   .attr("x1", 40) // Adjust position from the left
        //   .attr("y1", 0)
        //   .attr("x2", 40)
        //   .attr("y2", layout.height)
        //   .attr("stroke", "black");

        // Append x axis line (horizontal)
        svg
          .append("line")
          .attr("x1", 40)
          .attr("y1", layout.height) // Adjust position from the bottom
          // .attr("x2", layout.width)
          .attr("x2", chartWidth)
          .attr("y2", layout.height)
          .attr("stroke", "black");

        // Append axis labels
        svg
          .append("text")
          // .attr("x", layout.width / 2)
          .attr("x", chartWidth / 2)
          .attr("x", layout.width / 2)
          .attr("y", layout.height - 10)
          .attr("text-anchor", "middle")
          .text("");

        svg
          .append("text")
          .attr("x", 10)
          .attr("y", layout.height / 2)
          .attr("text-anchor", "start")
          .text("");

        // Append y-axis ticks with labels and gray lines
        if (yTickValues) {
          yTickValues.forEach((tickValue) => {
            const yPosition = layout.height * (1 - tickValue);
            svg
              .append("line") // Append gray line
              .attr("x1", 40)
              .attr("y1", yPosition)
              // .attr("x2", layout.width)
              .attr("x2", chartWidth)
              .attr("y2", yPosition)
              .attr("stroke", "#E8E9E9")
              .attr("stroke-array", "2,2"); // Dashed line style

            svg
              .append("text") // Append y-axis tick label
              .attr("x", 30)
              .attr("y", yPosition)
              .attr("text-anchor", "end")
              .text(tickValue);
          });
        }

        // Append a text element to indicate there is no data
        svg
          .append("text")
          // .attr("x", layout.width / 2)
          .attr("x", chartWidth / 2)
          .attr("y", layout.height / 2)
          .attr("text-anchor", "middle")
          .text(translatedLabels.noDataAvailable)
          .style("font-weight", "bold") // Apply bold font weight
          .style("fill", "gray"); // Apply gray color
        // Append the SVG to the container
        ref.current.appendChild(svg.node());
      } else {
        ref.current.appendChild(
          d3BarChart(data, {
            x: (d) => d.label,
            y: (d) => d.value,
            yFormat: ",.0f",
            yLabel: "Counts",
            //width: layout.width, // Use the width from the layout object
            with: chartWidth,
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
  }, [data, layout, color, barWidth, chartWidth]);

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
    marginBottom = 10, // the bottom margin, in pixels
    marginLeft = 100, // the left margin, in pixels
    width = 440, // the outer width of the chart, in pixels
    // width, // Add chartWidth as a parameter
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
  let xLabelMargin = 0;
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
    xLabelRotation = -20; // Rotate by 30 degrees for Spanish language
    // Calculate additional margin for rotated x-axis labels in Spanish
    xLabelMargin = 50;
  }
  // Update the margins based on the additional margin required
  const marginBottomAdjusted = marginBottom + xLabelMargin;

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
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("height", height + marginTop + marginBottomAdjusted) // Adjust height
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
    // .attr(
    //   "transform",
    //   `translate(${marginLeft},${height - marginTop - xLabelMargin})`
    // )
    .call(xAxis)
    .selectAll(".tick text") // Select all x-axis tick labels
    .style("text-anchor", language === "es" ? "end" : "center") // Conditionally set text-anchor style
    //.style("text-anchor", "end")
    //.attr("dx", "-0.8em")
    //.attr("dy", "0.15em")
    .attr("transform", `rotate(${xLabelRotation})`); // Rotate the labels

  return svg.node();
}
