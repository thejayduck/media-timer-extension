const ALARM_NAME = "skipMediaTrackAlarm";
const ICON_ON = "icons/icon-on_48.png";
const ICON_OFF = "icons/icon-off_48.png";
const DRY = false; // Set this to true for testing // TEMP solution

// Functions

function startTimer(minutes, repeat) {
  if (minutes) {
    const period = parseFloat(minutes);
    let alarmOptions = {
      delayInMinutes: period
    };

    if (repeat) {
      alarmOptions.periodInMinutes = period; // repeat timer
      console.log(`Media skip timer started. Will fire in ${period} minutes and REPEAT every ${period} minutes until cleared.`);
    } else {
      console.log(`Media skip timer started. Will fire ONCE in ${period} minutes.`);
    }

    browser.browserAction.setIcon({ path: ICON_ON });
    browser.alarms.create(ALARM_NAME, alarmOptions);
    browser.alarms.onAlarm.addListener(() => {
      if (!repeat) browser.browserAction.setIcon({ path: ICON_OFF });
    })
  } else {
    browser.browserAction.setIcon({ path: ICON_OFF });
    console.error("Invalid timer duration provided:", minutes);
  }
}

function clearTimer() {
  browser.alarms.clear(ALARM_NAME).then((wasCleared) => {
    if (wasCleared) {
      console.log("Media skip timer cleared.");
    } else {
      console.log("No active timer to clear.");
    }
  });
  browser.browserAction.setIcon({ path: ICON_OFF });
}

// On alarm trigger event
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const alarmDetails = await browser.alarms.get(ALARM_NAME);
    console.log("Attempting to skip media.");

    try {
      // Find audible tabs that
      let audibleTabs = await browser.tabs.query({ audible: true });

      if (audibleTabs.length === 0) {
        console.log("No audible tabs found.");
        // clearTimer();
        if (alarmDetails && alarmDetails.periodInMinutes) {
          console.log("Alarm will repeat if not cleared.");
        }
        return;
      }

      // Checks if currently focused tab is audible // Used incase there are multiple sources.
      let activeFocusedTabs = await browser.tabs.query({ active: true, currentWindow: true });
      let targetTab = null;

      if (activeFocusedTabs.length > 0) {
        const currentActiveTab = activeFocusedTabs[0];
        if (currentActiveTab.audible) {
          targetTab = currentActiveTab;
        }
      }

      if (!targetTab && audibleTabs.length > 0) {
        targetTab = audibleTabs[0];
      }

      // Send appropiate message to respective tab.
      if (targetTab && targetTab.id) {
        console.log(`Sending skip command to tab ID: ${targetTab.id} (${targetTab.url})`);
        try {
          await browser.tabs.sendMessage(targetTab.id, { action: "skipTrack", dry: DRY });
        } catch (error) {
          console.error(`Error sending message to tab ${targetTab.id}:`, error);
        }
      } else {
        console.log("No audible tab found to send skip command.");
        if (alarmDetails && alarmDetails.periodInMinutes) {
          console.log("Timer will repeat if not cleared.");
        }
      }

    } catch (error) {
      console.error("Error handling alarm:", error);
    }
  }
});

// Message Interpreter
browser.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.command === "startTimer") {
    clearTimer();
    startTimer(message.minutes, message.repeat);
    sendResponse({ status: message.repeat ? "Repeating timer started" : "One-shot timer started" });
  } else if (message.command === "clearTimer") {
    clearTimer();
    sendResponse({ status: "Timer cleared" });
  }
  return true;
});

console.log("Background script loaded.");