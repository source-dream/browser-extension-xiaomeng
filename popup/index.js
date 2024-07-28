const chaoxing_tool_status = document.getElementById('chaoxing_tool_status')
const start_answer_but = document.getElementById('start_answer_but')
const xiaomi_tool_status = document.getElementById('xiaomi_tool_status')

chaoxing_tool_status.onclick = async function() {
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
        });
    }
}
xiaomi_tool_status.onclick = async function() {
    const [tab] = await chrome.tabs.query({
        url: ["https://i.mi.com/*"],
        active: true,
        currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'initXiaomiTool',
            xiaomiToolStatus: xiaomi_tool_status.checked
        })
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持小米云服务助手功能！",
            iconUrl: "../icons/ym128x128.png"
        });
    }
}
cdut_tool_status.onclick = async function() {
    // 判断当前页面是否为成都理工大学页面
    const [tab] = await chrome.tabs.query({
        url: ["http://jxpc-cdut-edu-cn.vpn.cdut.edu.cn:8118/*"],
        active: true,
        currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'initCdutTool',
            cdutToolStatus: cdut_tool_status.checked
        })
    } else {
        chrome.notifications.create({
            type: "basic",
            title: "小梦",
            message: "该网页不支持成都理工大学助手功能！",
            iconUrl: "../icons/ym128x128.png"
        });
    }
}