import { useState, useRef, useEffect, createContext } from 'react';
import ChatBox from '@/components/ChatBox'
import './App.css'

export const IsWaitingContext = createContext(null);
export const SelectableCodeContext = createContext([]);
export const SelectedCodeContext = createContext();

const DEFAULT_MESSAGE = "Hello! How can I assist you today?";
const defaultMessages = [
  {
    message: JSON.stringify({
      explanation: DEFAULT_MESSAGE,
      codeBlock: null
    }), messageClass: "received"
  }
];
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
    "codeBlock": {
      "type": ["object", "null"],
      "description": "An object containing the generated code snippets. This is optional and will be null if no code is suggested.",
      "properties": {
        "code": {
          "type": "string",
          "description": "The generated code snippet, possibly empty."
        },
        "language": {
          "type": "string",
          "description": "The language of the code snippet. Possible values are 'xml', 'python', 'javascript' or 'markdown'."
        }
      },
      "required": ["code", "language", "markdown"]
    }
  },
  "required": ["explanation"],
  "additionalProperties": false
}


export default function App() {
  // to keep track of last message for scrolling
  let lastMessageRef = useRef(null);

  let [messages, setMessages] = useState(defaultMessages);
  let [userMessageInput, setUserMessageInput] = useState("");
  let [chatSession, setChatSession] = useState(undefined);
  let [isWaitingForAi, setIsWaitingForAi] = useState(true);
  let [aiResponse, setAiResponse] = useState("");
  let [allCodeContext, setAllCodeContext] = useState([]);
  let [userSelectedCodeContext, setUserSelectedCodeContext] = useState([]);

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
    // Scroll to the last message
    lastMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  // todo: move to util?
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // todo: move to util?
  async function getTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  async function initializeChatSession() {
    // Initialize Language Model and Chat Session
    const availability = await window.LanguageModel.availability();
    if (availability === 'available') {
      let session = await LanguageModel.create({
        initialPrompts: DEFAULT_INITIAL_PROMPT,
      });
      setChatSession(session);
      setIsWaitingForAi(false);
    }
  }

  function attachMessageListener() {
    // Attach message listener to receive code context updates from content script
    // Todo: move it outside of this function and no need for return
    const messageListener = (message, sender, sendResponse) => {
      if (message.type === "CODE_CONTEXT_UPDATED") {
        setAllCodeContext([...allCodeContext, message.payload]);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return messageListener;
  }

  async function sendInitialMessageToContentScript() {
    // Send initial message to content script to request code context
    const tab = await getTab();
    chrome.tabs.sendMessage(tab.id, {
      type: "REQUEST_CODE_CONTEXT",
      payload: "intial request",
    });
  }

  async function initializeApp() {
    // Initial setup function
    await initializeChatSession();
    const messageListener = attachMessageListener();
    await sleep(10);
    sendInitialMessageToContentScript();
    return messageListener;
  }

  // 1. how to use the ace lib for code editor in odoo module to edit

  //   a. const targetElement = document.getElementsByClassName("ace_content")[0];
  //   b. const edx = ace.edit(targertElement)
  //   c. edx.session.setValue("<hi>yo<hi>") or edx.setValue("<hi>yo<hi>");

  // 2. how to get the code value from ace editor in odoo module

  //   a. const targetElement = document.getElementsByClassName("ace_content")[0];
  //   b. const edx = ace.edit(targertElement)
  //   c. const codeValue = edx.getValue();
  //   or
  //   a. document.getElementsByClassName("ace_content")[0].innerText


  function constructPromptWithCodeContext(prompt, codeContext) {
    // Construct prompt by embedding code context
    let currentPrompt = `Your task is to modify the code block provided below based on the user's request.

                        **You MUST use the code provided in the "CURRENT CODE" block as your source.**
                          **Do NOT ask the user to paste the code.** You already have it.

                          ---
                          CURRENT CODE:
                          \`\`\`
                          ${codeContext}
                          \`\`\`
                          ---
                          USER REQUEST:
                          ${prompt}
                          ---

                        Please provide the fully modified code block. If helpful, add a brief explanation of the changes you made.`
    return currentPrompt;
  }

  async function sendUserPrompt(prompt) {
    // Send user prompt to chat session with code context if available

    // Todo: this should not be 0th index all the time, need to handle multiple context selection
    const codeContext = userSelectedCodeContext.length > 0 ? allCodeContext[userSelectedCodeContext[0]] : false;
    let promptWithContext = prompt;
    if (codeContext !== false) {
      promptWithContext = constructPromptWithCodeContext(prompt, codeContext);
    }
    let ans = await chatSession.prompt(promptWithContext, {
      responseConstraint: DEFAULT_SCHEMA,
    });

    setIsWaitingForAi(false);
    setAiResponse(ans);
  }

  // initial setup hook
  useEffect(() => {
    const messageListener = initializeApp();
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  },
    []
  )

  // scroll to last message on new message
  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  // handle ai response
  useEffect(() => {
    if (aiResponse !== "") {
      messagesUpdate(aiResponse, 'received');
      setAiResponse("");
    }
  },
    [aiResponse]
  )

  useEffect(() => {
    const tempSelectedContext = allCodeContext.map((codeContext, index) => index);
    setUserSelectedCodeContext(tempSelectedContext);
  }, [allCodeContext]);

  return (
    <IsWaitingContext value={isWaitingForAi}>
      <SelectableCodeContext value={allCodeContext}>
        <SelectedCodeContext value={{ userSelectedCodeContext, setUserSelectedCodeContext }}>
          <ChatBox messages={messages} lastMessageRef={lastMessageRef} messagesUpdate={messagesUpdate} userMessageInput={userMessageInput} setUserMessageInput={setUserMessageInput} />
        </SelectedCodeContext>
      </SelectableCodeContext>
    </IsWaitingContext>
  )
}
