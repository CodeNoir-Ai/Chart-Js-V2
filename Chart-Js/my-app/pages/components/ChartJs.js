

//ChartJS backupsolution working on this at the moment


import Chart from 'chart.js/auto';
import {useEffect, useRef, useState} from 'react';
import {Line} from 'react-chartjs-2'
import {
    Chart as ChartJS, 
    LineElement, 
    CategoryScale, //X Axis(Tiem)
    LinearScale, //Y axis(Prices)
    PointElement,
} from "chart.js";
import parsedData from '../../public/assets/XRP-USD.json';

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
)


function ChartJs() {
    const mainChart = useRef();
    const [clickedPoints, setClickedPoints] = useState([])
    




   function drawLine() 
     { 
        mainChart.current.ctx.save();
        mainChart.current.ctx.strokeStyle = "blue"
        mainChart.current.ctx.lineWidth = "1"
        const x = mainChart.current.scales.x;
        mainChart.current.ctx.moveTo(0,0)
        mainChart.current.ctx.lineTo(x.getPixelForValue(),0)
        mainChart.current.ctx.stroke();
        mainChart.current.ctx.restore();


     }
  

  // Convert parsed data to chart format
const labels = parsedData.map(item => item.Date);
const openData = parsedData.map(item => item.Open);
const highData = parsedData.map(item => item.High);
const lowData = parsedData.map(item => item.Low);
const closeData = parsedData.map(item => item.Close);


const data = {
  labels: labels,
  datasets: [
    {
      label: 'Open',
      data: openData,
      borderColor: 'black',
      fill: false,
      borderWidth: 1,
      pointRadius: 0,
    },
    // {
    //   label: 'High',
    //   data: highData,
    //   borderColor: 'black',
    //   fill: false,
    //   borderWidth: 0.5

    // },
    // {
    //   label: 'Low',
    //   data: lowData,
    //   borderColor: 'black',
    //   fill: false,
    //   borderWidth: 0.5

    // },
    // {
    //   label: 'Close',
    //   data: closeData,
    //   borderColor: 'black',
    //   fill: false,
    //   borderWidth: 0.5

    // }
  ]
};

//drawline
const drawline = {
    id: 'drawline',
    beforeDatasetsDraw(chart, args, pluginOptions) {
        const {ctx, data, chartArea: {top, bottom, left, right}, scales } = chart;
        ctx.save();
    }
}

const options = {
  plugins: {
      legend: true,
      customCanvasBackgroundColor: {
        color:"#fff"
      }
      [drawline]
  },
  scales: {
      x: {
          ticks: {
              autoSkip: true,
          }
      },
      y: {
          beginAtZero: true
      }
  },
  animation: { 
    duration: 0,
  }


};



    return (

        <div>
            <h1>Dummy Chart</h1>

        <div className = "chart-container">
          <div className = "chartBox">
          <Line ref = {mainChart} 
            data = {data}
            options={options}

            

            />
          </div>
          <button onClick={drawLine}>Draw Line</button>
        </div>
           

        </div>
    )


}

export default ChartJs;