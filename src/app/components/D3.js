import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import Chartleft from './chart_data/chart_left';
import { generateChart, manageLineDrawing } from "../helper/canvas-helper";
import ChatBox from '../components/chart_data/chatbox.js';
import TextTool from '../chartTools/TextTool.js';
import LineToolPopUp from '../chartTools/LineToolPopup';
import LineToolSettings from '../chartTools/LineToolSettings';

const D3JS = () => {
    const chartRef = useRef(null);
    const priceAxiesRef = useRef(null);
    const toolTipRef = useRef(null);
    const enableLineDrawingBtnRef = useRef(null);
    // For textTool
    const toolContainerRef = useRef(null);
    const toolHeaderRef = useRef(null);
    const zoomRectRef = useRef(null);

    const [enableLineDrawing, setEnableLineDrawing] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [chartType, setChartType] = useState('candlestick');
    // State to hold fetched data
    const [data, setData] = useState([]);
    // Setting the width for the charts to be passed
    const [chartWidth, setChartWidth] = useState(null)
    const [chartHeight, setChartHeight] = useState(null)
    // Getting the intial redering of the x and Y scales 
    const [xScaleSet, setXScaleSet] = useState(null);
    const [yScaleSet, setYScaleSet] = useState(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    // Storing the trend lines in states
    const [trendLinesData, setTrendLinesData] = useState([]);
    const [showMovingAverage, setShowMovingAverage] = useState(false);
    const [showExponentialMovingAverage, setShowExponentialMovingAverage] = useState(false);
    const [showTextTool, setShowTextTool] = useState(false);
    const [showFib, setShowFib] = useState(false);
    // Keep Track of  Line Drawing states
    const [lineType, setLineType] = useState("ray");
    const [isDragging, setIsDragging] = useState(false)
    
    // Effect for fetching data
    useEffect(() => {
        axios.get('http://localhost:3001/stockdata')
        .then(response => {
            if (!Array.isArray(response.data) || !response.data.length) {
            console.error('Invalid data format', response.data);
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
    }, [data]);

    function toggleMovingAverage() {
        setShowMovingAverage(!showMovingAverage);
    }

    function toggleExponentialMovingAverage() {
        setShowExponentialMovingAverage(!showExponentialMovingAverage)
    }

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
        setShowTextTool(false);
        setEnableLineDrawing(false);
        setShowFib(false);
    };

    const handleCloseTextTool = () => {
        const toolContainer = toolContainerRef.current;
        if (toolContainer) toolContainer.style.display = 'none';
        setShowTextTool(false);
    }; 

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const containerRect = toolContainerRef.current.getBoundingClientRect();
        setOffsetX(e.clientX - containerRect.left);
        setOffsetY(e.clientY - containerRect.top);
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
        const container = toolContainerRef.current;
        container.style.left = x + 'px';
        container.style.top = y + 'px';
    };
      
    const margin = {top: 55, right: 80, bottom: 40, left: 53};

    useEffect(() => {
        const chartContainer = d3.select(chartRef.current);
        chartContainer.selectAll('*').remove();
        chartContainer.style('cursor', 'crosshair');
        
        // Create responsive SVG container
        const svgContainer = d3.select(chartRef.current)
            .append('div')
            .classed('svg-container', true); // Make it responsive
        const zoomRect = svgContainer.select("rect");
        zoomRectRef.current = zoomRect;
        
        // Get initial dimensions based on available space and margins
        const initialWidth = parseInt(svgContainer.style('width')) - margin.left - margin.right;
        const initialHeight = parseInt(svgContainer.style('height')) - margin.top - margin.bottom;
        
        // Set chart width and height as state values
        setChartWidth(initialWidth);
        setChartHeight(initialHeight);
        
        // Create a responsive SVG element
        const svg = svgContainer
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .classed('svg-content-responsive', true); // Make it responsive
        
        // Getting the height data to manipulate the inner G element height.
        const svgContainerHeight = svgContainer.node().getBoundingClientRect().height;
        const svgContainerRect = svgContainer.node().getBoundingClientRect();
        
        // Create an SVG element for the price axis
        const priceAxisSvg = d3.select(priceAxiesRef.current)
            .append('svg')
            .attr('width', initialWidth)
            .attr('height', initialHeight)
            .attr('class', 'price-axis-container');
        
        // Create the main group element for the chart
        const mainGroupElement = svg
            .append('g')
            .attr('transform', `translate(${0}, ${margin.top})`);
        
        // Create a nested group element
        const nestedGroup = mainGroupElement.append('g').attr('transform', 'translate(0, 0)');
        
        // Function to handle window resizes and update the chart
        const handleResize = () => {
            // Get new dimensions based on available space and margins
            const newWidth = parseInt(svgContainer.style('width')) - margin.left - margin.right;
            const newHeight = parseInt(svgContainer.style('height')) - margin.top - margin.bottom;
        
            // Update the viewBox attribute for responsiveness
            svg.attr('viewBox', `0 0 ${newWidth + margin.left + margin.right} ${newHeight + margin.top + margin.bottom}`);
        
            // Clear previous chart elements
            d3.select(priceAxiesRef.current).selectAll('*').remove();
            svg.selectAll('*').remove();
        
            // Create a new SVG element for the price axis
            const newPriceAxisSvg = d3.select(priceAxiesRef.current)
            .append('svg')
            .attr('width', 50)
            .attr('height', newHeight);
        
            // Create a new nested group element
            const newNestedGroup = mainGroup.append('g').attr('transform', 'translate(0, 0)');
        
            // Call the generateChart function with new dimensions
            generateChart(
                chartType, svg, newNestedGroup, data,
                newWidth, newHeight, svgContainerHeight, svgContainerRect,
                enableLineDrawing, priceAxiesRef, newPriceAxisSvg, showMovingAverage,
                showExponentialMovingAverage, showFib, showTextTool, lineType
            );
        };
        
        // Initialize chart drawing
        generateChart(
            chartType, svg, nestedGroup, data, initialWidth,
            initialHeight, svgContainerHeight, svgContainerRect,
            enableLineDrawing, priceAxiesRef, priceAxisSvg,
            showMovingAverage, showExponentialMovingAverage,
            showFib, showTextTool, lineType
        );
        
        // Attach an event listener to handle window resizes
        window.addEventListener('resize', handleResize);
        
        // Return a cleanup function to remove the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [chartType, priceAxiesRef]);


    useEffect(() => {
        // Don't see use for margin obj
        // const margin = { top: 30, right: 80, bottom: 40, left: 53 };
        const svg = d3.select(chartRef.current).select('svg').select('g');
        const overlay = svg.select(".overlay");
        const zoomRect = svg.select("rect");
    
        if (overlay.empty() || zoomRect.empty()) {
            console.warn("No overlay or zoomRect found");
            return;
        }
    
        const x = d3.scaleUtc()
            .domain(d3.extent(data, d => new Date(d.Date)))
            .range([0, chartWidth + 200]);
    
        const y = d3.scaleLinear()
            .domain([
                d3.min(data, d => Math.min(d.Low, d.Close)),
                d3.max(data, d => Math.max(d.High, d.Close))
            ])
            .range([chartHeight, 0]);

        console.log("Chart width:", chartWidth);
        console.log("Chart height:", chartHeight);

        // Check if overlay exists
        if (overlay.empty()) {
            console.warn("No overlay found");
            return;
        }

        // Check if zoomRect exists 
        if (zoomRect.empty()) {
            console.warn("No zoomRect found");
            return;
        }

        // Remove existing event listeners
        overlay.on("mousedown", null);
        overlay.on("mousemove", null);
        zoomRect.on("mousedown", null);
        zoomRect.on("mousemove", null);
    
        // Re-attach event listeners if line drawing is enabled
        // if exist ? perform function : or else
        enableLineDrawing ? manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, null, null, lineType, x, y) : null;
        showTextTool ? manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, showTextTool, "text", null, x, y) : null;
        showFib ? manageLineDrawing(svg, svg.select('g'), overlay, enableLineDrawing, showFib, null, null, x, y) : null;

            
    }, [enableLineDrawing, showTextTool, lineType]);
    
    // UseEffect to handle showcasing the moving averages
    useEffect(() => {
        const svg = d3.select(chartRef.current).select('svg').select('g');
        
        if (!svg) {
            console.warn("SVG or group element not found");
            return;
        }
        
        svg.select("#movingAverageLine").style("display", showMovingAverage ? null : "none");
        svg.select("#expmovingAverageLine").style("display", showExponentialMovingAverage ? null : "none");
    }, [showMovingAverage, showExponentialMovingAverage, chartRef]);         

    const toggleChartType = () => { setChartType(prevType => prevType === 'candlestick' ? 'line' : 'candlestick');};
    
    return (
      <div>
        <div className="controls"></div>
        <div className="chart-wrapper">
          <div className="chart-modal">
            {/* Handling the Chart Bar Tool Selector */}
            <Chartleft
              toggleChartType={toggleChartType}
              toggleLineDrawing={toggleLineDrawing}
              toggleTextTool={toggleTextTool}
              toggleFibTool={toggleFibTool}
              isActive={isActive}
              setLineType={setLineType}
              lineType={lineType} />
            {/* Surrounding container that holds the chart */}
            <div className="chart-container">
              <div className="chart-inner-wrapper">
                <button className="close-text-tool" onClick={toggleMovingAverage}>Toggle SMA</button>
                <button className="close-text-tool" onClick={toggleExponentialMovingAverage}>Toggle EMA</button>
              </div>
              <div ref={chartRef}></div>
              <div ref={toolContainerRef} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="text-tool-container">
                <div className="scroll-wrapper">
                  <div ref={toolHeaderRef} onMouseDown={handleMouseDown} style={{ cursor: 'grab' }} className="text-tool-header">
                    <h2 style={{ fontSize: "20px" }}>Text</h2>
                  </div>
                  <div className="flex-row-text-tool">
                    <div className="color-change-div">
                      <span className="color-change-inner-div"></span>
                    </div>
                    <select className="font-change-div" name="font-size">
                      <option value="" disabled selected>14</option>
                      <option value="16">16</option>
                      <option value="18">18</option>
                      <option value="20">20</option>
                      <option value="22">22</option>
                      <option value="24">24</option>
                      <option value="26">26</option>
                      <option value="28">28</option>
                    </select>
                    <div className="color-change-div">
                      <span className="bold">B</span>
                    </div>
                    <div className="color-change-div">
                      <span className="italic">I</span>
                    </div>
                  </div>
                  <div className="text-tool-wrapper">
                    <textarea className="text-area"></textarea>
                  </div>
                  {/* Background Checkbox */}
                  <div className="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B">
                    <div className="inner-tBgV1m0B">
                      <div className="wrap-Q2NZ0gvI">
                        <label className="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw">
                          <span className="wrapper-GZajBGIm">
                            <input className="input-GZajBGIm" type="checkbox" name="toggle-enabled" value="on" />
                            <span className="box-GZajBGIm check-GZajBGIm">
                              <span className="icon-GZajBGIm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none">
                                  <path stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path>
                                </svg>
                              </span>
                            </span>
                          </span>
                          <span className="label-vyj6oJxw">
                            <span className="title-FG0u1J5p">Background</span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="bg-check-box"></div>
                  </div>
                  {/* Border Checkbox */}
                  <div className="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B">
                    <div className="inner-tBgV1m0B">
                      <div className="wrap-Q2NZ0gvI">
                        <label className="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw">
                          <span className="wrapper-GZajBGIm">
                            <input className="input-GZajBGIm" type="checkbox" name="toggle-enabled" value="on" />
                            <span className="box-GZajBGIm check-GZajBGIm">
                              <span className="icon-GZajBGIm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none">
                                  <path stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path>
                                </svg>
                              </span>
                            </span>
                          </span>
                          <span className="label-vyj6oJxw">
                            <span className="title-FG0u1J5p">Border</span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="bg-check-box"></div>
                  </div>
                  {/* Text Wrap Checkbox */}
                  <div className="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B">
                    <div className="inner-tBgV1m0B">
                      <div className="wrap-Q2NZ0gvI">
                        <label className="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw">
                          <span className="wrapper-GZajBGIm">
                            <input className="input-GZajBGIm" type="checkbox" name="toggle-enabled" value="on" />
                            <span className="box-GZajBGIm check-GZajBGIm">
                              <span className="icon-GZajBGIm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none">
                                  <path stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path>
                                </svg>
                              </span>
                            </span>
                          </span>
                          <span className="label-vyj6oJxw">
                            <span className="title-FG0u1J5p">Text Wrap</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="text-tool-footer">
                    <select className="font-change-div" name="font-size">
                      <option value="" disabled selected>Template</option>
                      <option value="16">16</option>
                      <option value="18">18</option>
                      <option value="20">20</option>
                      <option value="22">22</option>
                      <option value="24">24</option>
                      <option value="26">26</option>
                      <option value="28">28</option>
                    </select>
                    <div className="text-button-container">
                      <button class="cancel-text-tool">Cancel</button>
                      <button onClick={handleCloseTextTool} class="close-text-tool">Okay</button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Dealing with LineDrawing tool text popup */}
              <LineToolPopUp />
              <LineToolSettings />
              {/* Dealing with LineDrawing tool text popup */}
            </div>
            <ChatBox />
          </div>
        </div>
      </div>
    );
};
export default D3JS;