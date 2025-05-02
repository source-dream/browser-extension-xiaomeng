const chaoxing_tool_status = document.getElementById("chaoxing_tool_status");
const xiaomi_tool_status = document.getElementById("xiaomi_tool_status");
const cdut_tool_status = document.getElementById("cdut_tool_status");

// 超星答题助手
chaoxing_tool_status.onclick = async function () {
    const [tab] = await chrome.tabs.query({
        url: ["https://mooc1.chaoxing.com/*"],
        active: true,
        currentWindow: true,
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: "initChaoXingAction",
            active: chaoxing_tool_status.checked,
        });
        chrome.storage.sync.set(
            { initChaoXingAction: { active: chaoxing_tool_status.checked } },
            function () {
                console.log("状态已保存！");
            }
        );
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持答题助手功能！",
            iconUrl: "../icons/ym128x128.png",
        });
    }
};

// 小米云服务助手
xiaomi_tool_status.onclick = async function () {
    const [tab] = await chrome.tabs.query({
        url: ["https://i.mi.com/*"],
        active: true,
        currentWindow: true,
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: "initXiaomiTool",
            xiaomiToolStatus: xiaomi_tool_status.checked,
        });
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持小米云服务助手功能！",
            iconUrl: "../icons/ym128x128.png",
        });
    }
};

// 成都理工大学助手
cdut_tool_status.onclick = async function () {
    // 判断当前页面是否为成都理工大学页面
    const [tab] = await chrome.tabs.query({
        url: ["http://jxpc-cdut-edu-cn.vpn.cdut.edu.cn:8118/*"],
        active: true,
        currentWindow: true,
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: "initCdutTool",
            cdutToolStatus: cdut_tool_status.checked,
        });
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持成都理工大学助手功能！",
            iconUrl: "../icons/ym128x128.png",
        });
    }
};

function init() {
    chrome.storage.sync.get("initChaoXingAction", function (data) {
        if (data.initChaoXingAction) {
            chaoxing_tool_status.checked = data.initChaoXingAction.active;
        } else {
            chaoxing_tool_status.checked = false;
        }
    });
    chrome.storage.sync.get("xiaomiToolStatus", function (data) {
        if (data.xiaomiToolStatus) {
            xiaomi_tool_status.checked = data.xiaomiToolStatus.active;
        } else {
            xiaomi_tool_status.checked = false;
        }
    });
    chrome.storage.sync.get("cdutToolStatus", function (data) {
        if (data.cdutToolStatus) {
            cdut_tool_status.checked = data.cdutToolStatus.active;
        } else {
            cdut_tool_status.checked = false;
        }
    });
}
init();
