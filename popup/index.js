const start_answer_but = document.getElementById('start_answer_but')

start_answer_but.onclick = async function() {
    const [tab] = await chrome.tabs.query({
        url: ["https://mooc1.chaoxing.com/*"],
        active: true,
        currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'manageChaoXingPage',
            manageChaoXingPage: start_answer_but.checked
        })
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持答题助手功能！",
            iconUrl: "../icons/ym128x128.png"
        },(notificationId) => {
            console.log('notificationId-->', notificationId)
        });
    }
}

function init() {
    const checkbox = document.getElementById('start_answer_but');
    const statusDisplay = document.getElementById('status_display');
    
    chrome.storage.sync.get('manageChaoXingPage', function(data) {
        manageChaoXingPage = data.manageChaoXingPage;
        checkbox.checked = manageChaoXingPage
        if (checkbox.checked) {
            statusDisplay.textContent = '启用';
        } else {
            statusDisplay.textContent = '停用';
        }
        chrome.tabs.query({
            url: ["https://mooc1.chaoxing.com/*"],
            active: true,
            currentWindow: true
        }, function(tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'manageChaoXingPage',
                    manageChaoXingPage: manageChaoXingPage
                })
            }
        });
    });

    checkbox.addEventListener('change', function() {
        if (this.checked) {
            statusDisplay.textContent = '启用';
        } else {
            statusDisplay.textContent = '停用';
        }
        chrome.storage.sync.set({
            manageChaoXingPage: this.checked
        });
        chrome.tabs.query({
            url: ["https://mooc1.chaoxing.com/*"],
            active: true,
            currentWindow: true
        }, function(tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'manageChaoXingPage',
                    manageChaoXingPage: data.manageChaoXingPage
                })
            }
        });
    });
}
init();
