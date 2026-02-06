// This code runs when you click the extension icon
// It sends messages to content.js to activate different modes

document.getElementById('simpleBtn').addEventListener('click', () => {
  console.log("Simple button clicked");
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    console.log("Active tab:", tabs[0]);
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "simpleMode"}, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message error:", chrome.runtime.lastError);
          alert("Error: " + chrome.runtime.lastError.message);
        } else {
          console.log("Message sent successfully", response);
        }
      });
    }
  });
});

document.getElementById('focusBtn').addEventListener('click', () => {
  console.log("Focus button clicked");
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    console.log("Active tab:", tabs[0]);
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "focusMode"}, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message error:", chrome.runtime.lastError);
          alert("Error: " + chrome.runtime.lastError.message);
        } else {
          console.log("Message sent successfully", response);
        }
      });
    }
  });
});

document.getElementById('normalBtn').addEventListener('click', () => {
  console.log("Normal button clicked");
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    console.log("Active tab:", tabs[0]);
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "normalMode"}, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message error:", chrome.runtime.lastError);
          alert("Error: " + chrome.runtime.lastError.message);
        } else {
          console.log("Message sent successfully", response);
        }
      });
    }
  });
});
