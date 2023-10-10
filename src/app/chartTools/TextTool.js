import { text } from 'd3';
import React, { useEffect, useRef, useState } from 'react';



const TextTool = (toolContainerRef,toolHeaderRef, handleMouseMove, handleMouseDown, handleMouseUp, handleCloseTextTool) => { 



    return( 
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




    )


}

export default TextTool;