
function compare(a, b) {
    const split1 = a.split('');
    let count = 0;
    split1.forEach((item) => {
        if (b.includes(item)) {
            count++;
        }
    });
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) {
        return 0;
    }
    return count / maxLength;
}

let fetchController;

async function answerQuestion() {
    const inp1 = document.getElementById('cj_inp1');
    const key = inp1.value;
    if (!key) {
        chrome.runtime.sendMessage({ action: 'fromContent', title: '小梦-学习通助手', message: '请输入卡密 获取卡密联系QQ: 1054636553' });
        const but_auto_answer = document.getElementById('but_auto_answer');
        but_auto_answer.textContent = '自动答题';
        but_auto_answer.style.backgroundColor = "#4CAF50";
        isAnswering = false;
        return;
    }

    const questions = document.querySelectorAll('.questionLi');
    const fetchPromises = [];
    const reportedErrors = new Set(); // 用于跟踪已报告的错误

    // 初始验证请求
    const devUrl = 'http://localhost:5678/v2/question/query';
    const prodUrl = 'https://api.sourcedream.cn/v2/question/query';
    fetchController = new AbortController();
    const signal = fetchController.signal;

    try {
        const initialResponse = await fetch(prodUrl, {
            method: 'POST',
            signal,
            body: JSON.stringify({ title: 'initial_check', key: key }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        data = await initialResponse.json();

        if (data.code === 401) {
            throw new Error(data.message || '密钥错误，请检查您的密钥。如果无法答题 请联系QQ: 1054636553');
        }
        questions.forEach((question) => {
            const check_answer = question.querySelector('.check_answer');
            const check_answer_dx = question.querySelector('.check_answer_dx');
            if (check_answer || check_answer_dx) {
                return true;
            }

            const questionTextElement = question.querySelector('h3');
            const questionText = questionTextElement.innerText.trim();
            // 去除题目前缀 ^\d{1,2}\.
            let title = questionText.replace(/^\d{1,2}\./, '');
            // 去除题目中的空格
            title = title.replace(/\s/g, "");
            title = title.replace(/\(单选题\)/, "").replace(/\(多选题\)/, "");
            const fetchPromise = fetch(prodUrl, {
                method: 'POST',
                signal,
                body: JSON.stringify({ title: title, key: key }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            }).then(data => {
                if (!data || data.code !== 1 || data.data.length === 0) {
                    throw new Error(data.message || '未找到答案，请自行搜索或者使用手动搜题功能(暂不支持)或使用随机答题');
                }
                let flag = false;
                data.data.some((data) => {
                    const answer = data.answer;
                    const answerArray = answer.split('');
                    let answerOptions = [];
                    data.options.forEach((option) => {
                        if (answerArray.includes(option.slice(0, 1))) {
                            answerOptions.push(option);
                        }
                    });

                    const optionTextElements = question.querySelectorAll('.answerBg');
                    optionTextElements.forEach((optionTextElement) => {
                        let optionText = optionTextElement.innerText.trim();
                        optionText = optionText.replace(/\s/g, "").replace(/[A-Z]/g, "").replace(/\./g, "");
                        answerOptions.forEach((answerOption) => {
                            answerOption = answerOption.replace(/\s/g, "").replace(/[A-Z]/g, "").replace(/\./g, "");
                            if (compare(optionText, answerOption) === 1) {
                                optionTextElement.click();
                                flag = true;
                                return;
                            }
                        });
                    });

                    if (flag === true) {
                        return flag;
                    }
                });

                const remain = data.remain;
                $('#cj_balance').text(remain);
            }).catch(error => {
                if (!reportedErrors.has(error.message)) {
                    chrome.runtime.sendMessage({
                        action: 'fromContent',
                        title: '小梦-学习通助手',
                        message: 'Error: ' + error.message + ' 如果无法答题 请联系QQ: 1054636553'
                    });
                    reportedErrors.add(error.message); // 记录已报告的错误
                }
            });

            fetchPromises.push(fetchPromise);
        });

        await Promise.all(fetchPromises);
        chrome.runtime.sendMessage({
            action: 'fromContent',
            title: '小梦-学习通助手',
            message: '任务已完成!空白的内容是没有匹配到的题目，请自行搜索或者使用手动搜题功能(暂不支持)或使用随机答题'
        });

        // 复原按钮样式
        const but_auto_answer = document.getElementById('but_auto_answer');
        but_auto_answer.textContent = '自动答题';
        but_auto_answer.style.backgroundColor = "#4CAF50";
        isAnswering = false;

    } catch (error) {
        if (!reportedErrors.has(error.message)) {
            chrome.runtime.sendMessage({
                action: 'fromContent',
                title: '小梦-学习通助手',
                message: 'Error: ' + error.message + ' 如果无法答题 请联系QQ: 1054636553'
            });
            reportedErrors.add(error.message); // 记录已报告的错误
        }
        // 复原按钮样式
        const but_auto_answer = document.getElementById('but_auto_answer');
        but_auto_answer.textContent = '自动答题';
        but_auto_answer.style.backgroundColor = "#4CAF50";
        isAnswering = false;
    }
}

function clearQuestion() {
    const questions = document.querySelectorAll('.questionLi')
    questions.forEach((question) => {
        const optionTextElements = question.querySelectorAll('.answerBg');
        optionTextElements.forEach((optionTextElement) => {
            const check_answer = optionTextElement.querySelector('.check_answer')
            const check_answer_dx = optionTextElement.querySelector('.check_answer_dx')
            if(check_answer || check_answer_dx) {
                optionTextElement.click();
            }
        });
    });
}

let isAnswering = false;

function createPage() {
    // 创建页面元素
    const page = $('<div id="cj_move_page"></div>');
    const h3 = $('<h1 id="cj_move_h1">小梦-学习通助手</h1>');
    const but_auto_answer = $('<button id="but_auto_answer">自动答题</button>');
    const but2 = $('<button id="cj_but2">随机答题</button>');
    const but3 = $('<button id="cj_but3">智能答题</button>');
    const but4 = $('<button id="cj_but4">清空记录</button>');
    const inp1 = $('<input id="cj_inp1" placeholder="请输入你的key"/>');
    const lab1 = $('<label id="cj_lab1">卡密余额: <span id="cj_balance">开始答题后可见</span></label>');

    // 将元素添加到页面
    page.append(h3, but_auto_answer, but2, but3, but4, inp1, lab1);
    $('body').append(page);

    // 事件绑定
    but_auto_answer.on('click', async (e) => {
        if (!isAnswering) {
            but_auto_answer.text('停止答题').css("background-color", "red");
            answerQuestion();
        } else {
            if (fetchController) {
                fetchController.abort();
                fetchController = null;
            }
            but_auto_answer.text('自动答题').css("background-color", "#4CAF50");
        }
        isAnswering = !isAnswering;
    });

    $('#cj_but2, #cj_but3').click((e) => {
        alert("暂时不支持");
    });

    $('#cj_but4').click((e) => {
        clearQuestion();
        chrome.runtime.sendMessage({ action: 'fromContent', title: '小梦-学习通助手', message: '任务已完成' });
    });

    // 设置样式
    page.css({
        "border-radius": "10px",
        "width": "232px",
        "height": "238px",
        "text-align": "center"
    });

    const buttonStyle = {
        "margin": "10px",
        "background-color": "#4CAF50",
        "color": "white",
        "padding": "10px 20px",
        "border": "none",
        "border-radius": "5px",
        "cursor": "pointer",
        "box-shadow": "0 4px 8px 0 rgba(0,0,0,0.2)"
    };

    but_auto_answer.css(buttonStyle);
    but2.css(buttonStyle);
    but3.css(buttonStyle);
    but4.css(buttonStyle);

    inp1.css({
        "margin": "10px",
        "padding": "10px",
        "border-radius": "5px",
        "border": "1px solid #ccc",
        "width": "calc(100% - 22px)",
        "box-sizing": "border-box"
    });

    lab1.css({
        "margin": "10px",
        "font-weight": "bold"
    });

    // 启用拖动功能
    drag(document.getElementById('cj_move_page'));
}

function drag(ele) {
    let oldX, oldY, newX, newY
    ele.onmousedown = function (e) {
        if (!cj_move_page.style.right && !cj_move_page.style.bottom) {
        cj_move_page.style.right = 0
        cj_move_page.style.bottom = 0
        }
        oldX = e.clientX
        oldY = e.clientY
        document.onmousemove = function (e) {
        newX = e.clientX
        newY = e.clientY
        cj_move_page.style.right = parseInt(cj_move_page.style.right) - newX + oldX + 'px'
        cj_move_page.style.bottom = parseInt(cj_move_page.style.bottom) - newY + oldY + 'px'
        oldX = newX
        oldY = newY
        }
        document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
        }
    }
}



function init() {
    chrome.storage.sync.get('manageChaoXingPage', function(data) {
        const manageChaoXingPage = data.manageChaoXingPage;
        if (manageChaoXingPage && window.location.href.includes('https://mooc1.chaoxing.com/')) {
            createPage()
        } else {
            $('#cj_move_page').remove()
        }
    });
}
init();

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(async (message) => {
    if(message.action === "manageChaoXingPage") {
        if(message.manageChaoXingPage) {
            createPage()
            console.log('createPage')
        } else {
            $('#cj_move_page').remove()
            console.log('removePage')
        }
    } else if (message.action === 'initXiaomiTool') {
        initXiaomiTool(message.xiaomiToolStatus);
    }
})

function initXiaomiTool(isDisplay) {
    if (isDisplay) {
        // 创建小米云服务助手页面
        // 创建悬浮窗的HTML元素，并应用内联样式
        const page = $(`
            <div id="xiaomiToolPage" style="
                width: 250px; 
                height: 200px; 
                background-color: #fff; 
                border: 1px solid #ccc; 
                position: fixed; 
                top: 100px; 
                left: 100px; 
                z-index: 1000; 
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 
                border-radius: 8px; 
                overflow: hidden;
                user-select: none;">
                <div style="
                    background-color: #007BFF; 
                    padding: 10px; 
                    cursor: move; 
                    color: white; 
                    font-weight: bold; 
                    text-align: center;">
                    源梦小米云服务助手
                </div>
                <div style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: calc(100% - 40px);">
                    <button id="myButton" style="
                        padding: 10px 20px; 
                        background-color: #007BFF; 
                        color: white; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        transition: background-color 0.3s;">
                        开始一键下载
                    </button>
                </div>
            </div>`);

        // 将悬浮窗添加到页面中
        $('body').append(page);

        // 定义一个变量来存储setInterval的ID
        let intervalId;

        // 定义一个函数来执行点击操作
        function clickElements() {
            // 选择所有具有类名 'icon-download-AGmtM' 的元素
            var downloadElements = document.getElementsByClassName('icon-download-AGmtM');
            
            // 检查是否找到了元素
            if (downloadElements.length > 0) {
                // 点击第一个找到的 'icon-download-AGmtM' 元素
                downloadElements[0].click();
                console.log('icon-download-AGmtM 元素已被点击');
            } else {
                console.log('未找到具有类名 "icon-download-AGmtM" 的元素');
            }

            // 选择所有具有类名 'ico-next-1RCGp' 的元素
            var arrowElements = document.getElementsByClassName('ico-next-1RCGp');
            
            // 检查是否找到了元素
            if (arrowElements.length > 0) {
                // 点击第一个找到的 'ico-next-1RCGp' 元素
                arrowElements[0].click();
                console.log('ico-next-1RCGp 元素已被点击');
            } else {
                console.log('未找到具有类名 "ico-next-1RCGp" 的元素，停止执行');
                // 停止执行并恢复按钮
                clearInterval(intervalId);
                resetButton();
            }
        }

        // 定义一个函数来重置按钮
        function resetButton() {
            $('#myButton').css('background-color', '#007BFF').text('开始一键下载');
        }

        // 绑定按钮点击事件
        $('#myButton').click(function() {
            if ($('#myButton').text() === '开始一键下载') {
                // 更改按钮颜色和文本
                $('#myButton').css('background-color', 'red').text('执行中');
                // 每隔3秒执行一次 clickElements 函数
                intervalId = setInterval(clickElements, 3000);
            } else {
                // 停止执行并恢复按钮
                clearInterval(intervalId);
                resetButton();
            }
        });

        // 实现悬浮窗全局拖动效果
        let x, y, l, t;
        let isDown = false;

        // 在整个悬浮窗上绑定mousedown事件
        page.mousedown(function(e) {
            x = e.clientX;
            y = e.clientY;
            l = page.offset().left;
            t = page.offset().top;
            isDown = true;
        });

        $(document).mousemove(function(e) {
            if (isDown) {
                const nx = e.clientX - x + l;
                const ny = e.clientY - y + t;
                page.css({ left: nx + 'px', top: ny + 'px' });
            }
        });

        $(document).mouseup(function() {
            isDown = false;
        });

        // 在拖动过程中禁用文本选择
        page.on('selectstart', function(e) {
            e.preventDefault();
        });
    } else {
        // 移除小米云服务助手页面
        $('#xiaomiToolPage').remove();
    }
}

