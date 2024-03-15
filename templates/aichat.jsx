import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'libraries/react-markdown';
import { templates } from 'core/js/reactHelpers';

export default function AiChat(props) {
  const {
    chatMessages,
    handleSubmit,
    openChatText,
    displayTitle,
    body: initialBody,
    placeholder // assuming placeholder is passed as a prop
  } = props;

  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const openForm = () => {
    setChatOpen(true);
    inputRef.current.focus();
  };

  const closeForm = () => {
    setChatOpen(false);
  };

  const TypingAnimation = () => (
    <li class="system">
      <div className="typing-animation">
        {[...Array(3)].map((_, index) => (
          <span key={index} className="dot"></span>
        ))}
      </div>
    </li>
  );

  setInterval(()=> {
    const length = chatMessages.length;
    if (chatMessages[length-1]?.type === "system") {
      setLoading(false)
    }
  }, 100);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setSendButtonState(true);
    const message = inputRef.current.value;
    console.log(chatMessages);
    chatMessages.push({ message, type: 'user', rendered: true });

    inputRef.current.value = '';

    if (props.handleSubmit) {
      props.handleSubmit(message);
    }

  };

  const scrollToBottom = () => {
    const msgsCont = document.querySelector(".msgs_cont");
    msgsCont.scrollTop = msgsCont.scrollHeight;
  };

  const setSendButtonState = (disabled) => {
    const sendButton = document.querySelector(".aichat .uil-message");
    sendButton.style.background = "transparent";
    sendButton.disabled = disabled;
  };

  const RenderWordByWord = ({ message, index }) => {
    const [renderedMessage, setRenderedMessage] = useState('');

    useEffect(() => {
      const timer = setTimeout(() => {
        const partialMessage = message.slice(0, renderedMessage.length + 1);
        setRenderedMessage(partialMessage);
        scrollToBottom();
      }, 10);
      return () => clearTimeout(timer);
    }, [renderedMessage, message]);

    useEffect(() => {
      if (renderedMessage === message) {
        setSendButtonState(false);
        chatMessages[index].rendered = true; // Update the rendered flag once rendering is complete
      }
    }, [renderedMessage, message, index]);

    return (
      <>
        <ReactMarkdown>{renderedMessage}</ReactMarkdown>
      </>
    );
  };

  useEffect(() => {
    // Update the send button background color based on input text length
    const inputtxt = inputRef.current;
    const sendbtn = document.querySelector(".aichat .uil-message");
    inputtxt.addEventListener("input", () => {
      if (inputtxt.value.length > 0) {
        sendbtn.style.background = "#722ea5";
      } else {
        sendbtn.style.background = "transparent";
      }
    });

    return () => {
      // Clean up event listener when the component unmounts
      inputtxt.removeEventListener("input");
    };
  }, []);

  return (
    <div className="aichat">
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"></link>
      {!chatOpen && <button className="openAIChat" onClick={openForm}>{openChatText}</button>}
      <div className={`aichat__box ${chatOpen ? 'show' : 'hide'}`}>
      <button className="closeButton" onClick={closeForm}>&#10006;</button>
        <form onSubmit={handleFormSubmit}>
          <main>
            <div className="topper">
              <div className="icon"></div>
              <div className="name">{displayTitle}</div>
            </div>
            <div className="msgs_cont">
              <ul id="list_cont">
                {chatMessages.map((message, index) => (
                  <li key={index} className={message.type}>
                    {message.rendered ? (
                      <ReactMarkdown>{message.message}</ReactMarkdown>
                    ) : (
                      <RenderWordByWord message={message.message} index={index} />
                    )}
                  </li>
                ))}
                {loading && <TypingAnimation />}
              </ul>
            </div>
            <div className="bottom">
              <div id="input">
                <input ref={inputRef} type="text" id="txt" placeholder="Send a message" name="msg"></input>
                <button type="submit" className="uil uil-message"></button>
              </div>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
}