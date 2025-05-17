browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action == "skipTrack") {
    console.log("Content script received skipTrack command.");
    try {
      let skipped = false;

      const selectors = [
        // YouTube
        '.ytp-next-button',
        // Spotify
        '[data-testid="control-button-skip-forward"]',
      ];

      for (const selector of selectors) {
        const nextButton = document.querySelector(selector);
        if (nextButton && typeof nextButton.click == 'function') {
          console.log(`Found skip button with selector: ${selector}`);
          if (!request.dry) {
            nextButton.click();
          }
          skipped = true;
          break;
        }
      }

      if (skipped) {
        sendResponse({ status: "Media skip attempted." });
      } else {
        console.log("No known 'next' button found or MediaSession skip failed.");
        sendResponse({ status: "Could not find a way to skip media on this page." });
      }

    } catch (error) {
      console.error("Error in content script trying to skip media:", error);
      sendResponse({ status: "Error skipping media.", error: error.message });
    }
    return true;
  }
});

console.log("content.js script loaded.");