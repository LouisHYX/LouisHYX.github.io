/**
 * 爆炸类
 * @constructor
 */

var Boom = function (x, y, color) {
    this.getRandom = function () {
        var _r = Math.floor(Math.random() * 7 - 3);
        if (_r === 0) {
            this.getRandom();
        } else {
            return _r;
        }
    };

    this.x = x;
    this.y = y;
    this.vx = this.getRandom();
    this.vy = this.getRandom();
    this.color = color;
    this.radius = Math.floor(Math.random() * 5 + 2);
    this._x = 0;  // x轴增量
    this._y = 0;  // y轴增量
    this.isDead = false;
};

Boom.prototype.draw = function () {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
};

Boom.prototype.update = function () {
    if (Math.pow(Math.pow(this._x, 2) + Math.pow(this._y, 2), 0.5) < 80) {
        this._x += this.vx;
        this._y += this.vy;
        this.x += this.vx;
        this.y += this.vy;
    } else {
        this.isDead = true;
    }
};