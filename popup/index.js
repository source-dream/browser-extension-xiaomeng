const start_answer_but = document.getElementById('start_answer_but')
start_answer_but.onclick = async function() {
    const [tab] = await chrome.tabs.query({
        url: ["https://mooc1.chaoxing.com/*"],
        active: true,
        currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'createChaoXingPage',
            createChaoXingPageEnabled: start_answer_but.checked
        })
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持答题助手功能！",
            iconUrl: "../icons/ym128x128.png"
        },(notificationId) => {
            console.log('notificationId-->', notificationId)
        }
        );
    }
}

function init() {
    const checkbox = document.getElementById('start_answer_but');
    const statusDisplay = document.getElementById('status_display');
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            statusDisplay.textContent = '启用';
        } else {
            statusDisplay.textContent = '停用';
        }
        // 保存状态
        chrome.storage.sync.set({
            createChaoXingPage: this.checked
        });
    });
    chrome.storage.sync.get('createChaoXingPage', function(data) {
        checkbox.checked = data.createChaoXingPage;
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
                    action: 'createChaoXingPage',
                    createChaoXingPageEnabled: data.createChaoXingPage
                })
            }
        });
    });
}
init();
