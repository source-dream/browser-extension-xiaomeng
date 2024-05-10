
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

function answerQuestion() {
    const inp1 = document.getElementById('cj_inp1');
    const key = inp1.value;
    if(!key) {
        alert('请输入卡密 获取卡密联系QQ: 1054636553')
        return
    }
    const questions = document.querySelectorAll('.questionLi')
    let alertExecuted = false;
    const fetchPromises = [];
    questions.forEach((question) => {
        const check_answer = question.querySelector('.check_answer')
        const check_answer_dx = question.querySelector('.check_answer_dx')
        if(check_answer || check_answer_dx) {
            return true
        }
        const questionTextElement = question.querySelector('h3');
        const questionText = questionTextElement.innerText.trim();
        const match = questionText.slice(14)
        const devUrl = 'http://localhost:5678/cdut/questionInquiry/';
        const prodUrl = 'https://api.sourcedream.cn/cdut/questionInquiry/';
        fetchController = new AbortController();
        const signal = fetchController.signal;
        const fetchPromise = fetch(prodUrl, {
            method: 'POST',
            signal,
            body: JSON.stringify({match: match, key: key}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        }).then(data => {
            if(!data){
                return;
            }
            if (data.error) {
                return;
            }
            if(data.data.length === 0) {
                return;
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
                        if(compare(optionText, answerOption)===1) {
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
            if (!alertExecuted) {
                alert(error);
                alertExecuted = true;
                return
            }
        });
        fetchPromises.push(fetchPromise);
    })
    Promise.all(fetchPromises).then(() => {
        chrome.runtime.sendMessage({ action: 'fromContent', title: '小梦-学习通助手', message: '任务已完成!空白的内容是没有匹配到的题目，请自行搜索或者使用手动搜题功能(暂不支持)或使用随机答题' });
    });
    $('cj_but1').text('自动答题');
    $('cj_but1').css("background-color", "#4CAF50");
    
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
    const page = $('<div id="cj_move_page"></div>');
    const h3 = $('<h1 id="cj_move_h1">小梦-学习通助手</h1>');
    const but1 = $('<button id="cj_but1">自动答题</button>');
    const but2 = $('<button id="cj_but2">随机答题</button>');
    const but3 = $('<button id="cj_but3">智能答题</button>');
    const but4 = $('<button id="cj_but4">清空记录</button>');
    const inp1 = $('<input id="cj_inp1" placeholder="请输入你的卡密"/>');
    const lab1 = $('<label id="cj_lab1">卡密余额: <span id="cj_balance">开始答题后可见</span></label>');
    page.append(h3);
    page.append(but1);
    page.append(but2);
    page.append(but3);
    page.append(but4);
    page.append(inp1);
    page.append(lab1);
    $('body').append(page);
    
    but1.on('click', async (e) => {
        if (!isAnswering) {
            but1.text('停止答题');
            but1.css("background-color", "red");
            answerQuestion();
        } else {
            if (fetchController) {
                fetchController.abort();
                fetchController = null;
            }
            but1.text('自动答题');
            but1.css("background-color", "#4CAF50");
        }
        isAnswering = !isAnswering;
    });
    $('#cj_but2').click(async (e) => {
        alert("暂时不支持");
        
    });
    $('#cj_but3').click(async (e) => {
        alert("暂时不支持");
    });
    $('#cj_but4').click(async (e) => {
        clearQuestion();
        chrome.runtime.sendMessage({action: 'fromContent', title: '小梦-学习通助手', message: '任务已完成'});
    });
    page.css({
        "border-radius": "10px",
        "width": "232px",
        "height": "238px",
        "text-align": "center"
    });
    but1.css({
        "margin": "10px",
        "background-color": "#4CAF50",
        "color": "white",
        "padding": "10px 20px",
        "border": "none",
        "border-radius": "5px",
        "cursor": "pointer",
        "box-shadow": "0 4px 8px 0 rgba(0,0,0,0.2)",
    });
    but2.css({
        "margin": "10px",
        "background-color": "#4CAF50",
        "color": "white",
        "padding": "10px 20px",
        "border": "none",
        "border-radius": "5px",
        "cursor": "pointer",
        "box-shadow": "0 4px 8px 0 rgba(0,0,0,0.2)",
    });
    but3.css({
        "margin": "10px",
        "background-color": "#4CAF50",
        "color": "white",
        "padding": "10px 20px",
        "border": "none",
        "border-radius": "5px",
        "cursor": "pointer",
        "box-shadow": "0 4px 8px 0 rgba(0,0,0,0.2)",
    });
    but4.css({
        "margin": "10px",
        "background-color": "#4CAF50",
        "color": "white",
        "padding": "10px 20px",
        "border": "none",
        "border-radius": "5px",
        "cursor": "pointer",
        "box-shadow": "0 4px 8px 0 rgba(0,0,0,0.2)",
    });
    inp1.css({
        "margin": "10px",
        "padding": "10px",
        "border-radius": "5px",
        "border": "1px solid #ccc",
        "width": "calc(100% - 22px)",
        "box-sizing": "border-box",
    });
    lab1.css({
        "margin": "10px",
        "font-weight": "bold", 
    });
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

chrome.runtime.onMessage.addListener(async (message) => {
    console.log('message', message)
    if(message.action === "manageChaoXingPage") {
        if(message.manageChaoXingPage) {
            createPage()
            console.log('createPage')
        } else {
            $('#cj_move_page').remove()
            console.log('removePage')
        }
    }
})

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


