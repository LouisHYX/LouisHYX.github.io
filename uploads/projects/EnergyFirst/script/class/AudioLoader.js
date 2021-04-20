/**
 * 游戏图片资源加载器（在loading界面实现进度条显示）
 */

"use strict";

var AudioLoader = function (audioUrls) {
    this.audioUrls = audioUrls || [];
    this.audiosIndex = 0;
    this.audiosLoaded = 0;
    this.audiosFailedToLoad = 0;
    this.audios = {};
};

AudioLoader.prototype = {
    /**
     * 外部循环调用该方法加载音频
     * @returns {number}
     */
    load: function () {
        if (this.audiosIndex < this.audioUrls.length) {
            this.loadaudio(this.audioUrls[this.audiosIndex]);
            this.audiosIndex++;
        }
        return (this.audiosLoaded + this.audiosFailedToLoad) / this.audioUrls.length * 100;
    },

    loadaudio: function (audioUrl) {
        var audio = new Audio(),
            me = this;

        audio.src = audioUrl;

        audio.addEventListener('canplaythrough', function (e) {
            me.audioLoadedCallback(e);
        });

        audio.addEventListener('error', function (e) {
            me.audioLoadErrorCallback(e);
        });

        this.audios[audioUrl] = audio;
    },

    audioLoadedCallback: function (e) {
        this.audiosLoaded++;

    },

    audioLoadErrorCallback: function (e) {
        this.audiosFailedToLoad++;
    },

    getaudio: function (url) {
        return this.audios[url];
    }
};