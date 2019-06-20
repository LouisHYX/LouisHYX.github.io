"use strict";

//--------------------------------------------定义常量
var SPACE = 30;  //网格大小
var SPEED = 100;  //速度
var REWARD = 10;  //单次奖励

//--------------------------------------------绘制贪食蛇和食物
var map = document.getElementById("map");  //获取canvas画布
var ctx = map.getContext("2d");  //获取绘图环境
var gold = document.getElementById("gold");  //获取加分
var sBody = [];  //存储每一个蛇块坐标
var fBody = [];  //存储当前食物坐标
var dir = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];  //定义随机移动方向
var isPause = false;  //游戏是否暂停
var isOver = false;  //游戏是否结束
var score = 0;  //游戏得分

/**
 * 获取随机坐标
 * @param x
 * @param y
 * @param limit
 * @returns {Array}
 */
function randomPos(x, y, limit) {
    var _pos = new Array(2);
    _pos[0] = Math.floor(Math.random() * (x[1] - x[0]) + limit) * SPACE;
    _pos[1] = Math.floor(Math.random() * (y[1] - y[0]) + limit) * SPACE;
    return _pos;
}

/**
 * 贪食蛇构造函数
 * @constructor
 */
function Snake(color) {
    this.color = color;  //颜色
}

/**
 * 绘制初始贪食蛇
 */
Snake.prototype.createSnake = function () {
    var posHead = randomPos([4, 36], [4, 20], 4);
    var posNode = posHead.concat([]);
    var posNode_1 = posNode.concat([]);

    this.createBlock(posHead);
    sBody[sBody.length] = posHead;  //将蛇每一节坐标放入数组

    //--------------根据初始移动方向来确定第二节的位置
    switch (dir) {
        case "up":
            posNode[1] = posHead[1] + SPACE;
            break;
        case "down":
            posNode[1] = posHead[1] - SPACE;
            break;
        case "left":
            posNode[0] = posHead[0] + SPACE;
            break;
        case "right":
            posNode[0] = posHead[0] - SPACE;
            break;
    }

    this.createBlock(posNode);
    sBody[sBody.length] = posNode;  //将蛇每一节坐标放入数组

    //--------------根据初始移动方向来确定第三节的位置
    switch (dir) {
        case "up":
            posNode_1[1] = posNode[1] + SPACE;
            break;
        case "down":
            posNode_1[1] = posNode[1] - SPACE;
            break;
        case "left":
            posNode_1[0] = posNode[0] + SPACE;
            break;
        case "right":
            posNode_1[0] = posNode[0] - SPACE;
            break;
    }
    this.createBlock(posNode_1);
    sBody[sBody.length] = posNode_1;  //将蛇每一节坐标放入数组
};

/**
 * 绘制贪食蛇身其中一块儿
 */
Snake.prototype.createBlock = function (pos) {
    ctx.beginPath();
    ctx.rect(pos[0], pos[1], SPACE, SPACE);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
};

/**
 * 食物继承蛇
 * @constructor
 */
function Food(color) {
    Snake.call(this, color);
}

/**
 * 绘制食物
 */
Food.prototype.createFood = function () {
    var pos = randomPos([0, 36], [0, 20], 0);

    //保证食物出现的坐标不能与蛇重叠(遍历蛇身数组，若pos位置存在则重新执行createFood函数来获取新的pos值)
    for (var i = 0; i < sBody.length; i++) {
        if (sBody.toString().indexOf(pos.toString()) !== -1) {
            this.createFood();
            return false;
        }
    }

    ctx.beginPath();
    ctx.rect(pos[0], pos[1], SPACE, SPACE);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    fBody = pos;
};

var snake = new Snake("coral");
snake.createSnake();
var food = new Food("lightgreen");
food.createFood();


//--------------------------------------------动画(贪食蛇移动)
var moveTimer = setInterval(move, SPEED);

/**
 * 显示面板
 */
function showBoard() {
    var info = document.getElementById("info");
    var go = document.getElementById("go");
    var board = document.getElementById("board");

    info.innerHTML = "<strong style='font-size: 40px; line-height: 120px;'>游戏结束</strong><br/><strong>得分：&nbsp;&nbsp;</strong><strong style='font-size: 60px; color: yellow; vertical-align:-5px;'>" + score + "</strong>";
    go.textContent = "再玩一次";
    board.style.display = "block";
    clearInterval(moveTimer);
    ctx.clearRect(0, 0, map.offsetWidth, map.offsetHeight);  //清屏
    isOver = false;
}

/**
 * 蛇移动一次的函数，每移动一格需要进行碰撞检测
 */
function move() {
    var posTail = sBody[sBody.length - 1];  //原尾部位置
    var posHead = sBody[0];  //原头部位置
    var newHead = [];  //新头部位置

    switch (dir) {
        case "up":
            newHead = [posHead[0], posHead[1] - SPACE];
            snake.createBlock(newHead);
            sBody.unshift(newHead);
            break;
        case "down":
            newHead = [posHead[0], posHead[1] + SPACE];
            snake.createBlock(newHead);
            sBody.unshift(newHead);
            break;
        case "right":
            newHead = [posHead[0] + SPACE, posHead[1]];
            snake.createBlock(newHead);
            sBody.unshift(newHead);
            break;
        case "left":
            newHead = [posHead[0] - SPACE, posHead[1]];
            snake.createBlock(newHead);
            sBody.unshift(newHead);
            break;
    }

    //------------------------碰撞检测
    if (posHead.toString() === fBody.toString()) {  //是否吃到食物
        gold.textContent = "+" + REWARD;
        setTimeout(function () {
            gold.className = "gold";
        }, 800);
        gold.className += " gold-animation";
        snake.createBlock(posTail);
        sBody.push(posTail);
        food.createFood();
        score += REWARD;
    }
    if (sBody.concat([" "]).join(" ").split(" " + [newHead[0], newHead[1]].toString() + " ").length > 1) {  //是否撞自己(判断sBody里面是否存在1处以上头部坐标)
        showBoard();
    }
    if (posHead[0] === -SPACE || posHead[0] === map.offsetWidth || posHead[1] === -SPACE || posHead[1] === map.offsetHeight) {  //是否撞墙
        showBoard();
    }

    //------------------------删除尾部
    ctx.clearRect(posTail[0], posTail[1], SPACE, SPACE);
    sBody.splice(sBody.length - 1, 1);

}


//--------------------------------------------绑定键盘事件
document.onkeydown = function (e) {
    var kc = e.keyCode;
    if (!isOver) {
        if (kc === 37 && dir !== "right") {
            dir = "left";
        }
        if (kc === 38 && dir !== "down") {
            dir = "up";
        }
        if (kc === 39 && dir !== "left") {
            dir = "right";
        }
        if (kc === 40 && dir !== "up") {
            dir = "down";
        }
        if (kc === 32) {
            if (isPause) {
                moveTimer = setInterval(move, SPEED);
            }
            if (!isPause) {
                clearInterval(moveTimer);
            }
            isPause = !isPause;
        }
    }
};