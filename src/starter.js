import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

const margin = { top: 20, right: 10, bottom: 100, left: 10 };

// scale
const xScale = d3
  .scaleBand()
  .range([margin.left, width - margin.right])
  .paddingInner(0.1);

const colorScale = d3
  .scaleSequential()
  .domain([0.8, -0.8])
  .interpolator(d3.interpolateRgbBasis(["blue", "white", "red"]));

const xLegendScale = d3
  .scaleBand()
  .range([width / 2 - 140, width / 2 + 140])
  .paddingInner(0.1);

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data

let rects;
let data = [];
let xAxis;
let legendData;
let legendRects, legendLabels;

d3.csv("data/temperature-anomaly-data.csv").then((raw_data) => {
  //   console.log(raw_data);

  data = raw_data
    .filter((d) => d.Entity == "Global")
    .map((d) => d)
    .map((d) => {
      const obj = {};
      obj.year = parseInt(d.Year);
      obj.avg = +d["Global average temperature anomaly relative to 1961-1990"];
      return obj;
    });

  legendData = d3.range(
    d3.min(data, (d) => d.avg),
    d3.max(data, (d) => d.avg),
    0.2
  );

  xScale.domain(data.map((d) => d.year));

  xAxis = d3
    .axisBottom(xScale)
    .tickValues(xScale.domain().filter((d) => !(d % 10)));
  // d(연도 데이터)를 10으로 나눴을 때 0이면 거짓, 0이 아니면 참이고 참일 때 데이터가 나옴
  // 그래서 10년 단위로 x바가 나오게 하기 위해 !()로 반전시켜주는 것

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .attr("class", "x-axis")
    .call(xAxis);

  rects = svg
    .selectAll("rects")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.year))
    .attr("y", margin.top)
    .attr("width", xScale.bandwidth())
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", (d) => colorScale(d.avg));

  xLegendScale.domain(legendData.map((d, i) => i));

  legendRects = svg
    .selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xLegendScale(i))
    .attr("y", height - margin.bottom + 50)
    .attr("width", xLegendScale.bandwidth())
    .attr("height", 20)
    .attr("fill", (d) => colorScale(d));

  legendLabels = svg
    .selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", (d, i) => xLegendScale(i) + xLegendScale.bandwidth() / 2)
    .attr("y", height - margin.bottom + 65)
    .text((d) => d3.format("0.1f")(d))
    .attr("class", "legend-labels")
    .style("fill", (d) => (d >= 0.5 ? "#fff" : "#111"));
});
