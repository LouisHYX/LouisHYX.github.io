/**
 * 游戏流程
 * 包括：1.游戏加载；2.菜单；3.游戏循环（背景，角色，技能，特效的绘制以及更新）
 */

"use strict";

//--------------------------------------初始化(设置画布全屏)
canvas.style.width = '100%';

window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

//--------------------------------------加载资源(进度条绘制完毕之后调用 mainMenu() 进入主菜单)
var mainMenuPage = document.getElementById('mainMenuPage'),
    allButtonsBox = document.getElementById('allButtons'),
    startGameBtn = document.getElementById('startGame'),
    exitGameBtn = document.getElementById('exitGame'),
    gameTitle = document.getElementById('gameTitle'),
    bgm = null,
    buttonClick = null,
    barGrow = null,
    barReduce = null,
    speedUp = null,
    immortal = null,
    win = null,
    lose = null;

var loadingBar = new LoadingBar(),
    loadedPerImage = 0,
    loadingBarTimer = null,
    loadedPerAudio = 0;

var imageLoader = new ImageLoader([
    'assets/image/game_name.png',
    'assets/image/role.png',
    'assets/image/energy.png',
    'assets/image/button_start.png',
    'assets/image/button_exit.png',
    'assets/image/button_restart.png',
    'assets/image/button_mainMenu.png',
    'assets/image/skill.png',
    'assets/image/youwin.png',
    'assets/image/youlose.png',
    'assets/image/ability.png'
]);

var audioLoader = new AudioLoader([
    "assets/audio/bgm.mp3",
    "assets/audio/click_button.wav",
    "assets/audio/explode.wav",
    "assets/audio/eat_player.wav",
    "assets/audio/eat_monster.wav",
    "assets/audio/bar_grow.mp3",
    "assets/audio/bar_reduce.mp3",
    "assets/audio/speed_up.mp3",
    "assets/audio/immortal.mp3",
    "assets/audio/win.mp3",
    "assets/audio/lose.mp3"
]);

loadingBar.drawBar();
loadingBar.drawFrame();
loadingBar.drawText();
loadingBar.drawHero();

var loadedTimer = setInterval(function () {
    loadedPerImage = imageLoader.load();
    loadedPerAudio = audioLoader.load();
    if (loadedPerAudio === 0 && loadedPerImage === 0) {
        loadingBarTimer = setInterval(loadingBarAnimation, 1000 / 60);
    }
    if (loadedPerAudio >= 100 && loadedPerImage >= 100) {  // 加载完毕
        clearInterval(loadedTimer);
    }
}, 100);

function loadingBarAnimation() {
    loadingBar.curBarWidth = parseInt((loadedPerAudio + loadedPerImage / 100).toFixed(1) * loadingBar.width);
    if (loadingBar.curPoint <= loadingBar.curBarWidth) {
        clear();
        loadingBar.drawBar();
        loadingBar.drawFrame();
        loadingBar.drawText();
        loadingBar.drawHero();


        if (loadingBar.curPoint >= loadingBar.width) {  // 当前所画的长度大于进度条原有长度停止绘制
            clearInterval(loadingBarTimer);
            setTimeout(mainMenu, 1000);
        }

        loadingBar.update();
    }
}

//--------------------------------------游戏主菜单(开始游戏之后进入 readyLoop() 准备开始游戏循环)
function mainMenu() {

    bgm = audioLoader.getaudio("assets/audio/bgm.mp3");
    buttonClick = audioLoader.getaudio("assets/audio/click_button.wav");
    barGrow = audioLoader.getaudio("assets/audio/bar_grow.mp3");
    barReduce = audioLoader.getaudio("assets/audio/bar_reduce.mp3");
    speedUp = audioLoader.getaudio("assets/audio/speed_up.mp3");
    immortal = audioLoader.getaudio("assets/audio/immortal.mp3");
    win = audioLoader.getaudio("assets/audio/win.mp3");
    lose = audioLoader.getaudio("assets/audio/lose.mp3");

    bgm.play();
    bgm.volume = 0.1;

    clear();  // 清屏

    // 创建背景
    grid = new Grid();
    grid.draw();

    var titleImg = imageLoader.getImage("assets/image/game_name.png");

    gameTitle.setAttribute("src", titleImg.src);
    startGameBtn.setAttribute("src", "assets/image/button_start.png");
    // exitGameBtn.setAttribute("src", "assets/image/button_exit.png");

    mainMenuPage.removeAttribute("class");  // 显示主菜单

    allButtonsBox.style.marginLeft = -(window.innerWidth * 0.4 * 0.5) + "px";

    allButtonsBox.addEventListener("touchstart", function (e) {
        if (e.target.id === "startGame") {
            startGameBtn.className += " btn-down";
        }
        // if (e.target.id === "exitGame") {
        //     exitGameBtn.className += " btn-down";
        // }
        buttonClick.play();
    });

    allButtonsBox.addEventListener("touchend", function (e) {
        if (e.target.id === "startGame") {
            startGameBtn.className = "menuButton";
            mainMenuPage.setAttribute("class", "hide");
            isGameOver = false;
            readyLoop();
        }
        // if (e.target.id === "exitGame") {
        //     exitGameBtn.className = "menuButton";
        //     window.close();
        // }
    });
}


//--------------------------------------游戏循环
var animation = 0,  // 当前动画循环索引值
    grid = null,  // 背景
    player = null,  // 玩家
    monsters = [],  // 怪物数组
    energyBar = null,  // 能量条
    grd = null,  // 能量条渐变
    energy = new Array(2),  // 能量数组(场上最多两个能量)
    particles = [],  // 粒子数组
    cutPoint = 0,  // 能量条增长截点
    playerBoomArr = [],  // 玩家爆炸粒子组
    abilities = [], // 所有技能数组
    ability = null,  // 当前创建的技能
    condition_energy_empty = false,  // 能量条空状态
    condition_energy_full = false;  // 能量条满状态

/**
 * 获取能量类型，返回1或2或3
 * @param num
 * @returns {*}
 */
function getType(num) {
    if (num >= 40) {
        num = 1;
    } else if (num >= 10 && num < 40) {
        num = 2;
    } else if (num >= 0 && num < 10) {
        num = 3;
    }
    return num;
}

function readyLoop() {

    // 清屏
    clear();

    // 创建角色(玩家和怪物)
    var roleImg = imageLoader.getImage("assets/image/role.png");
    player = new Player(roleImg);
    monsters[0] = new Monster(roleImg);
    var pos_monster = getRandomPosition(monsters[0]);
    monsters[0].x = pos_monster[0];
    monsters[0].y = pos_monster[1];
    monsters[1] = new Monster(roleImg);
    pos_monster = getRandomPosition(monsters[1]);
    monsters[1].x = pos_monster[0];
    monsters[1].y = pos_monster[1];

    // 创建能量条
    energyBar = new EnergyBar(80);
    grd = context.createLinearGradient(0, 0, energyBar.width, 0);
    grd.addColorStop(0, "#ffae00");
    grd.addColorStop(1, "#ff3600");
    energyBar.marginT = 0;
    energyBar.curPoint = energyBar.width * 0.3;

    // 创建能量
    var energyImg = imageLoader.getImage("assets/image/energy.png");
    var pos_energy = getRandomPosition(energy);
    energy[0] = new Energy(getType(Math.floor(Math.random() * 101)), energyImg);
    energy[0].x = pos_energy[0];
    energy[0].y = pos_energy[1];
    pos_energy = getRandomPosition(energy);
    energy[1] = new Energy(getType(Math.floor(Math.random() * 101)), energyImg);
    energy[1].x = pos_energy[0];
    energy[1].y = pos_energy[1];

    // 创建技能
    abilities = [];
    var icon = imageLoader.getImage("assets/image/ability.png");  // 技能图标
    abilities.push(new SpeedUp(icon));
    abilities.push(new Immortal(icon));

    //-----------计算与怪物最近的能量
    calculateNearest(monsters[0]);
    calculateNearest(monsters[1]);

    cancelAnimationFrame(animation);
    animation = RAF(gameLoop);  // 开始主循环

}

var startTime = 0;

function gameLoop(time) {

    if (time === undefined) {
        time = +new Date;
    }

    if (!isGameOver) {
        clear();

        grid.draw();

        if (ability && !ability.destroyed) {
            ability.draw();
            if (time - startTime > 1000 / 8) {  // 将技能动画以8帧/秒播放
                ability.update();
                startTime = time;
            }
        }

        for (var i = 0; i < energy.length; i++) {
            monsters[i].update();
            monsters[i].draw();
        }

        if (!player.isDead) {
            player.update();
            player.draw();
            if (player.immortal) {
                ability.immortalAnimation(player.x, player.y);
            }
            if (player.speedUp) {
                ability.speedUpAnimation(player.x, player.y);
            }
        } else {
            boom(playerBoomArr);
        }

        for (var j = 0; j < energy.length; j++) {
            if (time - startTime > 100) {  // 将能量动画以10帧/秒播放
                energy[j].update();
            }
            energy[j].draw();
        }

        if (energyBar.isBarGrowing) {  // 能量条增长
            energyBar.energyBarGrow(cutPoint);
        } else {
            cutPoint = 0;
        }

        energyBar.draw();

        if (particles.length > 0) {
            for (var num = 0; num < particles.length; num++) {
                particles[num].update(energyBar.marginL + energyBar.curPoint, energyBar.marginT + energyBar.height / 2);
                particles[num].draw();
                if (particles[num].y <= energyBar.height) {
                    if (cutPoint >= 0) {
                        barGrow.play();
                    }
                    // if (cutPoint < 0) {
                    //     barReduce.play();
                    // }
                    cutPoint += particles[num].point;
                    energyBar.isBarGrowing = true;
                    particles.splice(num, 1);  // 删除已经到达当前能量右边界的粒子
                }
            }
        }

        if (player.isControlled) {
            player.drawZone();  // 绘制控制区
            player.drawController();  // 绘制方向指示圆
        }

        judgeEnergyBarState();  // 判断能量条是否为空或者是否加满

        collisionDetection();  // 碰撞检测

        RAF(gameLoop);
    }

}

/**
 * 产生爆炸效果
 */
function boom(who) {
    if (who.length === 0) {
        who = [];  // 当所有粒子全部消失后重置粒子数组
        isGameOver = true;  // 游戏当前状态设置为结束状态
        endMenu();  // 显示结束菜单
    }
    for (var i = 0; i < who.length; i++) {
        if (!who[i].isDead) {
            who[i].update();
            who[i].draw();
        } else {
            who.splice(i, 1);
        }
    }

}

/**
 * 碰撞检测函数
 */
function collisionDetection() {
    var explode = audioLoader.getaudio("assets/audio/explode.wav"),
        monsterEat = audioLoader.getaudio("assets/audio/eat_monster.wav"),
        playerEat = audioLoader.getaudio("assets/audio/eat_player.wav"),
        speedUp = audioLoader.getaudio("assets/audio/speed_up.mp3"),
        immortal = audioLoader.getaudio("assets/audio/immortal.mp3");


    //-----------玩家吃到能量
    for (var i = 0; i < energy.length; i++) {
        if (calculateDistance(player.x, player.y, player.radius, energy[i].x, energy[i].y, energy[i].radius)) {

            //--------------创建粒子飞入能量条
            particles.push(new Particle(energy[i].type, energy[i].x, energy[i].y, true));

            //--------------重新修改被吃能量的类型和位置
            var pos_player_energy = getRandomPosition(energy);
            energy[i].type = getType(Math.floor(Math.random() * 101));
            energy[i].x = pos_player_energy[0];
            energy[i].y = pos_player_energy[1];
            energy[i].isAimed = false;
            for (x in monsters) {
                if (monsters[x].nearestOne.isAimed === false) {
                    //-----------计算与怪物最近的能量
                    calculateNearest(monsters[x]);
                }
            }

            //--------------概率创建技能
            var num = getType(Math.floor(Math.random() * 101));
            if (ability === null && num === 2) {
                ability = abilities[Math.floor(Math.random() * 2)];
                var pos_ability = getRandomPosition(ability);
                ability.x = pos_ability[0];
                ability.y = pos_ability[1];
            }
            playerEat.play();
        }
    }

    //-----------玩家吃到技能
    if (ability) {
        if (calculateDistance(player.x, player.y, player.radius, ability.x, ability.y, ability.radius)) {
            ability.destroyed = true;
            switch (ability.type) {
                case "speedup":
                    speedUp.play();
                    player.speedUp = true;
                    player.speed = 5;
                    setTimeout(function () {
                        player.speed = 3;
                        player.speedUp = false;
                        ability = null;  // 销毁技能图标
                    }, ability.duration);
                    break;
                case "immortal":
                    immortal.play();
                    player.immortal = true;
                    setTimeout(function () {
                        player.immortal = false;
                        ability = null;  // 销毁技能图标
                    }, ability.duration);
                    break;
            }
        }
    }


    //-----------怪物吃到能量
    for (var p = 0; p < energy.length; p++) {
        for (var q = 0; q < energy.length; q++) {
            if (calculateDistance(monsters[p].x, monsters[p].y, monsters[p].radius, energy[q].x, energy[q].y, energy[q].radius)) {

                //--------------创建粒子飞入能量条
                particles.push(new Particle(energy[q].type, energy[q].x, energy[q].y, false));

                //--------------重新修改被吃能量的类型和位置
                var pos_monster_energy = getRandomPosition(energy);
                energy[q].type = getType(Math.floor(Math.random() * 101));
                energy[q].x = pos_monster_energy[0];
                energy[q].y = pos_monster_energy[1];
                energy[q].isAimed = false;
                monsters[p].nearestOne = null;

                //-----------计算与怪物最近的能量
                calculateNearest(monsters[p]);

                monsterEat.play();
            }
        }
    }

    //-----------玩家撞到怪物
    if (!player.immortal) {
        for (var j = 0; j < monsters.length; j++) {
            if (calculateDistance(player.x, player.y, player.radius, monsters[j].x, monsters[j].y, monsters[j].radius) && !player.isDead) {
                player.isDead = true;
                for (var x = 0; x < 20; x++) {
                    playerBoomArr.push(new Boom(player.x, player.y, "#ffc000"));
                }
                explode.play();
            }
        }
    }

    //-----------玩家撞到墙
    if (isHittingBorder() && !player.isDead) {
        player.isDead = true;
        for (var m = 0; m < 20; m++) {
            playerBoomArr.push(new Boom(player.x, player.y, "#ffc000"));
        }
        explode.play();
    }


}

/**
 * 计算与怪物最近的能量(若该能量已被怪物锁定，则其他怪物需要修改为第二远的能量目标)
 */
function calculateNearest(monster) {
    var noAimedEnergyDistance = [];

    for (var x = 0; x < energy.length; x++) {
        if (!energy[x].isAimed) {
            energy[x].distance = Math.pow(energy[x].x - monster.x, 2) + Math.pow(energy[x].y - monster.y, 2);
            noAimedEnergyDistance.push(energy[x].distance);
        }
    }

    var minDis = Math.min.apply(this, noAimedEnergyDistance);

    for (var y = 0; y < energy.length; y++) {
        if (energy[y].distance === minDis) {
            energy[y].isAimed = true;
            monster.nearestOne = energy[y];
            monster.calculateAngle(energy[y].x - monster.x, monster.y - energy[y].y);
        }
    }
}

/**
 * 判断能量条状态
 */
function judgeEnergyBarState() {
    //-----------能量条是否为空
    if (energyBar.curPoint <= 0) {
        condition_energy_empty = true;
        if (!player.isDead) {
            player.isDead = true;
            for (var m = 0; m < 20; m++) {
                playerBoomArr.push(new Boom(player.x, player.y, "#ffc000"));
            }
        }
    }

    //-----------能量条是否已满
    if (energyBar.curPoint >= energyBar.width) {
        condition_energy_full = true;
        isGameOver = true;  // 游戏当前状态设置为结束状态
        endMenu();  // 显示结束菜单
    }
}

/**
 * 判断两圆心之间的距离是否小于等于两圆半径之和
 */
function calculateDistance(x1, y1, r1, x2, y2, r2) {
    var dis = Math.round(Math.pow(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2), 0.5));
    if (dis <= r1 + r2) {
        return true;
    }
}

/**
 * 判断是否撞到边界
 */
function isHittingBorder() {
    return !((Math.round(player.x) - player.radius >= 0 && Math.round(player.x) + player.radius <= canvas.width) && (Math.round(player.y) - player.radius - energyBar.height >= 0 && Math.round(player.y) + player.radius <= canvas.height))
}

/**
 * 创建随机位置, return [x, y]
 */
function getRandomPosition(who) {
    var _x = Math.floor(Math.random() * (canvas.width + 1 - (20 + 30) * 2) + (20 + 30)),
        _y = Math.floor(Math.random() * (canvas.height + 1 - (20 + 30) * 2 - 40) + (20 + 30 + 40));

    //-----------判断这个位置是否可用
    if (calculateDistance(_x, _y, 20, player.x, player.y, player.radius)) {  // 不能与玩家重叠
        getRandomPosition();
    }
    if (typeof who === Object && who.constructor === Array) {
        for (var n = 0; n < who.length; n++) {  // 两个能量不能重叠
            if (who[n] !== undefined) {
                if (calculateDistance(_x, _y, 20, who[n].x, who[n].y, who[n].radius)) {
                    getRandomPosition(who);
                }
            }
        }
    } else if (typeof who === Object && who.constructor !== Array) {
        if (calculateDistance(_x, _y, 20, who.x, who.y, who.radius)) {
            getRandomPosition(who);
        }
    }

    return [_x, _y];
}

//--------------------------------------游戏结束菜单(玩家获胜或者玩家失败之后弹出)
function endMenu() {

    bgm.pause();

    var mask = document.getElementById("mask"),
        gameOverMenu = document.getElementById("gameOverMenu"),
        allButtons_end = document.getElementById("allButtons_end"),
        restart = document.getElementById("restart"),
        mainM = document.getElementById("mainMenu"),
        youWhat = document.getElementById("youWhat");

    restart.setAttribute("src", "assets/image/button_restart.png");
    mainM.setAttribute("src", "assets/image/button_mainMenu.png");
    var resultImg = null;
    if (!player.isDead) {
        resultImg = imageLoader.getImage("assets/image/youwin.png");
        win.play();
    } else {
        resultImg = imageLoader.getImage("assets/image/youlose.png");
        lose.play();
    }
    youWhat.setAttribute("src", resultImg.src);

    mask.removeAttribute("class");  // 显示结束菜单

    gameOverMenu.style.border = "#ffa77c " + gameOverMenu.offsetWidth * 0.03 + "px solid";

    allButtons_end.addEventListener("touchstart", function (e) {
        if (e.target.id === "restart") {
            restart.className += " btn-down";
        }
        if (e.target.id === "mainMenu") {
            mainM.className += " btn-down";
        }
        buttonClick.play();
    });

    allButtons_end.addEventListener("touchend", function (e) {
        if (e.target.id === "restart") {
            restart.className = "endButton";
            mask.setAttribute("class", "hide");  // 隐藏结束菜单
            isGameOver = false;
            readyLoop();  // 重新绘制画布并开始游戏
            bgm.play();
        }
        if (e.target.id === "mainMenu") {
            mainM.className = "endButton";
            mask.setAttribute("class", "hide");  // 隐藏结束菜单
            mainMenu();
        }
    });

}
