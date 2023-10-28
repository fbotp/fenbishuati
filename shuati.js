// ==UserScript==
// @name         fenbi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       rourou
// @match        https://www.fenbi.com/spa/tiku/report/preview/xingce/xingce/*
// @match        https://www.fenbi.com/spa/tiku/report/exam/solution/xingce/xingce/*
// @icon         https://fenbi.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const script = document.createElement('script');
    script.src = 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/qrcodejs/1.0.0/qrcode.min.js'; // 替换为实际的路径
    script.async = true;

    function waitForElementToDo(selector, time, func) {
        if(document.querySelector(selector)!=null) {
            func(selector);
        }
        else {
            setTimeout(function() {
                waitForElementToDo(selector, time, func);
            }, time);
        }
    }

    function clearAnswer(selector) {
        document.querySelectorAll(selector).forEach(i => i.classList.remove("right-options"));
        document.querySelectorAll(".error-options").forEach(i => i.classList.remove("error-options"));
        document.querySelector(".fb-collpase-content")?.setAttribute("hidden", "");
        document.querySelectorAll(".expend-btn").forEach(i => i.click());
        document.querySelectorAll(".solu-answer-text").forEach(i => {i.innerHTML = "<p>□</p>"});
        return;
    }

    function getCode(selector) {
        if (location.href.includes("exam") || location.href.includes("material")) {
            let url;
            if (location.href.includes("material")) {
                url = `https://tiku.fenbi.com/api/xingce/universal/auth/solutions?type=8&id=${location.href.match(/id=([^&]+)/)[1]}&checkId=${location.href.match(/checkId=([^&]+)/)[1]}&app=web&kav=100&av=100&hav=100&version=3.0.0.0`
            }
            else {
                url = `https://tiku.fenbi.com/api/xingce/exercises/${location.href.match(/\/(\d+)\/\d/)[1]}?app=web&kav=100&av=100&hav=100&version=3.0.0.0`;
            }
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.withCredentials = true;
            xhr.responseType = 'json';
            xhr.setRequestHeader('authority', 'tiku.fenbi.com');
            xhr.setRequestHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
            xhr.setRequestHeader('accept-language', 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6');
            xhr.setRequestHeader('cache-control', 'max-age=0');
            xhr.setRequestHeader('upgrade-insecure-requests', '1');

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let response = xhr.response;
                    let questionIds;
                    if (location.href.includes("material")) {
                        questionIds = response.solutions.map(i => i.id);
                    }
                    else {
                        questionIds = response.sheet.questionIds;
                    }
                    let waterfallElements = document.querySelectorAll('.ng-trigger-waterfall');
                    for (var i = 0; i < waterfallElements.length; i++) {
                        let ulElement = waterfallElements[i].querySelector('ul');
                        // Create a new list item for each questionId and add the QR code
                        let liElement = document.createElement('li');
                        new QRCode(liElement, {
                            text: "/book/xingce?id="+questionIds[i], // 替换为您要生成二维码的数据
                            width: 128, // 二维码宽度
                            height: 128 // 二维码高度
                        });
                        // Append the list item to the ul
                        ulElement.appendChild(liElement);
                    }
                }
            };
            xhr.send();
        }
        else {
            let questionIds = [/id=([^&]+)/.exec(location.href)[1]];
            let waterfallElements = document.querySelectorAll('.ng-trigger-waterfall');
            for (var i = 0; i < waterfallElements.length; i++) {
                let ulElement = waterfallElements[i].querySelector('ul');
                // Create a new list item for each questionId and add the QR code
                let liElement = document.createElement('li');
                new QRCode(liElement, {
                    text: "/book/xingce?id="+questionIds[i], // 替换为您要生成二维码的数据
                    width: 128, // 二维码宽度
                    height: 128 // 二维码高度
                });
                // Append the list item to the ul
                ulElement.appendChild(liElement);
            }
        }
    }
    waitForElementToDo(".right-options", 50, clearAnswer);
    script.onload = () => {
        waitForElementToDo(".ng-trigger-waterfall", 50, getCode)
    };
    document.head.appendChild(script);
})();