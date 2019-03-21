var IS_ON = false;

document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup loaded");
    var btn = document.getElementById('switch');
    btn.addEventListener('click', () => {
        console.log("Toggle pressed");
        if (btn.checked) {
            chrome.browserAction.setIcon({path: "icon/remembrallon_128x128.png"});
            IS_ON = true;
        } else {
            chrome.browserAction.setIcon({path: "icon/remembralloff_128x128.png"});
            IS_ON = false;
        }
        chrome.runtime.sendMessage({type: "set_val", data: IS_ON},function(response) {
            console.log(response.result);
        });
    });
    chrome.runtime.sendMessage({type: "set_val", data: IS_ON},function(response) {
        console.log(response.result);
    });
});


//
// // Add listener to receive messages from background page
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
//     switch (request.type)
//     {
//         case 'get_val':
//             console.log("POPUP");
//             chrome.runtime.sendMessage({type: "set_val", data: IS_ON},function(response) {
//                 console.log(response.result);
//             });
//             break;
//     }
// });

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {type: 'set_val', data: IS_ON}, function(response) {
//         console.log(response.result);
//     });
// });