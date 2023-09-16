"use client"
import styles from '../styles/Home.module.css'
import ChartContents from './components/chat_contents'
import Image from 'next/image';
import Chartright from './components/chart_data/chart_right';
import Chartleft from './components/chart_data/chart_left'

import ChartJs from './components/ChartJs'
import D3JS from './components/RED3'

import *  as d3 from 'd3';
import { useEffect, useState, useRef } from 'react';

export function Header() {
    return (
        <>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Interactive Charts</title>
                    <script src="https://d3js.org/d3.v6.min.js"></script>
                </meta>
            </meta>
        </>
    )
}



export default function Home() {

    const [drawing, isDrawing] = useState(false)

    const chartRef = useRef(null);
    const priceAxiesRef = useRef(null)
    const toolTipRef = useRef(null);
    const [enableLineDrawing, setEnableLineDrawing] = useState(false)
    const [chartType, setChartType] = useState('candlestick');
    const [data, setData] = useState([]);  // State to hold fetched data
    var svg
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    var g


    let lineStartPoint = null;
    useEffect(() => {
        svg = d3.select("svg")
        g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
        // var svg = document.querySelector("svg")
        const width = svg.style.width - margin.left - margin.right;
        const height = svg.style.height - margin.top - margin.bottom;
        const tooltip = d3.select('.tooltip');

        let currentChart = 'candlestick';  // Setting a default valuexx

        // For responsiveness
        window.addEventListener("resize", function () {
            alert("yeah")
        });



        // Show Candlestick by default on page load
        if (currentChart === 'candlestick') {
            showCandlestick();
        } else {
            showLineChart();
        }
    }, [chartType])

    //This shoujld be built universally and externally, needs be independedn
    function showCandlestick() {
        //currentChart = 'candlestick';  // Update the current chart value

        fetch('http://localhost:3001/stockdata')
            .then(response => response.json())
            .then(data => {
                renderCandlestick(data);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
            });
    }
    function showLineChart() {
        currentChart = 'linechart';  // Update the current chart value

        g.selectAll('*').remove();

        fetch('http://localhost:3001/stockdata')
            .then(response => response.json())
            .then(data => {
                renderChart(data);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
            });

        function renderChart(data) {
            const width = parseInt(svg.style("width")) - margin.left - margin.right;
            const height = parseInt(svg.style("height")) - margin.top - margin.bottom;

            const x = d3.scaleUtc()
                .domain(d3.extent(data, d => new Date(d.date)))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([d3.min(data, d => d.close), d3.max(data, d => d.close)])
                .nice()
                .range([height, 0]);

            const xAxis = d3.axisBottom(x);
            const yAxis = d3.axisLeft(y);

            const yAxisGrid = d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat('')
                .ticks(10);

            g.append("g")
                .attr("class", "y-grid")
                .call(yAxisGrid);

            // Add x-axis grid lines
            const xAxisGrid = d3.axisBottom(x)
                .tickSize(-height)
                .tickFormat('')
                .ticks(6);

            g.append("g")
                .attr("class", "x-grid")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxisGrid);

            g.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);

            g.append("g").call(yAxis);

            const line = d3.line()
                .x(d => x(new Date(d.date)))
                .y(d => y(d.close));

            const linePath = g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line);

            g.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => x(new Date(d.date)))
                .attr("cy", d => y(d.close))
                .attr("r", 3)
                .on('mouseover', (event, d) => {
                    tooltip.style('display', 'block')
                        .html(`
                <div>Date: ${d.date}</div>
                <div>Close Price: ${d.close}</div>
            `)
                        .style('left', (event.pageX + 15) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', () => {
                    tooltip.style('display', 'none');
                });

            const crosshair = g.append('g').style('display', 'none');
            const crosshairX = crosshair.append("line").attr("class", "crosshair").attr("y1", 0).attr("y2", height);
            const crosshairY = crosshair.append("line").attr("class", "crosshair").attr("x1", 0).attr("x2", width);

            svg.on("mousemove", (event) => {
                const [mx, my] = d3.pointer(event);
                const mouseX = mx - margin.left;
                const mouseY = my - margin.top;
                crosshair.style('display', null);
                crosshairX.attr("x1", mouseX).attr("x2", mouseX);
                crosshairY.attr("y1", mouseY).attr("y2", mouseY);
            });

            svg.on("mouseleave", () => {
                crosshair.style("display", "none");
            });
            svg.on("mousedown", (event) => {
                if (enableLineDrawing) {


                    const [mx, my] = d3.pointer(event);
                    const mouseX = mx - margin.left;
                    const mouseY = my - margin.top;

                    if (!lineStartPoint) {
                        lineStartPoint = { x: mouseX, y: mouseY };
                    } else {
                        g.append("line")
                            .attr("x1", lineStartPoint.x)
                            .attr("y1", lineStartPoint.y)
                            .attr("x2", mouseX)
                            .attr("y2", mouseY)
                            .attr("stroke", "black")
                            .attr("stroke-width", 1.5);
                        lineStartPoint = null;
                    }
                }
            });

            svg.on("mousemove", (event) => {

                if (enableLineDrawing) {
                    if (lineStartPoint) {
                        const [mx, my] = d3.pointer(event);
                        const mouseX = mx - margin.left;
                        const mouseY = my - margin.top;

                        // Remove old temporary line
                        g.selectAll(".temp-line").remove();

                        // Draw a new temporary line
                        g.append("line")
                            .attr("class", "temp-line")
                            .attr("x1", lineStartPoint.x)
                            .attr("y1", lineStartPoint.y)
                            .attr("x2", mouseX)
                            .attr("y2", mouseY)
                            .attr("stroke", "black")
                            .attr("stroke-width", 1.5)
                            .attr("stroke-dasharray", "4 4");
                    }
                }
            });
            const zoom = d3.zoom()
                .scaleExtent([1, 20])
                .on("zoom", (event) => {
                    const transform = event.transform;
                    const newX = transform.rescaleX(x);
                    g.select(".x-axis").call(xAxis.scale(newX));
                    g.selectAll(".dot")
                        .attr("cx", d => newX(new Date(d.date)));
                    line.x(d => newX(new Date(d.date)));
                    linePath.attr("d", line);
                });
            svg.call(zoom);
        }
    }

    function renderCandlestick(data) {
        console.log(data)
        const width = parseInt(svg.style("width")) - margin.left - margin.right;
        const height = parseInt(svg.style("height")) - margin.top - margin.bottom;
        g.selectAll('*').remove();

        const x = d3.scaleUtc()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
            .range([innerHeight, 0]);

        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        // Add y-axis grid lines
        const yAxisGrid = d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
            .ticks(10);

        g.append("g")
            .attr("class", "y-grid")
            .call(yAxisGrid);

        // Add x-axis grid lines
        const xAxisGrid = d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat('')
            .ticks(6);

        g.append("g")
            .attr("class", "x-grid")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxisGrid);


        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis);

        g.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        const crosshair = g.append('g').style('display', 'none');
        const crosshairX = crosshair.append("line")
            .attr("class", "crosshair")
            .attr("y1", 0)
            .attr("y2", innerHeight);

        const crosshairY = crosshair.append("line")
            .attr("class", "crosshair")
            .attr("x1", 0)
            .attr("x2", innerWidth);

        svg.on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event);
            const mouseX = mx - margin.left;
            const mouseY = my - margin.top;
            crosshair.style('display', null);
            crosshairX.attr("x1", mouseX).attr("x2", mouseX);
            crosshairY.attr("y1", mouseY).attr("y2", mouseY);
        });
        svg.on("mouseleave", () => {
            crosshair.style("display", "none");
        });
        const initialWidth = 6;
        const bars = g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(new Date(d.date)) - initialWidth / 2)
            .attr("y", d => y(Math.max(d.open, d.close)))
            .attr("height", d => Math.abs(y(d.open) - y(d.close)))
            .attr("width", initialWidth)
            .attr("fill", d => d.open > d.close ? "red" : "green")
            .on('mouseover', (event, d) => {
                tooltip.style('display', 'block')
                    .html(`
            <div>Date: ${d.date}</div>
            <div>Open: ${d.open}</div>
            <div>Close: ${d.close}</div>
            <div>High: ${d.high}</div>
            <div>Low: ${d.low}</div>
        `)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 15) + 'px');
            })
            .on('mouseout', () => {
                tooltip.style('display', 'none');
            });

        const lines = g.selectAll(".line")
            .data(data)
            .enter().append("line")
            .attr("class", "line")
            .attr("x1", d => x(new Date(d.date)))
            .attr("y1", d => y(d.high))
            .attr("x2", d => x(new Date(d.date)))
            .attr("y2", d => y(d.low))
            .attr("stroke", d => d.open > d.close ? "red" : "green");
        svg.on("mousedown", (event) => {
            const [mx, my] = d3.pointer(event);
            const mouseX = mx - margin.left;
            const mouseY = my - margin.top;

            if (!lineStartPoint) {
                lineStartPoint = { x: mouseX, y: mouseY };
            } else {
                g.append("line")
                    .attr("x1", lineStartPoint.x)
                    .attr("y1", lineStartPoint.y)
                    .attr("x2", mouseX)
                    .attr("y2", mouseY)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1.5);
                lineStartPoint = null;
            }
        });

        svg.on("mousemove", (event) => {
            if (lineStartPoint) {
                const [mx, my] = d3.pointer(event);
                const mouseX = mx - margin.left;
                const mouseY = my - margin.top;

                // Remove old temporary line
                g.selectAll(".temp-line").remove();

                // Draw a new temporary line
                g.append("line")
                    .attr("class", "temp-line")
                    .attr("x1", lineStartPoint.x)
                    .attr("y1", lineStartPoint.y)
                    .attr("x2", mouseX)
                    .attr("y2", mouseY)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4 4");
            }
        });


        const zoom = d3.zoom()
            .scaleExtent([1, 20])
            .on("zoom", (event) => {
                const transform = event.transform;
                const minTranslateX = (1 - transform.k) * x(new Date(data[0].date));
                if (transform.x > minTranslateX) {
                    transform.x = minTranslateX;
                }
                const newX = transform.rescaleX(x);
                const newWidth = initialWidth * Math.sqrt(transform.k);
                g.select(".x-axis").call(xAxis.scale(newX));
                bars.attr("x", d => newX(new Date(d.date)) - newWidth / 2)
                    .attr("width", newWidth);
                lines.attr("x1", d => newX(new Date(d.date)))
                    .attr("x2", d => newX(new Date(d.date)));
            });

        svg.call(zoom);
    }


    return (<>

        <div class="controls">
            <button onClick={() => { showCandlestick() }}>Show Candlestick Chart</button>
            <button onclick={() => { showLineChart() }}>Show Line Chart</button>
            <button onclick="toggleDrawing()">Toggle Drawing</button>
            <button onclick="deleteLines()">Delete Lines</button>
        </div>


        <div class="chart-container">
            <svg id="svg" width="100%" height="100%"></svg>
            <div class="tooltip"></div>
        </div>


    </>
    )



}