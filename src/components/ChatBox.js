import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "../styles.css";

const ChatBox = ({ isOpen, onRequestClose, cardId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/engines/gpt-4-vision-preview/completions",
        {
          prompt: updatedMessages.map((m) => m.content).join("\n"),
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: "OPEN_AI_KEY",
            "Content-Type": "application/json",
          },
        }
      );
      const botMessage = {
        role: "bot",
        content: response.data.choices[0].text.trim(),
      };
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setInput("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="chat-modal"
      overlayClassName="chat-modal-overlay"
    >
      <div className="chat-content">
        <h3>Chat with AI</h3>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </Modal>
  );
};

export default ChatBox;
