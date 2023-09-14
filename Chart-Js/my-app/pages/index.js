
import styles from '../styles/Home.module.css'
import ChartContents from './components/chat_contents'
import Image from 'next/image';
import Chartright from './components/chart_data/chart_right';
import Chartleft from './components/chart_data/chart_left'

import ChartJs from './components/ChartJs'
import D3JS from './components/D3'
export default function Home()

{
    return(
        
        <div>
            {/* <ChartComponent /> */}

            {/* <TradingChart /> */}


            <div className = {styles.grid_main}>

                <Chartleft />
                <D3JS />
                <ChartContents />
                <Chartright />



               

            </div>


             
        </div>
    )



}