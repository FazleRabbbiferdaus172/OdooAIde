import { useState, useRef, useEffect, createContext } from 'react';
import ChatBox from '@/components/ChatBox'
import Header from '@/components/Header';
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
    content: `You are OdooAide, an expert Odoo developer assistant.
      Your sole purpose is to help developers write, debug, and understand Odoo code (Python and XML).

      **Your Rules:**
      1.  **Always respond in Markdown format.**
      2.  Format all code snippets in Markdown code blocks (e.g., \`\`\`xml or \`\`\`python).
      3.  If you provide multiple code blocks (like XML and Python), provide them one after another.
      4.  Keep explanations concise and directly related to Odoo.
      5.  Always provide full code snippets; never partial code.
      6.  Be professional and helpful.\
      `
  }
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
  let [aiResponse, setAiResponse] = useState("done");
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
      // sendUserPrompt(message);
      streamUserPrompt(message);
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

  // Todo: move to chatbox comeponent?
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

  // Todo: move to chatbox
  function constructPromptWithCodeContext(prompt, codeContext) {
    // Construct prompt by embedding code context
    let currentPrompt = `**TASK:** Modify the provided "CURRENT CODE" based on the "USER REQUEST". Follow the example EXACTLY.
                        --- EXAMPLE START ---
                        CURRENT CODE:
                        \`\`\`xml
                        <tree>
                          <header>
                            <button name="action_approve" string="Approve"/>
                          </header>
                          <field name="name"/>
                        </tree>
                        \`\`\`
                        USER REQUEST: "remove the header"

                        YOUR RESPONSE:
                        \`\`\`xml
                        <tree>
                          <field name="name"/>
                        </tree>
                        \`\`\`
                        Removed the header section as requested.
                        --- EXAMPLE END ---


                        --- CURRENT TASK ---
                        CURRENT CODE:
                        \`\`\`
                        ${codeContext}
                        \`\`\`
                        USER REQUEST: "${prompt}"

                        **YOUR RESPONSE INSTRUCTIONS:**
                        1.  **OUTPUT ONLY THE FINAL, MODIFIED CODE BLOCK.**
                        2.  Do **NOT** repeat the "CURRENT CODE" block.
                        3.  Optionally, add a brief explanation *after* the code block.
                        4.  Use Markdown for the entire response.
                        ---`;
    return currentPrompt;
  }


  function getCodeContextForPrompt() {
    // Get code context based on user selection
    return userSelectedCodeContext.length > 0 ? allCodeContext[userSelectedCodeContext[0]] : false;
  }

  // todo: move to chatinput?
  async function sendUserPrompt(prompt) {
    // Send user prompt to chat session with code context if available

    // Todo: this should not be 0th index all the time, need to handle multiple context selection
    const codeContext = getCodeContextForPrompt();
    let promptWithContext = prompt;
    if (codeContext !== false) {
      promptWithContext = constructPromptWithCodeContext(prompt, codeContext);
    }
    let ans = await chatSession.prompt(promptWithContext);

    setIsWaitingForAi(false);
    setAiResponse(ans);
  }

  // todo: move to chatinput?
  async function streamUserPrompt(prompt) {
    // Stream user prompt to chat session
    setAiResponse("in_progress");
    let reply = "";
    setMessages(prev => [...prev, { message: "", messageClass: "received" }]);
    const codeContext = userSelectedCodeContext.length > 0 ? allCodeContext[userSelectedCodeContext[0]] : false;
    let promptWithContext = prompt;
    if (codeContext !== false) {
      promptWithContext = constructPromptWithCodeContext(prompt, codeContext);
    }

    try {
      const stream = await chatSession.promptStreaming(promptWithContext);

      for await (const chunk of stream) {
        reply += chunk;
        setMessages(prevMessages => {
          let lastMessageIndex = prevMessages.length - 1;
          let updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = { message: reply, messageClass: "received" };
          return updatedMessages;
        });
      }
    }
    catch (error) {
      console.error("Error during streaming:", error);
      setMessages(prevMessages => {
        let lastMessageIndex = prevMessages.length - 1;
        let updatedMessages = [...prevMessages];
        updatedMessages[lastMessageIndex] = { message: "Error occurred while receiving response.", messageClass: "received" };
        return updatedMessages;
      });
    }
    finally {
      setIsWaitingForAi(false);
      setAiResponse("done");
    }
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

  useEffect(() => {
    const tempSelectedContext = allCodeContext.map((codeContext, index) => index);
    setUserSelectedCodeContext(tempSelectedContext);
  }, [allCodeContext]);

  return (
    <IsWaitingContext value={isWaitingForAi}>
      <SelectableCodeContext value={allCodeContext}>
        <SelectedCodeContext value={{ userSelectedCodeContext, setUserSelectedCodeContext }}>
          <div className="main-app-container">
            <Header />
            <ChatBox messages={messages} lastMessageRef={lastMessageRef} messagesUpdate={messagesUpdate} userMessageInput={userMessageInput} setUserMessageInput={setUserMessageInput} />
          </div>
        </SelectedCodeContext>
      </SelectableCodeContext>
    </IsWaitingContext>
  )
}
