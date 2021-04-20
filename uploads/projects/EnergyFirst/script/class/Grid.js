/**
 * 背景网格类
 * @returns {Grid}
 * @constructor
 */

var Grid = function () {};

Grid.prototype = {
    draw: function () {
        context.lineWidth = 2;
        context.strokeStyle = "#2a3535";

        for (var i = 80 + 2; i < context.canvas.width; i += 80) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, context.canvas.height);
            context.stroke();
        }

        for (var j = 80 + 2; j < context.canvas.height; j += 80) {
            context.beginPath();
            context.moveTo(0, j);
            context.lineTo(context.canvas.width, j);
            context.stroke();
        }
    }
};