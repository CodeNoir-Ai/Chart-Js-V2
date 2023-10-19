// THIS HANDLES THE RENDERING OF LINE DRAWING TOOLS AND THE CHART
//*** TO NOTE THAT ONLY THE LINEDRAWING CHART CONTAINS THE DRAWING TOOLS  */



// generateLineChart.js
import exp from 'constants';
import * as d3 from 'd3';
import _, { maxBy, over } from 'lodash';
import next from 'next';
import { Line } from 'react-chartjs-2';
import {handleTextTool} from './LineDrawing/DrawingTools/TextTool.js' 
import {FibTool} from './LineDrawing/DrawingTools/FibTool.js' 

// Main Line Drawing Tools 
import {handleRayLine} from './LineDrawing/DrawingTools/RayLine.js' 
import {handleTrendLine} from './LineDrawing/DrawingTools/Trendline.js' 



/**
 * @param {Object} svg - The D3 Selection for the SVG element to draw in.
 * @param {Object} g - Hanldes the Zooming Capabilites, all chart creation is being appended to this rect 
 * @param {Array} data - The data to plot.
 * @param {Number} width - The width of the SVG element.
 * @param {Number} height - The height of the SVG element.
 * @param {Object} Overlay - Container That Handle Drawing Indications
 * @param {Bool} EnableLineDrawing - Boolean that checks if drawing capabilites is true or not 
 * @param {Bool} showTextTool - Boolean that checks if Text Tool Is Shown 
 * @param {Bool} showFib - BBoolean that checks if Fib Tool Is Shown 
 * @param {Bool} drawingType - Case switch that checks which drawing type is activated
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






export const manageLineDrawing = (svg, g, overlay, enableLineDrawing, showTextTool, showFib, drawingType, x , y) => {



  let lineStartPoint = null;
  let tempLine = null;

  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;


  let xScale = x || null;
  let yScale = y || null;

  if (showTextTool) handleTextTool(svg, overlay);
  if (showFib) FibTool(svg, overlay, g, yScale);




  // Modularzing The Code 

  if (enableLineDrawing) {
    overlay.on("click", (event) => {
        const [mx, my] = d3.pointer(event);
        switch(drawingType) {
            case 'trend':
              handleTrendLine(mx, my, g, x, lineStartPoint, tempLine, trendLines, overlay);
                break;
            case 'ray':
                handleRayLine(mx, my,svg,  g, overlay, enableLineDrawing); 
                break;
            // ... other cases
            default:
                break;
        }
    });


  }





  // if (enableLineDrawing) {

  //   overlay.on("click", (event) => {
  //     if (!enableLineDrawing) return;

  //     const [mx, my] = d3.pointer(event);



  //     if (!lineStartPoint) {
  //       lineStartPoint = { x: mx, y: my};


  //       tempLine = g.append("line")
  //         .attr("class", "temp-line")
  //         .attr("x1", lineStartPoint.x)
  //         .attr("y1", lineStartPoint.y)
  //         .attr("x2", mx)
  //         .attr("y2", my)
  //         .attr("stroke", "red")
  //         .attr("stroke-width", 2)



        
  //     } else {

  //       if (drawingType === 'trend') {

  //         // New code to account for zoom posiiotn and drawing 

  //         const currentTransform = d3.zoomTransform(g.node())
      



  //         g.append("line")
  //           .attr("class", "draw-line")
  //           .attr("x1", lineStartPoint.x)
  //           .attr("y1", lineStartPoint.y)
  //           .attr("x2", mx)
  //           .attr("y2", my)
  //           .attr("stroke", "red")
  //           .attr("stroke-width", 2);

  //         tempLine.remove();




          
  //         const dataXStart = currentTransform.rescaleX(x).invert(lineStartPoint.x)
  //         const dataYStart = g.node().__currentY.invert(lineStartPoint.y);         
  //         const dataXEnd = currentTransform.rescaleX(x).invert(mx);         
  //         const dataYEnd = g.node().__currentY.invert(my);


  //         lineData = { 
  //           id: lineID++, 
  //           startX: dataXStart, // data coordinates
  //           startY: dataYStart,
  //           endX: dataXEnd,
  //           endY: dataYEnd,
    
  //         };
          

  //           trendLines.push(lineData)



  //         lineStartPoint = null;

  // // Update the temporary line on mouse move
  // overlay.on("mousemove", (event) => {
  //   if (lineStartPoint && tempLine) {
  //     const [mx, my] = d3.pointer(event);
  //     tempLine.attr("x2", mx).attr("y2", my);
  //   }
  // });
  //       }else if (drawingType === 'ray') {
  //         let startPoint = null;
  //         let rayLine = null;
          
  //         if (!startPoint) {
  //           // Capture the starting point
  //           startPoint = { x: mx, y: my };
  //       } else {
  //           // If a ray line already exists, remove it
  //           if (rayLine) rayLine.remove();
    
  //           // Draw the permanent ray line
  //           rayLine = g.append("line")
  //               .attr("class", "ray-line")
  //               .attr("x1", startPoint.x)
  //               .attr("y1", startPoint.y)
  //               .attr("x2", mx)
  //               .attr("y2", my)
  //               .attr("stroke", "blue")
  //               .attr("stroke-width", 1.5);
    
                

  //           // Reset the starting point
  //           startPoint = null;
  //           enableLineDrawing = false;
  //       }


  //       overlay.on("mousemove", (event) => {
  //         if (startPoint && enableLineDrawing) {
  //           const [mx, my] = d3.pointer(event);

  //             const deltaX = mx - startPoint.x;
  //             const deltaY = my - startPoint.y;
  //             // Calculate the slope and extend the line to the edge
  //             const slope = (my - startPoint.y) / (mx - startPoint.x);
  //             let endX, endY;
              
  //             //This checks if mouse has moved to the right of the staring point
  //             if (deltaX >= 0) {
  //               endX = width;
  //               endY = startPoint.y + slope * (width - startPoint.x);
              
  //           } else {
  //               endX = 0;
  //               endY = startPoint.y - slope * startPoint.x;
  //           }

            
            

  //             // If a temporary line already exists, update its end point
  //             if (rayLine) {
  //                 rayLine.attr("x2", endX).attr("y2", endY);
  //             } else {
  //                 // Otherwise, create a new temporary line
  //                 rayLine = g.append("line")
  //                     .attr("class", "temp-ray-line")
  //                     .attr("x1", startPoint.x)
  //                     .attr("y1", startPoint.y)
  //                     .attr('pointer-events','none')
  //                     .attr("x2", endX)
  //                     .attr("y2", endY)
  //                     .attr("stroke", "red")
  //                     .attr("stroke-width", 1.5)
  //                     .attr("stroke-dasharray", "4 4");

  //                     // enableLineDrawing = false; // Disable line drawing after second click for trend line

  //             }
  //         }
  //     });
      


  //       }
  //       else if (drawingType === 'extended-line') {
  //         let startPoint = null;
  //         let rayLine = null;
          
  //         if (!startPoint) {
  //           const [mx, my] = d3.pointer(event)
  //           startPoint = { x: mx, y: my };
  //       } else {
  //           // If a ray line already exists, remove it
  //           if (rayLine) rayLine.remove();
  //           rayLine = null
  //           startPoint = null
  //           enableLineDrawing = true;
  //       }


  //       overlay.on("mousemove", (event) => {
  //         if (startPoint && enableLineDrawing) {
  //           const [mx, my] = d3.pointer(event);

  //             //Calculate the angle 0 
  //             const theta = Math.atan2(my - startPoint.y, mx - startPoint.x);

  //             const endYLeft = startPoint.y - startPoint.x * Math.tan(theta);
  //             const endYRight = startPoint.y + (width - startPoint.x) * Math.tan(theta);

  //             // If a temporary line already exists, update its end point
  //             if (rayLine) {
  //               rayLine.attr("x1", 0)
  //                 .attr("y1", endYLeft)
  //                 .attr("x2", width)
  //                 .attr("y2", endYRight)
  //             } else {
  //                 // Otherwise, create a new temporary line
  //                 rayLine = g.append("line")
  //                     .attr("class", "temp-ray-line")
  //                     .attr("x1", 0)
  //                     .attr("y1", endYLeft)
  //                     .attr("x2", width)
  //                     .attr("y2", endYRight)
  //                     .attr('pointer-events','none')
  //                     .attr("stroke", "red")
  //                     .attr("stroke-width", 1.5)
  //                     // .attr("stroke-dasharray", "4 4");
  //                     enableLineDrawing = false; // Disable line drawing after second click for trend line

  //             }
  //         }
  //     });
      


  //   }else if (drawingType == "horizontal-line-ray"){ 
  //         let horizontalLineRay = null;

  //         overlay.on("click", (event) => {
  //             const [mx, my] = d3.pointer(event);
      
  //             // If a horizontal line already exists, remove it
  //             if (horizontalLineRay) horizontalLineRay.remove();
      
  //             // Draw the horizontal line from the clicked point to the right edge of the chart
  //             horizontalLineRay = g.append("line")
  //                 .attr("class", "horizontal-line-ray")
  //                 .attr("x1", mx) // starts from the click piont
  //                 .attr("y1", my)
  //                 .attr("x2", width) // Extend to the right edge of the chart
  //                 .attr("y2", my)
  //                 .attr("stroke", "green")
  //                 .attr("stroke-width", 1.5);
  //         });
  //       }else if (drawingType == "horizontal-line")
  //       { 
  //         let horizontalLine = null;


  //         overlay.on("click", (event) => {
  //           const [mx, my] = d3.pointer(event); 
  //           if(horizontalLine) horizontalLine.remove();


  //           horizontalLine = g.append("line")
  //           .attr('class'," horizonal-line")
  //           .attr("x1", 0) // Start from the edge of the chart 
  //           .attr("y1", my)
  //           .attr("x2", width) //Extend to the edge of the width 
  //           .attr("y2", my)
  //           .attr("stroke", "green")
  //           .attr("stroke-width", 1.5)
  //         });

      
  //       }
  //       else if  (drawingType == "vertical") { 
  //         let verticalLine = null;

  //         overlay.on("click", (event) => {
  //             const [mx, my] = d3.pointer(event);
      
  //             // If a vertical line already exists, remove it
  //             if (verticalLine) verticalLine.remove();
      
  //             // Draw the vertical line from the top edge to the bottom edge of the chart at the clicked x-coordinate
  //             verticalLine = g.append("line")
  //                 .attr("class", "vertical-line")
  //                 .attr("x1", mx)
  //                 .attr("y1", 0) // Start from the top edge of the chart
  //                 .attr("x2", mx)
  //                 .attr("y2", height) // Extend to the bottom edge of the chart
  //                 .attr("stroke", "purple")
  //                 .attr("stroke-width", 1.5);
  //         });
  //       }else if (drawingType === "cross-line")
  //       { 
  //         let crossLineHorizontal = null;
  //         let crossLineVertical = null;

          
  //         overlay.on("click", (event) => {
  //           const [mx, my] = d3.pointer(event);
    
  //           // If a vertical line already exists, remove it
  //           if (crossLineHorizontal) crossLineHorizontal.remove();
  //           if(crossLineVertical) crossLineVertical.remove();

  //           // Draw the vertical line from the top edge to the bottom edge of the chart at the clicked x-coordinate
  //           crossLineVertical = g.append("line")
  //               .attr("class", "cross-line-horizontal")
  //               .attr("x1", mx)
  //               .attr("y1", 0) // Start from the top edge of the chart
  //               .attr("x2", mx)
  //               .attr("y2", height) // Extend to the bottom edge of the chart
  //               .attr("stroke", "purple")
  //               .attr("stroke-width", 1.5);



  //           crossLineHorizontal = g.append("line")
  //           .attr('class', "cross-line-vertical")
  //           .attr("x1", 0)
  //           .attr("y1", my)
  //           .attr("x2", width)
  //           .attr("y2", my)
  //           .attr("stroke", "purple")
  //           .attr("stroke-width", 1.5)
            
  //       });




  //       } 
      
  //     }
  //   });

   
  // }
};







export const generateLineChart = (svg, g, data, width, height,svgContainerHeight,svgContainerRect,  enableLineDrawing, showMovingAverage,showExponentialMovingAverage, showFib, showTextTool, drawingType ) => {
  // Create scales s
  g.selectAll('*').remove();

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.Date))
    .range([0, width + 200])




 

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.Close), d3.max(data, d => d.Close)])
    .range([height, 0]);



  

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






  manageLineDrawing(svg, g, overlay, enableLineDrawing, showFib, showTextTool, drawingType, x , y );




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

if(showExponentialMovingAverage)
{ 

  g.select("#expmovingAverageLine").style("display", null); // or "block"

} else { 
  g.select("#expmovingAverageLine").style("display", "none");

}



//Function to update the trend lines 
function updateTrendLines(newX, newY) {

  g.selectAll(".draw-line")
    .data(trendLines)
    .join('line')
    .classed('.draw-line', true)
    .attr("stroke", "red") // or any desired color
    .attr("stroke-width", 2)
    .each(function (lineData) {
      const newXStart = newX(lineData.startX);
      const newYStart = newY(lineData.startY);
      const newXEnd = newX(lineData.endX);
      const newYEnd = newY(lineData.endY);
      d3.select(this).attr("x1", newXStart)
        .attr("y1", newYStart)
        .attr("x2", newXEnd)
        .attr("y2", newYEnd);
    })
    .on('contextmenu', function(event, d) { // Right-click event
      event.preventDefault(); // Prevent the default context menu from showing up
      
      // Get the position where the user clicked
      const [x, y] = d3.pointer(event);
      
      // Show the line-settings-container and position it slightly to the right of the click location
      d3.select('.line-settings-container')
          .style('left', (x + 10) + 'px')  // Slightly to the right
          .style('top', y + 'px')
          .style('display', 'flex');
      
      // Optional: Close the settings container when clicking anywhere else on the document
      d3.select(document).on('click.hideMenu', function() {
          d3.select('.line-settings-container').style('display', 'none');
          d3.select(document).on('click.hideMenu', null); // Remove this event listener after firing once
      });
  })   

    .on('mouseover', function(event, d) { // Mouseover event
      d3.select(this).attr("stroke", "orange").attr("stroke-width", 2).style("cursor", "pointer"); 
      

    })
    .on('mouseout', function(event, d) { // Mouseout event
      d3.select(this).attr("stroke", "red").attr("stroke-width", 2);
    })
   

  }

  //Dealing Soley With Line Settings 
  function handleToolContainerClick(event ) {
    console.log("This item is being clicked.... ")


}



d3.select('.link-settings-container')
    .on('click', handleToolContainerClick);



// d3.select('.lineSettings-tool-container')
// .style('display', 'flex');





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

      //For getting the current line drawing positoin aswell, getting the curreny Y by ac
      g.node().__currentY = newY;


      // Update the main line and dots
      g.select(".x-axis").call(xAxis.scale(newX));
      g.selectAll(".dot")
          .attr("cx", d => newX(d.Date));
      linePath.attr("d", line.y(d => newY(d.Close)).x(d => newX(d.Date)));

      //Update the y-axis grid lines 
      g.select('.y-grid').call(yAxisGrid.scale(newY));

      //Update the y-axis labels 
      yAxisGroup.transition().call(d3.axisRight(newY));


      movingAverageData.forEach(d => {
      });

      exponentialMovingAverageData.forEach(d => {
      });


      updateTrendLines(newX, newY);





//Handling  current date mousemovments hover.
overlay.on("mousemove", function(event) {

  const [mx,my] = d3.pointer(event) //Get mouse cords 

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
   
       priceToolTipX
        .style("display", "block")
        .html(`${formattedDate}`)
        .style('left', (event.pageX + 15) + 'px')  // Adjust position as needed
        .style('top', svgContainerRect.bottom - 28 + 'px')  // This pins the tooltip to the far left edge of the SVG container





 

}).on("mouseout", function() {
  priceToolTipY.style('display', 'none');
  priceToolTipX.style('display', 'none');
});




      movingAverageLine.x(d => newX(d.date));
      g.select("#movingAverageLine").attr("d", movingAverageLine(movingAverageData));

      exponentialLine.x(d => newX(d.date));
      g.select("#expmovingAverageLine").attr("d", exponentialLine(exponentialMovingAverageData));



      



  });

g.call(zoom);






  function setupTooltip(svg,width,height)
  { 
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
    tooltipLineY.attr("y1", yCoord).attr("y2", yCoord).attr("x1", 0).attr("x2", width + 200);



    
  
  });
  
  };
  setupTooltip(g, width, height);

  }
  



export const generateCandleStickChart =(svg, g, data, width, height,svgContainerHeight,svgContainerRect,  enableLineDrawing, showMovingAverage,showExponentialMovingAverage, showFib, showTextTool, drawingType ) => {

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
overlay.on("mousemove", function(event) {

  const [mx,my] = d3.pointer(event) //Get mouse cords 

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
   
       priceToolTipX
        .style("display", "block")
        .html(`${formattedDate}`)
        .style('left', (event.pageX + 15) + 'px')  // Adjust position as needed
        .style('top', svgContainerRect.bottom - 28 + 'px')  // This pins the tooltip to the far left edge of the SVG container



        //Encaspluating below this function handles the OPEN, HIGH, ClOSE, and LOW 
    
   // Step 2: Identify the Corresponding Bar for the Hovered Date
   data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

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
           .style('left',svgContainerRect.left + 10 + 'px')
           .style('top',svgContainerRect.top + 70 + 'px');
   } else {
       ohlcTooltip.style("display", "none");
   }
 

}).on("mouseout", function() {
  priceToolTipY.style('display', 'none');
  priceToolTipX.style('display', 'none');
  ohlcTooltip.style('display', 'none');

});








  })

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", throttledZoom);

  g.call(zoom);




  function setupTooltip(svg,width,height)
  { 
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
    tooltipLineY.attr("y1", yCoord).attr("y2", yCoord).attr("x1", 0).attr("x2", width + 200);
  
  
  
  });
  
  };
  setupTooltip(g, width, height);
  
  




}




// This generates the specific Chart Based on selection
export const generateChart = (chartType, svg, g, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, showMovingAverage , showExponentialMovingAverage, showFib, showTextTool, drawingType) => {
  // Clear previous chart elements
  svg.selectAll('*').remove();

  // Create a new group element
  const newG = svg.append("g").attr("transform", "translate(0, 0)");

  switch (chartType) {
    case 'line':
      return generateLineChart(svg, newG, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, showMovingAverage, showExponentialMovingAverage,showFib, showTextTool, drawingType);
    case 'candlestick':
      return generateCandleStickChart(svg, newG, data, width, height, svgContainerHeight, svgContainerRect, enableLineDrawing, showMovingAverage, showExponentialMovingAverage,showFib, showTextTool, drawingType);
    default:
      return null;
  }
};