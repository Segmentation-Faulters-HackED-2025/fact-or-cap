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
    if (info.menuItemId === "selectText") { // contains details about the clicked menu item
      chrome.scripting.executeScript({ // injects and executes funcion into tab
        target: { tabId: tab.id }, // runs script in tap
        function: getSelectedText // call da func
      });
    }
  });
  
  function getSelectedText() {
    // gets the text the user has selected
    const selectedText = window.getSelection().toString(); // makes the text a STRING
    if (selectedText) {
      alert(`You selected: ${selectedText}`); // CHANGE TO SHOW RESULT OF THE FACT CHECK
    }
  }
