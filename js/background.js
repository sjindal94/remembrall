var IS_ON = false;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (IS_ON && changeInfo.status == 'complete' && tab.active) {
        var allLinks = document.links;
        for (var i = 0; i < allLinks.length; i++) {
            console.log(allLinks[i].href);
            alert(allLinks[i].href);
        }
        chrome.tabs.getSelected(null, function (tab) {
            alert(tab.url);
        });

    }
});

// chrome.runtime.onInstalled.addListener(function (details) {
//     //To add a new right click option
//     // chrome.contextMenus.create({
//     //     "id": "sampleContextMenu",
//     //     "title": "Sample Context Menu",
//     //     "contexts": ["selection"]
//     // });
//
//
// });

// Start our listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("back recieved");
    switch (request.type)
    {
        case 'set_val':
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

            console.log(request.data);
            IS_ON = request.data;
            sendResponse({result: 'success'});
            break;
    }
});

// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Background loaded");
});
