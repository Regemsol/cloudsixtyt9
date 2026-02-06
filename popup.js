// This code runs when you click the extension icon
// It sends messages to content.js to activate different modes

document.getElementById('simpleBtn').addEventListener('click', () => {
  // Get the current active tab
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "simpleMode"}, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Could not inject on this tab:", chrome.runtime.lastError.message);
        }
      });
    }
  });
});

document.getElementById('focusBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "focusMode"}, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Could not inject on this tab:", chrome.runtime.lastError.message);
        }
      });
    }
  });
});

document.getElementById('normalBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "normalMode"}, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Could not inject on this tab:", chrome.runtime.lastError.message);
        }
      });
    }
  });
});
