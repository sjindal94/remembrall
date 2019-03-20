

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {

        chrome.tabs.getSelected(null, function(tab) {
            tabUrl = tab.url;
            alert(tab.url);
        });

    }
});

chrome.runtime.onInstalled.addListener(function(details) {
    //To add a new right click option
    // chrome.contextMenus.create({
    //     "id": "sampleContextMenu",
    //     "title": "Sample Context Menu",
    //     "contexts": ["selection"]
    // });


});

