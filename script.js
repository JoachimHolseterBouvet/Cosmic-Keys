const keys = document.querySelectorAll(".key");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const container = document.querySelector(".container");
const layoutSelect = document.getElementById("keyboard-layout-select"); // Get the select element
const keyboardElement = document.getElementById("keyboard"); // Get the keyboard element

let score = 0;
let currentKey = null;
let startTime = null;
let timeoutId = null;
const flashDuration = 1000; // Time in milliseconds for the key to flash
const incorrectFlashDuration = 500; // Duration for the red flash
const correctFlashDuration = 300; // Duration for the green flash
const wrongKeyPressPenalty = 25; // Amount to subtract for a wrong press
let timeLeft = 60;
let gameInterval;
let gameStarted = false;
let backgroundFlashActive = true; // New variable to control background flashing
let backgroundFlashInterval; // Variable to hold the interval ID for background flashing

// Define key sets for different layouts
const keyLayouts = {
  standard: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ",
  nordic: "QWERTYUIOPÅASDFGHJKLØÆZXCVBNM ",
};
let allValidKeys = keyLayouts.nordic; // Default to Nordic

function getRandomKey() {
  return allValidKeys[Math.floor(Math.random() * allValidKeys.length)];
}

function flashKey(keyChar) {
  const keyElement = Array.from(keys).find((key) => {
    if (keyChar === " ") {
      return key.textContent.trim() === "" && key.classList.contains("space");
    } else {
      return key.textContent === keyChar;
    }
  });
  if (keyElement) {
    keyElement.classList.add("active");
    currentKey = keyChar;
    startTime = Date.now();
    return true; // Indicate that a key was found and flashed
  } else {
    return false; // Indicate that no key was found
  }
}

function flashRandomKey() {
  if (backgroundFlashActive) {
    // Find the currently active key and remove the active class
    const currentlyActiveKey = document.querySelector(".key.active");
    if (currentlyActiveKey) {
      currentlyActiveKey.classList.remove("active");
    }

    const randomKey = getRandomKey();
    flashKey(randomKey);
  }
}

function updateScore(timeTaken) {
  const basePoints = 10;
  const timeBonus = Math.max(0, 500 - timeTaken); // Give bonus for responses faster than 500ms
  score += basePoints + Math.floor(timeBonus / 50);
  scoreDisplay.textContent = `Score: ${score}`;
}

function handleKeyPress(event) {
  if (!gameStarted || timeLeft <= 0) {
    return;
  }

  const pressedKey = event.key.toUpperCase();
  const expectedKey = currentKey === " " ? " " : currentKey;

  if (currentKey && pressedKey === expectedKey) {
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    updateScore(timeTaken);
    const correctKeyElement = Array.from(keys).find((key) => {
      if (currentKey === " ") {
        return key.textContent.trim() === "" && key.classList.contains("space");
      } else {
        return key.textContent === currentKey;
      }
    });
    if (correctKeyElement) {
      correctKeyElement.classList.remove("active");
      correctKeyElement.classList.add("correct");
      setTimeout(() => {
        correctKeyElement.classList.remove("correct");
      }, correctFlashDuration);
    }
    currentKey = null;
    startGame();
  } else {
    // Only penalize if the pressed key is one of the valid keys for the selected layout
    if (allValidKeys.includes(pressedKey)) {
      score -= wrongKeyPressPenalty;
      score = Math.max(0, score);
      scoreDisplay.textContent = `Score: ${score}`;

      const incorrectKeyElement = Array.from(keys).find((key) => {
        if (pressedKey === " ") {
          return (
            key.textContent.trim() === "" && key.classList.contains("space")
          );
        } else {
          return key.textContent === pressedKey;
        }
      });
      if (incorrectKeyElement) {
        incorrectKeyElement.classList.add("incorrect");
        setTimeout(() => {
          incorrectKeyElement.classList.remove("incorrect");
        }, incorrectFlashDuration);
        // If an incorrect key was pressed, and it was the active key,
        // we should clear the active state and currentKey to avoid confusion.
        if (currentKey && pressedKey === currentKey) {
          const activeKeyElement = document.querySelector(".key.active");
          if (activeKeyElement) {
            activeKeyElement.classList.remove("active");
          }
          currentKey = null;
          // Schedule the next key flash after a short delay
          if (gameStarted && timeLeft > 0) {
            setTimeout(startGame, 500);
          }
        }
      }
    }
  }
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = `Time: ${timeLeft}`;
  if (timeLeft <= 0) {
    clearInterval(gameInterval);
    gameStarted = false;
    timerDisplay.textContent = "Time: 0";
    alert(`Game Over! Your final score is: ${score}`);
  }
}

function startGame() {
  if (timeLeft <= 0) {
    return;
  }
  const randomKey = getRandomKey();
  flashKey(randomKey);
}

function initGame() {
  score = 0;
  timeLeft = 60;
  scoreDisplay.textContent = `Score: ${score}`;
  timerDisplay.style.display = "none";
  gameStarted = false;
  backgroundFlashActive = true;
  container.classList.add("blurred");
  // Start background flashing with setInterval
  backgroundFlashInterval = setInterval(flashRandomKey, 1500);
}

startButton.addEventListener("click", () => {
  // Get the selected layout value
  const selectedLayout = layoutSelect.value;
  allValidKeys = keyLayouts[selectedLayout]; // Update the valid keys based on selection

  // Remove any existing layout classes from the keyboard
  keyboardElement.classList.remove("standard-layout", "nordic-layout");
  // Add the class for the selected layout
  keyboardElement.classList.add(selectedLayout + "-layout");

  // Hide keys not in the selected layout
  keys.forEach((keyElement) => {
    const keyChar = keyElement.textContent.trim();
    // Check if the trimmed text content is in allValidKeys OR if it's the space key and space is valid
    if (
      allValidKeys.includes(keyChar) ||
      (keyChar === "" &&
        keyElement.classList.contains("space") &&
        allValidKeys.includes(" "))
    ) {
      keyElement.classList.remove("hidden-key"); // Show the key
    } else {
      keyElement.classList.add("hidden-key"); // Hide the key
    }
  });

  // Find and remove 'active' class from any currently active key (pre-game)
  const activeKeyElement = document.querySelector(".key.active");
  if (activeKeyElement) {
    activeKeyElement.classList.remove("active");
  }
  currentKey = null; // Also reset currentKey

  startScreen.classList.add("start-screen-hidden"); // Use class to hide
  container.classList.remove("blurred");
  timerDisplay.style.display = "block";
  gameStarted = true;
  backgroundFlashActive = false; // Stop background flashing
  clearInterval(backgroundFlashInterval); // Clear the background flashing interval
  gameInterval = setInterval(updateTimer, 1000);

  // Add a small delay before starting the first game flash
  setTimeout(startGame, 100);
});

window.onload = () => {
  initGame();
};

document.addEventListener("keydown", handleKeyPress);
