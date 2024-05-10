
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('message', message)
    if (message.action === 'fromContent') {
        chrome.notifications.create({
            type: "basic",
            title: message.title,
            message: message.message,
            iconUrl: "../icons/ym128x128.png"
        });
    }
});