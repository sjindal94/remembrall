let IS_ON = false;

document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup DOM loaded");

    let switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', () => {
        if (switchButton.checked) {
            chrome.browserAction.setIcon({path: "icon/remembrallon_128x128.png"});
            IS_ON = true;
        } else {
            chrome.browserAction.setIcon({path: "icon/remembralloff_128x128.png"});
            IS_ON = false;
        }
        console.log("Toggle is: ", IS_ON);
        chrome.storage.sync.set({"is_on": IS_ON}, function () {
            console.log('Cache Saved', "is_on", IS_ON);
        });
        chrome.runtime.sendMessage({type: "set_val"}, function (response) {
            console.log(response.result);
        });
    });

    /*let getCacheButton = document.getElementById('getCache');
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
    });*/

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
    } else if (details.reason === "update") {
        console.log("This is a update!");
        let thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
    chrome.storage.sync.set({"is_on": false}, function () {
        console.log('Cache Saved', "is_on", false);
    });
    chrome.browserAction.setIcon({path: "icon/remembralloff_128x128.png"});
    IS_ON = false;
});