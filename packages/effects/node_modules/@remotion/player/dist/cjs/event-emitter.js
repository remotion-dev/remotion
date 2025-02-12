"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailEmitter = exports.PlayerEmitter = void 0;
class PlayerEmitter {
    constructor() {
        this.listeners = {
            ended: [],
            error: [],
            pause: [],
            play: [],
            ratechange: [],
            scalechange: [],
            seeked: [],
            timeupdate: [],
            frameupdate: [],
            fullscreenchange: [],
            volumechange: [],
            mutechange: [],
            waiting: [],
            resume: [],
        };
        this.dispatchSeek = (frame) => {
            this.dispatchEvent('seeked', {
                frame,
            });
        };
        this.dispatchVolumeChange = (volume) => {
            this.dispatchEvent('volumechange', {
                volume,
            });
        };
        this.dispatchPause = () => {
            this.dispatchEvent('pause', undefined);
        };
        this.dispatchPlay = () => {
            this.dispatchEvent('play', undefined);
        };
        this.dispatchEnded = () => {
            this.dispatchEvent('ended', undefined);
        };
        this.dispatchRateChange = (playbackRate) => {
            this.dispatchEvent('ratechange', {
                playbackRate,
            });
        };
        this.dispatchScaleChange = (scale) => {
            this.dispatchEvent('scalechange', {
                scale,
            });
        };
        this.dispatchError = (error) => {
            this.dispatchEvent('error', {
                error,
            });
        };
        this.dispatchTimeUpdate = (event) => {
            this.dispatchEvent('timeupdate', event);
        };
        this.dispatchFrameUpdate = (event) => {
            this.dispatchEvent('frameupdate', event);
        };
        this.dispatchFullscreenChange = (event) => {
            this.dispatchEvent('fullscreenchange', event);
        };
        this.dispatchMuteChange = (event) => {
            this.dispatchEvent('mutechange', event);
        };
        this.dispatchWaiting = (event) => {
            this.dispatchEvent('waiting', event);
        };
        this.dispatchResume = (event) => {
            this.dispatchEvent('resume', event);
        };
    }
    addEventListener(name, callback) {
        this.listeners[name].push(callback);
    }
    removeEventListener(name, callback) {
        this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback) => {
            callback({ detail: context });
        });
    }
}
exports.PlayerEmitter = PlayerEmitter;
class ThumbnailEmitter {
    constructor() {
        this.listeners = {
            error: [],
            waiting: [],
            resume: [],
        };
        this.dispatchError = (error) => {
            this.dispatchEvent('error', {
                error,
            });
        };
        this.dispatchWaiting = (event) => {
            this.dispatchEvent('waiting', event);
        };
        this.dispatchResume = (event) => {
            this.dispatchEvent('resume', event);
        };
    }
    addEventListener(name, callback) {
        this.listeners[name].push(callback);
    }
    removeEventListener(name, callback) {
        this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback) => {
            callback({ detail: context });
        });
    }
}
exports.ThumbnailEmitter = ThumbnailEmitter;
