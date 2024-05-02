
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

function answerQuestion() {
    const inp1 = document.getElementById('cj_inp1');
    const key = inp1.value;
    if(!key) {
        alert('请输入卡密 获取卡密联系QQ: 1054636553')
        return
    }
    const questions = document.querySelectorAll('.questionLi')
    let alertExecuted = false;
    questions.forEach((question) => {
        const check_answer = question.querySelector('.check_answer')
        const check_answer_dx = question.querySelector('.check_answer_dx')
        if(check_answer || check_answer_dx) {
            return true
        }
        const questionTextElement = question.querySelector('h3');
        const questionText = questionTextElement.innerText.trim();
        const match = questionText.slice(14)
        fetch('https://api.sourcedream.cn/cdut/questionInquiry/', {
            method: 'POST',
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
            if (data.code === 401) {
                console.log('没有找到答案');
            } else if (data.code === 501) {
                return Promise.reject('卡密余额不足');
            } else if (data.code === 400) {
                return Promise.reject('卡密不存在');
            }
            let flag = false;
            console.log('data', data.data);
            data.data.some((data) => {
                const answer = data.answer;
                const answerArray = answer.split('');
                let answerOptions = [];
                data.options.forEach((option, index) => {
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
                        if(compare(optionText,answerOption)===1) {
                            optionTextElement.click();
                            flag = true;
                            return;
                        }
                    });
                });
                if (flag === true) {
                    console.log("退出");
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
    })

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
    $('#cj_but1').click(async (e) => {
        answerQuestion();
    });
    $('#cj_but2').click(async (e) => {
        alert("暂时不支持");
    });
    $('#cj_but3').click(async (e) => {
        alert("暂时不支持");
    });
    $('#cj_but4').click(async (e) => {
        clearQuestion();
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
    if(message.action === "createChaoXingPage" && message.createChaoXingPageEnabled) {
        createPage()
    }
    if(message.action === "createChaoXingPage" && !message.createChaoXingPageEnabled) {
        $('#cj_move_page').remove()
    }
})

function init() {
    chrome.storage.sync.get('createChaoXingPage', function(data) {
        const createChaoXingPage = data.createChaoXingPage;
        console.log("createChaoXingPage", createChaoXingPage)
        if (createChaoXingPage && window.location.href.includes('https://mooc1.chaoxing.com/')) {
            createPage()
            drag(document.getElementById('cj_move_h1'));
        } else {
            $('#cj_move_page').remove()
        }
    });
    console.log('init');
}
init();


