'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[569],
	{
		/***/ 8569:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				// ESM COMPAT FLAG
				__webpack_require__.r(__webpack_exports__);

				// EXPORTS
				__webpack_require__.d(__webpack_exports__, {
					default: () => /* binding */ src_ShadowCircles,
				});

				// EXTERNAL MODULE: ../../node_modules/.pnpm/react@17.0.2/node_modules/react/index.js
				var react = __webpack_require__(2386);
				// EXTERNAL MODULE: ../../node_modules/.pnpm/polished@4.1.3/node_modules/polished/dist/polished.esm.js + 9 modules
				var polished_esm = __webpack_require__(6416);
				// EXTERNAL MODULE: ../core/dist/index.js
				var dist = __webpack_require__(4783);
				// CONCATENATED MODULE: ./src/ShadowCircles/Circle.tsx

				const makeSquircle = (w = 100, h = 100, curvature = 0.5) => {
					const curveWidth = (w / 2) * (1 - curvature);
					const curveHeight = (h / 2) * (1 - curvature);
					return `
        M 0, ${h / 2}
        C 0, ${curveWidth} ${curveHeight}, 0 ${w / 2}, 0
        S ${w}, ${curveHeight} ${w}, ${h / 2}
            ${w - curveWidth}, ${h - 0} ${w / 2}, ${h}
            0, ${w - curveHeight} 0, ${h / 2}
    `;
				};
				const Circle = ({size}) => {
					const videoConfig = (0, dist.useVideoConfig)();
					const frame = (0, dist.useCurrentFrame)();
					const progress = (0, dist.spring)({
						config: {
							damping: 1e3,
							mass: 0.7,
							stiffness: 10,
							overshootClamping: false,
						},
						fps: videoConfig.fps,
						frame,
						from: 0,
						to: 1,
					});
					const angle = (0, dist.interpolate)(
						progress,
						[0, 1],
						[0, Math.PI * 2],
					);
					const squircleFactor = (0, dist.interpolate)(
						progress,
						[0, 1],
						[0.5, 1.05],
					);
					const radius = videoConfig.width / 2;
					const left = videoConfig.width / 2 - size / 2;
					const top = videoConfig.height / 2 - size / 2;
					const x = radius * Math.cos(angle) + radius;
					const y = -radius * Math.sin(angle) + radius;
					const amountToMove = (videoConfig.width - size) * (1 - progress);
					const shade = 1 - Math.min(1, size / videoConfig.width);
					const color = (0, polished_esm /* mix */.CD)(
						shade * 0.1,
						'#000',
						'#fff',
					);
					return /* @__PURE__ */ react.createElement(
						'svg',
						{
							viewBox: `0 0 ${size} ${size}`,
							width: size,
							height: size,
							style: {
								position: 'absolute',
								left: left + amountToMove * x * 3e-4,
								top: top + amountToMove * y * 3e-4,
								WebkitFilter: 'drop-shadow(0 0 5px #5851db)',
							},
						},
						/* @__PURE__ */ react.createElement('path', {
							d: makeSquircle(size, size, squircleFactor),
							fill: color,
						}),
					);
				};
				// CONCATENATED MODULE: ./src/ShadowCircles/index.tsx

				const ShadowCircles = () => {
					return /* @__PURE__ */ react.createElement(
						'div',
						{
							style: {flex: 1, backgroundColor: 'white'},
						},
						/* @__PURE__ */ react.createElement(Circle, {
							size: 2400,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 2e3,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 1800,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 1600,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 1400,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 1200,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 1e3,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 800,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 600,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 400,
						}),
						/* @__PURE__ */ react.createElement(Circle, {
							size: 200,
						}),
					);
				};
				/* harmony default export */ const src_ShadowCircles = ShadowCircles;

				/***/
			},
	},
]);
//# sourceMappingURL=569.bundle.js.map
