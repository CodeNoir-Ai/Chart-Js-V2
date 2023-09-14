// generateLineChart.js
import * as d3 from 'd3';


/**
 * @param {Object} svg - The D3 Selection for the SVG element to draw in.
 * @param {Array} data - The data to plot.
 * @param {Number} width - The width of the SVG element.
 * @param {Number} height - The height of the SVG element.
 */
export const generateLineChart = (svg, g, data, width, height, enableLineDrawing) => {
  // Create scales
  g.selectAll('*').remove();

    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.Date))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Close)])
      .nice()
      .range([height, 0]);
  
    // Create line generator
    const line = d3.line()
      .x(d => x(d.Date))
      .y(d => y(d.Close));

      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

  
    // Add x-axis grid lines
    const xAxisGrid = d3.axisBottom(x)
      .tickSize(-height)
      .tickFormat('')
      .ticks(6);



    const zoomRect = g.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all");
  
    g.append("g")
      .attr("class", "x-grid")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxisGrid);
  
    // Add y-axis grid lines
    const yAxisGrid = d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat('')
      .ticks(10);
  
    g.append("g")
      .attr("class", "y-grid")
      .call(yAxisGrid);
 
    // Add the y-axis
    g.append("g")
      .call(d3.axisLeft(y));
  


      const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

     

      const linePath = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#85bb65")
      .attr("stroke-width", 1)
      .attr("d", line);
  
    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("display", "none");
  
    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.Date))  // Make sure the attribute names match your data
      .attr("cy", d => y(d.Close))
      .attr("r", 3)
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block')
          .html(`
            <div>Date: ${d.Date}</div>
            <div>Close Price: ${d.Close}</div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });
  
    // Add crosshair
    const crosshair = g.append('g').style('display', 'none');
    const crosshairX = crosshair.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height);
    const crosshairY = crosshair.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width);
  
    svg.on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event);
      crosshair.style('display', null);
      crosshairX.attr("x1", mx).attr("x2", mx);
      crosshairY.attr("y1", my).attr("y2", my);
    });
  
    svg.on("mouseleave", () => {
      crosshair.style("display", "none");
    });


// ... (your existing code)


    const zoom = d3.zoom()
                .scaleExtent([1, 20])
                .on("zoom", (event) => {
                    const transform = event.transform;
                    const newX = transform.rescaleX(x);
                    g.select(".x-axis").call(xAxis.scale(newX));
                    g.selectAll(".dot")
                    .attr("cx", d => newX(d.Date));  // Use d.Date, not new Date(d.date)
                    line.x(d => newX(d.Date));  // Update the line generator's x-scale
                    linePath.attr("d", line(data));  // Re-render the line path
                });
                zoomRect.call(zoom);


            //Generate Line 

         // Add this variable at the top of your function
let lineStartPoint = null;
// Add mousedown event for line drawing

if(enableLineDrawing)
{
  zoomRect.on("mousedown", (event) => {
    console.log("mousedownistriggerd")
    console.log(enableLineDrawing)
    const [mx, my] = d3.pointer(event);
    const mouseX = mx;
    const mouseY = my;
  
    if (!lineStartPoint) {
      lineStartPoint = { x: mouseX, y: mouseY };
    } else {
      g.append("line")
        .attr("x1", lineStartPoint.x)
        .attr("y1", lineStartPoint.y)
        .attr("x2", mouseX)
        .attr("y2", mouseY)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);
      lineStartPoint = null;
    }
  });
  
  // Add mousemove event for temporary line drawing
  zoomRect.on("mousemove", (event) => {
    console.log("mouse is moving")
    if (lineStartPoint) {
      const [mx, my] = d3.pointer(event);
      const mouseX = mx;
      const mouseY = my;
  
      // Remove old temporary line
      g.selectAll(".temp-line").remove();
  
      // Draw a new temporary line
      g.append("line")
        .attr("class", "temp-line")
        .attr("x1", lineStartPoint.x)
        .attr("y1", lineStartPoint.y)
        .attr("x2", mouseX)
        .attr("y2", mouseY)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4");
    }
  });
  
}else { 
  zoomRect.on("mousedown", null)
  zoomRect.on("mousemove", null)
}

// Add these event listeners at the bottom of your function








  };
  

export const generateCandleStickChart = (svg, g, data, width, height) => { 

  g.selectAll('*').remove();

  const x = d3.scaleUtc()
  .domain(d3.extent(data, d => new Date(d.Date)))  // Assuming Date is in correct format
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.Close)])
  .nice()
  .range([height, 0]);

// Axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);


  const yAxisGrid = d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
            .ticks(10);

        g.append("g")
            .attr("class", "y-grid")
            .call(yAxisGrid);

   // Add x-axis grid lines
   const xAxisGrid = d3.axisBottom(x)
   .tickSize(-height)
   .tickFormat('')
   .ticks(6);

   const zoomRect = g.append("rect")
   .attr("width", width)
   .attr("height", height)
   .attr("fill", "none")
   .attr("pointer-events", "all");

g.append("g")
   .attr("class", "x-grid")
   .attr("transform", `translate(0, ${height})`)
   .call(xAxisGrid);

   g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Bars
  const initialWidth = 6;
  const bars = g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(new Date(d.Date)) - initialWidth / 2)
    .attr("y", d => y(Math.max(d.Open, d.Close)))
    .attr("height", d => Math.abs(y(d.Open) - y(d.Close)))
    .attr("width", initialWidth)
    .attr("fill", d => d.Open > d.Close ? "red" : "green");
 
  // Lines for High and Low
  const lines = g.selectAll(".line")
    .data(data)
    .enter().append("line")
    .attr("class", "line")
    .attr("x1", d => x(new Date(d.Date)))
    .attr("y1", d => y(d.high))
    .attr("x2", d => x(new Date(d.Date)))
    .attr("y2", d => y(d.low))
    .attr("stroke", d => d.Open > d.Close ? "red" : "green");


    const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", (event) => {
        const transform = event.transform;
        const minTranslateX = (1 - transform.k) * x(new Date(data[0].Date));
        if (transform.x > minTranslateX) {
            transform.x = minTranslateX;
        }
        const newX = transform.rescaleX(x);
        const newWidth = initialWidth * Math.sqrt(transform.k); 
        g.select(".x-axis").call(xAxis.scale(newX));
        bars.attr("x", d => newX(new Date(d.Date)) - newWidth / 2)
            .attr("width", newWidth);
        lines.attr("x1", d => newX(new Date(d.Date)))
            .attr("x2", d => newX(new Date(d.Date)));
    });

    zoomRect.call(zoom);
}





//This generates the specfic Chart Based on selection 

// This generates the specific Chart Based on selection
// This generates the specific Chart Based on selection
export const generateChart = (chartType, svg, g, data, width, height) => {
  // Clear previous chart elements
  svg.selectAll('*').remove();

  // Create a new group element
  const newG = svg.append("g").attr("transform", "translate(0, 0)");

  switch(chartType) {
    case 'line':
      return generateLineChart(svg, newG, data, width, height);
    case 'candlestick':
      return generateCandleStickChart(svg, newG, data, width, height);
    default:
      return null;
  }
};
