import { useState, useRef, useEffect, createContext } from 'react';
import ChatBox from '@/components/ChatBox'
import './App.css'

export const IsWaitingContext = createContext(null);

const DEFAULT_MESSAGE = "Hello! How can I assist you today?";
const DEFAULT_INITIAL_PROMPT = [
  {
    role: 'system',
    content: `You are OdooAide, an expert Odoo developer with 10 years of experience. Your primary purpose is to help developers write, debug, and understand Odoo code for views, action, menu, cron, python (both Python and XML).
              Rules:
                1. Always adhere to Odoo development best practices.
                2. When generating code, provide both the XML view and the Python model changes unless specified otherwise.
                3. Keep explanations concise and directly related to Odoo.
                4. Format all code snippets in markdown code blocks with the language specified (e.g., \`\`\`xml or \`\`\`python).` }
];
const DEFAULT_SCHEMA = {
  "type": "object",
  "properties": {
    "explanation": {
      "type": "string",
      "description": "A conversational, natural language explanation for the user. This is always required."
    },
    "suggestion": {
      "type": ["object", "null"],
      "description": "An object containing the generated code snippets. This is optional and will be null if no code is suggested.",
      "properties": {
        "xml": {
          "type": "string",
          "description": "The generated XML code snippet, possibly empty."
        },
        "python": {
          "type": "string",
          "description": "The generated Python code snippet, possibly empty."
        }
      },
      "required": ["xml", "python"]
    }
  },
  "required": ["explanation"],
  "additionalProperties": false
}


export default function App() {
  const defaultMessages = [
    { message: DEFAULT_MESSAGE, messageClass: "received" }
  ];

  let [messages, setMessages] = useState(defaultMessages);
  let [userMessageInput, setUserMessageInput] = useState("");
  let [chatSession, setChatSession] = useState(undefined);
  let lastMessageRef = useRef(null);
  let [isWaitingForAi, setIsWaitingForAi] = useState(true);
  let [aiResponse, setAiResponse] = useState("");

  function messagesUpdate(newMessage = false, messageClass = "sent") {
    let message = userMessageInput.trim();
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
        initialPrompts: DEFAULT_INITIAL_PROMPT,
      });
      setChatSession(session);
      setIsWaitingForAi(false);
    }
  }

  async function sendUserPrompt(prompt) {
    // Test scripting Start
    function getTitle() { return document.title; }
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log("Active Tab: ", tab);
    // Test scripting End
    
    const [tt] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getTitle
    });
    console.log("Title from scripting: ", tt.result);
    let ans = await chatSession.prompt(prompt, {
      responseSchema: DEFAULT_SCHEMA,
    });
    setIsWaitingForAi(false);
    setAiResponse(ans);
    console.log("AI Response: ", ans);
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
