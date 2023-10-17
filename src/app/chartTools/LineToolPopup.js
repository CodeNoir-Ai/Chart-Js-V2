import { text } from 'd3';
import React, { useEffect, useRef, useState } from 'react';



const LineToolPopUp = () => { 



    return( 
       <div
        className = "line-settings-container">
     

          <div class = "scroll-wrapper" style  = {{cursor: "grab"}}>

        <div className = "link-wrapper-section">
        <button className = "link-btn">
            Copy Price "Dynamic Price here"
        </button>

        <button className = "link-btn">
            Paste
        </button>

   
        </div>
        <div className = "link-wrapper-section">
        <button className = "link-btn">
            Add alert on AAPL at 184.82
    
            </button>

        <button className = "link-btn">
            Trade
        </button>

   
        </div>
        <div className = "link-wrapper-section">
        <button className = "link-btn">
            ADD AAPL to watchlist
        </button>

        <button className = "link-btn">
            Add text note for AAPL
        </button>

   
        </div>

     
        <div className = "link-wrapper-section">
        <button className = "link-btn">
          Lock vertical cursor line by time 
        </button>

        </div>

     
        <div className = "link-wrapper-section">
   

        <button className = "link-btn">
            <span className = "link-settings-container">
                Settings

            </span>
        </button>

   
        </div>

     


        </div>

        </div>






    )


}

export default LineToolPopUp;