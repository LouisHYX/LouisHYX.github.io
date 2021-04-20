/**
 * 技能类
 * @constructor
 */

var Ability = function (icon, duration) {
    this.x = 0;
    this.y = 0;
    this.icon = this.icon || icon;  // 技能图标
    this.duration = duration;  // 技能持续时间
    this.radius = 15;  // 技能图标半径
    this.destroyed = false;  // 是否不再绘制该技能图标
};

Ability.prototype = {
    draw: function () {
        context.save();
        context.drawImage(this.icon, this.clipX, this.clipY, 30, 30, this.x - this.radius, this.y - this.radius, 30, 30);
        context.restore();

    },

    update: function () {
        parseInt(this.clipX / 30) >= 7 ? this.clipX = 0 : this.clipX += 30;
    }
};

/**
 * 加速
 * @constructor
 */
var SpeedUp = function (icon) {
    Ability.call(this, icon, 10000);

    this.type = "speedup";
    this.clipX = 0;  // 图像剪切区X
    this.clipY = 0;  // 图像剪切区Y
    this.opacity = 0.8;
    this.toZero = true;

    this.speedUpAnimation = function (x, y) {
        this.toZero === true ? this.opacity -= 0.05 : this.opacity += 0.05;
        if (this.opacity >= 0.8) this.toZero = true;
        if (this.opacity <= 0) this.toZero = false;
        context.beginPath();
        context.fillStyle = "rgba(255, 0, 0, " + this.opacity + ")";
        context.arc(x, y, 20, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    };

};

/**
 * 无敌
 * @constructor
 */
var Immortal = function (icon) {
    Ability.call(this, icon, 10000);

    this.type = "immortal";
    this.clipX = 0;  // 图像剪切区X
    this.clipY = 30;  // 图像剪切区Y

    this.immortalAnimation = function (x, y) {
        context.beginPath();
        context.fillStyle = "rgba(255, 255, 255, 0.3)";
        context.strokeStyle = "white";
        context.lineWidth = 1;
        context.arc(x, y, 40, 0, Math.PI * 2);
        context.fill();
        context.stroke();
    };

};

inheritPrototype(SpeedUp, Ability);
inheritPrototype(Immortal, Ability);

function inheritPrototype(son, father) {
    var prototype = Object(father.prototype);   // 创建对象
    prototype.constructor = son;                // 增强对象
    son.prototype = prototype;                  // 返回对象
}


