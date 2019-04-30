let IS_ON = false;
let password, url;

let isURLinWebStorePre = function (url) {
    console.log('In isURLinWebStorePre');
    let matchDomain = getHostName(url);
    console.log(matchDomain);
    webDb.find({
        selector: {
            url: {$eq: matchDomain}
        }
    }).then(function (result) {
        console.log(result.docs.length);
        addUrlListener(result.docs.length, matchDomain);
    }).catch(function (err) {
        console.log(err);
    });
};

let addUrlListener = function(length, matchDomain) {
    if(length === 0) {
        console.log(matchDomain + " does not exit in alexadb");
        let retVal = confirm("Add this URL permanently to the Web Store?");
        if (retVal === true) {
            console.log("UserInput: add URL to Web Store");
            addToWebStore(DomainName);
        } else {
            console.log("UserInput: Do Not add URL to Web Store");
        }
    }
}


/*
 * isURLinWebStore() - check for the URL in the WebDb(), if NOT,
 *                     depending on the user Input add/dissmiss the URL.
 * @tabURL: URL, the user presently inspecting.
 */
let isURLinWebStore = function (tabUrl) {
    let matchDomain = getHostName(tabUrl);
    if(matchDomain != null) {
        console.log("New host name : " + matchDomain);
        webDb.find({
            selector: {
                url: {$eq: matchDomain}
            }
        }).then(function (result) {
            userInput(result.docs.length, matchDomain);
        }).catch(function (err) {
            console.log(err);
        });
    }
};

/*
 * userInput() - call methods to add URL to WebDb() as per the user action
 *  @length: 1 - URL present in WebDb(), Do nothing
 *           0 - URL not in WebDb(), take the user input(retVal)
 *  @retVal: true  - add permanently to WebDb()
 *           false - dissmiss for now, Do nothing.                           
 */
let userInput = function (length, DomainName) {
    if (length === 0) {
        console.log("URL not in the Web Store");
        let retVal = confirm("Add this URL permanently to the Web Store?");
        //window.open(tabUrl,'height=200,width=150');
        if (retVal === true) {
            console.log("UserInput: add URL to Web Store");
            addToWebStore(DomainName);
        } else {
            console.log("UserInput: Do Not add URL to Web Store");
        }
    } else {
        console.log("URL in the Web Store");
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

let notifyClient = function (action) {
    console.log("Sending message to Client: ", action);
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: action}, function (response) {
            console.log("Response from web content: ", response);
        });
    });
};

function isPasswordReuse(password, url, callback) {
    console.log("In isPasswordReuse " + password);
    credentialDb.find({
        selector: {
            password: {$eq: password}
        }
    }).then(function (result) {
        console.log(result.docs);
        if (result.docs.length !== 0) {
            callback("alertUser");
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
        var allLinks = document.links;
        for (var i = 0; i < allLinks.length; i++) {
            console.log("Link " + i + ": " + allLinks[i].href);
        }

        chrome.tabs.getSelected(null, function (tab) {
            console.log("URL: " + tab.url);
        });

        notifyClient("detectPageType");
        //inspect the weblink by sending message to content.js
        notifyClient("fetchDomainname");
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Background recieved", request);
    switch (request.type) {
        case 'set_val':
            chrome.storage.sync.get("is_on", function (data) {
                IS_ON = data.is_on;
                sendResponse({result: 'Backgroung set value to ' + IS_ON});
                //if(IS_ON) askContent();
            });
            break;
        case 'URLinWebStore':
            isURLinWebStore(sender.tab.url);
            //sendResponse({result: ''});
            break;
        case 'URLinWebStorePre':
            isURLinWebStorePre(request.url);
            //sendResponse({result: ''});
            break;
        case 'checkPasswordReuse':
            console.log('In checkPasswordReuse');
            isPasswordReuse(request.password, request.url, notifyClient);
            //sendResponse({result: 'is duplicate'});
            //TODO:Optimise here use sendresponse instead of notifyclient
            break;
        case 'addToDatabase':
            console.log('In addToDatabase');
            password = request.password;
            url = request.url;
            chrome.tabs.onUpdated.addListener(tabListener);
            //sendResponse({result: 'Added to DB'});
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
    }
    return true;
});


// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Background loaded");
    createCredentialStore();
    createWebStore();
});




// if (result.docs.length === 0) {

//     console.log("Alexa Outside 10K");
//     let retVal = confirm("Add this URL permanently to the Web Store?");
//     //window.open(tabUrl,'height=200,width=150');

//     if (retVal === true) {
 //         addToWebStore(matchDomain);
//     } else {
//         console.log("Dissmiss for Now");
//     }
//     //callback();
// } else {
//     console.log("");
// }


//console.log("Add to Alexa Database");
// let doc = {
//     "_id": hashString(matchDomain),
//     "url": matchDomain
// };

// writeDocWebDb(doc);
// //console.log("Added to store " + doc);
// readDocWebDb(matchDomain);
