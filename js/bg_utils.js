let salt = "dummy";

//API Keys should not be posted in git but since this is private repo we are doing it
function setSalt() {
    $.getJSON("https://api.openweathermap.org/data/2.5/weather?q=London&APPID=f914ac022b86c488ee5274cd00131458", function (json) {
        console.log(JSON.stringify(json));
        salt = JSON.stringify(json);
    });
}

var hashString = function (string) {
    return CryptoJS.PBKDF2(string, salt, {keySize: 256 / 32, iterations: 1000}).toString();
};

/* Credits/Reference:
* http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
*/
function getHostName(taburl) {
    var match = taburl.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2
        && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    } else {
        return null;
    }
}