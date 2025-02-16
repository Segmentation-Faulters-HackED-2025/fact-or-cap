chrome.runtime.onInstalled.addListener(() => {
    // Creates a custom right click menu
    chrome.contextMenus.create({
      id: "selectText", // identify
      title: "Fact or Cap", // text in the menu
      contexts: ["selection"] // will only appear when user selects text
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    // listens to when custom button is clicked
    if (info.menuItemId === "selectText") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });
    }
  });
  
  function getSelectedText() {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      alert(`You selected: ${selectedText}`);
    }
  }
