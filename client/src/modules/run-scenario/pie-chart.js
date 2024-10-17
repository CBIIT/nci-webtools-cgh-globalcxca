import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { useTranslation } from "react-i18next";

export const defaultLayout = {
  width: 250,
  height: 250,
  margin: 40,
};

export default function PieChart({ id, data, layout = defaultLayout, colors }) {
  const { t, i18n } = useTranslation(); // Add this line
  const translatedLabels = {
    noDataAvailable: t("general.noData"),
    // ... other labels you need ...
  };

  const [chartWidth, setChartWidth] = useState(0); // New state variable for chart width

  const updateChartWidth = useCallback(() => {
    const containerWidth = ref.current.clientWidth;
    let newChartWidth = containerWidth - layout.margin * 4;
    // console.log("containerWidth--", containerWidth);
    // console.log("newChartWidth", newChartWidth);
    if (newChartWidth < 240) {
      newChartWidth = 240;
    }
    setChartWidth(newChartWidth);
  }, [layout.margin]);
  useEffect(() => {
    updateChartWidth();
    const handleResize = () => {
      updateChartWidth();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateChartWidth]);

  const ref = useRef(null);
  // useEffect(() => {
  //   if (ref.current && data && layout) {
  //     while (ref.current.firstChild) {
  //       ref.current.removeChild(ref.current.firstChild);
  //     }

  //     if (isNaN(data[0]?.value) || data.every((item) => item.value === 0)) {
  //       const emptySvg = d3
  //         .create("svg")
  //         //.attr("width", layout.width)
  //         .attr("width", chartWidth)
  //         .attr("height", chartWidth);

  //       // Draw an empty circle in the center of the SVG
  //       emptySvg
  //         .append("circle")
  //         .attr("cx", chartWidth / 2)
  //         .attr("cy", chartWidth / 2)
  //         .attr("r", Math.min(chartWidth, chartWidth) / 2) // Adjust the radius as needed
  //         .attr("fill", "#E8E9E9")
  //         .attr("stroke", "gray")
  //         .attr("stroke-width", 1);

  //       // emptySvg
  //       //   .append("circle")
  //       //   .attr("cx", layout.width / 2)
  //       //   .attr("cy", layout.height / 2)
  //       //   .attr("r", Math.min(layout.width, layout.height) / 3.5) // Adjust the radius as needed
  //       //   .attr("fill", "white")
  //       //   .attr("stroke", "gray")
  //       //   .attr("stroke-width", 1);

  //       emptySvg
  //         .append("text")
  //         .attr("text-anchor", "middle")
  //         .attr("font-size", "1rem")
  //         .attr("dy", "0.35em")
  //         .attr("x", chartWidth / 2)
  //         .attr("y", chartWidth / 2)
  //         .text(translatedLabels.noDataAvailable)
  //         .attr("fill", "gray")
  //         .style("font-weight", "bold"); // Apply bold font weight;

  //       ref.current.appendChild(emptySvg.node());
  //     } else {
  //       ref.current.appendChild(
  //         d3PieChart(data, {
  //           name: (d) => d.label,
  //           value: (d) => d.value,
  //           width: chartWidth,
  //           height: chartWidth,
  //           labelRadius: (Math.min(chartWidth, chartWidth) / 2) * 0.5,
  //           format: ",.0f",
  //           //colors: ["#D13C4B", "#FD7E14"],
  //           colors: colors,
  //           labels: translatedLabels,
  //         })
  //       );
  //     }
  //   }
  // }, [data, layout, colors.chartWidth]);

  useEffect(() => {
    if (ref.current && data && layout) {
      // Remove any existing chart content
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }

      if (isNaN(data[0]?.value) || data.every((item) => item.value === 0)) {
        // Create an empty pie chart
        const emptySvg = d3
          .create("svg")
          .attr("width", chartWidth)
          .attr("height", chartWidth);

        emptySvg
          .append("circle")
          .attr("cx", chartWidth / 2)
          .attr("cy", chartWidth / 2)
          .attr("r", Math.min(chartWidth, chartWidth) / 2.1)
          .attr("fill", "#E8E9E9")
          .attr("stroke", "gray")
          .attr("stroke-width", 1);

        emptySvg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", `${Math.min(chartWidth, chartWidth) * 0.075}px`) // Adjust font size based on chart width
          .attr("dy", "0.35em")
          .attr("x", chartWidth / 2)
          .attr("y", chartWidth / 2)
          .text(translatedLabels.noDataAvailable)
          .attr("fill", "gray")
          .style("font-weight", "bold");

        ref.current.appendChild(emptySvg.node());
      } else {
        // Draw the actual pie chart
        ref.current.appendChild(
          d3PieChart(data, {
            name: (d) => d.label,
            value: (d) => d.value,
            width: chartWidth,
            height: chartWidth,
            labelRadius: (Math.min(chartWidth, chartWidth) / 2) * 0.3,
            format: ",.0f",
            colors: colors,
            labels: translatedLabels,
            chartWidth: chartWidth, // Pass chartWidth as a parameter
          })
        );
      }
    }
  }, [data, chartWidth, colors, translatedLabels]);

  return (
    <div className="img-fluid p-2 pie-chart-container" ref={ref} id={id} />
  );
}

function d3PieChart(
  data,
  {
    name = ([x]) => x, // given d in data, returns the (ordinal) label
    value = ([, y]) => y, // given d in data, returns the (quantitative) value
    title, // given d in data, returns the title text
    width = 150, // outer width, in pixels
    height = 150, // outer height, in pixels
    innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
    outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
    labelRadius = innerRadius * 0.2 + outerRadius * 0.8, // center radius of labels
    format = ",", // a format specifier for values (in the label)
    names, // array of names (the domain of the color scale)
    colors, // array of colors for names
    stroke = innerRadius > 0 ? "none" : "white", // stroke separating widths
    strokeWidth = 1, // width of stroke separating format
    strokeLinejoin = "round", // line join of stroke separating wedges
    padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges
    labels,
    chartWidth, // Accept chartWidth as a parameter
  } = {}
) {
  // Compute values.
  const N = d3.map(data, name);
  const V = d3.map(data, value);
  const I = d3.range(N.length).filter((i) => !isNaN(V[i]));

  // Calculate total value.
  const totalValue = d3.sum(I, (i) => V[i]);
  //console.log("totalValue ", totalValue);

  // Calculate percentages.
  const percentages = I.map((i) => (V[i] / totalValue) * 100);

  // Check if data is empty
  const hasData = data.length > 0;

  // Unique the names.
  if (names === undefined) names = N;
  names = new d3.InternSet(names);

  // Chose a default color scheme based on cardinality.
  if (colors === undefined) colors = d3.schemeSpectral[names.size];
  if (colors === undefined)
    colors = d3.quantize(
      (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
      names.size
    );

  // Construct scales.
  const color = d3.scaleOrdinal(names, colors);

  const formatTotal = d3.format(`.${0}f`); // Specify the desired rounding for the total
  let tooltipData;

  // Compute titles.
  if (title === undefined) {
    const formatValue = d3.format(format);

    title = (i) => {
      // if (hasData) {
      //   const label = N[i].replace("%", "").trim();
      //   const words = label.split(" ");
      //   const lastWord = words[words.length - 1];
      //   return `${formatValue(V[i])} (${percentages[i].toFixed(
      //     1
      //   )}%) ${lastWord}`;
      // } else {
      //   return labels.noDataAvailable;
      // }
      if (hasData) {
        const label = N[i].replace("%", "").trim();
        const words = label.split(" ");
        const lastWord = words[words.length - 1];
        return `${formatValue(V[i])} (${percentages[i].toFixed(
          1
        )}%) ${lastWord}`;
      } else {
        const label = N[i].replace("%", "").trim();
        const words = label.split(" ");
        const lastWord = words[words.length - 1];
        return `${formatValue(V[i])} (${percentages[i].toFixed(
          1
        )}%) ${lastWord}`;
      }
    };

    tooltipData = (i) => {
      if (hasData) {
        const label = N[i].replace("%", "").trim();
        return `${formatValue(V[i])} (${percentages[i].toFixed(
          1
        )}%) ${label}\nTotal: ${formatTotal(totalValue)}`;
      } else {
        //return labels.noDataAvailable;
        const label = N[i].replace("%", "").trim();
        return `${formatValue(V[i])} (${percentages[i].toFixed(
          1
        )}%) ${label}\nTotal: ${formatTotal(totalValue)}`;
      }
    };
  } else {
    const O = d3.map(data, (d) => d);
    const T = title;
    title = (i) => {
      if (hasData) {
        const label = N[i].replace("%", "").trim();
        return `% ${label}: ${percentages[i].toFixed(1)}%\n ${label}: ${T(
          O[i],
          i,
          data
        )}\n `;
      } else {
        //return labels.noDataAvailable;
        const label = N[i].replace("%", "").trim();
        return `% ${label}: ${percentages[i].toFixed(1)}%\n ${label}: ${T(
          O[i],
          i,
          data
        )}\n `;
      }
    };

    tooltipData = (i) => {
      if (hasData) {
        const label = N[i].replace("%", "").trim();
        return `% ${label}: ${percentages[i].toFixed(1)}%\n ${label}: ${T(
          O[i],
          i,
          data
        )}\n Total: ${formatTotal(totalValue)}`;
      } else {
        //return labels.noDataAvailable;
        const label = N[i].replace("%", "").trim();
        return `% ${label}: ${percentages[i].toFixed(1)}%\n ${label}: ${T(
          O[i],
          i,
          data
        )}\n Total: ${formatTotal(totalValue)}`;
      }
    };
  }

  // Calculate labelRadius based on the percentage of the pie chart
  const maxPercentage = Math.max(...percentages);
  const minPercentage = Math.min(...percentages);
  const maxLabelRadius = outerRadius * 0.2; // Adjust as needed
  const minLabelRadius = outerRadius * -0.2; // Adjust as needed
  const adjustedLabelRadius = d3
    .scaleLinear()
    .domain([minPercentage, maxPercentage])
    .range([minLabelRadius, maxLabelRadius]);

  // Construct arcs.
  const arcs = d3
    .pie()
    .padAngle(padAngle)
    .sort(null)
    .value((i) => V[i])(I);
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const tooltip = d3
    .select(svg.node().parentNode)
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "red");

  svg
    .append("g")
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linejoin", strokeLinejoin)
    .selectAll("path")
    .data(arcs)
    .join("path")
    .attr("fill", (d) => color(N[d.data]))
    .attr("d", arc)
    .on("mouseover", (event, d) => {
      const [x, y] = d3.pointer(event);
      tooltip
        .style("visibility", "visible")
        .style("left", `${x}px`)
        .style("top", `${y}px`)
        .html(`${tooltipData(d.data)}`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    })
    .append("title")
    .text((d, i) => `${tooltipData(d.data)} `)
    .attr("font-size", "1rem");

  svg
    .append("g")
    .attr("font-family", "system-ui, sans-serif")
    .attr("font-size", 11)
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
    .attr("transform", (d) => {
      const pos = arcLabel.centroid(d);
      const isLeftHalf =
        d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI;
      let xAdjustment = 0;

      // // Adjust label position based on whether it's in the left or right half of the pie chart
      // if (isLeftHalf) {
      //   pos[1] += 10;
      // }
      const label = title(d.data);
      //if (d.endAngle - d.startAngle === Math.PI) {
      if (label.includes("(50.0%)") || d.endAngle - d.startAngle === Math.PI) {
        // When the arc is at 50%/50%, adjust the position to align labels horizontally
        if (isLeftHalf) {
          xAdjustment = 15; // Move the left half pie's label to the left
        } else {
          xAdjustment = -15; // Move the right half pie's label to the right
        }
        pos[1] = 0; // Adjust y-coordinate for horizontal alignment
      } else {
        pos[1] += 10; // Adjust y-coordinate for horizontal alignment
      }

      pos[0] += xAdjustment;

      pos[0] += xAdjustment;

      return `translate(${pos})`;
    })
    .attr("fill", "white")
    .selectAll("tspan")
    // .data((d) => {
    //   const lines = `${title(d.data)}`.split(/\n/);
    //   return d.endAngle - d.startAngle > 0.5 ? lines : lines.slice(0, 1);
    // })
    .data((d, i, nodes) => {
      const label = title(d.data);
      const lines = [];      
      const isLeftHalf = (d.startAngle + d.endAngle) / 2 <= Math.PI; // Mid-angle check      console.log("d.satrtAngle ", d.startAngle);
      
      // Split the label into numeric and description parts
      const splitLabel = label.split(")");
      const numericPart = `${splitLabel[0]})`.trim(); // Ensure trailing parenthesis is included
      const descriptionPart = splitLabel[1]?.trim() || ""; // Handle missing description gracefully

      // Push the numeric part first, then the description part (consistent order)
        if (isLeftHalf){
          lines.push(descriptionPart);
          lines.push(numericPart);
        }else{
          lines.push(numericPart);
          lines.push(descriptionPart);
        }
 


      return lines;
    })
    .join("tspan")
    .attr("x", 0)    
    .attr("dy", function (d, i, nodes) {
      const isLeftHalf =
        d.startAngle === 0 ;
    
      const lineHeight = 2.5; // Consistent line height in pixels
      const totalLines = nodes.length;
    
      // Adjust spacing based on whether it's in the left or right half
      if (isLeftHalf) {
        // Left half: Slightly tighter spacing
        return i === 0 ? `-${(totalLines - 1) * lineHeight / 2}px` : `${lineHeight}px`;
      } else {
        // Right half: Normal spacing
        return i === 0 ? `-${(totalLines - 1) * lineHeight / 2}px` : `${lineHeight -12}px`;
      }
    })
    .attr("y", (_, i, nodes) =>
      i
        ? `${i * 1}em`
        : `${adjustedLabelRadius(
            percentages[d3.select(nodes[i].parentNode).datum().index]
          )}px`
    ) // Use adjustedLabelRadius based on percentage
    .attr("font-weight", "bold")
    .text((d) => d);

  return Object.assign(svg.node(), { scales: { color }, arc });
}

// Function to wrap text
function wrapText(text, width = 12) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = [];
  words.forEach((word) => {
    if ((line + word).length > width) {
      lines.push(line);
      line = "";
    }
    line += `${word} `;
  });
  lines.push(line);
  return lines;
}
