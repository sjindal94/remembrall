let IS_ON = false;
let password, url;


/*
 * Credits/Reference:
 * http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
 *
 */

var ismatchURL = function (tabUrl) {

    var matchDomain = getHostName(tabUrl);

    //@TODO: matchDomain is NULL
    console.log(matchDomain);

    pouchDbAlexa.find({
        selector: {
            Url: {$eq: matchDomain}
        }
    }).then(function (result) {

        console.log(result.docs.length);
        if (result.docs.length == 0) {

            console.log("Alexa Outside 10K");
            var retVal = confirm("Add this URL permanently to Alexa DB?");
            //window.open(tabUrl,'height=200,width=150');

            if (retVal == true) {

                console.log("Add to Alexa Database");
                var doc = {
                    "_id": matchDomain,
                    "Url": matchDomain
                };

                writeDocAlexa(doc);
                console.log("Added to store " + doc);
                readAllDocsAlexa();

            } else {
                console.log("Do Not add to alexa database now");
            }
            ;
            //callback();
        } else {
            console.log("Alexa Within 10K");
        }
        ;

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

var notifyClient = function (isPresent) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {isPresent: isPresent}, function (response) {
            console.log('Dummy response to keep the console quiet');
        });
    });
}

var isDupePassword = function (password, url, callback) {
    console.log("In isDupePassword " + password);

    pouchDb.find({
        selector: {
            password: {$eq: password}
        }
    }).then(function (result) {
        console.log(result.docs);
        if (result.docs.length != 0) {
            callback(true);
        }
        ;
    }).catch(function (err) {
        console.log("ouch, an error");
    });
};

var tabListener = function (tabId, info, tab) {
    console.log('Signup success. Now add to store');
    addToStore(password, url);
    chrome.tabs.onUpdated.removeListener(tabListener);
}

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
            chrome.tabs.sendMessage(tabs[0].id, {action: "validateURL"}, function (response) {
                //alert(response);
            });

        });
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
                sendResponse({result: 'Backgroung set value to ' + IS_ON});
                //if(IS_ON) askContent();
            });
            break;
        case 'dialog':
            //console.log(request.domain);
            ismatchURL(sender.tab.url);
            break;
        case 'dupePass':
            console.log('In dupePass');
            isDupePassword(request.password, request.url, notifyClient);
            break;
        case 'addToDatabase':
            console.log('In addToDatabase');
            password = request.password;
            url = request.url;
            chrome.tabs.onUpdated.addListener(tabListener);
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
    }
    return true;
});


// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Background loaded");
    createDB();
    //createDBAlexa();
});
