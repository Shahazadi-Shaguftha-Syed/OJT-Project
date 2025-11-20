// ====== Data ======
const paragraphs = [
  "JavaScript makes web pages interactive and dynamic. Practice often and build small projects.",
  "Typing fast is a useful skill in programming and data entry. Accuracy matters more than speed at first.",
  "Practice regularly to improve your typing speed and accuracy. Short daily sessions beat long occasional ones.",
  "Coding challenges help you grow as a developer every day. Build, break, and fix things to learn.",
  "Front end development involves HTML, CSS and JavaScript. Create small UI projects to show your skills."
];
// ====== Elements ======
const testTextEl = document.getElementById("testText");
const typingArea = document.getElementById("typingArea");
const timeLeftEl = document.getElementById("timeLeft");
const mistakesEl = document.getElementById("mistakes");
const wpmEl = document.getElementById("wpm");
const cpmEl = document.getElementById("cpm");
const displayWPM = document.getElementById("displayWPM");
const tryAgainBtn = document.getElementById("tryAgain");
// ====== State ======
const TOTAL_TIME = 60; // seconds
let timerInterval = null;
let timeLeft = TOTAL_TIME;
let isTiming = false;
let currentText = "";
let startTime = null;

// ====== Helpers ======
function loadRandomText() {
  const idx = Math.floor(Math.random() * paragraphs.length);
  currentText = paragraphs[idx];
  // show full text (unhighlighted)
  testTextEl.innerHTML = escapeHtml(currentText);
  // reset typing area
  typingArea.value = "";
  typingArea.disabled = false;
  typingArea.focus();
  resetStats();
}
// Escape HTML to safely insert into DOM
function escapeHtml(str){
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function resetStats(){
  // stop timer if running
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    }
    timeLeft = TOTAL_TIME;
    isTiming = false;
    startTime = null;
    timeLeftEl.textContent = timeLeft;
    mistakesEl.textContent = 0;
    wpmEl.textContent = 0;
    cpmEl.textContent = 0;
    displayWPM.textContent = "0 WPM";
}

function startTimerOnce(){
  if (isTiming) return;
  isTiming = true;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) timeLeft = 0;
    timeLeftEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      typingArea.disabled = true;
    }
    // keep updating wpm while timing
    computeStats();
  }, 1000);
}

// compute mistakes, correctChars, WPM, CPM
function computeStats(){
  const typed = typingArea.value;
  const lenTyped = typed.length;
  const lenRef = currentText.length;
  let mistakes = 0;
  let correctChars = 0;
  for (let i = 0; i < lenTyped; i++){
    if (i >= lenRef) {
      // typed extra beyond reference -> count as mistake
      mistakes++;
    } else if (typed[i] !== currentText[i]) {
      mistakes++;
    } else {
      correctChars++;
    }
  }

  const elapsedSeconds = Math.max(1, (TOTAL_TIME - timeLeft)); // avoid zero
  const elapsedMinutes = elapsedSeconds / 60;
  const wpm = Math.round((correctChars / 5) / elapsedMinutes) || 0;
  const cpm = correctChars || 0;

  // update UI
  mistakesEl.textContent = mistakes;
  wpmEl.textContent = wpm;
  cpmEl.textContent = cpm;
  displayWPM.textContent = wpm + " WPM";

    // update highlighted test text: correct part colored neon
    const correctPart = escapeHtml(currentText.slice(0, correctChars + (lenTyped > lenRef ? 0 : 0)));
    const nextPart = escapeHtml(currentText.slice(correctChars));
    // We want to highlight correct characters by position, not by counting mistakes.
    // Another approach: highlight all indices where typed char equals ref char.
    let html = "";
    for (let i = 0; i < currentText.length; i++){
      const ch = escapeHtml(currentText[i]);
      if (i < typed.length && typed[i] === currentText[i]) {
        html += `<span style="color:var(--neon)">${ch}</span>`;
      } else {
        html += `<span>${ch}</span>`;
      }
    }
    testTextEl.innerHTML = html;
}

// ====== Events ======
typingArea.addEventListener("input", (e) => {
  // start timer when user first types
  if (!isTiming) startTimerOnce();
  computeStats();
});

tryAgainBtn.addEventListener("click", () => {
  loadRandomText(); // includes resetting stats
});

// load initial text
loadRandomText();// OPTIONAL: let user press Ctrl+Enter to finish early and stop timer
typingArea.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    // stop timer and disable typing
    if (timerInterval) clearInterval(timerInterval);
    typingArea.disabled = true;
  }
});

