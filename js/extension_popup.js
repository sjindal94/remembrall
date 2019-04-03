var IS_ON = false;

document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup loaded");
    console.log(new Date().toLocaleTimeString());

    var switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', () => {
        console.log("Toggle pressed");
        if (switchButton.checked) {
            console.log("ON");
            chrome.browserAction.setIcon({path: "icon/remembrallon_128x128.png"});
            IS_ON = true;
        } else {
            chrome.browserAction.setIcon({path: "icon/remembralloff_128x128.png"});
            IS_ON = false;
        }
        chrome.storage.sync.set({"is_on": IS_ON}, function () {
            console.log('Cache Saved', "is_on", IS_ON);
        });
        chrome.runtime.sendMessage({type: "set_val"}, function (response) {
            console.log(response.result);
        });
    });

    var getCacheButton = document.getElementById('getCache');
    getCacheButton.addEventListener('click', () => {
        chrome.storage.sync.get(null, function (data) {
            console.info("CURRENT CACHE DATA");
            console.info(data);

        });
    });


    var clearCacheButton = document.getElementById('clearCache');
    clearCacheButton.addEventListener('click', () => {
        chrome.storage.local.clear(function () {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error("CLEAR CACHE:" + error);
            }
        });
        console.log("CLEAR CACHE: Cache cleared");
    });

    var getDBDataButton = document.getElementById('getDBData');
    getDBDataButton.addEventListener('click', () => {
        console.log("Current DB data");
        readAllDocs();
    });

    //Initialize with previous set value
    chrome.storage.sync.get("is_on", function (data) {
        console.log(data);
        if (data.is_on) {
            switchButton.checked = true;
        } else {
            switchButton.checked = false;
        }
    });
});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        console.log("This is a first install!");
        chrome.runtime.sendMessage({type: "set_val", data: IS_ON}, function (response) {
            console.log(response.result);
        });
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});

//
// // Add listener to receive messages from background page
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
//     switch (request.type)
//     {
//         case 'get_val':
//             console.log("POPUP");
//             chrome.runtime.sendMessage({type: "set_val", data: IS_ON},function(response) {
//                 console.log(response.result);
//             });
//             break;
//     }
// });

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {type: 'set_val', data: IS_ON}, function(response) {
//         console.log(response.result);
//     });
// });