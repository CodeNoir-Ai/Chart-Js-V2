import * as d3 from 'd3';



export const FibTool = (svg, overlay, g, yScale) => {
  const width = svg.node().getBoundingClientRect().width;

  let startPoint = null;
  let endPoint = null;
  let tempLines = [];
  let tempRects = [];

  const fibColors = ["orange", "pink", "blue", "green", "purple"];
  const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 1];

  overlay.on("click", (event) => {
      const [mx, my] = d3.pointer(event);
      const priceAtPoint = yScale.invert(my);

      if (!startPoint) {
          startPoint = { x: mx, y: my, price: priceAtPoint };
          console.log('Start Point Price:', startPoint.price);


          fibLevels.forEach((level, index) => {
              const tempLine = g.append("line")
                  .attr("x1", mx)
                  .attr("y1", my)
                  .attr("x2", width)
                  .attr("y2", my)
                  .attr("stroke", "blue")
                  .attr("stroke-width", 1.5);
              tempLines.push(tempLine);

              if (index < fibLevels.length - 1) {
                  const tempRect = g.append("rect")
                      .attr("x", mx)
                      .attr("y", my)
                      .attr("width", width)
                      .attr("height", 0)
                      .attr("fill", fibColors[index])
                      .attr("opacity", 0.5);
                  tempRects.push(tempRect);
              }
          });

      } else {
          tempLines.forEach(line => line.remove());
          tempRects.forEach(rect => rect.remove());
          tempLines = [];
          tempRects = [];

          endPoint = { x: mx, y: my, price: priceAtPoint };

          const direction = mx < startPoint.x ? "left" : "right";
          const priceDiff = endPoint.price - startPoint.price;

          fibLevels.forEach((level, index) => {
              const priceLevel = startPoint.price + priceDiff * level;
              const y = yScale(priceLevel);

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
                  .attr("stroke-width", 1.5);

              if (index < fibLevels.length - 1) {
                  const nextPriceLevel = startPoint.price + priceDiff * fibLevels[index + 1];
                  const nextY = yScale(nextPriceLevel);
                  g.append("rect")
                      .attr("x", rectX)
                      .attr("y", Math.min(y, nextY))
                      .attr("width", rectWidth)
                      .attr("height", Math.abs(nextY - y))
                      .attr("fill", fibColors[index])
                      .attr("opacity", 0.5);
              }
          });

          startPoint = null;
      }
  });

  overlay.on("mousemove", (event) => {
      if (startPoint && tempLines.length) {
          const [mx, my] = d3.pointer(event);
          const priceAtCursor = yScale.invert(my);
          const priceDiff = priceAtCursor - startPoint.price;
          const direction = mx < startPoint.x ? "left" : "right";

          tempLines.forEach((line, index) => {
              const priceLevel = startPoint.price + priceDiff * fibLevels[index];
              const y = yScale(priceLevel);
              if (direction === "left") {
                  line.attr("x1", 0).attr("x2", startPoint.x);
              } else {
                  line.attr("x1", startPoint.x).attr("x2", width);
              }
              line.attr("y1", y).attr("y2", y);
          });

          tempRects.forEach((rect, index) => {
              const priceLevel = startPoint.price + priceDiff * fibLevels[index];
              const y = yScale(priceLevel);
              const nextPriceLevel = startPoint.price + priceDiff * fibLevels[index + 1];
              const nextY = yScale(nextPriceLevel);
              const rectHeight = Math.abs(nextY - y);
              const rectY = priceDiff >= 0 ? y : y - rectHeight;

              if (direction === "left") {
                  rect.attr("x", 0).attr("width", startPoint.x);
              } else {
                  rect.attr("x", startPoint.x).attr("width", width - startPoint.x);
              }
              rect.attr("y", Math.min(y, nextY)).attr("height", rectHeight);
          });
      }
  });
};



