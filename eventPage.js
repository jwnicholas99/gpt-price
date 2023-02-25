var contextMenuItem = {
    "id": "price.gpt",
    "title": "Check ChatGPT Price",
    "contexts": ["selection"]
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create(contextMenuItem);
  });



chrome.contextMenus.onClicked.addListener(clickData => {
    if(clickData.menuItemId == "price.gpt" && clickData.selectionText){
        chrome.storage.local.set({["textInput"]: clickData.selectionText});
    }
})