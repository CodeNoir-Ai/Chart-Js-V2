
import * as d3 from 'd3';


export const handleTextTool = (svg, overlay) => {
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
        d3.select(".text-area").on("input", function() {
            const value = d3.select(this).property("value");
            svgText.text(value);
        });
    });
}
