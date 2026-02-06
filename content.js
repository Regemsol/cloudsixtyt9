// This script runs on EVERY webpage you visit
// It's job is to find and hide distracting elements

console.log("🛡️ Focus Shield content script loaded on:", window.location.href);
console.log("⚠️ Focus Shield is INACTIVE - waiting for user to click a button");

let mutationObserver = null;
let currentMode = null;
let summaryElement = null;

// Listen for messages from the popup (when user clicks buttons)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Focus Shield received message:", request);
  try {
    if (request.action === "simpleMode") {
      console.log("✅ Activating Simple Mode");
      activateSimpleMode();
    } else if (request.action === "focusMode") {
      console.log("✅ Activating Focus Mode");
      activateFocusMode();
    } else if (request.action === "normalMode") {
      console.log("✅ Deactivating all modes");
      deactivateAllModes();
    }
    sendResponse({status: "success"});
  } catch (error) {
    console.error("Focus Shield error:", error);
    sendResponse({status: "error", message: error.message});
  }
});

// SIMPLE MODE: Remove ads + show content summary
function activateSimpleMode() {
  console.log("Simple Mode activated");
  
  // Clean up any previous mode
  stopMutationObserver();
  if (summaryElement && summaryElement.parentNode) {
    summaryElement.remove();
    summaryElement = null;
  }
  
  // Remove all hidden elements first
  const hiddenElements = document.querySelectorAll('.focus-shield-hidden');
  hiddenElements.forEach(element => {
    element.classList.remove('focus-shield-hidden');
  });
  
  currentMode = "simple";
  
  // Common selectors for ads and distracting elements
  const distractingSelectors = [
    // Ads - more aggressive matching
    '[class*="ad-"]',
    '[class*="ad_"]',
    '[class*="_ad"]',
    '[class*="ads"]',
    '[id*="ad-"]',
    '[id*="ad_"]',
    '[id*="_ad"]',
    '[class*="advertisement"]',
    '[class*="adsbygoogle"]',
    '[class*="banner"]',
    '[class*="sponsor"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    '[data-ad-format]',
    '[data-adsbygoogle]',
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="googletagmanager"]',
    'iframe[src*="pagead"]',
    'script[src*="ads"]',
    'script[src*="advertisement"]',
    '[class*="advert"]',
    '[class*="advertising"]',
    '[class*="promoted"]',
    '[class*="promote"]',
    '[class*="promotional"]',
    '[class*="promo"]',
    
    // Popups and modals
    '[class*="modal"]',
    '[class*="popup"]',
    '[class*="overlay"]',
    '[class*="notification"]',
    '[class*="toast"]',
    '[class*="dialog"]',
    '[role="dialog"]',
    
    // Social media widgets
    '[class*="social-share"]',
    '[class*="share-button"]',
    '[class*="shareicon"]',
    '[class*="social"]',
    
    // Cookie banners (more patterns)
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="gdpr"]',
    '[class*="consent"]',
    '[class*="banner-cookie"]',
    
    // Sidebars and extra navigation
    'aside',
    '[class*="sidebar"]',
    '[class*="right-rail"]',
    '[class*="rail"]',
    '[role="complementary"]',
    
    // Sticky headers/footers (often distracting)
    '[class*="sticky-header"]',
    '[class*="fixed-header"]',
    '[class*="sticky"]'
  ];
  
  // Hide all matching elements
  let hiddenCount = 0;
  distractingSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add('focus-shield-hidden');
        hiddenCount++;
      });
    } catch (e) {
      // Invalid selector, skip it
    }
  });
  
  console.log(`Simple Mode: Hidden ${hiddenCount} distracting elements`);
  
  // Generate and display a summary
  generateAndDisplaySummary();
  
  // Store that we're in simple mode
  document.body.setAttribute('data-focus-shield', 'simple');
  
  // Start watching for new ads injected dynamically
  startMutationObserver();
}

// FOCUS MODE: Only removes ads (clean reading)
function activateFocusMode() {
  console.log("Focus Mode activated");
  
  // Clean up any previous mode
  stopMutationObserver();
  if (summaryElement && summaryElement.parentNode) {
    summaryElement.remove();
    summaryElement = null;
  }
  
  // Remove all hidden elements first
  const hiddenElements = document.querySelectorAll('.focus-shield-hidden');
  hiddenElements.forEach(element => {
    element.classList.remove('focus-shield-hidden');
  });
  
  currentMode = "focus";
  
  // Comprehensive ad selector list - catches all ads on the page
  const ads = [
    // Ads - more aggressive matching
    '[class*="ad-"]',
    '[class*="ad_"]',
    '[class*="_ad"]',
    '[class*="ads"]',
    '[id*="ad-"]',
    '[id*="ad_"]',
    '[id*="_ad"]',
    '[class*="advertisement"]',
    '[class*="adsbygoogle"]',
    '[class*="banner"]',
    '[class*="sponsor"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    '[data-ad-format]',
    '[data-adsbygoogle]',
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="googletagmanager"]',
    'iframe[src*="pagead"]',
    'script[src*="ads"]',
    'script[src*="advertisement"]',
    '[class*="advert"]',
    '[class*="advertising"]',
    '[class*="promoted"]',
    '[class*="promote"]',
    '[class*="promotional"]',
    '[class*="promo"]',
    
    // Popups and modals (some ads appear as modals)
    '[class*="modal"]',
    '[class*="popup"]',
    '[class*="overlay"]',
    '[class*="notification"]',
    '[class*="toast"]',
    
    // Social media widgets
    '[class*="social-share"]',
    '[class*="share-button"]',
    '[class*="shareicon"]',
    '[class*="social"]'
  ];
  
  let hiddenCount = 0;
  ads.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add('focus-shield-hidden');
        hiddenCount++;
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });
  
  console.log(`✅ Focus Mode: Hidden ${hiddenCount} ads`);
  document.body.setAttribute('data-focus-shield', 'focus');
  
  // Start watching for new ads
  startMutationObserver();
}

// NORMAL MODE: Show everything again
function deactivateAllModes() {
  console.log("🔄 Deactivating all modes - returning to normal");
  currentMode = null;
  
  // Stop watching for new elements
  stopMutationObserver();
  
  // Remove ALL our modifications
  const hiddenElements = document.querySelectorAll('.focus-shield-hidden');
  hiddenElements.forEach(element => {
    element.classList.remove('focus-shield-hidden');
  });
  
  // Remove summary box
  if (summaryElement && summaryElement.parentNode) {
    summaryElement.remove();
    summaryElement = null;
  }
  
  // Remove the data attribute completely
  document.body.removeAttribute('data-focus-shield');
  
  // Reset background
  document.body.style.background = '';
  
  console.log("✅ Normal mode activated - all Focus Shield modifications removed");
}

// MutationObserver to catch dynamically-injected ads
function startMutationObserver() {
  // Stop any existing observer first
  stopMutationObserver();
  
  mutationObserver = new MutationObserver((mutations) => {
    // Rerun ad hiding on mutations (but throttle to avoid performance issues)
    clearTimeout(window.focusShieldTimeout);
    window.focusShieldTimeout = setTimeout(() => {
      if (currentMode === 'simple' || currentMode === 'focus') {
        hideAds();
      }
    }, 500);
  });
  
  // Watch for changes to the entire document
  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'data-ad-client', 'data-ad-slot']
  });
  
  console.log("Focus Shield: Watching for dynamically-injected ads");
}

function stopMutationObserver() {
  clearTimeout(window.focusShieldTimeout);
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
    console.log("Focus Shield: Stopped watching for new ads");
  }
}

// Extracted ad-hiding logic for reuse
function hideAds() {
  const distractingSelectors = [
    '[class*="ad-"]',
    '[class*="ad_"]',
    '[class*="_ad"]',
    '[class*="ads"]',
    '[id*="ad-"]',
    '[id*="ad_"]',
    '[id*="_ad"]',
    '[class*="advertisement"]',
    '[class*="adsbygoogle"]',
    '[class*="banner"]',
    '[class*="sponsor"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    '[data-ad-format]',
    '[data-adsbygoogle]',
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="googletagmanager"]',
    'iframe[src*="pagead"]',
    'script[src*="ads"]',
    'script[src*="advertisement"]',
    '[class*="advert"]',
    '[class*="advertising"]',
    '[class*="promoted"]',
    '[class*="promote"]',
    '[class*="promotional"]',
    '[class*="promo"]',
    '[class*="modal"]',
    '[class*="popup"]',
    '[class*="overlay"]',
    '[class*="notification"]',
    '[class*="toast"]',
    '[class*="social-share"]',
    '[class*="share-button"]',
    '[class*="shareicon"]',
    '[class*="social"]'
  ];
  
  distractingSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.classList.contains('focus-shield-hidden')) {
          element.classList.add('focus-shield-hidden');
          console.log("Focus Shield: Hid dynamically-injected ad", element);
        }
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });
}

// Generate and display a summary of the page content
function generateAndDisplaySummary() {
  try {
    // Remove old summary if exists
    if (summaryElement && summaryElement.parentNode) {
      summaryElement.remove();
    }
    
    // Find main content
    const mainContent = document.querySelector('main, article, [role="main"], .post-content, .article-content, #content, .content');
    const contentText = mainContent ? mainContent.innerText : document.body.innerText;
    
    if (!contentText) return;
    
    // Extract sentences and create summary
    const sentences = contentText.match(/[^.!?]+[.!?]+(?=\s+|$)/g) || [];
    const summaryLength = Math.ceil(sentences.length * 0.3); // 30% of content
    const summaryText = sentences.slice(0, Math.max(3, summaryLength)).join(' ').trim();
    
    if (summaryText.length < 50) return; // Too short to summarize
    
    // Create summary box
    summaryElement = document.createElement('div');
    summaryElement.className = 'focus-shield-summary';
    summaryElement.innerHTML = `
      <div class="summary-header">
        <strong>📝 Content Summary</strong>
        <button class="close-summary" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="summary-content">${summaryText}...</div>
    `;
    
    document.body.insertBefore(summaryElement, document.body.firstChild);
    console.log("Focus Shield: Summary generated");
  } catch (error) {
    console.error("Focus Shield: Error generating summary", error);
  }
}
