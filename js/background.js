var IS_ON = false;

var addToStore = function(password, url) {
    console.log("In addToStore");
    var doc = {
        "h_url"     :   hashString(url),
        "h_password":   hashString(password),
        "url"       :   url,
        "password"  :   password
    };
    writeDoc(doc);
    console.log("Done addToStore successfully");
    readAllDocs();
}

var isDupePassword = function(password, url, callback) {
    console.log("In isDupePassword " + password);
    pouchDb.find({
        selector: {
            password: {$eq: password}
        }
    }).then(function (result) {
        console.log(result.docs);
        if (result.docs.length == 0) {
            url = extractDomainName(url);
            console.log(url);
            callback(password, url);
            return false;
        } else {
            console.log("Already in Use! Choose a different password");
            return true;
        };
    }).catch(function (err) {
        console.log("ouch, an error");
    });
};

function askContent(){
        console.log("content asked");
        chrome.tabs.query({lastFocusedWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "detectPageType"}, function (response) {
            var lastError = chrome.runtime.lastError;
            if (lastError) {
                console.log(lastError.message);
                // 'Could not establish connection. Receiving end does not exist.'
                return;
            }
            console.log(response);
        });
        // chrome.tabs.sendMessage(tabs[0].id, {action: "validateURL"}, function (response) {
        //     console.log(response);
        // });

    });
}


chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (IS_ON && info.status === 'complete' && tab.active) {
        console.log("asking content");
        // var allLinks = document.links;
        // for (var i = 0; i < allLinks.length; i++) {
        //     console.log("Link " + i + ": " + allLinks[i].href);
        // }
        // chrome.tabs.getSelected(null, function (tab) {
        //     console.log("URL: " + tab.url);
        // });
        askContent();
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Background recieved", request);
    switch (request.type) {
        case 'set_val':
            // console.log(sender.tab ?
            //     "from a content script:" + sender.tab.url :
            //     "from the extension");
            chrome.storage.sync.get("is_on", function (data) {
                IS_ON = data.is_on;
                console.log("ISPN", data.is_on);
                sendResponse({result: 'Backgroung set value to ' + IS_ON});
                if(IS_ON) askContent();
            });
            break;
        case 'create_db':
            createDB();
            break;
        case 'destroy_db':
            destroyDB();
            break;
        case 'read_all_docs':
            readAllDocs();
            break;
        case 'info_db':
            infoDB();
            break;
        case 'validate_password':
            console.log(request);
            if(isDupePassword(request.password, sender.tab.url, addToStore)){
                console.log("Duplicate password");
                addToStore(request.password, sender.tab.url);
                sendResponse({result: true});
            }if(IS_ON) askContent();
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
    createDB();
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
// })


// case 'intercept_request':
//     console.log("intercepting request");
//     // chrome.webRequest.onBeforeRequest.addListener(function(details) {
//     //     console.log(details.url);
//     //     var ret = isDupePassword(request.password, sender.tab.url, addToStore);
//     //     console.log('DUP', ret);
//     //     },
//     //     {urls: ["<all_urls>"]},
//     //     ["blocking"]);
//     // chrome.webRequest.onBeforeRequest.addListener(function(details) {
//     //     console.log("In callback");
//     //     console.log(details.requestBody);
//     //     if(isDupePassword(request.password, sender.tab.url, addToStore)) {
//     //         console.log("Inside onBeforeRequest");
//     //         return {cancel: true};
//     //         console.log("Request stopped");
//     //     }
//     //     return;
//     // }, {
//     //     urls: [
//     //         '*://*/*'
//     //     ],
//     //     tabId: sender.tab.id
//     // }, ["blocking", "requestBody"]);
//
//     break;