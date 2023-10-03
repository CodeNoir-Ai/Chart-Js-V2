// generateLineChart.js
import exp from 'constants';
import * as d3 from 'd3';
import _, { maxBy } from 'lodash';
import next from 'next';

/**
 * @param {Object} svg - The D3 Selection for the SVG element to draw in.
 * @param {Array} data - The data to plot.
 * @param {Number} width - The width of the SVG element.
 * @param {Number} height - The height of the SVG element.
 */

export const manageLineDrawing = (svg, g, overlay, enableLineDrawing, drawingType = 'trend') => {


  let lineStartPoint = null;
  let tempLine = null;
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;





  if (enableLineDrawing) {

  
    overlay.on("click", (event) => {
      if (!enableLineDrawing) return;

      const [mx, my] = d3.pointer(event);
      const mouseX = mx;
      const mouseY = my;


      //Convert pixel-space to data space 
    
  





      if (!lineStartPoint) {
        lineStartPoint = { x: mouseX, y: mouseY};

        tempLine = g.append("line")
          .attr("class", "temp-line")
          .attr("x1", lineStartPoint.x)
          .attr("y1", lineStartPoint.y)
          .attr("x2", mx)
          .attr("y2", my)
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)

        
      } else {
        if (drawingType === 'trend') {
          tempLine.remove();
          g.append("line")
            .attr("class", "draw-line")
            .attr("x1", lineStartPoint.x)
            .attr("y1", lineStartPoint.y)
            .attr("x2", mouseX)
            .attr("y2", mouseY)
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);



          


          lineStartPoint = null;

  // Update the temporary line on mouse move
  overlay.on("mousemove", (event) => {
    if (lineStartPoint && tempLine) {
      const [mx, my] = d3.pointer(event);
      tempLine.attr("x2", mx).attr("y2", my);
    }
  });
        }else if (drawingType === 'ray') {
          let startPoint = null;
          let rayLine = null;
          
          if (!startPoint) {
            // Capture the starting point
            startPoint = { x: mx, y: my };
        } else {
            // If a ray line already exists, remove it
            if (rayLine) rayLine.remove();
    
            // Draw the permanent ray line
            rayLine = g.append("line")
                .attr("class", "ray-line")
                .attr("x1", startPoint.x)
                .attr("y1", startPoint.y)
                .attr("x2", mx)
                .attr("y2", my)
                .attr("stroke", "blue")
                .attr("stroke-width", 1.5);
    
                

            // Reset the starting point
            startPoint = null;
             // Disable further drawing + Second click
            enableLineDrawing = false;
        }


        overlay.on("mousemove", (event) => {
          if (startPoint && enableLineDrawing) {
            const [mx, my] = d3.pointer(event);

              const deltaX = mx - startPoint.x;
              const deltaY = my - startPoint.y;
              // Calculate the slope and extend the line to the edge
              const slope = (my - startPoint.y) / (mx - startPoint.x);
              let endX, endY;
              
              //This checks if mouse has moved to the right of the staring point
              if (deltaX >= 0) {
                endX = width;
                endY = startPoint.y + slope * (width - startPoint.x);
              
            } else {
                endX = 0;
                endY = startPoint.y - slope * startPoint.x;
            }

            
            

              // If a temporary line already exists, update its end point
              if (rayLine) {
                  rayLine.attr("x2", endX).attr("y2", endY);
              } else {
                  // Otherwise, create a new temporary line
                  rayLine = g.append("line")
                      .attr("class", "temp-ray-line")
                      .attr("x1", startPoint.x)
                      .attr("y1", startPoint.y)
                      .attr('pointer-events','none')
                      .attr("x2", endX)
                      .attr("y2", endY)
                      .attr("stroke", "red")
                      .attr("stroke-width", 1.5)
                      .attr("stroke-dasharray", "4 4");

                      // enableLineDrawing = false; // Disable line drawing after second click for trend line

              }
          }
      });
      


        }
        else if (drawingType === 'extended-line') {
          let startPoint = null;
          let rayLine = null;
          
          if (!startPoint) {
            const [mx, my] = d3.pointer(event)
            startPoint = { x: mx, y: my };
        } else {
            // If a ray line already exists, remove it
            if (rayLine) rayLine.remove();
            rayLine = null
            startPoint = null
            enableLineDrawing = true;
        }


        overlay.on("mousemove", (event) => {
          if (startPoint && enableLineDrawing) {
            const [mx, my] = d3.pointer(event);

              //Calculate the angle 0 
              const theta = Math.atan2(my - startPoint.y, mx - startPoint.x);

              const endYLeft = startPoint.y - startPoint.x * Math.tan(theta);
              const endYRight = startPoint.y + (width - startPoint.x) * Math.tan(theta);

              // If a temporary line already exists, update its end point
              if (rayLine) {
                rayLine.attr("x1", 0)
                  .attr("y1", endYLeft)
                  .attr("x2", width)
                  .attr("y2", endYRight)
              } else {
                  // Otherwise, create a new temporary line
                  rayLine = g.append("line")
                      .attr("class", "temp-ray-line")
                      .attr("x1", 0)
                      .attr("y1", endYLeft)
                      .attr("x2", width)
                      .attr("y2", endYRight)
                      .attr('pointer-events','none')
                      .attr("stroke", "red")
                      .attr("stroke-width", 1.5)
                      // .attr("stroke-dasharray", "4 4");
                      // enableLineDrawing = false; // Disable line drawing after second click for trend line

              }
          }
      });
      


    }else if (drawingType == "horizontal-line-ray"){ 
          let horizontalLineRay = null;

          overlay.on("click", (event) => {
              const [mx, my] = d3.pointer(event);
      
              // If a horizontal line already exists, remove it
              if (horizontalLineRay) horizontalLineRay.remove();
      
              // Draw the horizontal line from the clicked point to the right edge of the chart
              horizontalLineRay = g.append("line")
                  .attr("class", "horizontal-line-ray")
                  .attr("x1", mx) // starts from the click piont
                  .attr("y1", my)
                  .attr("x2", width) // Extend to the right edge of the chart
                  .attr("y2", my)
                  .attr("stroke", "green")
                  .attr("stroke-width", 1.5);
          });
        }else if (drawingType == "horizontal-line")
        { 
          let horizontalLine = null;


          overlay.on("click", (event) => {
            const [mx, my] = d3.pointer(event); 
            if(horizontalLine) horizontalLine.remove();


            horizontalLine = g.append("line")
            .attr('class'," horizonal-line")
            .attr("x1", 0) // Start from the edge of the chart 
            .attr("y1", my)
            .attr("x2", width) //Extend to the edge of the width 
            .attr("y2", my)
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
          });

      
        }else if  (drawingType == "vertical") { 
          let verticalLine = null;

          overlay.on("click", (event) => {
              const [mx, my] = d3.pointer(event);
      
              // If a vertical line already exists, remove it
              if (verticalLine) verticalLine.remove();
      
              // Draw the vertical line from the top edge to the bottom edge of the chart at the clicked x-coordinate
              verticalLine = g.append("line")
                  .attr("class", "vertical-line")
                  .attr("x1", mx)
                  .attr("y1", 0) // Start from the top edge of the chart
                  .attr("x2", mx)
                  .attr("y2", height) // Extend to the bottom edge of the chart
                  .attr("stroke", "purple")
                  .attr("stroke-width", 1.5);
          });
        }else if (drawingType === "cross-line")
        { 
          let crossLineHorizontal = null;
          let crossLineVertical = null;

          
          overlay.on("click", (event) => {
            const [mx, my] = d3.pointer(event);
    
            // If a vertical line already exists, remove it
            if (crossLineHorizontal) crossLineHorizontal.remove();
            if(crossLineVertical) crossLineVertical.remove();

            // Draw the vertical line from the top edge to the bottom edge of the chart at the clicked x-coordinate
            crossLineVertical = g.append("line")
                .attr("class", "cross-line-horizontal")
                .attr("x1", mx)
                .attr("y1", 0) // Start from the top edge of the chart
                .attr("x2", mx)
                .attr("y2", height) // Extend to the bottom edge of the chart
                .attr("stroke", "purple")
                .attr("stroke-width", 1.5);



            crossLineHorizontal = g.append("line")
            .attr('class', "cross-line-vertical")
            .attr("x1", 0)
            .attr("y1", my)
            .attr("x2", width)
            .attr("y2", my)
            .attr("stroke", "purple")
            .attr("stroke-width", 1.5)
            
        });




        } else if (drawingType === "fib") {
          let startPoint = null;
          let endPoint = null;
          let tempLines = []
          let tempRects = []
          const fibColors = ["orange", "pink", "blue", "green", "purple"]; 

          const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 1];
      
          overlay.on("click", (event) => {
              const [mx, my] = d3.pointer(event);
      
              if (!startPoint) {
                  // Capture the starting point
                  startPoint = { x: mx, y: my };

                  //Create etemp lines for each Fib level
                  fibLevels.forEach((level, index) =>  { 
                    const tempLine = g.append("line")
                      .attr("x1", mx)
                      .attr("y1", my)
                      .attr("x2", width)
                      .attr("y2", my)
                      .attr("stroke", "blue")
                      .attr("stroke-width", 1.5)
                    tempLines.push(tempLine)

                    if(index < fibLevels.length - 1 ) { 
                      const tempRect = g.append("rect")
                      .attr("x", mx) 
                      .attr("y", my)
                      .attr("width", width)
                      .attr("height", 0)
                      .attr("fill", fibColors[index])
                      .attr("opacity", 0.5)
                    tempRects.push(tempRect)
                    }

                  })


              } else {

                //Remove the Temp lines 
                tempLines.forEach(line => line.remove())
                tempRects.forEach(rect => rect.remove())
                tempLines = []
                tempRects = []


                  // Capture the ending point
                  endPoint = { x: mx, y: my };


                  //Determine the direction of the drawing 
                  const direction = mx < startPoint.x ? "left" : "right";

                
                  // Calculate the difference between start and end y-coordinates
                  const yDiff = endPoint.y - startPoint.y;
                  // Draw horizontal lines at Fibonacci levels
                  fibLevels.forEach((level, index) => {
                      const y = startPoint.y + yDiff * level;
                      let lineX1, lineX2, rectX, rectWidth;

                      if (direction === "left") {
                        lineX1 = 0;
                        lineX2 = startPoint.x;
                        rectX = 0;
                        rectWidth = startPoint.x;
                    } else {
                        lineX1 = startPoint.x;
                        lineX2 = width;
                        rectX = startPoint.x;
                        rectWidth = width - startPoint.x;
                    }


                      g.append("line")
                          .attr("x1", lineX1)
                          .attr("y1", y)
                          .attr("x2", lineX2)
                          .attr("y2", y)
                          .attr("stroke", "blue")
                          .attr("stroke-width", 1.5)

                     if (index < fibLevels.length - 1) {
                     const nextY = startPoint.y + yDiff * fibLevels[index + 1];
                            g.append("rect")
                                .attr("x", rectX)
                                .attr("y", y)
                                .attr("width", rectWidth)
                                .attr("height", nextY - y)
                                .attr("fill", fibColors[index])
                                .attr("opacity", 0.5);
                        }
                  });
      
                  // Reset the points for next drawing
                  startPoint = null;
                  // endPoint = null;
              }
          });
            // Update the temporary lines on mouse move  
            overlay.on("mousemove", (event) => {
              if (startPoint && tempLines.length) {
                  const [mx, my] = d3.pointer(event);
                  const yDiff = my - startPoint.y;
                  const direction = mx < startPoint.x ? "left" : "right";
          
                  tempLines.forEach((line, index) => {
                      const y = startPoint.y + yDiff * fibLevels[index];
                      if (direction === "left") {
                          line.attr("x1", 0).attr("x2", startPoint.x);
                      } else {
                          line.attr("x1", startPoint.x).attr("x2", width);
                      }
                      line.attr("y1", y).attr("y2", y);
                  });
          
                  tempRects.forEach((rect, index) => {
                    const y = startPoint.y + yDiff * fibLevels[index];
                    const nextY = startPoint.y + yDiff * fibLevels[index + 1];
                    const rectHeight = Math.abs(nextY - y);
                    const rectY = yDiff >= 0 ? y : y - rectHeight;
        
                    if (direction === "left") {
                        rect.attr("x", 0).attr("width", startPoint.x);
                    } else {
                        rect.attr("x", startPoint.x).attr("width", width - startPoint.x);
                    }
                    rect.attr("y", rectY).attr("height", rectHeight);
                });
        
              }
          });
          


      }
      
      }
    });

   
  }
};


const movingAverage = (data, numberOfPricePoints) => {
  return data.map((row, index, total) => {
    const start = Math.max(0, index - numberOfPricePoints);
    const end = index;
    const subset = total.slice(start, end + 1);
    const sum = subset.reduce((a, b) => {
      return a + b['Close'];
    }, 0);
    return {
      date: row['Date'],
      average: sum / subset.length
    };
  });
};

//Calculate the Exponential moving averagae.

const exponentialMovingAverage = (data, numberOfPricePoints) => {
  let emaArray = [];
  let previousEma;

  const alpha = 2 / (numberOfPricePoints + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < numberOfPricePoints) {
      // For the initial data points where EMA can't be computed, we'll use SMA as a starting point
      const subset = data.slice(0, i + 1);
      const sum = subset.reduce((a, b) => a + b['Close'], 0);
      previousEma = sum / subset.length;
    } else {
      // Calculate EMA
      previousEma = (data[i]['Close'] * alpha) + (previousEma * (1 - alpha));
    }

    emaArray.push({
      date: data[i]['Date'],
      average: previousEma
    });
  }

  return emaArray;
};



export const generateLineChart = (svg, g, data, width, height, enableLineDrawing, priceAxiesRef, showMovingAverage,showExponentialMovingAverage ) => {
  // Create scales
  g.selectAll('*').remove();
  d3.select(priceAxiesRef.current).selectAll("*").remove();

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.Date))
    .range([0, width])
 

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.Close), d3.max(data, d => d.Close)])
    .range([height, 0]);


  // Create line generator
  const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.Close));

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  

  console.log("In the generate line fucntion", x.invert(150))
  

  const zoomRect = g.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all");


  // Add x-axis grid lines
  // const xAxisGrid = d3.axisBottom(x)
  //   .tickSize(-height)
  //   .tickFormat('')
  //   .ticks(10);

  // g.append("g")
  //   .attr("class", "x-grid")
  //   .attr("transform", `translate(0, ${height})`)
  //   .call(xAxisGrid);

  // Add y-axis grid lines
  const yAxisGrid = d3.axisLeft(y)
    .tickSize(-width)
    .tickFormat('')
    .ticks(10);

  g.append("g")
    .attr("class", "y-grid")
    .call(yAxisGrid);

  // Add the y-axis to the right
  const yAxisGroup = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width}, 0)`)
  //Draws the y axies 
  //  .call(d3.axisRight(y)); 

  yAxisGroup.select(".domain").remove();



  const xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));



  xAxis.tickSize(-height)



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

  d3.select(svg.node().parent).on("mousemove", (event) => {
    const [mx, my] = d3.pointer(event);
    crosshair.style('display', "contents");
    crosshairX.attr("x1", mx).attr("x2", mx);
    crosshairY.attr("y1", my).attr("y2", my);      
  });

  d3.select(svg.node().parent).on("mouseleave", () => {
    crosshair.style("display", "none");
  });

// Append a transparent overlay rectangle on top of everything
const overlay = g.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "none")
  .attr("class", "overlay")  // <-- Add this line
  .attr("pointer-events", "all");  // This ensures the rectangle captures all mouse events


  // move out of line drawing


  // console.log(x.invert(150), "This is hte xcale with date")
  manageLineDrawing(svg, g, overlay, enableLineDrawing);

// calculates simple moving average over 50 days
const movingAverageData = movingAverage(data, 50);
const exponentialMovingAverageData = exponentialMovingAverage(data, 50)


const exponentialLine = d3
.line()
.x(d => x(d.date))
.y(d => y(d.average))
 .curve(d3.curveBasis);
g
 .append('path')
 .data([exponentialMovingAverageData])
 .style('fill', 'none')
 .attr('id', 'expmovingAverageLine')
 .attr('stroke', '#FF8900')
 .attr('d', exponentialLine)


//Create the Moving Average indicator to be displayed on the chart 
const movingAverageLine = d3
 .line()
 .x(d => x(d.date))
 .y(d => y(d.average))
  .curve(d3.curveBasis);
g
  .append('path')
  .data([movingAverageData])
  .style('fill', 'none')
  .attr('id', 'movingAverageLine')
  .attr('stroke', '#FF8900')
  .attr('d', movingAverageLine)


// generates moving average curve when called
if (showMovingAverage) {
  g.select("#movingAverageLine").style("display", null); // or "block"

  
} else {
  g.select("#movingAverageLine").style("display", "none");
}

if(showExponentialMovingAverage)
{ 
  g.select("#expmovingAverageLine").style("display", null); // or "block"

} else { 
  g.select("#expmovingAverageLine").style("display", "none");

}




  const zoom = d3.zoom()
  .scaleExtent([1, 20])
  .on("zoom", (event) => {
    const transform = event.transform;
    const newX = transform.rescaleX(x);

    // Update the main line and dots
    g.select(".x-axis").call(xAxis.scale(newX));
    g.selectAll(".dot")
      .attr("cx", d => newX(d.Date));
    linePath.attr("d", line.x(d => newX(d.Date)));

    movingAverageData.forEach(d => {
    });
    
    exponentialMovingAverageData.forEach(d => {
    });
    

    

    
    movingAverageLine.x(d => newX(d.date));
    g.select("#movingAverageLine").attr("d", movingAverageLine(movingAverageData));
    
    exponentialLine.x(d => newX(d.date));
    g.select("#expmovingAverageLine").attr("d", exponentialLine(exponentialMovingAverageData));
    

  });

g.call(zoom);





  // Create SVG element for price axis
  const priceAxisSvg = d3.select(priceAxiesRef.current)
    .append("svg")
    .attr("width", 50)  // Width of the price axis container
    .attr("height", height)  // Set the height to be the same as the main SVG
    .attr("class", "price-axis-container");



  // Generate price labels similar to how you did for the main y-axis
  const yAxisTicks = y.ticks(10);  // Same number of ticks as y-grid
  yAxisTicks.forEach(tick => {
    priceAxisSvg.append('text')
      .attr('x', 10)
      .attr('y', y(tick) + 40)  // Use the same y scale
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .text(tick);
  });

    


  
  const tooltipLineX = g.append("line")
  .attr("class", "tooltip-line")
  .style('pointer-events','none')
  .attr("id", "tooltip-line-x")
  .attr("stroke", "grey")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

const tooltipLineY = g.append("line")
  .attr("class", "tooltip-line")
  .style('pointer-events','none')
  .attr("id", "tooltip-line-y")
  .attr("stroke", "grey")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");


  

// Attach the mousemove event to the overlay
svg.on("mousemove", function (event) {
  const [xCoord, yCoord] = d3.pointer(event, this);
  // Update the position of the red lines to extend from the mouse position
  tooltipLineX.attr("x1", xCoord).attr("x2", xCoord).attr("y1", 0).attr("y2", height);
  tooltipLineY.attr("y1", yCoord).attr("y2", yCoord).attr("x1", 0).attr("x2", width);

});

};


export const generateCandleStickChart = (svg, g, data, width, height) => {

  /* can we reduce to just charting data layer?
   * leave the drawing layer alone
  */
  g.selectAll('*').remove();

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => new Date(d.Date)))  // Assuming Date is in correct format
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => Math.min(d.Low, d.Close)),
      d3.max(data, d => Math.max(d.High, d.Close))
    ])
    .range([height, 0]);


  // Axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisRight(y);


  // If you also want to move the y-grid lines, you can do so like this:
  const yAxisGrid = d3.axisRight(y)  // Use axisRight instead of axisLeft
    .tickSize(width)  // Positive width to extend grid lines across the chart
    .tickFormat('')
    .ticks(10);

  g.append("g")
    .attr("class", "y-grid")
    .attr("transform", `translate(0, 0)`)  // No need to translate
    .call(yAxisGrid);



  // Add x-axis grid lines

  const initialWidth = 6;
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

  // g.append("g")
  //   .attr("class", "y-axis")
  //   .attr("transform", `translate(${width}, 0)`)  // Translate it to the right
  //   .call(yAxis);

  // Bars
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
    .attr("y1", d => y(d.High))
    .attr("x2", d => x(new Date(d.Date)))
    .attr("y2", d => y(d.Low))
    .attr("stroke", d => d.Open > d.Close ? "red" : "green");


  const drawlines = g.selectAll(".draw-line")

    .data(data)
    .enter().append("line")
    .attr("class", "draw-line")
    .attr("x1", 100)
    .attr("y1", 100)
    .attr("x2", 300)
    .attr("y2", 200)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);




  const throttledZoom = _.throttle((event) => {
    const transform = event.transform;
    //const minTranslateX = (1 - transform.k) * x(new Date(data[0].Date));
    // if (transform.x > minTranslateX) {
    //     transform.x = minTranslateX;
    // }
    const newX = transform.rescaleX(x);
    const newWidth = initialWidth * Math.sqrt(transform.k);
    g.select(".x-axis").call(xAxis.scale(newX));
    bars.attr("x", d => newX(new Date(d.Date)) - newWidth / 2)
      .attr("width", newWidth);
    lines.attr("x1", d => newX(new Date(d.Date)))
      .attr("x2", d => newX(new Date(d.Date)));


    drawlines.attr("x2", d => newX(new Date(d.Date)))
      .attr("stroke", "red")
      .attr("stroke-width", 3.5);





  })

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", throttledZoom);

  zoomRect.call(zoom);
}





// This generates the specific Chart Based on selection
export const generateChart = (chartType, svg, g, data, width, height, enableLineDrawing, priceAxiesRef, showMovingAverage , showExponentialMovingAverage) => {
  // Clear previous chart elements
  svg.selectAll('*').remove();

  // Create a new group element
  const newG = svg.append("g").attr("transform", "translate(0, 0)");

  switch (chartType) {
    case 'line':
      return generateLineChart(svg, newG, data, width, height, enableLineDrawing, priceAxiesRef, showMovingAverage, showExponentialMovingAverage);
    case 'candlestick':
      return generateCandleStickChart(svg, newG, data, width, height);
    default:
      return null;
  }
};