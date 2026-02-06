// Popup interaction logic
const simpleBtn = document.getElementById('simpleBtn');
const focusBtn = document.getElementById('focusBtn');
const normalBtn = document.getElementById('normalBtn');
const openReadme = document.getElementById('openReadme');

function setActive(mode) {
  [simpleBtn, focusBtn, normalBtn].forEach(b => b.classList.remove('active'));
  if (mode === 'simple') simpleBtn.classList.add('active');
  if (mode === 'focus') focusBtn.classList.add('active');
  if (mode === 'normal') normalBtn.classList.add('active');
}

function sendAction(action, mode) {
  // disable while sending
  [simpleBtn, focusBtn, normalBtn].forEach(b => b.disabled = true);
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].id) {
      alert('No active tab found');
      [simpleBtn, focusBtn, normalBtn].forEach(b => b.disabled = false);
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, {action}, (response) => {
      [simpleBtn, focusBtn, normalBtn].forEach(b => b.disabled = false);
      if (chrome.runtime.lastError) {
        console.error('Message error:', chrome.runtime.lastError);
        alert('Error: ' + chrome.runtime.lastError.message + '\nMake sure the page is reloaded.');
        return;
      }
      if (response && response.status === 'success') {
        setActive(mode);
      } else {
        console.log('Response:', response);
      }
    });
  });
}

simpleBtn.addEventListener('click', () => sendAction('simpleMode', 'simple'));
focusBtn.addEventListener('click', () => sendAction('focusMode', 'focus'));
normalBtn.addEventListener('click', () => sendAction('normalMode', 'normal'));

openReadme.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({url: 'https://github.com/Regemsol/cloudsixtyt9'});
});
