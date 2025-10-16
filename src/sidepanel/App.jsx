import { useState, useRef, useEffect, createContext } from 'react';
import ChatBox from '@/components/ChatBox'
import './App.css'


export const IsWaitingContext = createContext(null);

export default function App() {
  const defaultMessages = [
    { message: "Hello!", messageClass: "received" }
  ];

  let [messages, setMessages] = useState(defaultMessages);
  let [userMessageInput, setUserMessageInput] = useState("");
  let [chatSession, setChatSession] = useState(undefined);
  let lastMessageRef = useRef(null);
  let [isWaitingForAi, setIsWaitingForAi] = useState(true);
  let [aiResponse, setAiResponse] = useState("");

  function messagesUpdate(newMessage = false, messageClass = "sent") {
    let message = userMessageInput;
    if (messageClass !== "sent") {
      if (newMessage !== false) {
        message = newMessage;
      }
      else {
        message = "Error!! check console"
        console.error("No message was received");
      }
    }
    setMessages([...messages, { message: message, messageClass: messageClass }]);
    if (messageClass === "sent") {
      setUserMessageInput("");
      setIsWaitingForAi(true);
      sendUserPrompt(message)
    }
  }

  function scrollToLastMessage() {
    lastMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  async function initializeChatSession() {
    const availability = await window.LanguageModel.availability();
    if (availability === 'available') {
      let session = await LanguageModel.create({
        initialPrompts: [
          { role: 'system', content: 'You are a helpful and friendly assistant.Be professional with responses. Do not use any emojis in response' }
        ],
      });
      setChatSession(session);
      setIsWaitingForAi(false);
    }
  }

  async function sendUserPrompt(prompt) {
    let ans = await chatSession.prompt([{ role: "user", content: prompt }]);
    setIsWaitingForAi(false);
    setAiResponse(ans);
    console.log("AI Response: ", ans);
    // messagesUpdate(ans, 'received');
  }

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  useEffect(() => { initializeChatSession() },
    []
  )

  useEffect(() => {
    if (aiResponse !== "") {
      messagesUpdate(aiResponse, 'received');
      setAiResponse("");
    }
  },
    [aiResponse]
  )

  return (
    <IsWaitingContext value={isWaitingForAi}>
      <ChatBox messages={messages} lastMessageRef={lastMessageRef} messagesUpdate={messagesUpdate} userMessageInput={userMessageInput} setUserMessageInput={setUserMessageInput} />
    </IsWaitingContext>
  )
}
