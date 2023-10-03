import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';  // Make sure to install axios
import { generateChart, manageLineDrawing } from "../helper/canvas-helper"
import Chartleft from './chart_data/chart_left';
const D3JS = () => {
  const chartRef = useRef(null);
  const priceAxiesRef = useRef(null)
  const toolTipRef = useRef(null);
  const [enableLineDrawing, setEnableLineDrawing] = useState(false)
  const [chartType, setChartType] = useState('candlestick');
  const [data, setData] = useState([]);  // State to hold fetched data
  const zoomRectRef = useRef(null);

  //getting the intial redering of the x and Y scales 
  const xScaleRef = useRef();
  const yScaleRef = useRef()

  //Storing the trend lines in states
  const [trendLinesData, setTrendLinesData] = useState([])

  //Toggleing States between Indicators
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showExponentialMovingAverage, setShowExponentialMovingAverage] = useState(false);


  const toggleLineDrawing = () => {  // 2. Add toggle function
    setEnableLineDrawing(!enableLineDrawing);
  };
  function toggleMovingAverage() {
    setShowMovingAverage(!showMovingAverage)
  }
  function toggleExponentialMovingAverage() {
    setShowExponentialMovingAverage(!showExponentialMovingAverage)
  }
  
  


  useEffect(() => {

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(chartRef.current).style("cursor", "crosshair");

    //TODO can we calculate this instead of hard code?
    const margin = { top: 30, right: 80, bottom: 40, left: 53 };
    axios.get('http://localhost:3001/stockdata')
      .then(response => {
        if (!Array.isArray(response.data) || !response.data.length) {
          console.log(response.data)
          console.error('Invalid data format');
          return;
        }
        const parsedData = response.data.map(d => {
          const date = new Date(d.date);
          const open = +d.open;
          const high = +d.high;
          const low = +d.low;
          const close = +d.close;
          if (!date || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
            console.error('Invalid data entry:', d);
            return null;
          }
          return { Date: date, Open: open, High: high, Low: low, Close: close };
        }).filter(Boolean);
        setData(parsedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });





    // Create responsive container
    const svgDiv = d3.select(chartRef.current)
      .append("div")
      .classed("svg-container", true);  // Make it responsive


      const zoomRect = svgDiv.select("rect");
      zoomRectRef.current = zoomRect;
    
    // Get initial dimensions
    const initialWidth = parseInt(svgDiv.style("width")) - margin.left - margin.right;
    const initialHeight = parseInt(svgDiv.style("height")) - margin.top - margin.bottom;




    const xscale = d3.scaleUtc()
    .domain(d3.extent(data, d => d.Date))
    .range([0, initialWidth])
  
      
    let xScaleRef = xscale;

     
        

    // Create SVG element
    const svgContainer = svgDiv.append('svg')
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .classed("svg-content-responsive", true);  // Make it responsive

    // Create SVG element for price axis
    const priceAxisSvg = d3.select(priceAxiesRef.current)
      .append("svg")
      .attr("width", initialWidth)  // Width of the price axis container
      .attr("height", initialHeight)  // Set the height to be the same as the main SVG
      .attr("class", "price-axis-container");


    // Create the main group element
    const svg = svgContainer
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create Grid lines
    // const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const g = svg.append("g").attr("transform", "translate(0, 0)");

    // Function to handle window resize
    const handleResize = () => {
      // Get new dimensions
      const newWidth = parseInt(svgDiv.style("width")) - margin.left - margin.right;
      const newHeight = parseInt(svgDiv.style("height")) - margin.top - margin.bottom;

      // Update the viewBox attribute for responsiveness
      svgContainer.attr("viewBox", `0 0 ${newWidth + margin.left + margin.right} ${newHeight + margin.top + margin.bottom}`);

      d3.select(priceAxiesRef.current).selectAll('*').remove();
      // Remove previous chart elements
      svg.selectAll('*').remove();

      const newPriceAxisSvg = d3.select(priceAxiesRef.current)
        .append("svg")
        .attr("width", 50)
        .attr("height", newHeight);
      // Recreate the main group element
      const newG = svg.append("g").attr("transform", "translate(0, 0)");

      // Call the generateLineChart function with new dimensions
      generateChart(chartType, svg, newG, data, newWidth, newHeight, enableLineDrawing, priceAxiesRef, newPriceAxisSvg, showMovingAverage, showExponentialMovingAverage);
    };



    // Initial chart drawing
    generateChart(chartType, svg, g, data, initialWidth, initialHeight, enableLineDrawing, priceAxiesRef, priceAxisSvg, showMovingAverage, showExponentialMovingAverage);

    // Attach resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };


    // Initialize margins and data

  }, [chartType, priceAxiesRef]);

  // Add this useEffect to your existing component
// Second useEffect for line drawing
useEffect(() => {
  const margin = { top: 30, right: 80, bottom: 40, left: 53 };

  // Select the existing SVG and group elements
  const svg = d3.select(chartRef.current).select('svg').select('g');
  // Assuming you have a rect for zooming in your SVG
  const zoomRect = svg.select("rect");
  const overlay = svg.select(".overlay");

  console.log(xScaleRef.invert(150), "Loggin teh ref")


  if (overlay.empty()) {
    console.warn("No overlay found");
    return;
  }
  
  // Check if zoomRect exists
  if (zoomRect.empty()) {
    console.warn("No zoomRect found");
    return;
  }

  // Remove existing event listeners to avoid duplication
  overlay.on("mousedown", null);
  overlay.on("mousemove", null);

  zoomRect.on("mousedown", null);
  zoomRect.on("mousemove", null); 

  // Re-attach event listeners if line drawing is enabled
  if (enableLineDrawing) {
    manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, "trend", x, y, trendLinesData);
  }


}, [enableLineDrawing]);

useEffect(() => {
  // Select the existing SVG and group elements
  const svg = d3.select(chartRef.current).select('svg').select('g');




  // Check if the SVG and group elements are available
  if (!svg.empty()) {
    if (showMovingAverage) {
      // If showMovingAverage is true, display the moving average line
      svg.select("#movingAverageLine").style("display", null); // or "block"
    } else {
      // If showMovingAverage is false, hide the moving average line
      svg.select("#movingAverageLine").style("display", "none");
    }

    if(showExponentialMovingAverage){
      svg.select("#expmovingAverageLine").style("display", null); // or "block"

    }else { 
      svg.select("#expmovingAverageLine").style("display", "none");

    }

  } else {
    console.warn("SVG or group element not found");
  }
}, [showMovingAverage, showExponentialMovingAverage, chartRef]);





  const toggleChartType = () => {
    setChartType(prevType => prevType === 'candlestick' ? 'line' : 'candlestick');
  };

  return (
    <div>
      <div className="controls">
        {/* <button onClick={toggleChartType}>{chartType === 'candlestick' ? 'Show Line Chart' : 'Show CandleStick Chart'}</button> */}
      </div>

      <div className="chart-wrapper">
      <div className="chart-modal">
        <div className = "chart-inner-wrapper">
        <button onClick={toggleMovingAverage}>Toggle SMA</button>
        <button onClick={toggleExponentialMovingAverage}>Toggle EMA</button>
        </div>

          <div className = "chart-container">
          <Chartleft
            toggleChartType={toggleChartType}
            toggleLineDrawing={toggleLineDrawing}
          />
          <div ref={chartRef}></div>

          <div className="price-axies-container" ref={priceAxiesRef}></div>
        </div>
        </div>

      </div>

    </div>
  );
};

export default D3JS;