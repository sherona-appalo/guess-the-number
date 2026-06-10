let mode = "daily";
let number;
let attempts = 0;
let input = [];

// ---------- DATE ----------
const today = new Date().toDateString();
const now = new Date().getTime();
const ONE_DAY = 24 * 60 * 60 * 1000;

// ---------- DAILY STREAK ----------
let dailyStreak = Number(localStorage.getItem("dailyStreak")) || 0;
let lastDailyPlayed = localStorage.getItem("lastDailyPlayed");

// Reset streak if missed a day
if (lastDailyPlayed && now - Number(lastDailyPlayed) > ONE_DAY * 1.5) {
  dailyStreak = 0;
  localStorage.setItem("dailyStreak", dailyStreak);
}

// ---------- DAILY LOCK ----------
let dailyLocked = localStorage.getItem("dailyLocked") === today;

// Unlock daily at midnight
if (localStorage.getItem("dailyLocked") !== today) {
  localStorage.removeItem("dailyLocked");
  dailyLocked = false;
}

// ---------- UNLIMITED LOCK ----------
let unlimitedLocked = false;

// Update UI
document.getElementById("dailyStreak").textContent =
  "Daily Streak: " + dailyStreak;

// ---------- NUMBER GENERATION ----------
function generateDailyNumber() {
  const d = new Date();
  const seed =
    d.getFullYear() * 10000 +
    (d.getMonth() + 1) * 100 +
    d.getDate();

  return (seed * 9301 + 49297) % 999 + 1;
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 999) + 1;
}

function getNumber() {
  return mode === "daily"
    ? generateDailyNumber()
    : generateRandomNumber();
}

// Init
number = getNumber();

// ---------- MODE SWITCH ----------
function setMode(m) {
  mode = m;
  number = getNumber();
  attempts = 0;
  input = [];
  unlimitedLocked = false;
  updateBoxes();

  document.getElementById("playAgainBtn").style.display = "none";

  document.getElementById("modeText").textContent =
    "Mode: " + (mode === "daily" ? "Daily" : "Unlimited");

  document.getElementById("attempts").textContent = "Attempts: 0";

  if (mode === "daily" && dailyLocked) {
    document.getElementById("message").textContent =
      "✅ Daily number solved. Come back tomorrow!";
  } else {
    document.getElementById("message").textContent = "";
  }
}

// ---------- KEYBOARD INPUT ----------
document.addEventListener("keydown", (e) => {

  // 🚫 Block input when locked
  if (
    (mode === "daily" && dailyLocked) ||
    (mode === "unlimited" && unlimitedLocked)
  ) return;

  if (e.key >= "0" && e.key <= "9") {
    if (input.length < 3) {
      input.push(e.key);
    } else {
      input[2] = e.key;
    }
    updateBoxes();
  }

  if (e.key === "Backspace") {
    input.pop();
    updateBoxes();
  }

  if (e.key === "Enter") {
    submitGuess();
  }
});

function updateBoxes() {
  for (let i = 0; i < 3; i++) {
    document.getElementById("d" + i).textContent =
      input[i] || "";
  }
}

// ---------- SUBMIT GUESS ----------
function submitGuess() {

  if (
    (mode === "daily" && dailyLocked) ||
    (mode === "unlimited" && unlimitedLocked)
  ) return;

  const message = document.getElementById("message");

  if (input.length !== 3) {
    message.textContent = "❌ Enter 3 digits";
    pulse(message);
    return;
  }

  const guess = Number(input.join(""));
  attempts++;

  document.getElementById("attempts").textContent =
    "Attempts: " + attempts;

  if (guess === number) {
    message.textContent = "🎉 Correct!";
    pulse(message);

    if (mode === "daily") {
      dailyStreak++;
      dailyLocked = true;

      localStorage.setItem("dailyStreak", dailyStreak);
      localStorage.setItem("lastDailyPlayed", now);
      localStorage.setItem("dailyLocked", today);

      document.getElementById("dailyStreak").textContent =
        "Daily Streak: " + dailyStreak;

      setTimeout(() => {
        message.textContent =
          "✅ Daily number solved. Come back tomorrow!";
      }, 800);

    } else {
      // 🔒 LOCK unlimited until Play Again
      unlimitedLocked = true;
      document.getElementById("playAgainBtn").style.display = "inline-block";
    }

  } else if (guess < number) {
    message.textContent = "⬆️ Higher";
    pulse(message);
  } else {
    message.textContent = "⬇️ Lower";
    pulse(message);
  }
}

// ---------- PLAY AGAIN ----------
function playAgain() {
  if (mode !== "unlimited") return;

  number = generateRandomNumber();
  attempts = 0;
  input = [];
  unlimitedLocked = false;
  updateBoxes();

  document.getElementById("attempts").textContent = "Attempts: 0";
  document.getElementById("message").textContent = "";
  document.getElementById("playAgainBtn").style.display = "none";
}

// ---------- VISUAL FEEDBACK ----------
function pulse(el) {
  el.style.transform = "scale(1.06)";
  el.style.transition = "0.15s";
  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 150);
}
