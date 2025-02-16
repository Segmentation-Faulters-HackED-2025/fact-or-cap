document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get("highlightedText", function (data) {
        if (data.highlightedText) {
            document.getElementById("highlightbox").value = data.highlightedText;
        }
    });
});