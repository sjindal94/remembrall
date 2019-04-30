let IS_ON = false;

document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup loaded");
    console.log(new Date().toLocaleTimeString());

    let switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', () => {
        console.log("Toggle pressed");
        if (switchButton.checked) {
            console.log("ON");
            chrome.browserAction.setIcon({
                path: {
                    "16": "icon/remembrallon_16x16.png",
                    "19": "icon/remembrallon_19x19.png",
                    "38": "icon/remembrallon_38x38.png",
                    "48": "icon/remembrallon_48x48.png",
                    "128": "icon/remembrallon_128x128.png"
                }
            });
            IS_ON = true;
        } else {

            chrome.browserAction.setIcon({
                path: {
                    "16": "icon/remembralloff_16x16.png",
                    "19": "icon/remembralloff_19x19.png",
                    "38": "icon/remembralloff_38x38.png",
                    "48": "icon/remembralloff_48x48.png",
                    "128": "icon/remembralloff_128x128.png"
                }
            });
            IS_ON = false;
        }
        chrome.storage.sync.set({"is_on": IS_ON}, function () {
            console.log('Cache Saved', "is_on", IS_ON);
        });
        chrome.runtime.sendMessage({type: "set_val"}, function (response) {
            console.log(response.result);
        });
    });

    let getCacheButton = document.getElementById('getCache');
    getCacheButton.addEventListener('click', () => {
        chrome.storage.sync.get(null, function (data) {
            console.info("CURRENT CACHE DATA");
            console.info(data);

        });
    });


    let clearCacheButton = document.getElementById('clearCache');
    clearCacheButton.addEventListener('click', () => {
        chrome.storage.local.clear(function () {
            let error = chrome.runtime.lastError;
            if (error) {
                console.error("CLEAR CACHE:" + error);
            }
        });
        console.log("CLEAR CACHE: Cache cleared");
    });

    let getDBDataButton = document.getElementById('getDBData');
    getDBDataButton.addEventListener('click', () => {
        console.log("Current DB data");
        chrome.runtime.sendMessage({type: "read_all_docs"}, function (response) {
            console.log(response);
        });
    });

    let createDBButton = document.getElementById('createDB');
    createDBButton.addEventListener('click', () => {
        console.log("Creating DB with dummy data");
        chrome.runtime.sendMessage({type: "create_db"}, function (response) {
            console.log(response);
        });
    });

    let destroyDBButton = document.getElementById('destroyDB');
    destroyDBButton.addEventListener('click', () => {
        console.log("Destroying DB");
        chrome.runtime.sendMessage({type: "destroy_db"}, function (response) {
            console.log(response);
        });
    });

    let infoDBButton = document.getElementById('infoDB');
    infoDBButton.addEventListener('click', () => {
        console.log("Info DB");
        chrome.runtime.sendMessage({type: "info_db"}, function (response) {
            console.log(response);
        });
    });

    //Initialize with previous set value
    chrome.storage.sync.get("is_on", function (data) {
        switchButton.checked = data.is_on;
    });
});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        console.log("This is a first install!");
        setSalt();
        chrome.runtime.sendMessage({type: "set_val", data: IS_ON}, function (response) {
            console.log(response.result);
        });
    } else if (details.reason === "update") {
        let thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});

//may delete db onSuspend of runtime
//also check how and why to convert background pageinto an event page


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