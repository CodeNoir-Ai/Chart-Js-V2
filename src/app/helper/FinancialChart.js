import * as d3 from 'd3';


export class FinancialChart {
    
    constructor(container, initialConfig = {}) {
        this.attrs = {
            width: container.clientWidth,
            height: container.clientHeight,
            margin: { top: 30, right: 80, bottom: 40, left: 83 },
            data: [],
            xScale: d3.scaleUtc(),
            yScale: d3.scaleLinear(),
    

        };
        
        Object.assign(this.attrs, initialConfig);

        //Handles the Switching Between Chart Types 

        
        // this.chartTypes = 
        // { 
        //     "line": generateLineChart,
        //     "candlestick" : generateCandleStickChart,

        //     // We will add more as needed 
        // }




        this.isLineDrawingEnable = false;
        this.lineStartPoint = null;
        this.tempLine = null;

        

        this.container = container;
        this.initializeChartComponents();
        window.addEventListener("resize", this.handleResize.bind(this));

    }

    initializeChartComponents() {
        this.svg = d3.select(this.container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content-responsive", true);

        this.chartArea = this.svg
            .append("g")
            .attr("transform", `translate(${this.attrs.margin.left}, ${this.attrs.margin.top})`);

       this.attrs.yScale.range([this.attrs.height - this.attrs.margin.top - this.attrs.margin.bottom, 0]);


        //Creating a overlay for the line drawing
        this.drawingOverlay  = this.chartArea.append("rect")
        .attr("width", this.attrs.width - this.attrs.margin.left - this.attrs.margin.right)
        .attr("height", this.attrs.height - this.attrs.margin.top - this.attrs.margin.bottom)
        .attr("fill", "transparent");  // This makes it invisible

        if (this.isLineDrawingEnabled) {
            this.drawingOverlay
                .on("mousedown", this.startLine.bind(this))
                .on("mousemove", this.drawLine.bind(this))
                .on("mouseup", this.endLine.bind(this));
        }
  

        this.initializeGridLines();
        this.initializeAxes();
    }

    handleResize() {
        this.svg.selectAll('*').remove(); // Clear out old elements
        this.attrs.width = this.container.clientWidth;
        this.attrs.height = this.container.clientHeight;
        this.update(this.attrs.data);
    }

    initializeGridLines() {
        
        const yGridLines = d3.axisLeft(this.attrs.yScale).ticks(10)
        .tickSize(-this.attrs.width + this.attrs.margin.left + this.attrs.margin.right)
        .tickFormat(""); //No tick labels
    

        this.chartArea.append("g")
            .attr("class", "y-gridlines")
            .attr("transform", `translate(0, 0)`)  // No need to translate
            .call(yGridLines);

        const xGridLines = d3.axisBottom(this.attrs.xScale)
            .ticks(10)
            .tickSize(this.attrs.height - this.attrs.margin.top - this.attrs.margin.bottom);

        this.chartArea.append("g")
            .attr("class", "x-gridlines")
            .call(xGridLines);
    }

    initializeAxes() {
        this.chartArea.append("g")
            .attr("class", "y-axis");

       
    const xAxis = d3.axisBottom(this.attrs.xScale)
        .ticks(10)
        .tickSize(-(this.attrs.height - this.attrs.margin.top - this.attrs.margin.bottom));

        this.chartArea.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.attrs.height - this.attrs.margin.top - this.attrs.margin.bottom})`)
            .call(xAxis)

    }

    render() {


        this.chartArea.select(".y-gridlines")
        .call(d3.axisLeft(this.attrs.yScale)
            .tickSize(-this.attrs.width + this.attrs.margin.left + this.attrs.margin.right)
            .ticks(10)
            .tickFormat(""));  // Empty tick labels for grid lines

        const lineGenerator = d3.line()
            .x(d => this.attrs.xScale(d.Date))
            .y(d => this.attrs.yScale(d.Close));

        let line = this.chartArea.selectAll(".line-path").data([this.attrs.data]);

        line.enter()
            .append("path")
            .merge(line)
            .attr("class", "line-path")
            .attr("d", lineGenerator)
            .attr("fill", "none")
            .attr("stroke", "steelblue");

        this.chartArea.select(".x-axis").call(d3.axisBottom(this.attrs.xScale));
        this.chartArea.select(".y-axis").call(d3.axisLeft(this.attrs.yScale));




    }

    update(data) {
        this.attrs.data = data;

        this.attrs.xScale
                .domain(d3.extent(this.attrs.data, d => d.Date))
            .range([0, this.attrs.width - this.attrs.margin.left - this.attrs.margin.right]);

        this.attrs.yScale
            .domain([d3.min(this.attrs.data, d => d.Close), d3.max(this.attrs.data, d => d.Close)])
            .range([this.attrs.height - this.attrs.margin.top - this.attrs.margin.bottom, 0]);

        this.render();
    }

    destroy() {
        window.removeEventListener("resize", this.handleResize);
    }


}


