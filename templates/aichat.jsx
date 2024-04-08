import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'libraries/react-markdown';
import { templates } from 'core/js/reactHelpers';

export default function AiChat(props) {
  const {
    conversations,
    chatMessages,
    newConversation,
    loadConversation,
    openChatText,
    displayTitle,
    body: initialBody,
    placeholder // assuming placeholder is passed as a prop
  } = props;

  const [chatOpen, setChatOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const openForm = () => {
    setChatOpen(true);
    inputRef.current.focus();
  };

  const closeForm = () => {
    setChatOpen(false);
  };

  const expandBox = () => {
    setExpanded(!expanded);
  };

  const TypingAnimation = () => (
    <li class="assistant">
      <div className="typing-animation">
        {[...Array(3)].map((_, index) => (
          <span key={index} className="dot"></span>
        ))}
      </div>
    </li>
  );

  setInterval(()=> {
    const length = chatMessages.length;
    if (chatMessages[length-1]?.type === "assistant") {
      setLoading(false)
    }
  }, 100);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setSendButtonState(true);
    const message = inputRef.current.value;
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

  /*
   * Rating system
   */
  const [showTextBox, setShowTextBox] = useState([]);

  const handleMoreOptionClick = (messageId) => {
    // Toggle the message ID in the array
    setShowTextBox((prevShowTextBox) =>
      prevShowTextBox.includes(messageId)
        ? prevShowTextBox.filter((id) => id !== messageId)
        : [...prevShowTextBox, messageId]
    );
  };

  // Need to move this somewhere.
  const defaultRatingResponses = {
    1: [
        "Don't like the style",
        "Not factually correct",
        "Didn't fully follow instructions",
        "Refused when it shouldn't have",
        "Being lazy"
    ],
    2: [
        "Not helpful",
        "Confusing response",
        "Didn't provide enough detail",
        "Could be improved",
        "Incomplete information"
    ],
    3: [
        "Somewhat helpful",
        "Partially correct",
        "Room for improvement",
        "Average response",
        "Needs more detail"
    ],
    4: [
        "Quite helpful",
        "Mostly correct",
        "Good response",
        "Well-written",
        "Informative"
    ],
    5: [
        "Very helpful",
        "Completely correct",
        "Excellent response",
        "Clear and concise",
        "Highly informative"
    ]
  };

  // Show star ratings on hover
  const handleRatingHover = (messageId, rating) => {
    // Get the message container element by its ID
    const messageContainer = document.getElementById(messageId);
    if (!messageContainer) return; // Exit if message container not found

    // Get all star elements within the message container
    const stars = messageContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.innerHTML = '★ '; // Fill in star to indicate selection
        } else {
            star.innerHTML = '☆ '; // Reset star to empty
        }
    });
  }

  // Get the rating comment and call the super method to handle it
  const submitRatingResponse = (messageId, option = null) => {
    let response;
    if (!option) {
        // If no option is selected, get the value from the textarea associated with the messageId
        const textarea = document.querySelector(`.rating-comment textarea[data-message-id="${messageId}"]`);
        response = textarea.value;
    } else {
        response = option;
    }
    setShowTextBox(prev => prev.filter(id => id !== messageId));
    // Call the props function to submit the rating response
    props.handleRatingComment(messageId, response);
  };

  const handleCloseClick = (messageId) => {
    setShowTextBox(prev => prev.filter(id => id !== messageId));
    props.handleRatingComment(messageId,"");
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

  useEffect(() => {
    scrollToBottom(); // Call scrollToBottom function
  }, [chatMessages]); // chatMessages as a dependency

  return (
    <div className={`aichat ${expanded ? 'expanded' : ''}`}>
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"></link>
      {!chatOpen && <button className="openAIChat" onClick={openForm}>{openChatText}</button>}
      <div className={`aichat__box ${chatOpen ? 'show' : 'hide'}`}>
      <button className="expandButton" onClick={expandBox}>&#10070;</button>
      <button className="closeButton" onClick={closeForm}>&#10006;</button>
        <form onSubmit={handleFormSubmit}>
          <main>
            <div className="topper">
              <div className="icon"></div>
              <div className="name">{displayTitle}</div>
            </div>
            <div className={`conversations ${expanded ? 'expanded' : ''}`}>
              <h2>Conversations</h2>
              <ul className="new">
                <li className="conversation" onClick={() => newConversation()}>
                  New conversation
                </li>
              </ul>
              <h3>From this module</h3>
              <ul className="thisModule">
              {conversations.map((conversation, index) => (
                <li key={index} className="conversation" onClick={() => loadConversation(conversation.id)}>
                  {conversation.title}
                </li>
              ))}
              </ul>
              <h3>From related course</h3>
              <div className="thisCourse">

              </div>
            </div>
            <div className="msgs_cont">
              <ul id="list_cont">
                {chatMessages.map((message, index) => (
                    <li key={index} id={message.id} className={message.type}>
                        {message.rendered ? (
                            <ReactMarkdown>{message.message}</ReactMarkdown>
                        ) : (
                            <RenderWordByWord message={message.message} index={index} />
                        )}
                        {message.type === 'assistant' && message.rating && message.id && (
                            <div className="rating-container">
                                <div className="stars">
                                    {Array.from({ length: message.rating.rating }, (_, i) => (
                                        <span key={i} className="star">&#9733; </span> // Unicode for filled star symbol
                                    ))}
                                    {Array.from({ length: 5 - message.rating.rating }, (_, i) => (
                                        <span key={i + message.rating.rating} className="star">&#9734; </span> // Unicode for empty star symbol
                                    ))}
                                </div>
                                {message.showRatingOptions && !showTextBox.includes(message.id) && (
                                  <div className="rating-comment-container">
                                    <button class="closeButton" onClick={() => handleCloseClick(message.id)}>&#10006;</button>
                                    <b>Tell us more:</b><br/>
                                    <div className="rating-options">
                                      {/* Render default rating options */}
                                      {defaultRatingResponses[message.rating.rating].map((option, index) => (
                                          <div key={index} className="rating-option" onClick={() => submitRatingResponse(message.id, option)}>
                                              {option}
                                          </div>
                                      ))}
                                      {/* Render "More" option */}
                                      <div className="rating-option" onClick={() => handleMoreOptionClick(message.id)}>
                                          More
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {/* Render text box and submit button */}
                                {showTextBox.includes(message.id) && (
                                  <div className="rating-comment-container">
                                  <button class="closeButton" onClick={() => handleCloseClick(message.id)}>&#10006;</button>
                                  <b>Tell us more:</b><br/>
                                    <div className="rating-comment">
                                      <textarea data-message-id={message.id} placeholder="Enter your response"/>
                                      <button onClick={() => submitRatingResponse(message.id)}>Submit</button>
                                    </div>
                                  </div>
                                )}
                            </div>
                        )}
                        {message.type === 'assistant' && message.id && !message.rating && (
                          <div className="rating-container">
                              <div className="stars">
                                Rate?:&nbsp;
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span
                                        key={i}
                                        className="star"
                                        onMouseEnter={() => handleRatingHover(message.id,i + 1)}
                                        onMouseLeave={() => handleRatingHover(message.id,0)}
                                        onClick={() => props.handleRating(message.id, i + 1)}
                                    >☆ </span>
                                ))}
                              </div>
                          </div>
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