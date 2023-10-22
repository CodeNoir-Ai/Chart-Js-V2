import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';  // Make sure to install axios
import { generateChart, manageLineDrawing } from "../helper/canvas-helper"
// import { manageLineDrawing } from '../helper/LineDrawing/manageLineDrawing';
import Chartleft from './chart_data/chart_left';
import TextTool from '../chartTools/TextTool.js'
import LineToolPopUp from '../chartTools/LineToolPopup' 
import LineToolSettings from '../chartTools/LineToolSettings' 
import ChatBox from './chart_data/chatbox.js'

const D3JS = () => {

  const chartRef = useRef(null);
  const toolTipRef = useRef(null);
  const enableLineDrawingBtnRef = useRef(null);
  // For textTool
  const toolContainerRef = useRef(null);
  const toolHeaderRef = useRef(null);
  const zoomRectRef = useRef(null);

  const [enableLineDrawing, setEnableLineDrawing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [chartType, setChartType] = useState("candlestick");
  // State to hold fetched data
  const [data, setData] = useState([]);
  // Setting the width for the charts to be passed
  const [chartWidth, setChartWidth] = useState(null);
  const [chartHeight, setChartHeight] = useState(null);
  // Getting the intial redering of the x and Y scales
  const [xScaleSet, setXScaleSet] = useState(null);
  const [yScaleSet, setYScaleSet] = useState(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  // Storing the trend lines in states
  const [trendLinesData, setTrendLinesData] = useState([]);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showExponentialMovingAverage, setShowExponentialMovingAverage] =
    useState(false);
  const [showTextTool, setShowTextTool] = useState(false);
  const [showFib, setShowFib] = useState(false);
  // Keep Track of  Line Drawing states
  const [lineType, setLineType] = useState("ray");
  const [isDragging, setIsDragging] = useState(false);


 // Toggle functions for tools and indicators

  // // Fetching data for the chart
  // useEffect(() => { 
  //   axios.get('http://localhost:3001/stockdata')
  //   .then(response => {
  //     if (!Array.isArray(response.data) || !response.data.length) {
  //       console.log(response.data)
  //       console.error('Invalid data format');
  //       return;
  //     }
  //     const parsedData = response.data.map(d => {
  //       const date = new Date(d.date);
  //       const open = +d.open;
  //       const high = +d.high;
  //       const low = +d.low;
  //       const close = +d.close;
  //       if (!date || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
  //         console.error('Invalid data entry:', d);
  //         return null;
  //       }
  //       return { Date: date, Open: open, High: high, Low: low, Close: close };
  //     }).filter(Boolean);
  //     setData(parsedData);
  //   })
  //   .catch(error => {
  //     console.error('Error fetching data:', error);
  //   });

  // },[data])


  const hardcodedData = [
    {
      date: "2023-07-11T04:00:00.000Z",
      open: 189.160004,
      high: 189.300003,
      low: 186.600006,
      close: 188.080002,
      volume: 46638100,
      adjClose: 187.82637,
    },
    {
      date: "2023-07-10T04:00:00.000Z",
      open: 189.259995,
      high: 189.990005,
      low: 187.039993,
      close: 188.610001,
      volume: 59922200,
      adjClose: 188.355652,
    },
    {
      date: "2023-07-07T04:00:00.000Z",
      open: 191.410004,
      high: 192.669998,
      low: 190.240005,
      close: 190.679993,
      volume: 46778000,
      adjClose: 190.422852,
    },
    {
      date: "2023-07-06T04:00:00.000Z",
      open: 189.839996,
      high: 192.020004,
      low: 189.199997,
      close: 191.809998,
      volume: 45094300,
      adjClose: 191.551331,
    },
    {
      date: "2023-07-05T04:00:00.000Z",
      open: 191.570007,
      high: 192.979996,
      low: 190.619995,
      close: 191.330002,
      volume: 46920300,
      adjClose: 191.071976,
    },
    {
      date: "2023-07-03T04:00:00.000Z",
      open: 193.779999,
      high: 193.880005,
      low: 191.759995,
      close: 192.460007,
      volume: 31458200,
      adjClose: 192.20047,
    },
    {
      date: "2023-06-30T04:00:00.000Z",
      open: 191.630005,
      high: 194.479996,
      low: 191.259995,
      close: 193.970001,
      volume: 85069600,
      adjClose: 193.70842,
    },
    {
      date: "2023-06-29T04:00:00.000Z",
      open: 189.080002,
      high: 190.070007,
      low: 188.940002,
      close: 189.589996,
      volume: 46347300,
      adjClose: 189.33432,
    },
    {
      date: "2023-06-28T04:00:00.000Z",
      open: 187.929993,
      high: 189.899994,
      low: 187.600006,
      close: 189.25,
      volume: 51216800,
      adjClose: 188.994781,
    },
    {
      date: "2023-06-27T04:00:00.000Z",
      open: 185.889999,
      high: 188.389999,
      low: 185.669998,
      close: 188.059998,
      volume: 50730800,
      adjClose: 187.806381,
    },
    {
      date: "2023-06-26T04:00:00.000Z",
      open: 186.830002,
      high: 188.050003,
      low: 185.229996,
      close: 185.270004,
      volume: 48088700,
      adjClose: 185.020157,
    },
    {
      date: "2023-06-23T04:00:00.000Z",
      open: 185.550003,
      high: 187.559998,
      low: 185.009995,
      close: 186.679993,
      volume: 53079300,
      adjClose: 186.428238,
    },
    {
      date: "2023-06-22T04:00:00.000Z",
      open: 183.740005,
      high: 187.050003,
      low: 183.669998,
      close: 187,
      volume: 51245300,
      adjClose: 186.747818,
    },
    {
      date: "2023-06-21T04:00:00.000Z",
      open: 184.899994,
      high: 185.410004,
      low: 182.589996,
      close: 183.960007,
      volume: 49515700,
      adjClose: 183.711929,
    },
    {
      date: "2023-06-20T04:00:00.000Z",
      open: 184.410004,
      high: 186.100006,
      low: 184.410004,
      close: 185.009995,
      volume: 49799100,
      adjClose: 184.760498,
    },
    {
      date: "2023-06-16T04:00:00.000Z",
      open: 186.729996,
      high: 186.990005,
      low: 184.270004,
      close: 184.919998,
      volume: 101235600,
      adjClose: 184.670624,
    },
    {
      date: "2023-06-15T04:00:00.000Z",
      open: 183.960007,
      high: 186.520004,
      low: 183.779999,
      close: 186.009995,
      volume: 65433200,
      adjClose: 185.759155,
    },
    {
      date: "2023-06-14T04:00:00.000Z",
      open: 183.369995,
      high: 184.389999,
      low: 182.020004,
      close: 183.949997,
      volume: 57462900,
      adjClose: 183.701935,
    },
    {
      date: "2023-06-13T04:00:00.000Z",
      open: 182.800003,
      high: 184.149994,
      low: 182.440002,
      close: 183.309998,
      volume: 54929100,
      adjClose: 183.06279,
    },
    {
      date: "2023-06-12T04:00:00.000Z",
      open: 181.270004,
      high: 183.889999,
      low: 180.970001,
      close: 183.789993,
      volume: 54274900,
      adjClose: 183.542145,
    },
    {
      date: "2023-06-09T04:00:00.000Z",
      open: 181.5,
      high: 182.229996,
      low: 180.630005,
      close: 180.960007,
      volume: 48870700,
      adjClose: 180.715973,
    },
    {
      date: "2023-06-08T04:00:00.000Z",
      open: 177.899994,
      high: 180.839996,
      low: 177.460007,
      close: 180.570007,
      volume: 50214900,
      adjClose: 180.326492,
    },
    {
      date: "2023-06-07T04:00:00.000Z",
      open: 178.440002,
      high: 181.210007,
      low: 177.320007,
      close: 177.820007,
      volume: 61944600,
      adjClose: 177.5802,
    },
    {
      date: "2023-06-06T04:00:00.000Z",
      open: 179.970001,
      high: 180.119995,
      low: 177.429993,
      close: 179.210007,
      volume: 64848400,
      adjClose: 178.968338,
    },
    {
      date: "2023-06-05T04:00:00.000Z",
      open: 182.630005,
      high: 184.949997,
      low: 178.039993,
      close: 179.580002,
      volume: 121946500,
      adjClose: 179.33783,
    },
    {
      date: "2023-06-02T04:00:00.000Z",
      open: 181.029999,
      high: 181.779999,
      low: 179.259995,
      close: 180.949997,
      volume: 61945900,
      adjClose: 180.705978,
    },
    {
      date: "2023-06-01T04:00:00.000Z",
      open: 177.699997,
      high: 180.119995,
      low: 176.929993,
      close: 180.089996,
      volume: 68901800,
      adjClose: 179.847137,
    },
    {
      date: "2023-05-31T04:00:00.000Z",
      open: 177.330002,
      high: 179.350006,
      low: 176.759995,
      close: 177.25,
      volume: 99625300,
      adjClose: 177.010971,
    },
    {
      date: "2023-05-30T04:00:00.000Z",
      open: 176.960007,
      high: 178.990005,
      low: 176.570007,
      close: 177.300003,
      volume: 55964400,
      adjClose: 177.060898,
    },
    {
      date: "2023-05-26T04:00:00.000Z",
      open: 173.320007,
      high: 175.770004,
      low: 173.110001,
      close: 175.429993,
      volume: 54835000,
      adjClose: 175.19342,
    },
    {
      date: "2023-05-25T04:00:00.000Z",
      open: 172.410004,
      high: 173.899994,
      low: 171.690002,
      close: 172.990005,
      volume: 56058300,
      adjClose: 172.756714,
    },
    {
      date: "2023-05-24T04:00:00.000Z",
      open: 171.089996,
      high: 172.419998,
      low: 170.520004,
      close: 171.839996,
      volume: 45143500,
      adjClose: 171.608261,
    },
    {
      date: "2023-05-23T04:00:00.000Z",
      open: 173.130005,
      high: 173.380005,
      low: 171.279999,
      close: 171.559998,
      volume: 50747300,
      adjClose: 171.328644,
    },
    {
      date: "2023-05-22T04:00:00.000Z",
      open: 173.979996,
      high: 174.710007,
      low: 173.449997,
      close: 174.199997,
      volume: 43570900,
      adjClose: 173.965073,
    },
    {
      date: "2023-05-19T04:00:00.000Z",
      open: 176.389999,
      high: 176.389999,
      low: 174.940002,
      close: 175.160004,
      volume: 55772400,
      adjClose: 174.923798,
    },
    {
      date: "2023-05-18T04:00:00.000Z",
      open: 173,
      high: 175.240005,
      low: 172.580002,
      close: 175.050003,
      volume: 65496700,
      adjClose: 174.813934,
    },
    {
      date: "2023-05-17T04:00:00.000Z",
      open: 171.710007,
      high: 172.929993,
      low: 170.419998,
      close: 172.690002,
      volume: 57951600,
      adjClose: 172.457123,
    },
    {
      date: "2023-05-16T04:00:00.000Z",
      open: 171.990005,
      high: 173.139999,
      low: 171.800003,
      close: 172.070007,
      volume: 42110300,
      adjClose: 171.837967,
    },
    {
      date: "2023-05-15T04:00:00.000Z",
      open: 173.160004,
      high: 173.210007,
      low: 171.470001,
      close: 172.070007,
      volume: 37266700,
      adjClose: 171.837967,
    },
    {
      date: "2023-05-12T04:00:00.000Z",
      open: 173.619995,
      high: 174.059998,
      low: 171,
      close: 172.570007,
      volume: 45497800,
      adjClose: 172.33728,
    },
    {
      date: "2023-05-11T04:00:00.000Z",
      open: 173.850006,
      high: 174.589996,
      low: 172.169998,
      close: 173.75,
      volume: 49514700,
      adjClose: 173.276016,
    },
    {
      date: "2023-05-10T04:00:00.000Z",
      open: 173.020004,
      high: 174.029999,
      low: 171.899994,
      close: 173.559998,
      volume: 53724500,
      adjClose: 173.086533,
    },
    {
      date: "2023-05-09T04:00:00.000Z",
      open: 173.050003,
      high: 173.539993,
      low: 171.600006,
      close: 171.770004,
      volume: 45326900,
      adjClose: 171.301422,
    },
    {
      date: "2023-05-08T04:00:00.000Z",
      open: 172.479996,
      high: 173.850006,
      low: 172.110001,
      close: 173.5,
      volume: 55962800,
      adjClose: 173.026688,
    },
    {
      date: "2023-05-05T04:00:00.000Z",
      open: 170.979996,
      high: 174.300003,
      low: 170.759995,
      close: 173.570007,
      volume: 113316400,
      adjClose: 173.096512,
    },
    {
      date: "2023-05-04T04:00:00.000Z",
      open: 164.889999,
      high: 167.039993,
      low: 164.309998,
      close: 165.789993,
      volume: 81235400,
      adjClose: 165.337723,
    },
    {
      date: "2023-05-03T04:00:00.000Z",
      open: 169.5,
      high: 170.919998,
      low: 167.160004,
      close: 167.449997,
      volume: 65136000,
      adjClose: 166.993195,
    },
    {
      date: "2023-05-02T04:00:00.000Z",
      open: 170.089996,
      high: 170.350006,
      low: 167.539993,
      close: 168.539993,
      volume: 48425700,
      adjClose: 168.080215,
    },
    {
      date: "2023-05-01T04:00:00.000Z",
      open: 169.279999,
      high: 170.449997,
      low: 168.639999,
      close: 169.589996,
      volume: 52472900,
      adjClose: 169.127365,
    },
    {
      date: "2023-04-28T04:00:00.000Z",
      open: 168.490005,
      high: 169.850006,
      low: 167.880005,
      close: 169.679993,
      volume: 55209200,
      adjClose: 169.217117,
    },
    {
      date: "2023-04-27T04:00:00.000Z",
      open: 165.190002,
      high: 168.559998,
      low: 165.190002,
      close: 168.410004,
      volume: 64902300,
      adjClose: 167.950592,
    },
    {
      date: "2023-04-26T04:00:00.000Z",
      open: 163.059998,
      high: 165.279999,
      low: 162.800003,
      close: 163.759995,
      volume: 45498800,
      adjClose: 163.313263,
    },
    {
      date: "2023-04-25T04:00:00.000Z",
      open: 165.190002,
      high: 166.309998,
      low: 163.729996,
      close: 163.770004,
      volume: 48714100,
      adjClose: 163.323242,
    },
    {
      date: "2023-04-24T04:00:00.000Z",
      open: 165,
      high: 165.600006,
      low: 163.889999,
      close: 165.330002,
      volume: 41949600,
      adjClose: 164.878983,
    },
    {
      date: "2023-04-21T04:00:00.000Z",
      open: 165.050003,
      high: 166.449997,
      low: 164.490005,
      close: 165.020004,
      volume: 58337300,
      adjClose: 164.569839,
    },
    {
      date: "2023-04-20T04:00:00.000Z",
      open: 166.089996,
      high: 167.869995,
      low: 165.559998,
      close: 166.649994,
      volume: 52456400,
      adjClose: 166.195374,
    },
    {
      date: "2023-04-19T04:00:00.000Z",
      open: 165.800003,
      high: 168.160004,
      low: 165.539993,
      close: 167.630005,
      volume: 47720200,
      adjClose: 167.172729,
    },
    {
      date: "2023-04-18T04:00:00.000Z",
      open: 166.100006,
      high: 167.410004,
      low: 165.649994,
      close: 166.470001,
      volume: 49923000,
      adjClose: 166.015884,
    },
    {
      date: "2023-04-17T04:00:00.000Z",
      open: 165.089996,
      high: 165.389999,
      low: 164.029999,
      close: 165.229996,
      volume: 41516200,
      adjClose: 164.779251,
    },
    {
      date: "2023-04-14T04:00:00.000Z",
      open: 164.589996,
      high: 166.320007,
      low: 163.820007,
      close: 165.210007,
      volume: 49386500,
      adjClose: 164.759323,
    },
    {
      date: "2023-04-13T04:00:00.000Z",
      open: 161.630005,
      high: 165.800003,
      low: 161.419998,
      close: 165.559998,
      volume: 68445600,
      adjClose: 165.108353,
    },
    {
      date: "2023-04-12T04:00:00.000Z",
      open: 161.220001,
      high: 162.059998,
      low: 159.779999,
      close: 160.100006,
      volume: 50133100,
      adjClose: 159.663254,
    },
    {
      date: "2023-04-11T04:00:00.000Z",
      open: 162.350006,
      high: 162.360001,
      low: 160.509995,
      close: 160.800003,
      volume: 47644200,
      adjClose: 160.361343,
    },
    {
      date: "2023-04-10T04:00:00.000Z",
      open: 161.419998,
      high: 162.029999,
      low: 160.080002,
      close: 162.029999,
      volume: 47716900,
      adjClose: 161.587982,
    },
    {
      date: "2023-04-06T04:00:00.000Z",
      open: 162.429993,
      high: 164.960007,
      low: 162,
      close: 164.660004,
      volume: 45390100,
      adjClose: 164.210815,
    },
    {
      date: "2023-04-05T04:00:00.000Z",
      open: 164.740005,
      high: 165.050003,
      low: 161.800003,
      close: 163.759995,
      volume: 51511700,
      adjClose: 163.313263,
    },
    {
      date: "2023-04-04T04:00:00.000Z",
      open: 166.600006,
      high: 166.839996,
      low: 165.110001,
      close: 165.630005,
      volume: 46278300,
      adjClose: 165.178177,
    },
    {
      date: "2023-04-03T04:00:00.000Z",
      open: 164.270004,
      high: 166.289993,
      low: 164.220001,
      close: 166.169998,
      volume: 56976200,
      adjClose: 165.71669,
    },
    {
      date: "2023-03-31T04:00:00.000Z",
      open: 162.440002,
      high: 165,
      low: 161.910004,
      close: 164.899994,
      volume: 68749800,
      adjClose: 164.45015,
    },
    {
      date: "2023-03-30T04:00:00.000Z",
      open: 161.529999,
      high: 162.470001,
      low: 161.270004,
      close: 162.360001,
      volume: 49501700,
      adjClose: 161.917099,
    },
    {
      date: "2023-03-29T04:00:00.000Z",
      open: 159.369995,
      high: 161.050003,
      low: 159.350006,
      close: 160.770004,
      volume: 51305700,
      adjClose: 160.331436,
    },
    {
      date: "2023-03-28T04:00:00.000Z",
      open: 157.970001,
      high: 158.490005,
      low: 155.979996,
      close: 157.649994,
      volume: 45992200,
      adjClose: 157.219925,
    },
    {
      date: "2023-03-27T04:00:00.000Z",
      open: 159.940002,
      high: 160.770004,
      low: 157.869995,
      close: 158.279999,
      volume: 52390300,
      adjClose: 157.848221,
    },
    {
      date: "2023-03-24T04:00:00.000Z",
      open: 158.860001,
      high: 160.339996,
      low: 157.850006,
      close: 160.25,
      volume: 59196500,
      adjClose: 159.812851,
    },
    {
      date: "2023-03-23T04:00:00.000Z",
      open: 158.830002,
      high: 161.550003,
      low: 157.679993,
      close: 158.929993,
      volume: 67622100,
      adjClose: 158.496429,
    },
    {
      date: "2023-03-22T04:00:00.000Z",
      open: 159.300003,
      high: 162.139999,
      low: 157.809998,
      close: 157.830002,
      volume: 75701800,
      adjClose: 157.399445,
    },
    {
      date: "2023-03-21T04:00:00.000Z",
      open: 157.320007,
      high: 159.399994,
      low: 156.539993,
      close: 159.279999,
      volume: 73938300,
      adjClose: 158.845474,
    },
    {
      date: "2023-03-20T04:00:00.000Z",
      open: 155.070007,
      high: 157.820007,
      low: 154.149994,
      close: 157.399994,
      volume: 73641400,
      adjClose: 156.970612,
    },
    {
      date: "2023-03-17T04:00:00.000Z",
      open: 156.080002,
      high: 156.740005,
      low: 154.279999,
      close: 155,
      volume: 98944600,
      adjClose: 154.577164,
    },
    {
      date: "2023-03-16T04:00:00.000Z",
      open: 152.160004,
      high: 156.460007,
      low: 151.639999,
      close: 155.850006,
      volume: 76161100,
      adjClose: 155.42485,
    },
    {
      date: "2023-03-15T04:00:00.000Z",
      open: 151.190002,
      high: 153.25,
      low: 149.919998,
      close: 152.990005,
      volume: 77167900,
      adjClose: 152.572662,
    },
    {
      date: "2023-03-14T04:00:00.000Z",
      open: 151.279999,
      high: 153.399994,
      low: 150.100006,
      close: 152.589996,
      volume: 73695900,
      adjClose: 152.173737,
    },
    {
      date: "2023-03-13T04:00:00.000Z",
      open: 147.809998,
      high: 153.139999,
      low: 147.699997,
      close: 150.470001,
      volume: 84457100,
      adjClose: 150.059525,
    },
    {
      date: "2023-03-10T05:00:00.000Z",
      open: 150.210007,
      high: 150.940002,
      low: 147.610001,
      close: 148.5,
      volume: 68572400,
      adjClose: 148.094894,
    },
    {
      date: "2023-03-09T05:00:00.000Z",
      open: 153.559998,
      high: 154.539993,
      low: 150.229996,
      close: 150.589996,
      volume: 53833600,
      adjClose: 150.179184,
    },
    {
      date: "2023-03-08T05:00:00.000Z",
      open: 152.809998,
      high: 153.470001,
      low: 151.830002,
      close: 152.869995,
      volume: 47204800,
      adjClose: 152.452972,
    },
    {
      date: "2023-03-07T05:00:00.000Z",
      open: 153.699997,
      high: 154.029999,
      low: 151.130005,
      close: 151.600006,
      volume: 56182000,
      adjClose: 151.186447,
    },
    {
      date: "2023-03-06T05:00:00.000Z",
      open: 153.789993,
      high: 156.300003,
      low: 153.460007,
      close: 153.830002,
      volume: 87558000,
      adjClose: 153.410355,
    },
    {
      date: "2023-03-03T05:00:00.000Z",
      open: 148.039993,
      high: 151.110001,
      low: 147.330002,
      close: 151.029999,
      volume: 70732300,
      adjClose: 150.617996,
    },
    {
      date: "2023-03-02T05:00:00.000Z",
      open: 144.380005,
      high: 146.710007,
      low: 143.899994,
      close: 145.910004,
      volume: 52238100,
      adjClose: 145.511963,
    },
    {
      date: "2023-03-01T05:00:00.000Z",
      open: 146.830002,
      high: 147.229996,
      low: 145.009995,
      close: 145.309998,
      volume: 55479000,
      adjClose: 144.913589,
    },
    {
      date: "2023-02-28T05:00:00.000Z",
      open: 147.050003,
      high: 149.080002,
      low: 146.830002,
      close: 147.410004,
      volume: 50547000,
      adjClose: 147.007874,
    },
    {
      date: "2023-02-27T05:00:00.000Z",
      open: 147.710007,
      high: 149.169998,
      low: 147.449997,
      close: 147.919998,
      volume: 44998500,
      adjClose: 147.516479,
    },
    {
      date: "2023-02-24T05:00:00.000Z",
      open: 147.110001,
      high: 147.190002,
      low: 145.720001,
      close: 146.710007,
      volume: 55469600,
      adjClose: 146.309784,
    },
    {
      date: "2023-02-23T05:00:00.000Z",
      open: 150.089996,
      high: 150.339996,
      low: 147.240005,
      close: 149.399994,
      volume: 48394200,
      adjClose: 148.992432,
    },
    {
      date: "2023-02-22T05:00:00.000Z",
      open: 148.869995,
      high: 149.949997,
      low: 147.160004,
      close: 148.910004,
      volume: 51011300,
      adjClose: 148.503784,
    },
    {
      date: "2023-02-21T05:00:00.000Z",
      open: 150.199997,
      high: 151.300003,
      low: 148.410004,
      close: 148.479996,
      volume: 58867200,
      adjClose: 148.074951,
    },
    {
      date: "2023-02-17T05:00:00.000Z",
      open: 152.350006,
      high: 153,
      low: 150.850006,
      close: 152.550003,
      volume: 59144100,
      adjClose: 152.13385,
    },
    {
      date: "2023-02-16T05:00:00.000Z",
      open: 153.509995,
      high: 156.330002,
      low: 153.350006,
      close: 153.710007,
      volume: 68167900,
      adjClose: 153.290695,
    },
    {
      date: "2023-02-15T05:00:00.000Z",
      open: 153.110001,
      high: 155.5,
      low: 152.880005,
      close: 155.330002,
      volume: 65573800,
      adjClose: 154.906265,
    },
    {
      date: "2023-02-14T05:00:00.000Z",
      open: 152.119995,
      high: 153.770004,
      low: 150.860001,
      close: 153.199997,
      volume: 61707600,
      adjClose: 152.782074,
    },
    {
      date: "2023-02-13T05:00:00.000Z",
      open: 150.949997,
      high: 154.259995,
      low: 150.919998,
      close: 153.850006,
      volume: 62199000,
      adjClose: 153.430313,
    },
    {
      date: "2023-02-10T05:00:00.000Z",
      open: 149.460007,
      high: 151.339996,
      low: 149.220001,
      close: 151.009995,
      volume: 57450700,
      adjClose: 150.598038,
    },
    {
      date: "2023-02-09T05:00:00.000Z",
      open: 153.779999,
      high: 154.330002,
      low: 150.419998,
      close: 150.869995,
      volume: 56007100,
      adjClose: 150.229065,
    },
    {
      date: "2023-02-08T05:00:00.000Z",
      open: 153.880005,
      high: 154.580002,
      low: 151.169998,
      close: 151.919998,
      volume: 64120100,
      adjClose: 151.274597,
    },
    {
      date: "2023-02-07T05:00:00.000Z",
      open: 150.639999,
      high: 155.229996,
      low: 150.639999,
      close: 154.649994,
      volume: 83322600,
      adjClose: 153.992996,
    },
    {
      date: "2023-02-06T05:00:00.000Z",
      open: 152.570007,
      high: 153.100006,
      low: 150.779999,
      close: 151.729996,
      volume: 69858300,
      adjClose: 151.085403,
    },
    {
      date: "2023-02-03T05:00:00.000Z",
      open: 148.029999,
      high: 157.380005,
      low: 147.830002,
      close: 154.5,
      volume: 154357300,
      adjClose: 153.843628,
    },
    {
      date: "2023-02-02T05:00:00.000Z",
      open: 148.899994,
      high: 151.179993,
      low: 148.169998,
      close: 150.820007,
      volume: 118339000,
      adjClose: 150.179276,
    },
    {
      date: "2023-02-01T05:00:00.000Z",
      open: 143.970001,
      high: 146.610001,
      low: 141.320007,
      close: 145.429993,
      volume: 77663600,
      adjClose: 144.812149,
    },
    {
      date: "2023-01-31T05:00:00.000Z",
      open: 142.699997,
      high: 144.339996,
      low: 142.279999,
      close: 144.289993,
      volume: 65874500,
      adjClose: 143.677002,
    },
    {
      date: "2023-01-30T05:00:00.000Z",
      open: 144.960007,
      high: 145.550003,
      low: 142.850006,
      close: 143,
      volume: 64015300,
      adjClose: 142.392502,
    },
    {
      date: "2023-01-27T05:00:00.000Z",
      open: 143.160004,
      high: 147.229996,
      low: 143.080002,
      close: 145.929993,
      volume: 70555800,
      adjClose: 145.310028,
    },
    {
      date: "2023-01-26T05:00:00.000Z",
      open: 143.169998,
      high: 144.25,
      low: 141.899994,
      close: 143.960007,
      volume: 54105100,
      adjClose: 143.348419,
    },
    {
      date: "2023-01-25T05:00:00.000Z",
      open: 140.889999,
      high: 142.429993,
      low: 138.809998,
      close: 141.860001,
      volume: 65799300,
      adjClose: 141.257339,
    },
    {
      date: "2023-01-24T05:00:00.000Z",
      open: 140.309998,
      high: 143.160004,
      low: 140.300003,
      close: 142.529999,
      volume: 66435100,
      adjClose: 141.924484,
    },
    {
      date: "2023-01-23T05:00:00.000Z",
      open: 138.119995,
      high: 143.320007,
      low: 137.899994,
      close: 141.110001,
      volume: 81760300,
      adjClose: 140.510529,
    },
    {
      date: "2023-01-20T05:00:00.000Z",
      open: 135.279999,
      high: 138.020004,
      low: 134.220001,
      close: 137.869995,
      volume: 80223600,
      adjClose: 137.284286,
    },
    {
      date: "2023-01-19T05:00:00.000Z",
      open: 134.080002,
      high: 136.25,
      low: 133.770004,
      close: 135.270004,
      volume: 58280400,
      adjClose: 134.695343,
    },
    {
      date: "2023-01-18T05:00:00.000Z",
      open: 136.820007,
      high: 138.610001,
      low: 135.029999,
      close: 135.210007,
      volume: 69672800,
      adjClose: 134.63559,
    },
    {
      date: "2023-01-17T05:00:00.000Z",
      open: 134.830002,
      high: 137.289993,
      low: 134.130005,
      close: 135.940002,
      volume: 63646600,
      adjClose: 135.362488,
    },
    {
      date: "2023-01-13T05:00:00.000Z",
      open: 132.029999,
      high: 134.919998,
      low: 131.660004,
      close: 134.759995,
      volume: 57809700,
      adjClose: 134.1875,
    },
    {
      date: "2023-01-12T05:00:00.000Z",
      open: 133.880005,
      high: 134.259995,
      low: 131.440002,
      close: 133.410004,
      volume: 71379600,
      adjClose: 132.843246,
    },
    {
      date: "2023-01-11T05:00:00.000Z",
      open: 131.25,
      high: 133.509995,
      low: 130.460007,
      close: 133.490005,
      volume: 69458900,
      adjClose: 132.922897,
    },
    {
      date: "2023-01-10T05:00:00.000Z",
      open: 130.259995,
      high: 131.259995,
      low: 128.119995,
      close: 130.729996,
      volume: 63896200,
      adjClose: 130.174622,
    },
    {
      date: "2023-01-09T05:00:00.000Z",
      open: 130.470001,
      high: 133.410004,
      low: 129.889999,
      close: 130.149994,
      volume: 70790800,
      adjClose: 129.597076,
    },
    {
      date: "2023-01-06T05:00:00.000Z",
      open: 126.010002,
      high: 130.289993,
      low: 124.889999,
      close: 129.619995,
      volume: 87754700,
      adjClose: 129.069336,
    },
    {
      date: "2023-01-05T05:00:00.000Z",
      open: 127.129997,
      high: 127.769997,
      low: 124.760002,
      close: 125.019997,
      volume: 80962700,
      adjClose: 124.488869,
    },
    {
      date: "2023-01-04T05:00:00.000Z",
      open: 126.889999,
      high: 128.660004,
      low: 125.080002,
      close: 126.360001,
      volume: 89113600,
      adjClose: 125.823189,
    },
    {
      date: "2023-01-03T05:00:00.000Z",
      open: 130.279999,
      high: 130.899994,
      low: 124.169998,
      close: 125.07,
      volume: 112117500,
      adjClose: 124.538658,
    },
  ];


  useEffect(() => {
    // Parse the hardcoded data
    const parsedData = hardcodedData
      .map((d) => {
        const date = new Date(d.date);
        const open = +d.open;
        const high = +d.high;
        const low = +d.low;
        const close = +d.close;
        if (!date || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
          console.error("Invalid data entry:", d);
          return null;
        }
        return { Date: date, Open: open, High: high, Low: low, Close: close };
      })
      .filter(Boolean);

    setData(parsedData);
  }, []);



  function toggleMovingAverage() {
    setShowMovingAverage(!showMovingAverage);
  }

  function toggleExponentialMovingAverage() {
    setShowExponentialMovingAverage(!showExponentialMovingAverage);
  }

  const toggleLineDrawing = () => {
    setEnableLineDrawing(true);
    setShowTextTool(false);
    setShowFib(false);
    setIsActive((prev) => !prev);
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
    if (toolContainer) toolContainer.style.display = "none";
    setShowTextTool(false);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const containerRect = toolContainerRef.current.getBoundingClientRect();
    setOffsetX(e.clientX - containerRect.left);
    setOffsetY(e.clientY - containerRect.top);
    toolHeaderRef.current.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    toolHeaderRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    const container = toolContainerRef.current;
    container.style.left = x + "px";
    container.style.top = y + "px";
  };




    // Chart Rendering & Resizing Logic
  const margin = { top: 55, right: 80, bottom: 40, left: 53 };

  useEffect(() => {

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(chartRef.current).style("cursor", "crosshair");


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



    // Create the main group element
    const svg = svgContainer
      .append('g')
      .attr('transform', `translate(${0}, ${margin.top})`);

  

    const g = svg.append("g").attr("transform", "translate(0, 0)");

    // Function to handle window resize for chart
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
      generateChart(chartType, svg, newG, data, newWidth, newHeight, svgContainerHeight, svgContainerRect, enableLineDrawing, showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, lineType);
    };

    // Initial chart drawing
    generateChart(chartType, svg, g, data, initialWidth, initialHeight, svgContainerHeight, svgContainerRect, enableLineDrawing,  showMovingAverage, showExponentialMovingAverage, showFib, showTextTool, lineType);

    // Attach resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };


    // Initialize margins and data

  }, [chartType]);




  // Line Drawings Logic
  useEffect(() => {

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


  enableLineDrawing
  ? manageLineDrawing(
      svg,
      svg.select("g"),
      overlay,
      enableLineDrawing,
      null,
      null,
      lineType,
      x,
      y
    )
  : null;
showTextTool
  ? manageLineDrawing(
      svg,
      svg.select("g"),
      overlay,
      enableLineDrawing,
      showTextTool,
      "text",
      null,
      x,
      y
    )
  : null;
showFib
  ? manageLineDrawing(
      svg,
      svg.select("g"),
      overlay,
      enableLineDrawing,
      showFib,
      null,
      null,
      x,
      y
    )
  : null;
}, [enableLineDrawing, showTextTool, lineType]);



  // Handling the display of moving averages
  useEffect(() => {
    const svg = d3.select(chartRef.current).select("svg").select("g");

    if (!svg) {
      console.warn("SVG or group element not found");
      return;
    }

    svg
      .select("#movingAverageLine")
      .style("display", showMovingAverage ? null : "none");
    svg
      .select("#expmovingAverageLine")
      .style("display", showExponentialMovingAverage ? null : "none");
  }, [showMovingAverage, showExponentialMovingAverage, chartRef]);


// Chancging The Chart TYpe 

const toggleChartType = () => {
  setChartType((prevType) =>
    prevType === "candlestick" ? "line" : "candlestick"
  );
};



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
          lineType={lineType}
        />
        {/* Surrounding container that holds the chart */}
        <div className="chart-container">
          <div className="chart-inner-wrapper">
            <button className="close-text-tool" onClick={toggleMovingAverage}>
              Toggle SMA
            </button>
            <button
              className="close-text-tool"
              onClick={toggleExponentialMovingAverage}
            >
              Toggle EMA
            </button>
          </div>
          <div ref={chartRef}></div>
          <div
            ref={toolContainerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="text-tool-container"
          >
            <div className="scroll-wrapper">
              <div
                ref={toolHeaderRef}
                onMouseDown={handleMouseDown}
                style={{ cursor: "grab" }}
                className="text-tool-header"
              >
                <h2 style={{ fontSize: "20px" }}>Text</h2>
              </div>
              <div className="flex-row-text-tool">
                <div className="color-change-div">
                  <span className="color-change-inner-div"></span>
                </div>
                <select
                  className="font-change-div"
                  name="font-size"
                  defaultValue={"14"}
                >
                  <option value="" disabled>
                    14
                  </option>
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
                        <input
                          className="input-GZajBGIm"
                          type="checkbox"
                          name="toggle-enabled"
                          value="on"
                        />
                        <span className="box-GZajBGIm check-GZajBGIm">
                          <span className="icon-GZajBGIm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 11 9"
                              width="11"
                              height="9"
                              fill="none"
                            >
                              <path
                                strokeWidth="2"
                                d="M0.999878 4L3.99988 7L9.99988 1"
                              ></path>
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
                        <input
                          className="input-GZajBGIm"
                          type="checkbox"
                          name="toggle-enabled"
                          value="on"
                        />
                        <span className="box-GZajBGIm check-GZajBGIm">
                          <span className="icon-GZajBGIm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 11 9"
                              width="11"
                              height="9"
                              fill="none"
                            >
                              <path
                                strokeWidth="2"
                                d="M0.999878 4L3.99988 7L9.99988 1"
                              ></path>
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
                        <input
                          className="input-GZajBGIm"
                          type="checkbox"
                          name="toggle-enabled"
                          value="on"
                        />
                        <span className="box-GZajBGIm check-GZajBGIm">
                          <span className="icon-GZajBGIm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 11 9"
                              width="11"
                              height="9"
                              fill="none"
                            >
                              <path
                                strokeWidth="2"
                                d="M0.999878 4L3.99988 7L9.99988 1"
                              ></path>
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
                <select
                  className="font-change-div"
                  name="font-size"
                  defaultValue={"16"}
                >
                  <option value="" disabled>
                    Template
                  </option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="20">20</option>
                  <option value="22">22</option>
                  <option value="24">24</option>
                  <option value="26">26</option>
                  <option value="28">28</option>
                </select>
                <div className="text-button-container">
                  <button className="cancel-text-tool">Cancel</button>
                  <button
                    onClick={handleCloseTextTool}
                    className="close-text-tool"
                  >
                    Okay
                  </button>
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
