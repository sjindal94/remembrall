let salt = "dummy";

//API Keys should not be posted in git but since this is private repo we are doing it
function setSalt() {
    console.log("Setting salt");
    chrome.storage.sync.get("salt", function (data) {
        console.log(data);
        if (data.values === undefined) {
            $.getJSON("https://api.openweathermap.org/data/2.5/weather?q=London&APPID=f914ac022b86c488ee5274cd00131458", function (json) {
                console.log(JSON.stringify(json));
                salt = JSON.stringify(json);
                chrome.storage.sync.set({"salt": salt}, function () {
                    console.log('Salt Saved', "salt", salt);
                });
            });
        } else {
            salt = data['salt'];
        }
    });
}

let hashString = function (string) {
    return CryptoJS.PBKDF2(string, salt, {keySize: 256 / 32, iterations: 1000}).toString();
};

/* Credits/Reference:
* http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
*/


function getDomain(url) {
    let hostName = getHostName(url);
    let domain = "";

    if (hostName != null) {
        let parts = hostName.split('.');

        if (parts != null && parts.length === 2) {
            domain = hostName;
        } else if (parts[parts.length - 1].length === 2) {
            domain = hostName;
        } else if (parts.length > 2 && parts[parts.length - 1].length > 2) {
            for (let i = 1; i < parts.length - 1; i++)
                domain = domain + parts[i] + ".";
            domain = domain + parts[parts.length - 1];
        }
    }
    return domain;
}

function getHostName(taburl) {
    let match = taburl.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2
        && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    } else {
        return null;
    }
}