'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[268],
	{
		/***/ 7268:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				__webpack_require__.r(__webpack_exports__);
				/* harmony export */ __webpack_require__.d(__webpack_exports__, {
					/* harmony export */ DropDots: () => /* binding */ DropDots,
					/* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
					/* harmony export */
				});
				/* harmony import */ var polished__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(6416);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_0___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_0__,
					);
				var __defProp = Object.defineProperty;
				var __defProps = Object.defineProperties;
				var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
				var __getOwnPropSymbols = Object.getOwnPropertySymbols;
				var __hasOwnProp = Object.prototype.hasOwnProperty;
				var __propIsEnum = Object.prototype.propertyIsEnumerable;
				var __defNormalProp = (obj, key, value) =>
					key in obj
						? __defProp(obj, key, {
								enumerable: true,
								configurable: true,
								writable: true,
								value,
							})
						: (obj[key] = value);
				var __spreadValues = (a, b) => {
					for (var prop in b || (b = {}))
						if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
					if (__getOwnPropSymbols)
						for (var prop of __getOwnPropSymbols(b)) {
							if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
						}
					return a;
				};
				var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

				const gradients = [
					['#845ec2', '#ff5e78'],
					['rgb(40, 150, 114)', '#e6dd3b'],
					['#e48900', '#be0000'],
					['#fff600', '#f48b2a'],
					['#23689b', '#487e95'],
					['#9d0391', '#120078'],
				];
				const DropDots = ({opacity, volume}) => {
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_0__.useCurrentFrame)();
					const cycle = 15;
					const iteration = Math.floor(frame / cycle);
					const {height, width} = (0,
					remotion__WEBPACK_IMPORTED_MODULE_0__.useVideoConfig)();
					const dots = new Array(false ? 0 : 45).fill(true).map((x, i) => {
						const startX =
							(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
								`x-${i}-${iteration}`,
							) * width;
						const startY =
							(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
								`y-${i}-${iteration}`,
							) * height;
						const startRotation =
							(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
								`rotation-${i}-${iteration}`,
							) * 360;
						return {
							startX,
							endX:
								startX +
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
									(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
										`x-end-${i}-${iteration}`,
									),
									[0, 1],
									[-600, 600],
								),
							startY,
							endY:
								startY +
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
									(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
										`y-end-${i}-${iteration}`,
									),
									[0, 1],
									[-600, 600],
								),
							startRotation,
							endRotation:
								startRotation +
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
									(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
										`rotatad-${i}`,
									),
									[0, 1],
									[-180, 180],
								),
							size: (0, remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
									`size-${i}-${iteration}`,
								),
								[0, 0.9, 0.901, 1],
								[40, 40, 160, 160],
							),
							background:
								gradients[
									Math.floor(
										(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
											`color-${i}-${iteration}`,
										) * gradients.length,
									)
								],
							opacity: (0, remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
									`opacity-${i}-${iteration}`,
								),
								[0, 1],
								[0.83, 0.95],
							),
							gradId: (0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
								`gradient-${i}-${iteration}`,
							),
							hasShine:
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
									`shine-${i}`,
								) > 0.6,
							shineOpacity:
								(0, remotion__WEBPACK_IMPORTED_MODULE_0__.random)(
									`shine-opacity-${i}-${iteration}`,
								) * 0.7,
						};
					});
					const progress = (0,
					remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
						frame % cycle,
						[0, cycle],
						[0, 1],
					);
					return /* @__PURE__ */ React.createElement(
						'div',
						{
							style: {width, height, opacity},
						},
						dots.map((d) => {
							const left = (0,
							remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
								progress,
								[0, 1],
								[d.startX, d.endX],
							);
							const top = (0,
							remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
								progress,
								[0, 1],
								[d.startY, d.endY],
							);
							const rotate = (0,
							remotion__WEBPACK_IMPORTED_MODULE_0__.interpolate)(
								progress,
								[0, 1],
								[d.startRotation, d.endRotation],
							);
							return /* @__PURE__ */ React.createElement(
								'div',
								{
									style: {
										position: 'absolute',
										left,
										top,
										transform: `rotate(${rotate}deg)`,
									},
								},
								/* @__PURE__ */ React.createElement(
									'svg',
									{
										style: {
											width: d.size * 2,
											height: d.size * 40,
											position: 'absolute',
											top: 0,
										},
										preserveAspectRatio: 'none',
										viewBox: '0 0 200 4000',
									},
									/* @__PURE__ */ React.createElement(
										'defs',
										null,
										/* @__PURE__ */ React.createElement(
											'filter',
											{
												id: 'f1',
												x: '0',
												y: '0',
											},
											/* @__PURE__ */ React.createElement('feGaussianBlur', {
												in: 'SourceGraphic',
												stdDeviation: '10',
											}),
										),
										/* @__PURE__ */ React.createElement(
											'linearGradient',
											{
												id: `${d.gradId}`,
											},
											/* @__PURE__ */ React.createElement('stop', {
												stopColor: d.background[0],
												stopOpacity: d.shineOpacity * volume,
												offset: 0,
											}),
											/* @__PURE__ */ React.createElement('stop', {
												stopColor: d.background[1],
												stopOpacity: 0.11 * volume,
												offset: 1,
											}),
										),
									),
									d.hasShine
										? /* @__PURE__ */ React.createElement('path', {
												d: 'M 50 50 L 0 4000 L 200 4000 z',
												fill: `url(#${d.gradId})`,
												filter: 'url(#f1)',
											})
										: null,
								),
								/* @__PURE__ */ React.createElement(
									'div',
									{
										style: __spreadProps(
											__spreadValues(
												{
													height: d.size,
													width: d.size,
													borderRadius: d.size / 2,
													opacity: d.opacity,
													zIndex: d.size,
												},
												(0,
												polished__WEBPACK_IMPORTED_MODULE_1__ /* .linearGradient */.bC)(
													{
														colorStops: d.background,
													},
												),
											),
											{
												boxShadow: `0 0 60px ${
													(0,
													polished__WEBPACK_IMPORTED_MODULE_1__ /* .linearGradient */.bC)(
														{
															colorStops: d.background,
														},
													).backgroundColor
												}`,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											},
										),
									},
									/* @__PURE__ */ React.createElement(
										remotion__WEBPACK_IMPORTED_MODULE_0__.Img,
										{
											style: {
												height: (d.size / 3) * 2,
												width: (d.size / 3) * 2,
												marginLeft: d.size * 0.05,
												opacity: 0.55,
											},
											src: 'https://github.com/remotion-dev/logo/blob/main/monochromatic/element-0.png?raw=true',
										},
									),
								),
							);
						}),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
					DropDots;

				/***/
			},
	},
]);
//# sourceMappingURL=268.bundle.js.map
