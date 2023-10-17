// generateLineChart.js
import exp from 'constants';
import * as d3 from 'd3';
import _, { maxBy } from 'lodash';
import next from 'next';
import { Line } from 'react-chartjs-2';

/**
 * @param {Object} svg - The D3 Selection for the SVG element to draw in.
 * @param {Array} data - The data to plot.
 * @param {Number} width - The width of the SVG element.
 * @param {Number} height - The height of the SVG element.
 */



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





//REMEMBER TO REFACTOR TO REPAT EVENT HANDLES AND SWitCH TO CASE
let lineData = null;
let lineID = 0
let trendLines = []

// Handling Temp Trend Lines IDS(How can we implement to scale these?)

export const manageLineDrawing = (svg, g, overlay, enableLineDrawing, showTextTool, showFib, drawingType, x, y) => {



  let lineStartPoint = null;
  let tempLine = null;
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;


  let xScale = null
  let yScale = null

  //Get the current zoom position to account for the translatting zoom



  if (x) {


    xScale = x;
    yScale = y;
  }



  if (showTextTool) {

    if (showTextTool === false) {
      return
    }



    overlay.on("click", (event) => {
      if (showTextTool === false) {
        return
      }

      const [mx, my] = d3.pointer(event);



      // Assuming you have a reference to your text-tool-container
      const textToolContainer = d3.select(".text-tool-container");

      overlay.on("click", (event) => {
        const [mx, my] = d3.pointer(event);



        // Show the text-tool-container
        textToolContainer.style("display", "flex");

        // Create or select the SVG text element
        const svgText = overlay.select("text").empty()
          ? svg.append("text")
            .attr("x", mx)
            .attr("y", my)
            .attr("fill", "white")
            .attr("dy", "0.35em")          // Adjust vertical position
          : svg.select("text")
            .attr("x", mx)
            .attr("y", my)
            .attr("dy", "0.35em");         // Adjust vertical position

        // Attach input event listener to the textarea
        d3.select(".text-area").on("input", function () {

          const value = d3.select(this).property("value");
          svgText.text(value);
        });
      });

    })

  }







  if (showFib) {

    if (showFib === false) {
      return
    }



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
        fibLevels.forEach((level, index) => {
          const tempLine = g.append("line")
            .attr("x1", mx)
            .attr("y1", my)
            .attr("x2", width)
            .attr("y2", my)
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
          tempLines.push(tempLine)

          if (index < fibLevels.length - 1) {
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



  if (enableLineDrawing) {

    overlay.on("click", (event) => {
      if (!enableLineDrawing) return;

      const [mx, my] = d3.pointer(event);
      const currentTransform = d3.zoomTransform(g.node());
      const [rawX, rawY] = d3.pointer(event);
      const transformedX = (rawX - currentTransform.x) / currentTransform.k;
      const transformedY = (rawY - currentTransform.y) / currentTransform.k;


      const mouseX = mx;
      const mouseY = my;





      if (!lineStartPoint) {
        // lineStartPoint = { x: transformedX, y: transformedY };
        lineStartPoint = { x: rawX, y: rawY };


        tempLine = g.append("line")
          .attr("class", "temp-line")
          .attr("x1", lineStartPoint.x)
          .attr("y1", lineStartPoint.y)
          .attr("x2", mx)
          .attr("y2", my)
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)




      } else {

        if (drawingType === 'trend') {


          // debugger;
          // New code to account for zoom posiiotn and drawing 

          const currentTransform = d3.zoomTransform(g.node())
          // Inverse transform the start and end points of the line
          const unzoomedStart = currentTransform.invert([lineStartPoint.x, lineStartPoint.y]);
          const unzoomedEnd = currentTransform.invert([mouseX, mouseY]);

          tempLine.remove();


          // g.append("line")
          // .attr("class", "draw-line")
          // .attr("x1", unzoomedStart[0])
          // .attr("y1", unzoomedStart[1])
          // .attr("x2", unzoomedEnd[0])
          // .attr("y2", unzoomedEnd[1])
          // .attr("stroke", "red")
          // .attr("stroke-width", 1);


          g.append("line")
            .attr("class", "draw-line")
            .attr("x1", lineStartPoint.x)
            .attr("y1", lineStartPoint.y)
            .attr("x2", mouseX)
            .attr("y2", mouseY)
            .attr("stroke", "red")
            .attr("stroke-width", 1);

          tempLine.remove();




          // currentTransform.rescaleX(x).invert(lineStartPoint.x)


          // const dataXStart = x.invert(lineStartPoint.x);
          // const dataYStart = y.invert(lineStartPoint.y);
          // const dataXEnd = x.invert(mouseX);
          // const dataYEnd = y.invert(mouseY);



          const dataXStart = currentTransform.rescaleX(x).invert(lineStartPoint.x);
          const dataYStart = g.node().__currentY.invert(lineStartPoint.y);
          const dataXEnd = currentTransform.rescaleX(x).invert(mouseX);
          const dataYEnd = g.node().__currentY.invert(mouseY);



          lineData = {
            id: lineID++,
            startX: dataXStart, // data coordinates
            startY: dataYStart,
            endX: dataXEnd,
            endY: dataYEnd,
            pixelStartX: lineStartPoint.x, // screen coordinates
            pixelStartY: lineStartPoint.y,
            pixelEndX: mouseX,
            pixelEndY: mouseY
          };


          trendLines.push(lineData)


          console.log(lineData, "this is showing current position of the line data")

          lineStartPoint = null;

          // Update the temporary line on mouse move
          overlay.on("mousemove", (event) => {
            if (lineStartPoint && tempLine) {
              const [mx, my] = d3.pointer(event);
              tempLine.attr("x2", mx).attr("y2", my);
            }
          });
        } else if (drawingType === 'ray') {
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
                  .attr('pointer-events', 'none')
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
                  .attr('pointer-events', 'none')
                  .attr("stroke", "red")
                  .attr("stroke-width", 1.5)
                // .attr("stroke-dasharray", "4 4");
                enableLineDrawing = false; // Disable line drawing after second click for trend line

              }
            }
          });



        } else if (drawingType == "horizontal-line-ray") {
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
        } else if (drawingType == "horizontal-line") {
          let horizontalLine = null;


          overlay.on("click", (event) => {
            const [mx, my] = d3.pointer(event);
            if (horizontalLine) horizontalLine.remove();


            horizontalLine = g.append("line")
              .attr('class', " horizonal-line")
              .attr("x1", 0) // Start from the edge of the chart 
              .attr("y1", my)
              .attr("x2", width) //Extend to the edge of the width 
              .attr("y2", my)
              .attr("stroke", "green")
              .attr("stroke-width", 1.5)
          });


        }
        else if (drawingType == "vertical") {
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
        } else if (drawingType === "cross-line") {
          let crossLineHorizontal = null;
          let crossLineVertical = null;


          overlay.on("click", (event) => {
            const [mx, my] = d3.pointer(event);

            // If a vertical line already exists, remove it
            if (crossLineHorizontal) crossLineHorizontal.remove();
            if (crossLineVertical) crossLineVertical.remove();

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




        }

      }
    });


  }
};






export const generateLineChart = (svg, g, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, drawingType) => {
  // Create scales
  g.selectAll('*').remove();
  d3.select(priceAxiesRef.current).selectAll("*").remove();

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.Date))
    .range([0, width + 200])






  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.Close), d3.max(data, d => d.Close)])
    .range([height, 0]);



  console.log("loggin in canvas height", height)
  console.log("Loggin in canvs width", width)

  // Create line generator
  const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.Close));

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);





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
    .tickSize(-width - 200)
    .tickFormat('')
    .ticks(10);

  g.append("g")
    .attr("class", "y-grid")
    .call(yAxisGrid);

  // Add the y-axis to the right
  const yAxisGroup = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width + 95}, 0)`)
    .attr('stroke', 'rgba(255, 255, 255, 0.1)')  // White with 20% opacity
    .attr('stroke-width', 1)
    .call(d3.axisRight(y));

  yAxisGroup.select(".domain").remove();



  //This controls the data labels
  const xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${svgContainerHeight - 75 - 15})`)
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
  // g.selectAll(".dot")
  //   .data(data)
  //   .enter().append("circle")
  //   .attr("class", "dot")
  //   .attr("cx", d => x(d.Date))  // Make sure the attribute names match your data
  //   .attr("cy", d => y(d.Close))
  //   .attr("r", 3)
  //   .on('mouseover', (event, d) => {
  //     tooltip.style('display', 'block')
  //       .html(`
  //           <div>Date: ${d.Date}</div>
  //           <div>Close Price: ${d.Close}</div>
  //         `)
  //       .style('left', (event.pageX + 15) + 'px')
  //       .style('top', (event.pageY - 28) + 'px');
  //   })
  //   .on('mouseout', () => {
  //     tooltip.style('display', 'none');
  //   });




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
    .attr("width", width + 200)
    .attr("height", height)
    .attr("fill", "none")
    .attr("class", "overlay")  // <-- Add this line
    .attr("pointer-events", "all");  // This ensures the rectangle captures all mouse events






  manageLineDrawing(svg, g, overlay, enableLineDrawing, showFib, showTextTool, drawingType, x, y);




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
    .style("display", "none")
    .attr('id', 'movingAverageLine')
    .attr('stroke', '#FF8900')
    .attr('d', movingAverageLine)


  // generates moving average curve when called
  if (showExponentialMovingAverage) {
    g.select("#movingAverageLine").style("display", null);


  } else {
    g.select("#movingAverageLine").style("display", "none");
  }

  if (showExponentialMovingAverage) {

    g.select("#expmovingAverageLine").style("display", null); // or "block"

  } else {
    g.select("#expmovingAverageLine").style("display", "none");

  }




  // Function to update the trend lines
  function updateTrendLines(newX, newY) {

    g.selectAll(".draw-line")
      .data(trendLines)
      .join('line')
      .classed('.draw-line', true)
      .attr("stroke", "red") // or any desired color
      .attr("stroke-width", 1.5)
      .each(function (lineData) {
        const newXStart = newX(lineData.startX);
        const newYStart = newY(lineData.startY);
        const newXEnd = newX(lineData.endX);
        const newYEnd = newY(lineData.endY);
        console.log(`Start: (${newXStart}, ${newYStart}), End: (${newXEnd}, ${newYEnd})`);
        d3.select(this).attr("x1", newXStart)
          .attr("y1", newYStart)
          .attr("x2", newXEnd)
          .attr("y2", newYEnd);
      })



    // console.log({trendLines});
    // trendLines.forEach(lineData => {
    //   const newXStart = newX(lineData.startX);
    //   const newYStart = y(lineData.startY);
    //   const newXEnd = newX(lineData.endX);
    //   const newYEnd = y(lineData.endY);

    //   console.log(`Start: (${newXStart}, ${newYStart}), End: (${newXEnd}, ${newYEnd})`);


    //   // Check if the line exists, if not create it
    //   let drawLine = g.select(`.draw-line-${lineData.id}`);
    //   if (drawLine.empty()) {
    //     drawLine = g.append("line")
    //       .attr("class", `draw-line draw-line-${lineData.id}`)
    //       .attr("stroke", "red") // or any desired color
    //       .attr("stroke-width", 1.5);
    //   }

    //   drawLine.attr("x1", newXStart)
    //     .attr("y1", newYStart)
    //     .attr("x2", newXEnd)
    //     .attr("y2", newYEnd);
    // });


  }

  updateTrendLines(x, y);



  // Check if tooltip exists
  if (d3.select("#priceToolTipX").empty()) {
    // If not, create it
    d3.select("body").append("div")
      .attr("id", "priceToolTipX")
      .attr("class", "tooltip")
      .style("display", "none");
  }

  // Do the same for priceToolTipY
  if (d3.select("#priceToolTipY").empty()) {
    d3.select("body").append("div")
      .attr("id", "priceToolTipY")
      .attr("class", "tooltip")
      .style("display", "none");
  }

  //Creataing the hovering tooltip
  const priceToolTipY = d3.select("body").append("div")
    .attr("class", "priceToolTipY")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "rgba(123, 123, 123, 0.555)")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");

  const priceToolTipX = d3.select("body").append("div")
    .attr("class", "priceToolTipX")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "rgba(123, 123, 123, 0.555)")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");









  //For updating the price to be correlated to the zoom state
  let currentX = x;
  let currentY = y;

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", (event) => {
      const transform = event.transform;

      //Calcuate the max and min TranslateY(for the chart) which is calcuating the boundries
      let maxTranslateY = (height - height * transform.k) / transform.k
      let minTranslateY = 0

      //Restrict the transform translateY  component 
      // transform.y = Math.min(Math.max(transform.y, minTranslateY), maxTranslateY);
      const newX = transform.rescaleX(x);

      //Get the current domain of the x-axis after zooming/panning
      const xDomain = newX.domain()
      //Filter the data to get only the visible points.
      const visibleData = data.filter(d => d.Date >= xDomain[0] && d.Date <= xDomain[1]);

      // Recalculate y-domain based on visible data
      const yDomain = [
        d3.min(visibleData, d => d.Close),
        d3.max(visibleData, d => d.Close)
      ];

      const newY = transform.rescaleY(y);

      newY.domain(yDomain);

      // Update the current scales
      currentX = newX;
      currentY = newY;





      // Update the main line and dots
      g.select(".x-axis").call(xAxis.scale(newX));
      g.selectAll(".dot")
        .attr("cx", d => newX(d.Date));
      linePath.attr("d", line.y(d => newY(d.Close)).x(d => newX(d.Date)));

      //Update the y-axis grid lines 
      g.select('.y-grid').call(yAxisGrid.scale(newY));

      g.node().__currentY = newY;

      //Update the y-axis labels 
      yAxisGroup.call(d3.axisRight(newY));


      movingAverageData.forEach(d => {
      });

      exponentialMovingAverageData.forEach(d => {
      });


      updateTrendLines(newX, newY);





      //Handling  current date mousemovments hover.
      overlay.on("mousemove", function (event) {

        const [mx, my] = d3.pointer(event) //Get mouse cords 

        //To account for the zoom state
        const hoverDate = currentX.invert(mx);
        const hoverPrice = currentY.invert(my);

        priceToolTipY
          .style("display", 'block')
          .html(`${hoverPrice.toFixed(2)}`)
          .style('left', svgContainerRect.right - 40 + 'px')  // This pins the tooltip to the far left edge of the SVG container
          .style('top', (event.pageY - 28) + 'px');


        //Formatting the date for the output.
        const formatDate = d3.timeFormat("%d, %B '%y");
        const formattedDate = formatDate(hoverDate);
        console.log("Formatted Hovered Date:", formattedDate);

        priceToolTipX
          .style("display", "block")
          .html(`${formattedDate}`)
          .style('left', (event.pageX + 15) + 'px')  // Adjust position as needed
          .style('top', svgContainerRect.bottom - 28 + 'px')  // This pins the tooltip to the far left edge of the SVG container







      }).on("mouseout", function () {
        priceToolTipY.style('display', 'none');
        priceToolTipX.style('display', 'none');
      });




      movingAverageLine.x(d => newX(d.date));
      g.select("#movingAverageLine").attr("d", movingAverageLine(movingAverageData));

      exponentialLine.x(d => newX(d.date));
      g.select("#expmovingAverageLine").attr("d", exponentialLine(exponentialMovingAverageData));







    });

  g.call(zoom);






  function setupTooltip(svg, width, height) {
    const tooltipLineX = g.append("line")
      .attr("class", "tooltip-line")
      .style('pointer-events', 'none')
      .attr("id", "tooltip-line-x")
      .attr("stroke", "grey")

      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    const tooltipLineY = g.append("line")
      .attr("class", "tooltip-line")
      .style('pointer-events', 'none')
      .attr("id", "tooltip-line-y")
      .attr("stroke", "grey")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");




    // Attach the mousemove event to the overlay
    svg.on("mousemove", function (event) {
      const [xCoord, yCoord] = d3.pointer(event, this);
      // Update the position of the red lines to extend from the mouse position
      tooltipLineX.attr("x1", xCoord).attr("x2", xCoord).attr("y1", 0).attr("y2", height);
      tooltipLineY.attr("y1", yCoord).attr("y2", yCoord).attr("x1", 0).attr("x2", width + 200);





    });

  };
  setupTooltip(g, width, height);

}




export const generateCandleStickChart = (svg, g, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, drawingType) => {

  /* can we reduce to just charting data layer?
   * leave the drawing layer alone
  */
  g.selectAll('*').remove();

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => new Date(d.Date)))  // Assuming Date is in correct format
    .range([0, width + 200]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => Math.min(d.Low, d.Close)),
      d3.max(data, d => Math.max(d.High, d.Close))
    ])
    .range([height, 0]);


  // Axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisRight(y);


  xAxis.tickSize(-height)



  // // If you also want to move the y-grid lines, you can do so like this:
  // const yAxisGrid = d3.axisRight(y)  // Use axisRight instead of axisLeft
  //   .tickSize(width + 200)  // Positive width to extend grid lines across the chart
  //   .tickFormat('')
  //   .ticks(15)

  //     // Add y-axis grid lines
  const yAxisGrid = d3.axisLeft(y)
    .tickSize(-width - 200)
    .tickFormat('')
    .ticks(10);

  g.append("g")
    .attr("class", "y-grid")
    .call(yAxisGrid);

  // Add the y-axis to the right
  const yAxisGroup = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width + 95}, 0)`)
    .attr('stroke', 'rgba(255, 255, 255, 0.1)')  // White with 20% opacity
    .attr('stroke-width', 1)
    .call(d3.axisRight(y));

  yAxisGroup.select(".domain").remove();



  // g.append("g")
  // .attr("class", "y-grid")
  // .call(yAxisGrid)
  // .selectAll("line")



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
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Bars
  const bars = g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(new Date(d.Date)) - initialWidth / 2)
    .attr("y", d => y(Math.max(d.Open, d.Close)))
    .attr("height", d => Math.abs(y(d.Open) - y(d.Close)))
    .attr("width", initialWidth)
    .attr("fill", d => d.Open > d.Close ? "red" : "green")



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


  // const drawlines = g.selectAll(".draw-line")

  //   .data(data)
  //   .enter().append("line")
  //   .attr("class", "draw-line")
  //   .attr("x1", 100)
  //   .attr("y1", 100)
  //   .attr("x2", 300)
  //   .attr("y2", 200)
  //   .attr("stroke", "black")
  //   .attr("stroke-width", 1.5);





  // Check if tooltip exists
  if (d3.select("#priceToolTipX").empty()) {
    // If not, create it
    d3.select("body").append("div")
      .attr("id", "priceToolTipX")
      .attr("class", "tooltip")
      .style("display", "none");
  }

  // Do the same for priceToolTipY
  if (d3.select("#priceToolTipY").empty()) {
    d3.select("body").append("div")
      .attr("id", "priceToolTipY")
      .attr("class", "tooltip")
      .style("display", "none");
  }

  //Creataing the hovering tooltip
  const priceToolTipY = d3.select("body").append("div")
    .attr("class", "priceToolTipY")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "rgba(123, 123, 123, 0.555)")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");

  const priceToolTipX = d3.select("body").append("div")
    .attr("class", "priceToolTipX")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "rgba(123, 123, 123, 0.555)")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");


  //Open high close and low nature.
  // Add this at the beginning of your code, where you set up your SVG and other elements
  const ohlcTooltip = d3.select("body").append("div")
    .attr("class", "ohlcTooltip")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "rgba(123, 123, 123, 0.555)")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");




  // Append a transparent overlay rectangle on top of everything
  const overlay = g.append("rect")
    .attr("width", width + 200)
    .attr("height", height)
    .attr("fill", "none")
    .attr("class", "overlay")  // <-- Add this line
    .attr("pointer-events", "all");  // This ensures the rectangle captures all mouse events






  let currentX = x;
  let currentY = y;

  const throttledZoom = _.throttle((event) => {
    const transform = event.transform;

    const newX = transform.rescaleX(x);
    const newWidth = initialWidth * Math.sqrt(transform.k);
    g.select(".x-axis").call(xAxis.scale(newX));
    bars.attr("x", d => newX(new Date(d.Date)) - newWidth / 2)
      .attr("width", newWidth);
    lines.attr("x1", d => newX(new Date(d.Date)))
      .attr("x2", d => newX(new Date(d.Date)));

    //Calcuate the max and min TranslateY(for the chart) which is calcuating the boundries
    let maxTranslateY = (height - height * transform.k) / transform.k
    let minTranslateY = 0

    //Restrict the transform translateY  component 
    transform.y = Math.min(Math.max(transform.y, minTranslateY), maxTranslateY);

    //Get the current domain of the x-axis after zooming/panning
    const xDomain = newX.domain()
    //Filter the data to get only the visible points.
    const visibleData = data.filter(d => d.Date >= xDomain[0] && d.Date <= xDomain[1]);

    // Recalculate y-domain based on visible data
    const yDomain = [
      d3.min(visibleData, d => d.Close),
      d3.max(visibleData, d => d.Close)
    ];

    const newY = transform.rescaleY(y);

    newY.domain(yDomain);


    //Update the y-axis grid lines 
    g.select('.y-grid').call(yAxisGrid.scale(newY));

    //Update the y-axis labels 
    yAxisGroup.call(d3.axisRight(newY));




    // Update the current scales
    currentX = newX;
    currentY = newY;

    //Handling  current date mousemovments hover.
    overlay.on("mousemove", function (event) {

      const [mx, my] = d3.pointer(event) //Get mouse cords 

      //To account for the zoom state
      const hoverDate = currentX.invert(mx);
      const hoverPrice = currentY.invert(my);

      priceToolTipY
        .style("display", 'block')
        .html(`${hoverPrice.toFixed(2)}`)
        .style('left', svgContainerRect.right - 40 + 'px')  // This pins the tooltip to the far left edge of the SVG container
        .style('top', (event.pageY - 28) + 'px');


      //Formatting the date for the output.
      const formatDate = d3.timeFormat("%d, %B '%y");
      const formattedDate = formatDate(hoverDate);
      console.log("Formatted Hovered Date:", formattedDate);

      priceToolTipX
        .style("display", "block")
        .html(`${formattedDate}`)
        .style('left', (event.pageX + 15) + 'px')  // Adjust position as needed
        .style('top', svgContainerRect.bottom - 28 + 'px')  // This pins the tooltip to the far left edge of the SVG container



      //Encaspluating below this function handles the OPEN, HIGH, ClOSE, and LOW 

      // Step 2: Identify the Corresponding Bar for the Hovered Date
      data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

      console.log("logign the data", data)
      const bisectDate = d3.bisector(d => new Date(d.Date)).left;
      const index = bisectDate(data, hoverDate, 1);
      let adjustedIndex = index;
      if (index > 0 && index < data.length) {
        const dateBefore = new Date(data[index - 1].Date);
        const dateAfter = new Date(data[index].Date);
        const distanceBefore = Math.abs(dateBefore - hoverDate);
        const distanceAfter = Math.abs(dateAfter - hoverDate);
        adjustedIndex = distanceBefore < distanceAfter ? index - 1 : index;
      } else if (index >= data.length) {
        adjustedIndex = index - 1;
      }

      const hoveredData = data[adjustedIndex];

      // Step 3: Extract the OHLC Data from the Identified Bar
      if (hoveredData) {
        const openValue = hoveredData.Open.toFixed(2);
        const highValue = hoveredData.High.toFixed(2);
        const lowValue = hoveredData.Low.toFixed(2);
        const closeValue = hoveredData.Close.toFixed(2);

        // Step 4: Display the OHLC Data in the Tooltip
        ohlcTooltip
          .style("display", "block")
          .html(`O: ${openValue} H: ${highValue} L: ${lowValue} C: ${closeValue}`)
          .style('left', d3.pointer(event)[0] + svgContainerRect.left + 10 + 'px')
          .style('top', d3.pointer(event)[1] + svgContainerRect.top + 10 + 'px');
      } else {
        ohlcTooltip.style("display", "none");
      }


    }).on("mouseout", function () {
      priceToolTipY.style('display', 'none');
      priceToolTipX.style('display', 'none');
      ohlcTooltip.style('display', 'none');

    });








  })

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", throttledZoom);

  g.call(zoom);




  function setupTooltip(svg, width, height) {
    const tooltipLineX = g.append("line")
      .attr("class", "tooltip-line")
      .style('pointer-events', 'none')
      .attr("id", "tooltip-line-x")
      .attr("stroke", "grey")

      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    const tooltipLineY = g.append("line")
      .attr("class", "tooltip-line")
      .style('pointer-events', 'none')
      .attr("id", "tooltip-line-y")
      .attr("stroke", "grey")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");




    // Attach the mousemove event to the overlay
    svg.on("mousemove", function (event) {
      const [xCoord, yCoord] = d3.pointer(event, this);
      // Update the position of the red lines to extend from the mouse position
      tooltipLineX.attr("x1", xCoord).attr("x2", xCoord).attr("y1", 0).attr("y2", height);
      tooltipLineY.attr("y1", yCoord).attr("y2", yCoord).attr("x1", 0).attr("x2", width + 200);



    });

  };
  setupTooltip(g, width, height);






}




// This generates the specific Chart Based on selection
export const generateChart = (chartType, svg, g, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, drawingType) => {
  // Clear previous chart elements
  svg.selectAll('*').remove();

  // Create a new group element
  const newG = svg.append("g").attr("transform", "translate(0, 0)");

  switch (chartType) {
    case 'line':
      return generateLineChart(svg, newG, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, drawingType);
    case 'candlestick':
      return generateCandleStickChart(svg, newG, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, drawingType);
    default:
      return null;
  }
};