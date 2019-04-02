var IS_ON = false;
const used_passwords = new Set(['password123','password321','qwerty']);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (IS_ON && changeInfo.status == 'complete' && tab.active) {
        var allLinks = document.links;
        for (var i = 0; i < allLinks.length; i++) {
            console.log("Link " + i + ": " + allLinks[i].href);
        }
        chrome.tabs.getSelected(null, function (tab) {
            console.log("URL: " + tab.url);
        });

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "checkForPassword"}, function (response) {
                alert(response);
            });
            chrome.tabs.sendMessage(tabs[0].id, {action: "validateURL"}, function (response) {
                alert(response);
            });
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
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Background recieved");
    switch (request.type) {
        case 'set_val':
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            chrome.storage.sync.get("is_on", function (data) {
                console.log(data.is_on);
                IS_ON = data.is_on;
                sendResponse({result: 'Backgroung set value to ' + IS_ON});
            });
            break;
        case 'store':
            var data = {data: request.data, url: sender.tab.url, password: request.password};
            console.log(data);
            console.log("PASSWORD : " + data.password);

            if(used_passwords.has(data.password)) {
                alert("Already in Use! Choose a different password");
                chrome.webRequest.onBeforeRequest.addListener(function(details) {
                    console.log("In callback");
                }, {
                    urls: [
                        '*://*/*'
                    ],
                    tabId: sender.tab.id
                }, ["blocking"]);
                console.log("Request stopped");
            } else {
                // Store email, password and domain in the database
            }
            break;
    }
    return true;
});



// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Background loaded");
});


