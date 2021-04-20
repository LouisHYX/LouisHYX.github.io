"use strict";

//--------------------------------------公共池

//-----------常量
var RAF = window.requestNextAnimationFrame,
    WINWIDTH = 720,  // 初始设定屏幕宽度
    WINHEIGHT = 1280,  // 初始设定屏幕高度
    SCREENRADIO = WINWIDTH / window.innerWidth;  //屏幕比例系数

//-----------变量
var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    isGameOver = false;

//-----------方法
/**
 * 擦除画布内容
 */
var clear = function () {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};