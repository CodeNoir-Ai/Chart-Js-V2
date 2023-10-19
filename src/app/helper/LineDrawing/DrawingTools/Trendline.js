

import * as d3 from 'd3';


export const handleTrendLine = (mx , my, g, x,  lineStartPoint, tempLine,  trendLines, overlay) =>

{  
    

    if (!lineStartPoint) {
        // Initialize the start point and draw the temporary line
        lineStartPoint = { x: mx, y: my };

        tempLine = g.append("line")
            .attr("class", "temp-line")
            .attr("x1", lineStartPoint.x)
            .attr("y1", lineStartPoint.y)
            .attr("x2", mx)
            .attr("y2", my)
            .attr("stroke", "red")
            .attr("stroke-width", 2);

        // Update the temporary line on mouse move
        overlay.on("mousemove", (event) => {
            if (lineStartPoint && tempLine) {
                const [mx, my] = d3.pointer(event);
                tempLine.attr("x2", mx).attr("y2", my);
            }
        });

    } else {
        // Finalize the trend line
        const currentTransform = d3.zoomTransform(g.node());

        g.append("line")
            .attr("class", "draw-line")
            .attr("x1", lineStartPoint.x)
            .attr("y1", lineStartPoint.y)
            .attr("x2", mx)
            .attr("y2", my)
            .attr("stroke", "red")
            .attr("stroke-width", 2);

        tempLine.remove();

        const dataXStart = currentTransform.rescaleX(x).invert(lineStartPoint.x);
        console.log(dataXStart)
        const dataYStart = g.node().__currentY.invert(lineStartPoint.y);
        const dataXEnd = currentTransform.rescaleX(x).invert(mx);
        const dataYEnd = g.node().__currentY.invert(my);

        const lineData = { 
            id: lineID++, 
            startX: dataXStart,
            startY: dataYStart,
            endX: dataXEnd,
            endY: dataYEnd,
        };


        trendLines.push(lineData);
        lineStartPoint = null;
    }

}
