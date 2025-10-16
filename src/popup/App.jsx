import { useState, useRef, useEffect } from 'react';
import ChatBox from '@/components/ChatBox'
import './App.css'

export default function App() {
  const defaultMessages = [
    { message: "Hello!", messageClass: "received" },
    { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" },
    { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" },
    { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" },
    { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" },
    { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" }, { message: "Hi there!", messageClass: "sent" },
    { message: "How can I help you?", messageClass: "received" },
  ];

  let [messages, setMessages] = useState(defaultMessages);
  let [userMessageInput, setUserMessageInput] = useState("");
  let lastMessageRef = useRef(null);

  function messagesUpdate(newMessage) {
    setMessages([...messages, { message: userMessageInput, messageClass: "sent" }]);
    debugger;
    setUserMessageInput("");
  }

  function scrollToLastMessage() {
    debugger
    lastMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  return (
    <ChatBox messages={messages} lastMessageRef={lastMessageRef} messagesUpdate={messagesUpdate} userMessageInput={userMessageInput} setUserMessageInput={setUserMessageInput} />
  )
}
