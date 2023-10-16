import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';  // Make sure to install axios
import { generateChart, manageLineDrawing } from "../helper/canvas-helper"
import Chartleft from './chart_data/chart_left';
import TextTool from '../chartTools/TextTool.js'
import ChatBox from '../components/chart_data/chatbox.js'

import  FinancialChartComponent from '../components/ChartComponent/Chart.js'

const D3JS = () => {
  const chartRef = useRef(null);
  const priceAxiesRef = useRef(null)
  const toolTipRef = useRef(null);
  const [enableLineDrawing, setEnableLineDrawing] = useState(false)
  const [isActive, setIsActive] = useState(false);
  const enableLineDrawingBtnRef = useRef(null)
  const [chartType, setChartType] = useState('candlestick');
  const [data, setData] = useState([]);  // State to hold fetched data
  const zoomRectRef = useRef(null);

  //getting the intial redering of the x and Y scales 
  const [xScaleSet, setXScaleSet] = useState(null)
  const [yScaleSet, setYScaleSet] = useState(null)

  //Storing the trend lines in states
  const [trendLinesData, setTrendLinesData] = useState([])

  //Toggleing States between Indicators
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showExponentialMovingAverage, setShowExponentialMovingAverage] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  const [showFib, setShowFib] = useState(false)

  //Keep Track of  Line Drawing states
  const [lineType, setLineType] = useState("ray");


  const toggleLineDrawing = () => {
    setEnableLineDrawing(true);
    setShowTextTool(false);
    setShowFib(false);
    setIsActive(prev => !prev);
};

const toggleTextTool = () => {
    setShowTextTool(true);
    setEnableLineDrawing(false);
    setShowFib(false);
};
 
const toggleFibTool = () => {
    setShowFib(true);
    setShowTextTool(false);
    setEnableLineDrawing(false);
};

  function toggleMovingAverage() {
    setShowMovingAverage(!showMovingAverage);



  }
  function toggleExponentialMovingAverage() {
    setShowExponentialMovingAverage(!showExponentialMovingAverage)
  }
  
  //Active States Styling 



  //Text Tool Draggin


    //For the textTool
    const toolContainerRef = useRef(null);
    const toolHeaderRef = useRef(null)
  
    const [isDragging, setIsDragging] = useState(false)
    const [offsetX, setOffsetX] = useState(0)
    const [offsetY, setOffsetY] = useState(0)
  

  const handleCloseTextTool= () => 
  { 
    const toolContainer = toolContainerRef.current;

    if (toolContainer) {
      toolContainer.style.display = 'none';
  }

  setShowTextTool(false);

  }  


  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffsetX(e.clientX - toolContainerRef.current.getBoundingClientRect().left);
    setOffsetY(e.clientY - toolContainerRef.current.getBoundingClientRect().top);
    toolHeaderRef.current.style.cursor = 'grabbing';
};

const handleMouseUp = () => {
    setIsDragging(false);
    toolHeaderRef.current.style.cursor = 'grab';
};

const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    toolContainerRef.current.style.left = x + 'px';
    toolContainerRef.current.style.top = y + 'px';
};
  //Text Tool Draggin
  

  useEffect(() => { 
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

  },[data])


  const margin = { top: 55, right: 80, bottom: 40, left: 53 };
  //Setting the width for the charts to be passed
  const [chartWidth, setChartWidth] = useState(null)
  const [chartHeight, setChartHeight] = useState(null)

  useEffect(() => {

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(chartRef.current).style("cursor", "crosshair");

    //TODO can we calculate this instead of hard code?
  




    // Create responsive container
    const svgDiv = d3.select(chartRef.current)
      .append("div")
      .classed("svg-container", true);  // Make it responsive


      const zoomRect = svgDiv.select("rect");
      zoomRectRef.current = zoomRect;
    
    // Get initial dimensions
    const initialWidth = parseInt(svgDiv.style("width")) - margin.left - margin.right;
    const initialHeight = parseInt(svgDiv.style("height")) - margin.top - margin.bottom;

    setChartWidth(initialWidth)
    setChartHeight(initialHeight)


  

     
        

    // Create SVG element
    const svgContainer = svgDiv.append('svg')
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .classed("svg-content-responsive", true);  // Make it responsive

      //Getting the height data to manipulate the inner G element height.
      const svgContainerHeight = svgContainer.node().getBoundingClientRect().height;
      const svgContainerRect = svgContainer.node().getBoundingClientRect()



    // Create SVG element for price axis
    const priceAxisSvg = d3.select(priceAxiesRef.current)
      .append("svg")
      .attr("width", initialWidth)  // Width of the price axis container
      .attr("height", initialHeight)  // Set the height to be the same as the main SVG
      .attr("class", "price-axis-container");


    // Create the main group element
    const svg = svgContainer
      .append('g')
      .attr('transform', `translate(${0}, ${margin.top})`);

  

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
      generateChart(chartType, svg, newG, data, newWidth, newHeight, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, newPriceAxisSvg, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, lineType);
    };



    // Initial chart drawing
    generateChart(chartType, svg, g, data, initialWidth, initialHeight, svgContainerHeight, svgContainerRect, enableLineDrawing, priceAxiesRef, priceAxisSvg, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, lineType);

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


  const x = d3.scaleUtc()
  .domain(d3.extent(data, d => new Date(d.Date)))  // Assuming Date is in correct format
  .range([0, chartWidth + 200]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => Math.min(d.Low, d.Close)),
      d3.max(data, d => Math.max(d.High, d.Close))
    ])
    .range([chartHeight, 0]);


    console.log("Logging the chart widt", chartWidth)
    console.log("Loggin in useEFfect height",chartHeight)

    
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
    manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, null, null, lineType,x,y);
  }
  if (showTextTool) {
    manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, showTextTool, "text", null, x, y);
  }

  if (showFib) {
    manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, showFib, null, null, x, y);
  }




}, [enableLineDrawing, showTextTool, lineType]);

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
      </div>

      <div className="chart-wrapper">
      <div className="chart-modal">
             <Chartleft
            toggleChartType={toggleChartType}
            toggleLineDrawing={toggleLineDrawing}
            toggleTextTool = {toggleTextTool}
            toggleFibTool = {toggleFibTool}
            isActive = {isActive}
            setLineType = {setLineType}
            lineType = {lineType}


          />


          <div className = "chart-container">

          <div className = "chart-inner-wrapper">
        <button className = "close-text-tool" onClick={toggleMovingAverage}>Toggle SMA</button>
        <button className = "close-text-tool" onClick={toggleExponentialMovingAverage}>Toggle EMA</button>
        </div>


         
          <div ref={chartRef}>

          </div>
          {/* <FinancialChartComponent data = {data} /> */}

          <div ref = {toolContainerRef} 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className = "text-tool-container">
     

          <div class = "scroll-wrapper">

          <div 
          ref = {toolHeaderRef}
          onMouseDown={handleMouseDown}
          style = {{cursor:'grab'}}
          className = "text-tool-header">
              <h2 style = {{fontSize: "20px"}}>Text</h2>

          </div>
          <div className = "flex-row-text-tool">
              <div className = "color-change-div">
                <span className = "color-change-inner-div"></span>
              </div>

              <select className = "font-change-div" name = "font-size"> 
              <option value="" disabled selected>14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="22">22</option>
              <option value="24">24</option>
              <option value="26">26</option>
              <option value="28">28</option>

              </select>
              <div className = "color-change-div">
                <span className = "bold">B</span>
              </div>
              <div className = "color-change-div">
                <span className = "italic">
                  I
                </span>
              </div>


            </div>


          <div className = "text-tool-wrapper">
         
            <textarea className = "text-area">
            </textarea>
          </div>


          <div data-section-name="TextTextColorSelect" class="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B"><div class="inner-tBgV1m0B"><div class="wrap-Q2NZ0gvI"><label class="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw"><span class="wrapper-GZajBGIm">
            
            <input class="input-GZajBGIm" type="checkbox" name="toggle-enabled" value="on" />
            <span class="box-GZajBGIm check-GZajBGIm"><span class="icon-GZajBGIm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none"><path stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path></svg></span></span></span><span class="label-vyj6oJxw"><span class="title-FG0u1J5p">Background</span></span></label></div></div>
            
              <div className = "bg-check-box">
                
              </div>
            </div>


          <div data-section-name="TextTextColorSelect" class="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B"><div class="inner-tBgV1m0B"><div class="wrap-Q2NZ0gvI"><label class="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw"><span class="wrapper-GZajBGIm">
            
            <input class="input-GZajBGIm" type="checkbox" name="toggle-enabled" value="on" />
            <span class="box-GZajBGIm check-GZajBGIm"><span class="icon-GZajBGIm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none"><path stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path></svg></span></span></span><span class="label-vyj6oJxw"><span class="title-FG0u1J5p">Border</span></span></label></div></div>
            
            
            <div className = "bg-check-box">
                
                </div></div>
            
       
          <div data-section-name="TextTextColorSelect" class="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B"><div class="inner-tBgV1m0B"><div class="wrap-Q2NZ0gvI"><label class="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw"><span class="wrapper-GZajBGIm">
            
            <input class="input-GZajBGIm" type="checkbox" name="toggle-enabled" value="on" />
            <span class="box-GZajBGIm check-GZajBGIm"><span class="icon-GZajBGIm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none"><path stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path></svg></span></span></span><span class="label-vyj6oJxw"><span class="title-FG0u1J5p">Text Wrap</span></span></label></div></div></div>




 
          </div>
          <div className = "text-tool-footer">
  <select className = "font-change-div" name = "font-size"> 
              <option value="" disabled selected>Template</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="22">22</option>
              <option value="24">24</option>
              <option value="26">26</option>
              <option value="28">28</option>

              </select>
        
        <div className = "text-button-container">
        <button  class = "cancel-text-tool">Cancel</button>
  <button onClick={handleCloseTextTool} class = "close-text-tool">Okay</button>

        </div>

  </div>


        </div>


          {/* <div className="price-axies-container" ref={priceAxiesRef}></div> */}
        </div>



          <ChatBox />

        </div>

      </div>
      






    </div>
  );
};

export default D3JS;