"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVideoConfig = void 0;
const react_1 = require("react");
const CanUseRemotionHooks_js_1 = require("./CanUseRemotionHooks.js");
const is_player_js_1 = require("./is-player.js");
const use_unsafe_video_config_js_1 = require("./use-unsafe-video-config.js");
/*
 * @description Retrieves information about the composition context in which it is used, including dimensions, frame rate, duration, and more.
 * @see [Documentation](https://www.remotion.dev/docs/use-video-config)
 */
const useVideoConfig = () => {
    const videoConfig = (0, use_unsafe_video_config_js_1.useUnsafeVideoConfig)();
    const context = (0, react_1.useContext)(CanUseRemotionHooks_js_1.CanUseRemotionHooks);
    const isPlayer = (0, is_player_js_1.useIsPlayer)();
    if (!videoConfig) {
        if ((typeof window !== 'undefined' && window.remotion_isPlayer) ||
            isPlayer) {
            throw new Error([
                'No video config found. Likely reasons:',
                '- You are probably calling useVideoConfig() from outside the component passed to <Player />. See https://www.remotion.dev/docs/player/examples for how to set up the Player correctly.',
                '- You have multiple versions of Remotion installed which causes the React context to get lost.',
            ].join('-'));
        }
        throw new Error('No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.');
    }
    if (!context) {
        throw new Error('Called useVideoConfig() outside a Remotion composition.');
    }
    return videoConfig;
};
exports.useVideoConfig = useVideoConfig;
