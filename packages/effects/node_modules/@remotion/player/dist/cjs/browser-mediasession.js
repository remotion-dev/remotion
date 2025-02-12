"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBrowserMediaSession = void 0;
const react_1 = require("react");
const use_player_js_1 = require("./use-player.js");
const useBrowserMediaSession = ({ browserMediaControlsBehavior, videoConfig, playbackRate, }) => {
    const { playing, pause, play, emitter, getCurrentFrame, seek } = (0, use_player_js_1.usePlayer)();
    (0, react_1.useEffect)(() => {
        if (!navigator.mediaSession) {
            return;
        }
        if (browserMediaControlsBehavior.mode === 'do-nothing') {
            return;
        }
        if (playing) {
            navigator.mediaSession.playbackState = 'playing';
        }
        else {
            navigator.mediaSession.playbackState = 'paused';
        }
    }, [browserMediaControlsBehavior.mode, playing]);
    (0, react_1.useEffect)(() => {
        if (!navigator.mediaSession) {
            return;
        }
        if (browserMediaControlsBehavior.mode === 'do-nothing') {
            return;
        }
        const onTimeUpdate = () => {
            if (!videoConfig) {
                return;
            }
            if (navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: videoConfig.durationInFrames / videoConfig.fps,
                    playbackRate,
                    position: getCurrentFrame() / videoConfig.fps,
                });
            }
        };
        emitter.addEventListener('timeupdate', onTimeUpdate);
        return () => {
            emitter.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, [
        browserMediaControlsBehavior.mode,
        emitter,
        getCurrentFrame,
        playbackRate,
        videoConfig,
    ]);
    (0, react_1.useEffect)(() => {
        if (!navigator.mediaSession) {
            return;
        }
        if (browserMediaControlsBehavior.mode === 'do-nothing') {
            return;
        }
        navigator.mediaSession.setActionHandler('play', () => {
            if (browserMediaControlsBehavior.mode === 'register-media-session') {
                play();
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (browserMediaControlsBehavior.mode === 'register-media-session') {
                pause();
            }
        });
        navigator.mediaSession.setActionHandler('seekto', (event) => {
            if (browserMediaControlsBehavior.mode === 'register-media-session' &&
                event.seekTime !== undefined &&
                videoConfig) {
                seek(Math.round(event.seekTime * videoConfig.fps));
            }
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            if (browserMediaControlsBehavior.mode === 'register-media-session' &&
                videoConfig) {
                seek(Math.max(0, Math.round((getCurrentFrame() - 10) * videoConfig.fps)));
            }
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
            if (browserMediaControlsBehavior.mode === 'register-media-session' &&
                videoConfig) {
                seek(Math.max(videoConfig.durationInFrames - 1, Math.round((getCurrentFrame() + 10) * videoConfig.fps)));
            }
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (browserMediaControlsBehavior.mode === 'register-media-session') {
                seek(0);
            }
        });
        return () => {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('seekto', null);
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
        };
    }, [
        browserMediaControlsBehavior.mode,
        getCurrentFrame,
        pause,
        play,
        seek,
        videoConfig,
    ]);
};
exports.useBrowserMediaSession = useBrowserMediaSession;
