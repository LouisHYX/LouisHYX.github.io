"use strict";

//----------------------游戏初始化
var info = document.getElementById("info");
var go = document.getElementById("go");
var board = document.getElementById("board");
var gold = document.getElementById("gold");  //获取加分

info.innerHTML = "<strong style='color:coral'>上下左右</strong>&nbsp;——&nbsp;方向控制<br/><strong style='color:coral'>空格</strong>&nbsp;——&nbsp;暂停和继续";

go.textContent = "开始游戏";

gold.style.marginLeft = - gold.offsetWidth / 2 + "px";

go.onclick = function () {
    //-----------去除游戏信息以及开始按钮
    board.style.display = "none";

    //-----------开始游戏后添加main.js文件
    if(document.getElementById("main")){  //每次重开游戏删除之前的main.js，添加新的main.js执行
        document.body.removeChild(document.getElementById("main"));
    }
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", "main.js");
    script.setAttribute("id", "main");
    document.body.appendChild(script);
};