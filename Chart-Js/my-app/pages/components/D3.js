import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';  // Make sure to install axios

import MainData from '../../public/assets/XRP-USD.json';  // Assuming this is correct
import styles from '../../styles/chart.module.css';
import {generateChart, generateCandleStickChart, generateLineChart} from '../../pages/helper/canvas-helper'

const D3JS = () => {
  const chartRef = useRef(null);
  const toolTipRef = useRef(null);
  const [enableLineDrawing, setEnableLineDrawing] = useState(false)
  const [chartType, setChartType] = useState('line'); 
  const [data, setData] = useState([]);  // State to hold fetched data


  const toggleLineDrawing = () => {  // 2. Add toggle function
    setEnableLineDrawing(!enableLineDrawing);
  };


  useEffect(() => {

    d3.select(chartRef.current).selectAll("*").remove();
   
    const margin = { top: 70, right: 60, bottom: 50, left: 80 };
    // Fetch data from local server
    axios.get('http://localhost:3001/stockdata')
      .then(response => {
        setData(response.data);  // Update state with fetched data
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    
    // Parse the date and convert the close to a number
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
      d.Date = parseDate(d.Date);
      d.Close = +d.Close;
    });
  

    // Create responsive container
    const svgDiv = d3.select(chartRef.current)
      .append("div")
      .classed("svg-container", true);  // Make it responsive
  
    // Get initial dimensions
    const initialWidth = parseInt(svgDiv.style("width")) - margin.left - margin.right;
    const initialHeight = parseInt(svgDiv.style("height")) - margin.top - margin.bottom;
  
    // Create SVG element
    const svgContainer = svgDiv.append('svg')
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${initialWidth + margin.left + margin.right} ${initialHeight + margin.top + margin.bottom}`)
      .classed("svg-content-responsive", true);  // Make it responsive
  
    // Create the main group element
    const svg = svgContainer
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    // Create Grid lines
    const g = svg.append("g").attr("transform", "translate(0, 0)");
  
    // Function to handle window resize
    const handleResize = () => {
      // Get new dimensions
      const newWidth = parseInt(svgDiv.style("width")) - margin.left - margin.right;
      const newHeight = parseInt(svgDiv.style("height")) - margin.top - margin.bottom;
  
      // Update the viewBox attribute for responsiveness
      svgContainer.attr("viewBox", `0 0 ${newWidth + margin.left + margin.right} ${newHeight + margin.top + margin.bottom}`);
  
      // Remove previous chart elements
      svg.selectAll('*').remove();
  
      // Recreate the main group element
      const newG = svg.append("g").attr("transform", "translate(0, 0)");
  
      // Call the generateLineChart function with new dimensions
      generateChart(chartType, svg, newG, data, newWidth, newHeight);
    };
  
    // Initial chart drawing
    generateChart(chartType, svg, g, data, initialWidth, initialHeight);
  
    // Attach resize event listener
    window.addEventListener('resize', handleResize);
  
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };

    console.log("Data:", data);
    console.log("X Scale:", x.domain(), x.range());
    console.log("Y Scale:", y.domain(), y.range());
    // Initialize margins and data

  }, [ chartType]);
  
  

  return (
    <div>
      <div className="controls">
        <button onClick={() => setChartType('candlestick')}>Show CandleStick Chart</button>
        <button onClick={() => setChartType('line')}>Show Line Chart</button>
        <button onClick={toggleLineDrawing}>Toggle Line Drawing</button>
        <button>Delete Lines</button>
      </div>

      <div className="chart-container">
        <div ref={chartRef}></div>
      </div>
    </div>
  );
};

export default D3JS;
