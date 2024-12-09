import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.csv("data.csv")
  .then((data) => {

    const moviesOnly = data.filter((d) => d.Type === "Movie");


    const groupedData = d3.rollup(
      moviesOnly,
      (v) => v.length, 
      (d) => d.Country
    );


    const processedData = Array.from(groupedData, ([Country, Count]) => ({
      Country,
      Count,
    }));


    processedData.sort((a, b) => d3.ascending(a.Country, b.Country));

    const svgWidth = 1500;
    const svgHeight = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3
      .select("#moviePlot")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(processedData.map((d) => d.Country))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.Count)]) 
      .nice()
      .range([height, 0]);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));


    const tooltip = d3.select("#tooltip");


    g.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.Country))
      .attr("y", (d) => y(d.Count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.Count))
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").text(`Aantal films: ${d.Count}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));
  })
  .catch((error) => {
    console.error("Error loading the CSV file:", error);
  });
