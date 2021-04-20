/**
 * 游戏图片资源加载器（在loading界面实现进度条显示）
 */

"use strict";

var ImageLoader = function (imageUrls) {
    this.imageUrls = imageUrls || [];
    this.imagesIndex = 0;
    this.imagesLoaded = 0;
    this.imagesFailedToLoad = 0;
    this.images = {};
};

ImageLoader.prototype = {
    /**
     * 外部循环调用该方法加载图像
     * @returns {number}
     */
    load: function () {
        if (this.imagesIndex < this.imageUrls.length) {
            this.loadImage(this.imageUrls[this.imagesIndex]);
            this.imagesIndex++;
        }
        return (this.imagesLoaded + this.imagesFailedToLoad) / this.imageUrls.length * 100;
    },

    loadImage: function (imageUrl) {
        var image = new Image(),
            me = this;

        image.src = imageUrl;

        image.addEventListener('load', function (e) {
            me.imageLoadedCallback(e);
        });

        image.addEventListener('error', function (e) {
            me.imageLoadErrorCallback(e);
        });

        this.images[imageUrl] = image;
    },

    imageLoadedCallback: function (e) {
        this.imagesLoaded++;

    },

    imageLoadErrorCallback: function (e) {
        this.imagesFailedToLoad++;
    },

    getImage: function (url) {
        return this.images[url];
    }
};