var IS_ON = false;
const used_passwords = new Set(['password123', 'password321', 'qwerty', 'terster1']);

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
                //alert(response);
            });
            chrome.tabs.sendMessage(tabs[0].id, {action: "validateURL"}, function (response) {
                //alert(response);
            });
        });
    }
});

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
            initDBForTest();
            break;
        case 'validate_password':
            var dbEntry = {
                "_id": "1",
                "url": sender.tab.url,
                "user_data": request.data,
                //"password": hashString(request.password)
                "password": request.password
            };
            writeDoc(dbEntry);
            readAllDocs();
            if (used_passwords.has(data.password)) {
                alert("Already in Use! Choose a different password");
                chrome.webRequest.onBeforeRequest.addListener(function (details) {
                    console.log("In callback");
                    return {cancel: true};
                }, {
                    urls: [
                        '*://*/*'
                    ],
                    tabId: sender.tab.id
                }, ["blocking"]);
                console.log("Request stopped");

            } else {
                // Store email, password and domain in the database
                var doc = {
                    "_id": "1",
                    "url": data.url,
                    "username": data.data,
                    "password": data.password
                };

                writeDoc(doc);
                readAllDocs();
            }
            break;
        case 'dialog':
            console.log("Dialog message");
            chrome.windows.create({url: chrome.extension.getURL("dialog.html"), type: "popup"});
            break;
    }
    return true;
});


// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Background loaded");
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

