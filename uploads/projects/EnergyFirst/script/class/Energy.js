/**
 * 能量类
 * 所有可以获取的各种能量都是该类实例
 */

var Energy = function (type, energyImg) {
    this.type = type || 1;  // 能量类型
    this.energyImg = this.energyImg || energyImg;
    this.clipX = 0;
    this.radius = 4;  // 核心半径
    this.x = 0;
    this.y = 0;
    this.isAimed = false;  // 是否被怪物锁定
    this.distance = 0;
};

Energy.prototype = {

    draw: function () {
        switch (this.type) {
            case 1:
                this.clipY = 0;
                break;
            case 2:
                this.clipY = 40;
                break;
            case 3:
                this.clipY = 80;
                break;
        }
        context.save();
        context.drawImage(this.energyImg, this.clipX, this.clipY, 40, 40, this.x - 20, this.y - 20, 40, 40);
        context.restore();
    },

    update: function () {
        parseInt(this.clipX / 40) >= 9 ? this.clipX = 0 : this.clipX += 40;
    }
};