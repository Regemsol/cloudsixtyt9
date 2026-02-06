// This code runs when you click the extension icon
// It sends messages to content.js to activate different modes

document.getElementById('simplifyBtn').addEventListener('click', () => {
  // Get the current active tab
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    // Send message to content.js on that tab
    chrome.tabs.sendMessage(tabs[0].id, {action: "simplifyMode"});
  });
});

document.getElementById('focusBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "focusMode"});
  });
});

document.getElementById('normalBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "normalMode"});
  });
});
