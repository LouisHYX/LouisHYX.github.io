/**
 * 角色类
 * 游戏角色(玩家和怪物)的父类
 * 使用寄生式组合继承得到父类原型中的属性和方法
 * @constructor
 */

var Role = function (roleImg) {
    this.angle = 0;  // 旋转角度
    this.radius = 20;  // 角色半径
    this.roleImg = this.roleImg || roleImg;  // 角色图像
    this.quadrant = 1;  // 将要进入的坐标象限(数学象限)
    this.isDead = false;  // 是否死亡
};

Role.prototype = {
    draw: function () {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.translate(-this.x, -this.y);
        context.drawImage(this.roleImg, this.clipX, this.clipY, 40, 40, this.x - this.radius, this.y - this.radius, 40, 40);
        context.restore();
    },

    /**
     * 计算给定位置相对于(0,0)点的弧度
     * @param x
     * @param y
     */
    calculateAngle: function (x, y) {
        if (x >= 0 && y >= 0) {
            this.angle = Math.abs(Math.atan(x / y));
            this.quadrant = 1;
        }
        if (x >= 0 && y <= 0) {
            this.angle = Math.PI - Math.abs(Math.atan(x / y));
            this.quadrant = 4;
        }
        if (x <= 0 && y <= 0) {
            this.angle = Math.PI + Math.abs(Math.atan(x / y));
            this.quadrant = 3;
        }
        if (x <= 0 && y >= 0) {
            this.angle = Math.PI * 2 - Math.abs(Math.atan(x / y));
            this.quadrant = 2;
        }

    },

    update: function () {
        switch (this.quadrant) {
            case 1:
                this.x += this.speed * Math.abs(Math.sin(this.angle));
                this.y -= this.speed * Math.abs(Math.cos(this.angle));
                break;
            case 2:
                this.x -= this.speed * Math.abs(Math.sin(this.angle));
                this.y -= this.speed * Math.abs(Math.cos(this.angle));
                break;
            case 3:
                this.x -= this.speed * Math.abs(Math.sin(this.angle));
                this.y += this.speed * Math.abs(Math.cos(this.angle));
                break;
            case 4:
                this.x += this.speed * Math.abs(Math.sin(this.angle));
                this.y += this.speed * Math.abs(Math.cos(this.angle));
                break;
        }
    }
};

/**
 * 玩家类
 * @constructor
 */
var Player = function (roleImg) {
    Role.call(this, roleImg);

    this.x = canvas.width / 2;  // 中心点X
    this.y = canvas.height / 2;  // 中心点Y
    this.clipX = 0;  // 图像剪切区X
    this.clipY = 0;  // 图像剪切区Y
    this.speed = 3;  // 初始移动速度
    this.immortal = false;
    this.speedUp = false;
    this.isControlled = false;  // 是否受到玩家的操控
    this.touchX = 0;  // 控制区X
    this.touchY = 0;  // 控制区Y
    this.controllerX = 0;  // 方向指示圆X
    this.controllerY = 0;  // 方向指示圆Y

    /**
     * 玩家操控(获得角度)
     */
    this.touchEvent = function () {
        var me = this;

        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();

            if (e.touches[1]) return;

            me.touchX = e.touches[0].pageX * SCREENRADIO;
            me.touchY = e.touches[0].pageY * SCREENRADIO;
            me.controllerX = e.touches[0].pageX * SCREENRADIO;
            me.controllerY = e.touches[0].pageY * SCREENRADIO;

            me.isControlled = true;
        });

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();

            //------------------更新方向指示圆并控制角色方向
            if (me.isControlled) {
                var _cX = 0,
                    _cY = 0,
                    distance = 0;  // 控制圆与控制区中心点的距离

                _cX = e.touches[0].pageX * SCREENRADIO - me.touchX;
                _cY = me.touchY - e.touches[0].pageY * SCREENRADIO;

                distance = Math.min(Math.round(Math.pow(Math.pow(_cX, 2) + Math.pow(_cY, 2), 0.5)), 60);

                me.calculateAngle(_cX, _cY);

                me.moveController(distance);
            }
        });

        canvas.addEventListener('touchend', function (e) {
            e.preventDefault();
            me.isControlled = false;  // 擦除控制区
        });
    };

    this.drawZone = function () {
        context.beginPath();
        context.fillStyle = "rgba(152, 220, 255, 0.2)";
        context.strokeStyle = "#98dcff";
        context.lineWidth = 2;
        context.arc(this.touchX, this.touchY, 96, 0, Math.PI * 2);
        context.fill();
        context.stroke();
    };

    this.drawController = function () {
        context.beginPath();
        context.fillStyle = "#98dcff";
        context.arc(this.controllerX, this.controllerY, 36, 0, Math.PI * 2);
        context.fill();
    };

    this.moveController = function (dis) {
        var me = this;
        switch (this.quadrant) {
            case 1:
                this.controllerX = this.touchX + dis * Math.abs(Math.sin(this.angle));
                this.controllerY = this.touchY - dis * Math.abs(Math.cos(this.angle));
                break;
            case 2:
                this.controllerX = this.touchX - dis * Math.abs(Math.sin(this.angle));
                this.controllerY = this.touchY - dis * Math.abs(Math.cos(this.angle));
                break;
            case 3:
                this.controllerX = this.touchX - dis * Math.abs(Math.sin(this.angle));
                this.controllerY = this.touchY + dis * Math.abs(Math.cos(this.angle));
                break;
            case 4:
                this.controllerX = this.touchX + dis * Math.abs(Math.sin(this.angle));
                this.controllerY = this.touchY + dis * Math.abs(Math.cos(this.angle));
                break;
        }
    };

    this.touchEvent();
};


/**
 * 怪物类
 * @constructor
 */
var Monster = function (roleImg) {
    Role.call(this, roleImg);

    this.x = 0;  // 中心点X
    this.y = 0;  // 中心点Y
    this.clipX = 0;   // 图像剪切区X
    this.clipY = 40;    // 图像剪切区Y
    this.speed = 2;  // 初始移动速度
};

inheritPrototype(Player, Role);
inheritPrototype(Monster, Role);

function inheritPrototype(son, father) {
    var prototype = Object(father.prototype);   // 创建对象
    prototype.constructor = son;                // 增强对象
    son.prototype = prototype;                  // 返回对象
}