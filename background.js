chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "selectText",
      title: "Select Text",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
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
