const codeBlockIdentifierClass = '.o_field_code';
const codeContentClass = '.ace_content';
let lastSentCode = null; // A cache to prevent sending duplicate messages

const findAndSendCode = () => {
  const codeContentElement = document.querySelector(codeContentClass);

  if (!codeContentElement) {
    lastSentCode = null; // Reset cache if editor disappears
    return;
  }

  try {
    const currentCode = document.querySelector(codeContentClass).innerText;

    if (currentCode !== lastSentCode) {
      console.log("Code context updated. Sending to side panel.");
      chrome.runtime.sendMessage({
        type: "CODE_CONTEXT_UPDATED",
        payload: currentCode,
      });
      lastSentCode = currentCode; // Update the cache
    }
    else {
      console.log("Code context unchanged. Not sending message.");
    }
  } catch (error) {
    console.error("Error retrieving code from ace editor: ", error);
  }
};


function attachMessageListener() {
  console.log("Attaching message listener in content script.");
  const messageListener = (message, sender, sendResponse) => {
    console.log("Content script received message: ", message.payload);
    if (message.type === "REQUEST_CODE_CONTEXT") {
      console.log("Received REQUEST_CODE_CONTEXT message.");
      lastSentCode = null;
      findAndSendCode();
    }
  }
  chrome.runtime.onMessage.addListener(messageListener);
}

function setupObserver() {
  console.log("Setting up MutationObserver in content script.");

  const mainObserver = new MutationObserver((mutationsList) => {
    findAndSendCode();
  });

  mainObserver.observe(document.body, {
    childList: true, // Watch for nodes being added or removed
    subtree: true,   // Watch all descendants
  });
}

// Initial code send
function main() {
  console.log("Initializing main content script.......");
  findAndSendCode();
  attachMessageListener();
  setupObserver();
  console.log("Main content script initialized and observing for code changes.");
}

main();