let IS_ON = false;
let password, url;

let checkIfUrlExists = function (urlSet, callback) {
    console.log('In isURLinWebStorePre');
    let maliciousUrls = [];
    let count = 0;
    for (let i = 0; i < urlSet.length; i++) {
        webDb.find({
            selector: {
                url: {$eq: urlSet[i]}
            }
        }).then(function (result) {
            count++;
            console.log(count);
            if (result.docs.length === 0) {
                maliciousUrls.push(urlSet[i]);
                console.log(maliciousUrls);
            } else
                console.log(url + " exists");
            if (count === urlSet.length) {
                callback(maliciousUrls);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

};

/*
 * addToWebStore() - add the DomainName to the WebDb()
 */
let addToWebStore = function (DomainName) {
    let doc = {
        "_id": hashString(DomainName),
        "url": DomainName
    };
    writeDocWebDb(doc);
    readDocWebDb(hashString(DomainName));
};


let addToStore = function (password, url) {
    console.log("In addToStore");
    let doc = {
        "_id": hashString(password),
        "h_url": hashString(url),
        "h_password": hashString(password),
        "url": url,
        "password": password
    };
    writeDoc(doc);
    console.log("Done addToStore successfully");
    readAllDocs();
};


function isPasswordReuse(password, url, formType, callback) {
    console.log("In isPasswordReuse " + password);
    credentialDb.find({
        selector: {
            password: {$eq: password}
        }
    }).then(function (result) {
        console.log(result.docs);
        if (result.docs.length !== 0) {
            if (formType === 'signup')
                callback("alertUser");
            else if (formType === 'login' && result.docs[0].url !== url)
                callback("alertUser");
            else {
                callback("noReuse");
            }
        } else {
            callback("noReuse");
        }
    }).catch(function (err) {
        console.log("ouch, an error", err);
    });
}

let tabListener = function () {
    console.log('Signup success. Now add to store');
    addToStore(password, url);
    chrome.tabs.onUpdated.removeListener(tabListener);
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (IS_ON && changeInfo.status === 'complete' && tab.active) {
        let allLinks = document.links;
        for (let i = 0; i < allLinks.length; i++) {
            console.log("Link " + i + ": " + allLinks[i].href);
        }
        console.log("Sending message to Client: ", "processWebPage");
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "processWebPage"}, function (response) {
                console.log("Response from web content: ", response);
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Message recieved", request);
    switch (request.type) {
        case 'set_val':
            chrome.storage.sync.get("is_on", function (data) {
                IS_ON = data.is_on;
                sendResponse({result: 'Backgroung set value to ' + IS_ON});
                //if(IS_ON) askContent();
            });
            break;
        case 'checkDomainWhitelisting':
            console.log('checkDomainWhitelisting');
            checkIfUrlExists(request.currentURLs, sendResponse);
            //sendResponse({result: 'success'});
            break;
        case 'whiteListDomain':
            console.log('whiteListDomain');
            addToWebStore(request.hostname);
            sendResponse({result: 'success'});
            break;
        case 'checkPasswordReuse':
            console.log('checkPasswordReuse');
            isPasswordReuse(request.password, request.url, request.formType, sendResponse);
            break;
        case 'saveCredentials':
            console.log('saveCredentials');
            password = request.password;
            url = request.url;
            chrome.tabs.onUpdated.addListener(tabListener);
            sendResponse({result: 'Added to DB'});
            break;
        case 'create_db':
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
            break;
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
});