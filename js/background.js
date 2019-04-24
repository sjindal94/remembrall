let IS_ON = false;
let password, url;


/*
 * Credits/Reference:
 * http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
 *
 */

let ismatchURL = function (tabUrl) {

    let matchDomain = getHostName(tabUrl);

    //@TODO: matchDomain is NULL
    console.log(matchDomain);

    pouchDbAlexa.find({
        selector: {
            Url: {$eq: matchDomain}
        }
    }).then(function (result) {

        console.log(result.docs.length);
        if (result.docs.length === 0) {

            console.log("Alexa Outside 10K");
            let retVal = confirm("Add this URL permanently to Alexa DB?");
            //window.open(tabUrl,'height=200,width=150');

            if (retVal === true) {

                console.log("Add to Alexa Database");
                let doc = {
                    "_id": matchDomain,
                    "Url": matchDomain
                };

                writeDocAlexa(doc);
                console.log("Added to store " + doc);
                readAllDocsAlexa();

            } else {
                console.log("Do Not add to alexa database now");
            }
            //callback();
        } else {
            console.log("Alexa Within 10K");
        }
    }).catch(function (err) {
        console.log(err);
    });
};


var addToStore = function (password, url) {
    console.log("In addToStore");
    var doc = {
        "_id": hashString(password),
        "h_url": hashString(url),
        "h_password": hashString(password),
        "url": url,
        "password": password
    };
    writeDoc(doc);
    console.log("Done addToStore successfully");
    readAllDocs();
}

var notifyClient = function (action) {
    console.log("Sending message to Client: ", action);
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: action}, function (response) {
            console.log("Response from web content: ", response);
        });
    });
}

function isPasswordReuse(password, url, callback) {
    console.log("In isPasswordReuse " + password);
    pouchDb.find({
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
};

var tabListener = function (tabId, info, tab) {
    console.log('Signup success. Now add to store');
    addToStore(password, url);
    chrome.tabs.onUpdated.removeListener(tabListener);
}

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

        case 'dialog':
            //TODO:No need of this case if optimized
            ismatchURL(sender.tab.url);
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
            createDB();
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
    createDB();
    //createDBAlexa();
});
