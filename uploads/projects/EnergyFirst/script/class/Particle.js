/**
 * 粒子类
 * 用于碰撞后产生的效果
 */

var Particle = function (type, x, y, isPositive) {
    this.type = type || "white";
    this.x = x || 0;
    this.y = y || 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 4;
    this.speed = 16;
    this.isPositive = isPositive;
    switch (this.type) {
        case 1:
            if (this.isPositive) {
                this.point = parseInt(context.canvas.width * 0.04);
            } else {
                this.point = -parseInt(context.canvas.width * 0.01);
            }
            this.color = "rgba(0, 255, 0, 1)";
            break;
        case 2:
            if (this.isPositive) {
                this.point = parseInt(context.canvas.width * 0.08);
            } else {
                this.point = -parseInt(context.canvas.width * 0.02);
            }
            this.color = "rgba(246, 255, 0, 1)";
            break;
        case 3:
            if (this.isPositive) {
                this.point = parseInt(context.canvas.width * 0.16);
            } else {
                this.point = -parseInt(context.canvas.width * 0.04);
            }
            this.color = "rgba(255, 90, 0, 1)";
            break;
    }
};

Particle.prototype = {

    draw: function () {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
    },

    update: function (desX, desY) {
        if (desX - this.x > 0 && this.y - desY > 0) {
            this.flyAngle = Math.abs(Math.atan((desX - this.x) / (desY - this.y)));
            this.x += Math.round(this.speed * Math.abs(Math.sin(this.flyAngle)));
            this.y -= Math.round(this.speed * Math.abs(Math.cos(this.flyAngle)));
        }
        if (desX - this.x < 0 && this.y - desY > 0) {
            this.flyAngle = Math.PI * 2 - Math.abs(Math.atan((desX - this.x) / (desY - this.y)));
            this.x -= Math.round(this.speed * Math.abs(Math.sin(this.flyAngle)));
            this.y -= Math.round(this.speed * Math.abs(Math.cos(this.flyAngle)));
        }
    }
};