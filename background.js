// background.js - responsible for the BTS work of the extention
// written by "The Segfaulters (Saaim Japanwala, Kavin Kumaranvasan, Nabeel Khan)"
// 19-02-2025


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    // this event creates the right click menu where we can choose to fact check data - SJ
    // selection is the array of data we have highlighted -SJ
    id: "factCheck",
    title: "Is This Fact or Cap?",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "factCheck") {
    if (info.selectionText) {
      // If text is selected, store it as usual and open the popup
      chrome.storage.local.set({ selectedText: info.selectionText }, () => {
        chrome.action.openPopup();
      });
    } else {
      // If no text is selected, open the popup with an empty input box
      chrome.storage.local.set({ selectedText: '' }, () => {
        chrome.action.openPopup();
      });
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  // this is when the pop up is manually opened, for the edge cases - SJ
  chrome.action.openPopup();
});
