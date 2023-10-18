import React, { useEffect, useRef, useState } from 'react';




const LineSelectorTextTool = () => { 



    return( 
<div>
<div className = "flex-row-text-tool">
<div className = "color-change-div small-color-change-div">
    </div>

<span classsName = "tool-Selector">Text</span>

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


<div data-section-name="TextTextColorSelect" class="cell-tBgV1m0B adaptive-tBgV1m0B checkableTitle-tBgV1m0B first-tBgV1m0B"><div class="inner-tBgV1m0B">
    
    <div class="wrap-Q2NZ0gvI"><label class="checkbox-FG0u1J5p checkbox-vyj6oJxw baseline-vyj6oJxw"><span class="wrapper-GZajBGIm">
  
</span>

<span class="label-vyj6oJxw"><span class="title-FG0u1J5p">Text Alignment</span></span></label>
  
  
  </div></div>
  
  <select className = "font-change-div" name = "font-size"> 
    <option value="" disabled selected>Center</option>
    <option value="16">16</option>
    <option value="18">18</option>
    <option value="20">20</option>
    <option value="22">22</option>
    <option value="24">24</option>
    <option value="26">26</option>
    <option value="28">28</option>

    </select>


    <select className = "font-change-div" name = "font-size"> 
    <option value="" disabled selected>Top</option>
    <option value="16">16</option>
    <option value="18">18</option>
    <option value="20">20</option>
    <option value="22">22</option>
    <option value="24">24</option>
    <option value="26">26</option>
    <option value="28">28</option>

    </select>
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
  <button class = "close-text-tool">Okay</button>

        </div>

  </div>



  

  </div>



    )


}
export default LineSelectorTextTool


