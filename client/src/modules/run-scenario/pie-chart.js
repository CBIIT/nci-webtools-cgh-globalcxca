import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useTranslation } from "react-i18next";

export const defaultLayout = {
  width: 250,
  height: 250,
  margin: 20,
};

export default function PieChart({ id, data, layout = defaultLayout, colors }) {
  const { t, i18n } = useTranslation(); // Add this line
  const translatedLabels = {
    noDataAvailable: t("general.noDataAvailable"),
    // ... other labels you need ...
  };

  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && data && layout) {
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }

      if (isNaN(data[0]?.value) || data.every((item) => item.value === 0)) {
        let emptyData = [{ label: "Empty", value: 1 }];

        const emptySvg = d3
          .create("svg")
          .attr("width", layout.width)
          .attr("height", layout.height);

        // Draw an empty circle in the center of the SVG
        emptySvg
          .append("circle")
          .attr("cx", layout.width / 2)
          .attr("cy", layout.height / 2)
          .attr("r", Math.min(layout.width, layout.height) / 2) // Adjust the radius as needed
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("stroke-width", 2);

        emptySvg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "1rem")
          .attr("dy", "0.35em")
          .attr("x", layout.width / 2)
          .attr("y", layout.height / 2)
          .text(translatedLabels.noDataAvailable)
          .attr("fill", "gray")
          .style("font-weight", "bold"); // Apply bold font weight;

        ref.current.appendChild(emptySvg.node());
      } else {
        ref.current.appendChild(
          d3PieChart(data, {
            name: (d) => d.label,
            value: (d) => d.value,
            width: layout.width,
            height: layout.height,
            labelRadius: (Math.min(layout.width, layout.height) / 2) * 0.5,
            format: ",.0f",
            //colors: ["#D13C4B", "#FD7E14"],
            colors: colors,
            labels: translatedLabels,
          })
        );
      }
    }
  }, [data, layout, colors]);

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
    width = 200, // outer width, in pixels
    height = 200, // outer height, in pixels
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
  } = {}
) {
  // Compute values.
  const N = d3.map(data, name);
  const V = d3.map(data, value);
  const I = d3.range(N.length).filter((i) => !isNaN(V[i]));

  // Calculate total value.
  const totalValue = d3.sum(I, (i) => V[i]);

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
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
    .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
    .attr("font-size", "0.7rem")
    .attr("fill", "white")
    .selectAll("tspan")
    .data((d) => {
      const lines = `${title(d.data)}`.split(/\n/);
      return d.endAngle - d.startAngle > 0.5 ? lines : lines.slice(0, 1);
    })
    .join("tspan")
    .attr("x", 0)
    .attr("y", (_, i) => `${i * 1}em`)
    .attr("font-weight", (_, i) => (i ? null : "bold"))
    .text((d) => d);

  return Object.assign(svg.node(), { scales: { color } });
}
