

import * as d3 from 'd3';


export const handleRayLine = (mx , my,svg,  g, overlay, enableLineDrawing) =>

{  
    
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
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
