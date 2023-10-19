
import styles from '../../styles/chart.module.css'
import React, { useEffect, useRef, useState } from 'react';

export default function ChatBox()

{

    const  chatContainer = useRef(null)
    const [message, setMessage] = useState('');
    const [responses, setResponses] = useState([
      {
        question: "Bamboo Ai Assitant",
        response: null,
      },
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const newResponse = { question: message, response: "" };
        setResponses([...responses, newResponse]);
      
        try {
          const response = await fetch("  http://localhost:3002", {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({ message }),
          });
      
          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }
      
          const data = await response.json();
          const messageFromServer = data.message;
      
          const updatedResponse = { ...newResponse, response: messageFromServer };
          
          setResponses((prevResponses) =>
            prevResponses.map((r) =>
              r.question === updatedResponse.question ? updatedResponse : r
            )
          );
        } catch (error) {
          console.error(error);
        }
      
        setMessage("");
      };

    return ( 

        <div ref = {chatContainer} className = {styles.chat_bg}>

            <div className = {styles.chat_container}>
                <div className = {styles.chat_header}>
                <span className = "profile_container">
                        
                        </span>
                </div>

                <div className = {styles.chat_box}>
                <div className = {styles.chat_Flex}>
                <div className = {styles.backdrop}></div>

                <div className= {styles.chat_Messages}>
                        <div className = {styles.response_Flex}>
                        <span className = {styles.temp_text}>
                            Bamboo is an Ai-assitant that specializes in trading.
                        </span>
                        </div>
                        {responses.map((r, i) => (
                            
                            <div className = {styles.response_Flex} key={i}>
                     
                            <p className = {styles.bot_Message}>{r.question}</p>
                            {r.response && <p className= {styles.user_Message }>{r.response}</p>}
                            </div>
                        ))}
            </div>
                </div>
                </div>
                <div className = {styles.chat_wrapper}>
                    <form onSubmit={handleSubmit} className = {styles.chat_form}>
                        <input 
                        value = {message}
                        onChange={(e) => setMessage(e.target.value)}
                        type = "text"
                         placeholder='Ask me anythihng'></input>
                    </form>
                </div>
            </div>




        </div>


    )


}