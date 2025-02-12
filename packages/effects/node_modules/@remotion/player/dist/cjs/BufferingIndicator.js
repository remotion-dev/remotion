"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferingIndicator = exports.bufferingIndicatorStrokeWidth = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const icons_js_1 = require("./icons.js");
const className = '__remotion_buffering_indicator';
const remotionBufferingAnimation = '__remotion_buffering_animation';
exports.bufferingIndicatorStrokeWidth = 3;
const playerStyle = {
    width: icons_js_1.ICON_SIZE,
    height: icons_js_1.ICON_SIZE,
    overflow: 'hidden',
    lineHeight: 'normal',
    fontSize: 'inherit',
};
const studioStyle = {
    width: 14,
    height: 14,
    overflow: 'hidden',
    lineHeight: 'normal',
    fontSize: 'inherit',
};
const BufferingIndicator = ({ type }) => {
    const style = type === 'player' ? playerStyle : studioStyle;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("style", { type: "text/css", children: `
				@keyframes ${remotionBufferingAnimation} {
          0% {
            rotate: 0deg;
          }
          100% {
            rotate: 360deg;
          }
        }
        
        .${className} {
            animation: ${remotionBufferingAnimation} 1s linear infinite;
        }        
			` }), (0, jsx_runtime_1.jsx)("div", { style: style, children: (0, jsx_runtime_1.jsx)("svg", { viewBox: type === 'player' ? '0 0 22 22' : '0 0 18 18', style: style, className: className, children: (0, jsx_runtime_1.jsx)("path", { d: type === 'player'
                            ? 'M 11 4 A 7 7 0 0 1 15.1145 16.66312'
                            : 'M 9 2 A 7 7 0 0 1 13.1145 14.66312', stroke: "white", strokeLinecap: "round", fill: "none", strokeWidth: 3 }) }) })] }));
};
exports.BufferingIndicator = BufferingIndicator;
