// import { handleTextTool } from './drawingTools/textTool';
// import { handleFibTool } from './drawingTools/fibTool';
// import { handleRayTool } from './drawingTools/rayTool';
// import { handleTrendTool } from './drawingTools/trendTool';
// // ... (other imports)

// export const manageLineDrawing = (svg, g, overlay, enableLineDrawing, showTextTool, showFib, drawingType, x , y) => {
//     const handlers = {
//         'text': handleTextTool,
//         'fib': handleFibTool,
//         'ray': handleRayTool,
//         'trend': handleTrendTool,
//         // ... (other handlers)
//     };

//     const currentHandler = handlers[drawingType];

//     if (currentHandler) {
//         currentHandler(svg, g, overlay, enableLineDrawing, showTextTool, showFib, x, y);
//     } else {
//         console.warn(`Drawing type "${drawingType}" is not recognized.`);
//     }
// };
