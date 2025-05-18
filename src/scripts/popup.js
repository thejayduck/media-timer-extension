const MAX_TIME = 120; // in minutes

let minutes = 10; // currently set minutes, default: 10 minutes
let alarmActive = false;
// let dryRun = false; // UNUSED
// Elements
let repeatCheckbox, startButton, clearButton, statusMessage, timeRemainingText;
let decreaseTime, timeSpinner, increaseTime;

document.addEventListener('DOMContentLoaded', () => {
  repeatCheckbox = document.getElementById('repeatCheckbox');
  startButton = document.getElementById('startButton');
  clearButton = document.getElementById('clearButton');
  statusMessage = document.getElementById('statusMessage');
  timeRemainingText = document.getElementById('timeRemaining');
  // Time Input
  decreaseTime = document.getElementById('decreaseTime');
  timeSpinner = document.getElementById('timeSpinner');
  increaseTime = document.getElementById('increaseTime');

  timeSpinner.value = minutes;

  // Get saved data
  browser.storage.local.get(["timerMinutes", "repeat"]).then(result => {
    if (result.timerMinutes) {
      minutes = result.timerMinutes;
      timeSpinner.value = result.timerMinutes;
    }
    if (result.repeat !== undefined) {
      repeatCheckbox.checked = result.repeat;
    }
  });

  // Update UI
  updateUIState(); // Initial UI update to get everything look normal
  setInterval(updateUIState, 1000);

  document.addEventListener('keypress', (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      alarmActive ? clearButton.click() : startButton.click();
    }
  });

  // Element Events
  startButton.addEventListener('click', () => {
    const repeatBool = repeatCheckbox.checked;

    browser.runtime.sendMessage({ command: "startTimer", minutes: parseFloat(minutes), repeat: repeatBool })
      .then(response => {
        console.log(response.status || "'Timer' action sent.");
        save({ timerMinutes: minutes, repeat: repeatBool });
        // Update UI
        updateUIState();
      })
      .catch(error => {
        statusMessage.textContent = "Error: " + error.message;
        console.log("Error: " + error.message);
      });
  });

  clearButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ command: "clearTimer" })
      .then(response => {
        console.log(response.status || "'Clear' action sent.");

        // Update UI
        updateUIState();
      })
      .catch(error => {
        statusMessage.textContent = "Error: " + error.message;
        console.log("Error: " + error.message);
      });
  });

  repeatCheckbox.addEventListener('change', (e) => {
    save({ repeat: e.target.checked });
  })

  // Time Input Events
  timeSpinner.addEventListener('input', (e) => {
    minutes = parseFloat(e.target.value).clamp();
    timeSpinner.value = minutes;
    save({ timerMinutes: minutes });
  })

  increaseTime.addEventListener('click', (e) => {
    timeSpinner.value = roundAndClampIncrement(e);
    save({ timerMinutes: minutes });
  });
  decreaseTime.addEventListener('click', (e) => {
    timeSpinner.value = roundAndClampIncrement(e, true);
    save({ timerMinutes: minutes });
  });
});

// Helper Functions

function timeRemaining() {
  const currentTime = Math.floor(Date.now() / 1000);

  return browser.alarms.get("skipMediaTrackAlarm").then((e) => {
    const endTime = Math.floor(e.scheduledTime / 1000);
    const secondsLeft = Math.max(0, endTime - currentTime); // Ensure non-negative
    return secondsLeft;
  }).catch((error) => {
    console.error("Error fetching alarm: ", error);
    return 0;
  });
}

function save(options = {}) {
  browser.storage.local.set(options);
}

function formatTime(time) { // time in seconds
  if (time <= 0) return "00:00:00";

  const dateObj = new Date(time * 1000);
  const hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const seconds = dateObj.getSeconds();

  let output = hours.toString().padStart(2, '0')
    + ':' + minutes.toString().padStart(2, '0')
    + ':' + seconds.toString().padStart(2, '0');

  return output;
}

function updateUIState() {
  checkAlarm().then(() => {
    statusMessage.textContent = alarmActive ? "Active" : "InActive"
    statusMessage.classList.toggle("active", alarmActive);

    if (alarmActive) {
      timeRemaining().then(secondsLeft => {
        timeRemainingText.textContent = formatTime(secondsLeft);
      });
    } else {
      timeRemainingText.textContent = "00:00:00";
    }

    startButton.disabled = alarmActive;
    clearButton.disabled = !alarmActive;
    repeatCheckbox.disabled = alarmActive

    decreaseTime.disabled = alarmActive;
    increaseTime.disabled = alarmActive;
    timeSpinner.disabled = alarmActive;
  });
}

function checkAlarm() {
  return browser.alarms.get("skipMediaTrackAlarm").then(alarm => {
    alarmActive = alarm != null;
  });
}

function roundAndClampIncrement(e, decrease = false) {
  const increment = e.shiftKey ? 0.1 : e.ctrlKey ? 5 : e.altKey ? 10 : 1;

  let incrementedValue = minutes + (decrease ? -increment : increment);
  incrementedValue = Math.round(incrementedValue * 10) / 10;

  minutes = incrementedValue.clamp();

  return minutes;
}

// Others

Number.prototype.clamp = function () {
  return Math.max(0.1, Math.min(this, MAX_TIME))
}