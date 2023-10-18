import { text } from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import LineSelectorTextTool from './LineSelectorTools/lineSelectorTextTool.js'
import LineSelectorCordTool from './LineSelectorTools/lineSelectorCordTool.js'



const LineToolSettings = () => { 


    //Change Tool based on State 
    const [selectedTool, setselectedTool] = useState(null)


    const renderSelectedTool = () => 
    { 
        switch(selectedTool) { 
            case "text":
                return <LineSelectorTextTool />;
            case "coordinates":
                return <LineSelectorCordTool />;
            default:
                return null
        }
    }

    



    return( 
        <div 
        className = "lineSettings-tool-container">
     

          <div class = "scroll-wrapper">

          <div 
        
          style = {{cursor:'grab'}}
          className = "text-tool-header">
              <h2 style = {{fontSize: "20px"}}>Trend Line(Dynamic Name)</h2>

          </div>



          <div className = "lineSettings-toolSelect">
            <span className = "lineSetting-small">Style</span>
            <span onClick={() => setselectedTool('text')} className = "lineSetting-small">Text</span>
            <span onClick={() => setselectedTool('coordinates')} className = "lineSetting-small">Coordinates</span>
            <span className = "lineSetting-small">Visibility</span>
          </div>



        {/* This is going to change based on selectors */}

        {renderSelectedTool()}





        {/* This is going to change based on selectors */}





       




 
          </div>



        </div>




    )


}

export default LineToolSettings;