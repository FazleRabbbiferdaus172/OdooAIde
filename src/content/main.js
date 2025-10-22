const codeBlockIdentifierClass = '.o_field_code';
const codeContentClass = '.ace_content';
let lastSentCode = null; // A cache to prevent sending duplicate messages

const findAndSendCode = () => {
  // Find the code block element and send its content if it has changed
  const codeContentElement = document.querySelector(codeContentClass);

  if (!codeContentElement) {
    lastSentCode = null; // Reset cache if editor disappears
    return;
  }

  try {
    const currentCode = document.querySelector(codeContentClass).innerText;

    if (currentCode !== lastSentCode) {
      chrome.runtime.sendMessage({
        type: "CODE_CONTEXT_UPDATED",
        payload: currentCode,
      });
      // Todo: instead of updating every time, only update when it is acknowledged in side panel, also need 2 states 1. for scaning 2. sending message.
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
  // Listen for messages from the side panel
  const messageListener = (message, sender, sendResponse) => {
    if (message.type === "REQUEST_CODE_CONTEXT") {
      lastSentCode = null;
      findAndSendCode();
    }
  }
  chrome.runtime.onMessage.addListener(messageListener);
}

function setupObserver() {
  // Set up a MutationObserver to monitor changes in the DOM
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
  findAndSendCode();
  attachMessageListener();
  setupObserver();
}

main();