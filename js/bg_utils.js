var hashString = function (string) {
    return CryptoJS.PBKDF2(string, salt, {keySize: 256 / 32, iterations: 1000}).toString();
};

var salt = "dummy";
//API Keys should not be posted in git but since this is private repo we are doing it
$.getJSON("http://api.openweathermap.org/data/2.5/weather?q=London&APPID=f914ac022b86c488ee5274cd00131458",function(json){
    console.log(JSON.stringify(json));
    salt = JSON.stringify(json);
});

var extractDomainName = function(url) {
    var domain = url;
    domain = domain.replace(/https?:\/\//,"");
    domain = domain.replace(/\/.*$/,"");
    return domain;  
};