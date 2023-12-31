import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';  // Make sure to install axios
import style from '../../styles/Home.module.css'
import MainData from '../../public/assets/XRP-USD.json';  // Assuming this is correct
import styles from '../../styles/chart.module.css';
import {generateChart, generateCandleStickChart, generateLineChart, manageLineDrawing} from '../../pages/helper/canvas-helper'
import Chartleft from './chart_data/chart_left';
const D3JS = () => {
  const chartRef = useRef(null);
  const priceAxiesRef = useRef(null)
  const toolTipRef = useRef(null);
  const [enableLineDrawing, setEnableLineDrawing] = useState(false)
  const [chartType, setChartType] = useState('candlestick'); 
  const [data, setData] = useState([]);  // State to hold fetched data
  const [zoomState, setZoomState] = useState();


  const toggleLineDrawing = () => {  // 2. Add toggle function
    setEnableLineDrawing(!enableLineDrawing);
  };


  useEffect(() => {

    d3.select(chartRef.current).selectAll("*").remove();
   
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

    // const parsedData = MainData.map(d => {
    //   const date = new Date(d.Date);
    //   const open = +d.Open;
    //   const high = +d.High;
    //   const low = +d.Low;
    //   const close = +d.Close;
    //   if (!date || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
    //     console.error('Invalid data entry:', d);
    //     return null;
    //   }
    //   return { Date: date, Open: open, High: high, Low: low, Close: close };
    // }).filter(Boolean);
    // setData(parsedData);
    



    // Create responsive container
    const svgDiv = d3.select(chartRef.current)
      .append("div")
      .classed("svg-container", true);  // Make it responsive
  
    // Get initial dimensions
    const initialWidth = parseInt(svgDiv.style("width")) - margin.left - margin.right;
    const initialHeight = parseInt(svgDiv.style("height")) - margin.top - margin.bottom;
  
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
    generateChart(chartType, svg, newG, data, newWidth, newHeight, enableLineDrawing, priceAxiesRef, newPriceAxisSvg, setZoomState, zoomState);
    };





    // Initial chart drawing
    generateChart(chartType, svg, g, data, initialWidth, initialHeight, enableLineDrawing, priceAxiesRef, priceAxisSvg, setZoomState, zoomState);
  
    manageLineDrawing(svg, enableLineDrawing)

    // Attach resize event listener
    window.addEventListener('resize', handleResize);
  
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };


    // Initialize margins and data

  },[chartType, priceAxiesRef]);

  // This useEffect toggles line drawing on and off
useEffect(() => {
  const svg = d3.select(chartRef.current).select('g');
  console.log(enableLineDrawing)

manageLineDrawing(svg, g, zoomRect, enableLineDrawing);
}, [enableLineDrawing]);

  
  const toggleChartType = () => {
    setChartType(prevType => prevType === 'candlestick' ? 'line' : 'candlestick');
  };

  return (
    <div>
      <div className="controls">
      {/* <button onClick={toggleChartType}>{chartType === 'candlestick' ? 'Show Line Chart' : 'Show CandleStick Chart'}</button> */}
        <button onClick={toggleLineDrawing}>Toggle Line Drawing</button>
        <button>Delete Lines</button>
      </div>

<div className = "chart-wrapper">
<div className="chart-container">
      <Chartleft 
      toggleChartType={toggleChartType}
      toggleLineDrawing={toggleLineDrawing}
      />
        <div ref={chartRef}></div>

        <div className="price-axies-container" ref={priceAxiesRef}></div>
      </div>
</div>
      
    </div>
  );
};

export default D3JS;