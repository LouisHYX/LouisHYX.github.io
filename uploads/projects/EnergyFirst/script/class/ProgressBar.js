/**
 * 进度条类
 * loading页面进度条以及游戏能量条都继承于此
 */

"use strict";

var ProgressBar = function (widthPercent, height) {
    this.widthPercent = widthPercent;  // 进度条所占屏宽比
    this.width = parseInt(Math.round(WINWIDTH * (this.widthPercent / 100)));
    this.height = height;
    this.marginL = parseInt(Math.round((WINWIDTH - this.width) / 2));  // 进度条左边距
    this.marginT = parseInt(Math.round(WINHEIGHT / 2));  // 进度条上边距
    this.curPoint = 0;  // 当前已经画到的长度

    return this;
};

/**
 * 加载进度条
 * @constructor
 */
var LoadingBar = function () {
    ProgressBar.call(this, 70, 20);
};

/**
 * 能量条
 * @constructor
 */
var EnergyBar = function () {
    ProgressBar.call(this, 100, 40);

    this.grd = context.createLinearGradient(0, 0, this.width, 0);
    this.grd.addColorStop(0, "#ffae00");
    this.grd.addColorStop(1, "#ff3600");
    this._curPoint = 0;  //  当前能量条已经增长的数值
    this.isBarGrowing = false;  // 是否开启能量条增长动画
    this.growStep = 3;  // 能量条增长的步长值
};

inheritPrototype(LoadingBar, ProgressBar);
inheritPrototype(EnergyBar, ProgressBar);

LoadingBar.prototype.drawBar = function () {
    context.beginPath();
    context.fillStyle = "#756EFF";
    context.rect(this.marginL, this.marginT, this.curPoint, this.height);
    context.fill();
};

LoadingBar.prototype.drawFrame = function () {
    context.beginPath();
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.rect(this.marginL, this.marginT, this.width, this.height);
    context.stroke();
};

LoadingBar.prototype.drawText = function () {
    context.beginPath();
    context.textAlign = "center";
    context.fillStyle = "white";
    context.font = "30px zchappy";
    context.fillText("加载中", WINWIDTH / 2, this.marginT - 30);
};

LoadingBar.prototype.drawHero = function () {
    var x = this.marginL + this.curPoint,
        y = this.marginT + this.height / 2;

    context.save();

    context.beginPath();
    context.fillStyle = "#ffc000";
    context.arc(x, y, 20, 0, Math.PI * 2);
    context.fill();

    this.setClipCircle(x, y);  // 设置蒙版区域

    context.beginPath();
    context.fillStyle = "white";
    context.arc(x + 14, y - 12, 10, 0, Math.PI * 2);
    context.arc(x + 14, y + 12, 10, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.fillStyle = "#7c2e13";
    context.arc(x + 14, y - 12, 4, 0, Math.PI * 2);
    context.arc(x + 14, y + 12, 4, 0, Math.PI * 2);
    context.fill();

    context.restore();
};

LoadingBar.prototype.setClipCircle = function (x, y) {
    context.beginPath();
    context.arc(x, y, 20, 0, Math.PI * 2);
    context.clip();
};

LoadingBar.prototype.update = function () {
    this.curPoint += 5;
    if (this.curPoint > this.width) {
        this.curPoint = this.width;
    }
};

EnergyBar.prototype.draw = function () {
    context.beginPath();
    context.fillStyle = "white";
    context.rect(this.marginL, this.marginT, this.width, this.height);
    context.fill();
    context.beginPath();
    context.fillStyle = this.grd;
    context.rect(this.marginL, this.marginT, this.curPoint, this.height);
    context.fill();
};

/**
 * 能量条增长动画函数
 * @param cutPoint
 */
EnergyBar.prototype.energyBarGrow = function (cutPoint) {
    this._curPoint += this.growStep;
    if (cutPoint >= 0) {
        this.curPoint += this.growStep;
    }
    if (cutPoint < 0) {
        this.curPoint -= this.growStep;
    }
    if (Math.abs(this._curPoint) >= Math.abs(cutPoint)) {
        this.isBarGrowing = false;
        this._curPoint = 0;
    }
};

function inheritPrototype(son, father) {
    var prototype = Object(father.prototype);   // 创建对象
    prototype.constructor = son;                // 增强对象
    son.prototype = prototype;                  // 返回对象
}