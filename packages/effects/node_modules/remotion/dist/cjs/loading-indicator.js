"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loading = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const AbsoluteFill_js_1 = require("./AbsoluteFill.js");
const rotate = {
    transform: `rotate(90deg)`,
};
const ICON_SIZE = 40;
const label = {
    color: 'white',
    fontSize: 14,
    fontFamily: 'sans-serif',
};
const container = {
    justifyContent: 'center',
    alignItems: 'center',
};
const Loading = () => {
    return ((0, jsx_runtime_1.jsxs)(AbsoluteFill_js_1.AbsoluteFill, { style: container, id: "remotion-comp-loading", children: [(0, jsx_runtime_1.jsx)("style", { type: "text/css", children: `
				@keyframes anim {
					from {
						opacity: 0
					}
					to {
						opacity: 1
					}
				}
				#remotion-comp-loading {
					animation: anim 2s;
					animation-fill-mode: forwards;
				}
			` }), (0, jsx_runtime_1.jsx)("svg", { width: ICON_SIZE, height: ICON_SIZE, viewBox: "-100 -100 400 400", style: rotate, children: (0, jsx_runtime_1.jsx)("path", { fill: "#555", stroke: "#555", strokeWidth: "100", strokeLinejoin: "round", d: "M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z" }) }), (0, jsx_runtime_1.jsxs)("p", { style: label, children: ["Resolving ", '<Suspense>', "..."] })] }));
};
exports.Loading = Loading;
