// This script runs on EVERY webpage you visit
// It's job is to find and hide distracting elements

console.log("🛡️ Focus Shield content script loaded on:", window.location.href);
console.log("⚠️ Focus Shield is INACTIVE - waiting for user to click a button");

let mutationObserver = null;
let currentMode = null;
let summaryElement = null;

// ===== NLP SYSTEM FOR DETECTING DISTRACTING ELEMENTS =====
// This system analyzes class names and DOM structure to identify distracting content
// Works across all websites without hardcoded selectors

class DistractingElementDetector {
  constructor() {
    // Keywords and patterns that indicate distracting content
    this.distractingPatterns = {
      ads: ['ad', 'advert', 'advertisement', 'ads', 'adsbygoogle', 'adsense', 'sponsored', 'sponsor', 'banner', 'promoted', 'promote', 'promotional', 'promo', 'advertisement-block'],
      modals: ['modal', 'popup', 'overlay', 'dialog', 'notice', 'alert', 'popin'],
      notifications: ['notification', 'notify', 'toast', 'alert', 'message-bar', 'banner-notification'],
      sidebars: ['sidebar', 'side-bar', 'rail', 'aside-', 'complementary', 'widget-area'],
      social: ['social', 'share', 'facebook', 'twitter', 'instagram', 'linkedin', 'sharing-widget'],
      cookies: ['cookie', 'gdpr', 'consent', 'privacy-notice', 'cookie-banner', 'cookie-consent'],
      tracking: ['tracking', 'analytics', 'pixel', 'beacon', 'gtag', 'mixpanel']
    };
    
    // Common word stems and their variations
    this.stemMap = {
      'ad': ['ad', 'ads', 'add', 'added', 'advertisement', 'advertise', 'advert'],
      'banner': ['banner', 'bannered'],
      'modal': ['modal', 'modals'],
      'popup': ['popup', 'pop-up', 'popover', 'pop'],
      'sponsor': ['sponsor', 'sponsored', 'sponsorship', 'sponsoring'],
      'promo': ['promo', 'promote', 'promoted', 'promotion', 'promotional'],
      'notification': ['notification', 'notify', 'notified', 'toast'],
      'social': ['social', 'share', 'sharing', 'shared'],
      'cookie': ['cookie', 'cookies', 'cookiebanner', 'gdpr'],
      'sidebar': ['sidebar', 'side-bar', 'rail', 'side'],
    };
  }
  
  // Convert text to lowercase and remove special characters for comparison
  normalizeText(text) {
    return text.toLowerCase().replace(/[-_]/g, '').trim();
  }
  
  // Calculate similarity between two strings (0-1 score)
  calculateSimilarity(str1, str2) {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    // Levenshtein-like distance for partial matches
    let matches = 0;
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) matches++;
    }
    return matches / Math.max(s1.length, s2.length);
  }
  
  // Extract root word (simple stemming)
  stemWord(word) {
    const normalized = this.normalizeText(word);
    for (let [stem, variations] of Object.entries(this.stemMap)) {
      if (variations.some(v => this.normalizeText(v) === normalized)) {
        return stem;
      }
    }
    return normalized;
  }
  
  // Check if a word matches a pattern (with fuzzy matching)
  matchesPattern(word, pattern) {
    const similarity = this.calculateSimilarity(word, pattern);
    return similarity > 0.7; // 70% similarity threshold
  }
  
  // Analyze a single class/id for distracting patterns
  analyzeClassOrId(classOrId, category = null) {
    if (!classOrId || classOrId.length === 0) return 0;
    
    let score = 0;
    const words = classOrId.toLowerCase().split(/[-_\s]/);
    
    // Check against all distracting patterns
    for (let [distCategory, patterns] of Object.entries(this.distractingPatterns)) {
      // If specific category is provided, only check that category
      if (category && distCategory !== category) continue;
      
      for (let word of words) {
        for (let pattern of patterns) {
          const similarity = this.calculateSimilarity(word, pattern);
          if (similarity > 0.75) {
            score += similarity; // Higher score for better matches
          }
        }
      }
    }
    
    return Math.min(score, 1); // Cap at 1.0
  }
  
  // Analyze an element based on multiple factors
  scoreElement(element) {
    let score = 0;
    const weights = {
      className: 0.4,
      id: 0.3,
      dataAttributes: 0.2,
      size: 0.1
    };
    
    // Score class names
    if (element.className) {
      score += (this.analyzeClassOrId(element.className) || 0) * weights.className;
    }
    
    // Score ID
    if (element.id) {
      score += (this.analyzeClassOrId(element.id) * 0.8) * weights.id; // ID slightly less weight
    }
    
    // Score data attributes
    for (let attr of element.attributes || []) {
      if (attr.name.startsWith('data-') && (attr.name.includes('ad') || attr.name.includes('tracking'))) {
        score += weights.dataAttributes;
      }
    }
    
    // Size heuristic: very large or very small elements are often distracting
    try {
      const rect = element.getBoundingClientRect();
      const viewportArea = window.innerWidth * window.innerHeight;
      const elementArea = rect.width * rect.height;
      
      // Ads are often 0% height (hidden) or cover 30%+ of viewport
      if (elementArea === 0 || (elementArea / viewportArea > 0.25)) {
        score += weights.size * 0.5;
      }
    } catch (e) {}
    
    return Math.min(score, 1);
  }
  
  // Find all distracting elements on the page using NLP
  findDistractivElemts(threshold = 0.5) {
    const distractingElements = [];
    const bodyElements = document.querySelectorAll('*');
    
    bodyElements.forEach(element => {
      const score = this.scoreElement(element);
      if (score >= threshold) {
        distractingElements.push({
          element,
          score,
          className: element.className,
          id: element.id,
          tag: element.tagName
        });
      }
    });
    
    // Sort by score (highest first)
    return distractingElements.sort((a, b) => b.score - a.score);
  }
  
  // Get category of distracting element
  categorizeElement(element) {
    const fullText = (element.className + ' ' + element.id).toLowerCase();
    
    for (let [category, patterns] of Object.entries(this.distractingPatterns)) {
      for (let pattern of patterns) {
        if (this.matchesPattern(fullText, pattern)) {
          return category;
        }
      }
    }
    return 'unknown';
  }
  
  // Analyze and log detected elements (for debugging)
  analyzePageElements() {
    const detected = this.findDistractivElemts(0.5);
    console.log(`🔍 NLP Analysis: Found ${detected.length} potentially distracting elements:`);
    
    detected.slice(0, 10).forEach((item, index) => {
      const category = this.categorizeElement(item.element);
      console.log(`${index + 1}. [${category.toUpperCase()}] Score: ${item.score.toFixed(2)} | Class: "${item.className}" | ID: "${item.id}"`);
    });
    
    return detected;
  }
}

// Create global detector instance
const distractingDetector = new DistractingElementDetector();

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

// SIMPLE MODE: Remove ads + show content summary (using NLP detection)
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
  
  // Remove any highlighting
  const highlighting = document.querySelectorAll('.focus-shield-highlighted');
  highlighting.forEach(element => {
    element.classList.remove('focus-shield-highlighted');
  });
  
  currentMode = "simple";
  
  // 🧠 Use NLP-based detection for distracting elements
  const distractingElements = distractingDetector.findDistractivElemts(0.45);
  
  let hiddenCount = 0;
  distractingElements.forEach(item => {
    item.element.classList.add('focus-shield-hidden');
    hiddenCount++;
  });
  
  console.log(`✅ Simple Mode: NLP detected and hidden ${hiddenCount} distracting elements`);
  
  // Also apply fallback selectors for common patterns not caught by NLP
  const fallbackSelectors = [
    'aside',
    '[role="dialog"]',
    '[role="complementary"]',
    '.sticky',
    '.fixed'
  ];
  
  fallbackSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.classList.contains('focus-shield-hidden')) {
          element.classList.add('focus-shield-hidden');
        }
      });
    } catch (e) {}
  });
  
  // Generate and display a summary
  generateAndDisplaySummary();
  
  // Store that we're in simple mode
  document.body.setAttribute('data-focus-shield', 'simple');
  
  // Log detailed NLP analysis
  distractingDetector.analyzePageElements();
  
  // Start watching for new ads injected dynamically
  startMutationObserver();
}

// FOCUS MODE: Only removes ads (clean reading) - using NLP detection
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
  
  // Remove any existing highlighting first
  const oldHighlight = document.querySelectorAll('.focus-shield-highlighted');
  oldHighlight.forEach(element => {
    element.classList.remove('focus-shield-highlighted');
  });
  
  currentMode = "focus";
  
  // Find and highlight main content
  const mainContentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.post-content',
    '.article-content',
    '#content',
    '.content'
  ];
  
  let mainContent = null;
  for (let selector of mainContentSelectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) break;
  }
  
  if (mainContent) {
    mainContent.classList.add('focus-shield-highlighted');
  }
  
  // 🧠 Use NLP-based detection for ads (higher threshold = only strongest matches)
  const allDistracting = distractingDetector.findDistractivElemts(0.6);
  
  // Filter to only ads and promotional content
  const adKeywords = ['ad', 'advert', 'advertisement', 'adsense', 'sponsor', 'promotion', 'promo', 'banner'];
  const ads = allDistracting.filter(item => {
    const fullText = (item.className + ' ' + item.id).toLowerCase();
    return adKeywords.some(keyword => fullText.includes(keyword));
  });
  
  let hiddenCount = 0;
  ads.forEach(item => {
    item.element.classList.add('focus-shield-hidden');
    hiddenCount++;
  });
  
  console.log(`✅ Focus Mode: NLP detected and hidden ${hiddenCount} ads`);
  
  // Apply fallback ad selectors
  const fallbackAdSelectors = [
    '[data-ad-client]',
    '[data-ad-slot]',
    '[data-ad-format]',
    '[data-adsbygoogle]',
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'script[src*="ads"]'
  ];
  
  fallbackAdSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.classList.contains('focus-shield-hidden')) {
          element.classList.add('focus-shield-hidden');
        }
      });
    } catch (e) {}
  });
  
  document.body.setAttribute('data-focus-shield', 'focus');
  
  // Log analysis
  console.log(`🔍 NLP Focus Mode: Analyzed ${allDistracting.length} distracting elements, hid ${hiddenCount} ads`);
  
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
  
  // Remove highlight from main content
  const highlighting = document.querySelectorAll('.focus-shield-highlighted');
  highlighting.forEach(element => {
    element.classList.remove('focus-shield-highlighted');
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

// Extracted ad-hiding logic for reuse (with NLP detection)
function hideAds() {
  // 🧠 Use NLP detection for ads
  const allDistracting = distractingDetector.findDistractivElemts(0.55);
  
  // Filter to ads/promotional content
  const adKeywords = ['ad', 'advert', 'advertisement', 'adsense', 'sponsor', 'promotion', 'promo', 'banner', 'popup', 'modal', 'overlay'];
  const ads = allDistracting.filter(item => {
    const fullText = (item.className + ' ' + item.id).toLowerCase();
    return adKeywords.some(keyword => fullText.includes(keyword));
  });
  
  // Hide detected ads
  ads.forEach(item => {
    if (!item.element.classList.contains('focus-shield-hidden')) {
      item.element.classList.add('focus-shield-hidden');
    }
  });
  
  // Also check common ad data attributes
  const dataAdElements = document.querySelectorAll('[data-ad-client], [data-ad-slot], [data-ad-format], [data-adsbygoogle]');
  dataAdElements.forEach(element => {
    if (!element.classList.contains('focus-shield-hidden')) {
      element.classList.add('focus-shield-hidden');
    }
  });
  
  // Check for ad-related iframes and scripts
  const adIframes = document.querySelectorAll(
    'iframe[src*="ads"], iframe[src*="doubleclick"], iframe[src*="googlesyndication"], iframe[src*="pagead"]'
  );
  adIframes.forEach(element => {
    if (!element.classList.contains('focus-shield-hidden')) {
      element.classList.add('focus-shield-hidden');
    }
  });
  
  if (ads.length > 0) {
    console.log(`Focus Shield: NLP detected and hid ${ads.length} dynamically-injected distracting elements`);
  }
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
    // Extract key points (sentences that look like they contain useful info)
    const sentences = contentText.match(/[^.!?]+[.!?]+/g) || [];
    
    // Filter and shorten sentences to key points
    const keyPoints = sentences
      .filter(s => s.trim().length > 20) // Only meaningful sentences
      .map(s => s.trim().slice(0, 120)) // Limit each point to 120 chars
      .slice(0, 5); // Show only top 5 points
    
    if (keyPoints.length === 0) return; // Not enough content
    
    // Create summary box
    summaryElement = document.createElement('div');
    summaryElement.className = 'focus-shield-summary';
    
    const bulletPoints = keyPoints
      .map(point => `<li>${point}${point.length === 120 ? '...' : ''}</li>`)
      .join('');
    
    summaryElement.innerHTML = `
      <div class="summary-header">
        <strong>📝 Key Points</strong>
        <button class="close-summary" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="summary-content">
        <ul class="summary-bullets">${bulletPoints}</ul>
      </div>
    `;
    
    document.body.insertBefore(summaryElement, document.body.firstChild);
    console.log("Focus Shield: Summary generated with key points");
  } catch (error) {
    console.error("Focus Shield: Error generating summary", error);
  }
}
