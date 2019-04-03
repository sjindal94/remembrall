var hashString = function (string) {
    var salt = "shubhamjindal"; //use current temperature for randomness
    var hashkey = CryptoJS.PBKDF2(string, salt, {keySize: 256 / 32, iterations: 1000}).toString();
    console.log("key", hashkey)
    return hashkey;
}

function getUrls() {
    var Urls = ['www.twilio.com', 'www.reddit.com', 'www.instagram.com', 'stackoverflow.com', 'www.google.com', 'www.amazon.com', 'www.facebook.com', 'www.microsoft.com', 'github.com'];
    return Urls;
}