let fetchController;
let isAnswering = false;

/**
 * 相似度比较
 */
function compare(a, b) {
    const split1 = a.split("");
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

/**
 * 格式化题目
 */
function formatTitle(title) {
    title = title.replace(/^\d{1,2}\./, ""); // 去除题号
    title = title.replace(/\s/g, ""); // 去除空格
    title = title.replace(/\(单选题\)/, "").replace(/\(多选题\)/, ""); // 去除题型
    title = title.replace(/[\[【]\s*\d+\s*分\s*[\]】]/g, "");
    return title;
}

async function answerQuestion() {
    const inp1 = document.getElementById("cj_inp1");
    const key = inp1.value;
    if (!key) {
        chrome.runtime.sendMessage({
            action: "fromContent",
            title: "小梦-学习通助手",
            message: "请输入卡密 获取卡密联系QQ: 1054636553",
        });
        const butAnswerAuto = document.getElementById("butAnswerAuto");
        butAnswerAuto.textContent = "自动答题";
        butAnswerAuto.style.backgroundColor = "#4CAF50";
        isAnswering = false;
        return;
    }

    const questions = document.querySelectorAll(".questionLi");
    const fetchPromises = [];
    const reportedErrors = new Set(); // 用于跟踪已报告的错误

    // 请求参数配置
    const url = "https://api.sourcedream.cn/v2/question/query";
    fetchController = new AbortController();
    const signal = fetchController.signal;

    try {
        // 密钥验证
        const resp = await fetch(url, {
            method: "POST",
            signal,
            body: JSON.stringify({ title: "initial_check", key: key }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        data = await resp.json();
        if (data.code === 401) {
            throw new Error(
                data.message ||
                    "密钥错误，请检查您的密钥。如果无法答题 请联系QQ: 1054636553"
            );
        }

        // 构造Promise数组
        questions.forEach((question) => {
            const check_answer = question.querySelector(".check_answer");
            const check_answer_dx = question.querySelector(".check_answer_dx");
            if (check_answer || check_answer_dx) {
                return true;
            }

            const questionTextElement = question.querySelector("h3");
            const questionText = questionTextElement.innerText.trim();
            const title = formatTitle(questionText);

            const fetchPromise = fetch(url, {
                method: "POST",
                signal,
                body: JSON.stringify({ title: title, key: key }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return res.json();
                })
                .then((data) => {
                    if (!data || data.code !== 1 || data.data.length === 0) {
                        throw new Error(
                            data.message ||
                                "未找到答案，请自行搜索或者使用手动搜题功能(暂不支持)或使用随机答题"
                        );
                    }
                    let flag = false;
                    data.data.some((data) => {
                        const answer = data.answer;
                        const answerArray = answer.split("");
                        let answerOptions = [];
                        data.options.forEach((option) => {
                            if (answerArray.includes(option.slice(0, 1))) {
                                answerOptions.push(option);
                            }
                        });

                        const optionTextElements =
                            question.querySelectorAll(".answerBg");
                        optionTextElements.forEach((optionTextElement) => {
                            let optionText = optionTextElement.innerText.trim();
                            optionText = optionText
                                .replace(/\s/g, "")
                                .replace(/[A-Z]/g, "")
                                .replace(/\./g, "");
                            answerOptions.forEach((answerOption) => {
                                answerOption = answerOption
                                    .replace(/\s/g, "")
                                    .replace(/[A-Z]/g, "")
                                    .replace(/\./g, "");
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

                    // const remain = data.remain;
                    // $("#cj_balance").text(remain);
                })
                .catch((error) => {
                    if (!reportedErrors.has(error.message)) {
                        chrome.runtime.sendMessage({
                            action: "fromContent",
                            title: "小梦-学习通助手",
                            message:
                                "Error: " +
                                error.message +
                                " 如果无法答题 请联系QQ: 1054636553",
                        });
                        reportedErrors.add(error.message); // 记录已报告的错误
                    }
                });

            fetchPromises.push(fetchPromise);
        });

        await Promise.all(fetchPromises);
        chrome.runtime.sendMessage({
            action: "fromContent",
            title: "小梦-学习通助手",
            message:
                "任务已完成!空白的内容是没有匹配到的题目，请自行搜索或者使用手动搜题功能(暂不支持)或使用随机答题",
        });

        // 复原按钮样式
        const butAnswerAuto = document.getElementById("butAnswerAuto");
        butAnswerAuto.textContent = "自动答题";
        butAnswerAuto.style.backgroundColor = "#4CAF50";
        isAnswering = false;
    } catch (error) {
        if (!reportedErrors.has(error.message)) {
            chrome.runtime.sendMessage({
                action: "fromContent",
                title: "小梦-学习通助手",
                message:
                    "Error: " +
                    error.message +
                    " 如果无法答题 请联系QQ: 1054636553",
            });
            reportedErrors.add(error.message); // 记录已报告的错误
        }
        // 复原按钮样式
        const butAnswerAuto = document.getElementById("butAnswerAuto");
        butAnswerAuto.textContent = "自动答题";
        butAnswerAuto.style.backgroundColor = "#4CAF50";
        isAnswering = false;
    }
}

function clearQuestion() {
    const questions = document.querySelectorAll(".questionLi");
    questions.forEach((question) => {
        const optionTextElements = question.querySelectorAll(".answerBg");
        optionTextElements.forEach((optionTextElement) => {
            const check_answer =
                optionTextElement.querySelector(".check_answer");
            const check_answer_dx =
                optionTextElement.querySelector(".check_answer_dx");
            if (check_answer || check_answer_dx) {
                optionTextElement.click();
            }
        });
    });
}

/**
 * 初始化学习通答题助手
 */
function initChaoXing() {
    const page = $(`
<div id="chaoxing-box"style="top: 100px;left: 100px;">
    <h1 class="title">小梦-学习通助手</h1>
    <div class="function">
        <button id="btn-answer-auto">自动答题</button>
        <button class="cj_but2">随机答题</button>
        <button id="cj_but3">智能答题</button>
        <button id="cj_but4">清空记录</button>
    </div>
    <input id="cj_inp1" placeholder="请输入源梦百货铺密钥"/>
</div>`);
    $("body").append(page);
    $("#btn-answer-auto").on("click", async function () {
        const butAnswerAuto = $(this);
        if (!isAnswering) {
            butAnswerAuto.text("停止答题").css("background-color", "red");
            answerQuestion();
        } else {
            if (fetchController) {
                fetchController.abort();
                fetchController = null;
            }
            butAnswerAuto.text("自动答题").css("background-color", "#4CAF50");
        }
        isAnswering = !isAnswering;
    });
    $("#cj_but2, #cj_but3").click(function () {
        alert("暂时不支持");
    });
    $("#cj_but4").click(function () {
        clearQuestion();
        chrome.runtime.sendMessage({
            action: "fromContent",
            title: "小梦-学习通助手",
            message: "任务已完成",
        });
    });
    drag(document.getElementById("chaoxing-box"));
}

/**
 * 窗口拖动实现函数
 */
function drag(ele) {
    let oldX, oldY, newX, newY;
    ele.onmousedown = function (e) {
        oldX = e.clientX;
        oldY = e.clientY;

        const rect = ele.getBoundingClientRect();
        let startLeft = rect.left;
        let startTop = rect.top;

        document.onmousemove = function (e) {
            newX = e.clientX;
            newY = e.clientY;
            const deltaX = newX - oldX;
            const deltaY = newY - oldY;

            ele.style.left = startLeft + deltaX + "px";
            ele.style.top = startTop + deltaY + "px";
        };

        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}

/**
 * 读取历史配置并初始化
 */
function init() {
    console.log("xiaomeng: content init");
    chrome.storage.sync.get("initChaoXingAction", function (data) {
        if (data.initChaoXingAction.active) {
            console.log("xiaomeng: chaoxing init");
            initChaoXing();
        } else {
            $("#cj_move_page").remove();
        }
    });

    // 处理popup模块的消息
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "initChaoXingAction") {
            if (message.active) {
                initChaoXing();
            } else {
                $("#cj_move_page").remove();
            }
        } else if (message.action === "initXiaomiTool") {
            initXiaomiTool(message.xiaomiToolStatus);
        } else if (message.action === "initCdutTool") {
            initCdutTool(message.cdutToolStatus);
        }
    });
}

function initXiaomiTool(isDisplay) {
    if (isDisplay) {
        const page = $(`
            <div id="xiaomiToolPage" style="
                width: 280px; 
                height: 400px; 
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
                <div style="padding: 10px;">
                    <h3 style="margin-bottom: 10px;color: black;">方法一：定时下载</h3>
                    <div style="
                        display: flex; 
                        flex-direction: column; 
                        justify-content: center; 
                        gap: 10px;">
                        <input id="intervalInput" type="number" min="0" value="3000" style="
                            padding: 10px; 
                            border: 1px solid #ccc; 
                            border-radius: 5px; 
                            width: 100%; 
                            text-align: center;
                            font-size: 16px;">
                        <span style="font-size: 14px; color: #666;">输入下载时间间隔（毫秒），0表示监听图片变化并立刻下载，适合少量图片，图片多会漏图片, 下太久网页还会崩....真服了</span>
                        <button id="myButton1" style="
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
                </div>
                <div style="padding: 10px;">
                    <h3 style="margin-bottom: 10px;color: black;">方法二：预加载下载法</h3>
                    <span style="font-size: 14px; color: #666;margin-bottom: 8px;">适合图片较多的情况，点击开始获取图片按钮，然后点击下一页，直到获取完所有图片，再点击下载全部图片，已弃用，原因是下载下来的是缩略图</span>
                    <div style="
                        display: flex; 
                        flex-direction: column;
                        justify-content: center; 
                        gap: 10px;">
                        <button id="startListeningButton" style="
                            padding: 10px 20px; 
                            background-color: #007BFF; 
                            color: white; 
                            border: none; 
                            border-radius: 5px; 
                            cursor: pointer; 
                            transition: background-color 0.3s;">开始获取图片</button>
                        <div id="imageCount" style="font-size: 14px; color: #666;">图片数量: 0</div>
                        <button id="downloadAllButton" style="
                            padding: 10px 20px; 
                            background-color: #007BFF; 
                            color: white; 
                            border: none; 
                            border-radius: 5px; 
                            cursor: pointer; 
                            transition: background-color 0.3s;display: none;">下载全部图片</button>
                    </div>
                </div>
            </div>`);

        $("body").append(page);

        let intervalId;
        let observer;
        let timeoutId;
        let lastSrc = "";
        let isLastImage = false;
        let imageSrcArray = []; // 用于存储图片链接

        // 点击下载元素
        function clickDownloadElement() {
            const downloadElements = document.getElementsByClassName(
                "icon-download-AGmtM"
            );
            if (downloadElements.length > 0) {
                downloadElements[0].click();
            } else {
                alert("请在详情预览界面使用此功能");
                stopExecution();
                return;
            }
        }

        // 点击下一页元素
        function clickNextElement() {
            const nextElements =
                document.getElementsByClassName("ico-next-1RCGp");
            if (nextElements.length > 0) {
                nextElements[0].click();
            } else {
                isLastImage = true;
                stopExecution();
            }
        }
        // 重置按钮
        function resetButton() {
            $("#myButton1")
                .css("background-color", "#007BFF")
                .text("开始一键下载");
        }
        // 结束执行
        function stopExecution() {
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (observer) {
                observer.disconnect();
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            resetButton();
            resetListenerButton();
        }

        $("#myButton1").click(function () {
            if ($("#myButton1").text() === "开始一键下载") {
                let interval = parseInt($("#intervalInput").val());

                if (interval === 0) {
                    const imgElement = document.querySelector(".img-3Ae3U");
                    if (!imgElement) {
                        alert("请在详情预览界面使用此功能");
                        return;
                    }
                    observer = new MutationObserver((mutationsList) => {
                        for (let mutation of mutationsList) {
                            if (
                                mutation.type === "attributes" &&
                                mutation.attributeName === "src"
                            ) {
                                const newSrc = imgElement.getAttribute("src");
                                if (newSrc !== lastSrc) {
                                    lastSrc = newSrc;
                                    isLastImage = false;
                                    setTimeout(() => {
                                        clickDownloadElement;
                                        clickNextElement();
                                    }, 200);
                                    clearTimeout(timeoutId);
                                    timeoutId = setTimeout(() => {
                                        observer.disconnect();
                                        alert(
                                            "4秒内未检测到图片变化，结束执行"
                                        );
                                        resetButton();
                                    }, 4000);
                                }
                            }
                        }
                    });
                    observer.observe(imgElement, { attributes: true });
                    imgElement.setAttribute(
                        "src",
                        imgElement.getAttribute("src")
                    );
                    timeoutId = setTimeout(() => {
                        observer.disconnect();
                        alert("4秒内未检测到图片变化，结束执行");
                        resetButton();
                    }, 4000);
                    $("#myButton1")
                        .css("background-color", "red")
                        .text("执行中");
                } else if (isNaN(interval) || interval < 0) {
                    alert("请输入一个有效的时间间隔（最小为0毫秒）");
                    return;
                } else {
                    $("#myButton1")
                        .css("background-color", "red")
                        .text("执行中");
                    intervalId = setInterval(() => {
                        clickDownloadElement();
                        clickNextElement();
                    }, interval);
                }
            } else {
                stopExecution();
            }
        });

        function resetListenerButton() {
            $("#startListeningButton")
                .css("background-color", "#007BFF")
                .text("开始获取图片");
            $("#imageCount").text("图片数量: " + imageSrcArray.length);
            if (imageSrcArray.length > 0) {
                $("#downloadAllButton").show();
            } else {
                $("#downloadAllButton").hide();
            }
        }
        // 开始获取图片按钮的点击事件
        $("#startListeningButton").click(function () {
            if ($("#startListeningButton").text() === "开始获取图片") {
                const imgElement = document.querySelector(".img-3Ae3U");
                if (!imgElement) {
                    alert("请在详情预览界面使用此功能");
                    return;
                }
                imageSrcArray = [];
                // $('#imageCount').text('图片数量: ' + imageSrcArray.length);
                // $('#downloadAllButton').hide();
                observer = new MutationObserver((mutationsList) => {
                    for (let mutation of mutationsList) {
                        if (
                            mutation.type === "attributes" &&
                            mutation.attributeName === "src"
                        ) {
                            const src = imgElement.getAttribute("src");
                            imageSrcArray.push(src);
                            $("#imageCount").text(
                                "图片数量: " + imageSrcArray.length
                            );
                            clickNextElement();
                        }
                    }
                });
                observer.observe(imgElement, { attributes: true });
                // 触发第一次监听
                imgElement.setAttribute("src", imgElement.getAttribute("src"));
                $("#startListeningButton")
                    .css("background-color", "red")
                    .text("获取中");
            } else if ($("#startListeningButton").text() === "获取中") {
                stopExecution();
                $("#startListeningButton")
                    .css("background-color", "#007BFF")
                    .text("继续获取");
            }
        });
        // 下载全部图片按钮的点击事件
        $("#downloadAllButton").click(function () {
            // 传递图片链接给background
            chrome.runtime.sendMessage({
                action: "downloadAllImages",
                images: imageSrcArray,
            });
            console.log("imageSrcArray", imageSrcArray);
        });

        let x, y, l, t;
        let isDown = false;

        page.mousedown(function (e) {
            x = e.clientX;
            y = e.clientY;
            l = page.offset().left;
            t = page.offset().top;
            isDown = true;
        });

        $(document).mousemove(function (e) {
            if (isDown) {
                const nx = e.clientX - x + l;
                const ny = e.clientY - y + t;
                page.css({ left: nx + "px", top: ny + "px" });
            }
        });

        $(document).mouseup(function () {
            isDown = false;
        });

        page.on("selectstart", function (e) {
            e.preventDefault();
        });
    } else {
        $("#xiaomiToolPage").remove();
    }
}

function initCdutTool(isDisplay) {
    if (isDisplay) {
        const page = $(`
            <div id="cdutToolPage" style="
                width: 280px; 
                height: 400px; 
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
                    CDUT助手
                </div>
                <div style="padding: 10px;">
                    <h3 style="margin-bottom: 10px;color: black;">一键评教</h3>
                    <input id="pingyu" type="text" min="0" value="老师讲的很好，认真负责" style="
                    padding: 10px; 
                    border: 1px solid #ccc; 
                    border-radius: 5px; 
                    width: 100%; 
                    text-align: center;
                    font-size: 16px;">
                    <span style="font-size: 14px; color: #666;">这里可以修改评语</span>
                    <div style="
                        display: flex; 
                        flex-direction: column; 
                        justify-content: center; 
                        gap: 10px;">
                        <button id="start1" style="
                            padding: 10px 20px; 
                            background-color: #007BFF; 
                            color: white; 
                            border: none; 
                            border-radius: 5px; 
                            cursor: pointer; 
                            transition: background-color 0.3s;">开始一键评教</button>
                    </div>
                </div>
            </div>`);

        $("body").append(page);
        // 重置按钮
        function resetButton() {
            $("#start1")
                .css("background-color", "#007BFF")
                .text("开始一键评教");
        }
        // 结束执行
        function stopExecution() {
            resetButton();
        }
        $("#start1").click(function () {
            if ($("#start1").text() === "开始一键评教") {
                $("#start1").css("background-color", "red").text("执行中");
                // 执行评教
                try {
                    document.querySelector(
                        ".el-textarea textarea.el-textarea__inner"
                    ).value = parseInt($("#pingyu").val());
                    document
                        .querySelector(
                            ".el-textarea textarea.el-textarea__inner"
                        )
                        .dispatchEvent(new Event("input", { bubbles: true }));
                    document
                        .querySelectorAll(".rater_input")
                        .forEach((input) => {
                            input.value = 10;
                            input.dispatchEvent(
                                new Event("input", { bubbles: true })
                            );
                        });
                } catch (e) {
                    console.error(e);
                }
                resetButton();
            } else {
                stopExecution();
            }
        });
        let x, y, l, t;
        let isDown = false;
        page.mousedown(function (e) {
            x = e.clientX;
            y = e.clientY;
            l = page.offset().left;
            t = page.offset().top;
            isDown = true;
        });
        $(document).mousemove(function (e) {
            if (isDown) {
                const nx = e.clientX - x + l;
                const ny = e.clientY - y + t;
                page.css({ left: nx + "px", top: ny + "px" });
            }
        });
        $(document).mouseup(function () {
            isDown = false;
        });
        page.on("selectstart", function (e) {
            e.preventDefault();
        });
    } else {
        $("#cdutToolPage").remove();
    }
}

init();
