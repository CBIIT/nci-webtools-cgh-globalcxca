import { useRef, useEffect } from "react";
import * as d3 from "d3";

export const defaultLayout = {
  width: 450,
  height: 450,
  margin: 20,
};

export default function PieChart({ data, layout = defaultLayout }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && data && layout) {
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }

      ref.current.appendChild(
        d3PieChart(data, {
          name: (d) => d.label,
          value: (d) => d.value,
          width: layout.width,
          height: layout.height,
          labelRadius: (Math.min(layout.width, layout.height) / 2) * 0.5,
          format: ".1%",
        })
      );
    }
  });

  return <div className="img-fluid p-2" ref={ref} />;
}

function d3PieChart(
  data,
  {
    name = ([x]) => x, // given d in data, returns the (ordinal) label
    value = ([, y]) => y, // given d in data, returns the (quantitative) value
    title, // given d in data, returns the title text
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
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
  } = {}
) {
  // Compute values.
  const N = d3.map(data, name);
  const V = d3.map(data, value);
  const I = d3.range(N.length).filter((i) => !isNaN(V[i]));

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

  // Compute titles.
  if (title === undefined) {
    const formatValue = d3.format(format);
    title = (i) => `${N[i]}\n${formatValue(V[i])}`;
  } else {
    const O = d3.map(data, (d) => d);
    const T = title;
    title = (i) => T(O[i], i, data);
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
    .style("background", "#000")
    .text("a simple tooltip");

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
        .text(title(d.data));
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    })
    .append("title")
    .text((d) => title(d.data))
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
    .attr("font-size", "1rem")
    .attr("fill", "white")
    .selectAll("tspan")
    .data((d) => {
      const lines = `${title(d.data)}`.split(/\n/);
      return d.endAngle - d.startAngle > 0.25 ? lines : lines.slice(0, 1);
    })
    .join("tspan")
    .attr("x", 0)
    .attr("y", (_, i) => `${i * 1.1}em`)
    .attr("font-weight", (_, i) => (i ? null : "bold"))
    .text((d) => d);

  return Object.assign(svg.node(), { scales: { color } });
}
