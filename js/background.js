let IS_ON = false;
let password, url;

let checkIfUrlExists = function (urlSet, callback) {
    console.log('In checkIfUrlExists');
    let maliciousUrls = [];
    let count = 0;
    for (let i = 0; i < urlSet.length; i++) {
        console.log('Searching for : ' + urlSet[i]);
        webDb.search({
                query: urlSet[i],
                fields: ['url']
            }, function (err, res) {
                count++;
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                    if (res.total_rows === 0) {
                        maliciousUrls.push(urlSet[i]);
                    }
                    if (count === urlSet.length) {
                        console.log("List of malicious URLS: ", maliciousUrls);
                        callback(maliciousUrls);
                    }
                }
            }
        );
    }

};

/*
 * addToWebStore() - add the DomainName to the WebDb()
 */
let addToWebStore = function (DomainName) {
    console.log("Adding domain to Web Store: ", DomainName);
    let doc = {
        "_id": hashString(DomainName),
        "url": DomainName
    };
    writeDocWebDb(doc);
};


let addToCredentialStore = function (password, url) {
    console.log("In addToCredentialStore");
    let doc = {
        "_id": hashString(password),
        "h_url": hashString(url),
        "h_password": hashString(password)
    };
    writeDoc(doc);
    console.log("Done addToCredentialStore successfully");
};


function isPasswordReuse(password, url, formType, callback) {
    console.log("In isPasswordReuse");
    credentialDb.search({
            query: hashString(password),
            fields: ['h_password'],
            include_docs: true
        }, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result.rows);
                if(result.total_rows !== 0) {
                    if (formType === 'signup') {
                        console.log("Password is being reused");
                        callback("alertUser");
                    } else if (formType === 'login' && result.rows[0].doc.h_url !== hashString(url)) {
                        console.log("Password is being reused");
                        callback("alertUser");
                    } else {
                        console.log("It is a new password");
                        callback("noReuse");
                    }
                }
            }
        }
    );
}

let tabListener = function () {
    addToCredentialStore(password, url);
    chrome.tabs.onUpdated.removeListener(tabListener);
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (IS_ON && changeInfo.status === 'complete' && tab.active) {
        console.log("Sending message to Content: processWebPage");
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "processWebPage"}, function (response) {
                console.log("Response: ", response);
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Message recieved: ", request);
    switch (request.type) {
        case 'set_val':
            chrome.storage.sync.get("is_on", function (data) {
                IS_ON = data.is_on;
                sendResponse({result: 'Backgroung toggle value: ' + IS_ON});
            });
            break;
        case 'checkDomainWhitelisting':
            checkIfUrlExists(request.currentURLs, sendResponse);
            break;
        case 'whiteListDomain':
            addToWebStore(request.hostname);
            sendResponse({result: 'success'});
            break;
        case 'checkPasswordReuse':
            isPasswordReuse(request.password, request.url, request.formType, sendResponse);
            break;
        case 'saveCredentials':
            password = request.password;
            url = request.url;
            chrome.tabs.onUpdated.addListener(tabListener);
            sendResponse({result: 'Adding to CredentialStore'});
            break;
        /*case 'create_db':
            createCredentialStore();
            sendResponse({result: 'DB created'});
            break;
        case 'destroy_db':
            destroyDB();
            sendResponse({result: 'DB destroyed'});
            break;
        case 'read_all_docs':
            readAllDocs();
            sendResponse({result: 'DB read'});
            break;
        case 'info_db':
            infoDB();
            sendResponse({result: 'DB info fetched'});
            break;*/
        default:
            console.log("Invalid request type received");
            sendResponse({result: 'failure'});
    }
    return true;
});


// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Background loaded");
    createCredentialStore();
    createWebStore();
    chrome.storage.sync.get("is_on", function (data) {
        IS_ON = data.is_on;
        if (IS_ON) {
            chrome.browserAction.setIcon({path: "icon/remembrallon_128x128.png"});
        }
    });
});