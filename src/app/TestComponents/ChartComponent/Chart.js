import React, {useLayoutEffect, useRef, useEffect} from 'react';
import * as d3 from 'd3';
import { FinancialChart } from '../../helper/FinancialChart';

const FinancialChartComponent = (props) => 
{ 
   const chartRef = useRef();
   const financialChart = useRef(null);


   useEffect(() => 
   {     
        //Ensure the Dom element is avaiable
        if (chartRef.current)
        { 
            financialChart.current = new FinancialChart(chartRef.current)
            if(props.data) { 
                financialChart.current.update(props.data)
            }
        }

    },[])


   useEffect(() =>
   { 
        if(props.data && financialChart.current)
        { 
            financialChart.current.update(props.data)
        }

   },[props.data])

   useEffect(() => {
    return () => {
        financialChart.current.destroy();
    };
}, []);




   return <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>;





}

export default FinancialChartComponent;


