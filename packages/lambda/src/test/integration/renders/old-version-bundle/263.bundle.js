'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[263],
	{
		/***/ 5263:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				__webpack_require__.r(__webpack_exports__);
				/* harmony export */ __webpack_require__.d(__webpack_exports__, {
					/* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
					/* harmony export */
				});
				/* harmony import */ var polished__WEBPACK_IMPORTED_MODULE_3__ =
					__webpack_require__(6416);
				/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(2386);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_2__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_2___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_2__,
					);
				/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(2922);
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

				const Container = styled_components__WEBPACK_IMPORTED_MODULE_1__ /* ["default"].div */
					.ZP.div`
	background-color: white;
	flex: 1;
`;
				const Label = styled_components__WEBPACK_IMPORTED_MODULE_1__ /* ["default"].div */
					.ZP.div`
	font-size: 260px;
	color: black;
	font-weight: 700;
	font-family: 'SF Pro Text';
	text-align: center;
	transform: scaleX(1);
	line-height: 1em;
`;
				const StaggerType = () => {
					const types = 4;
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_2__.useCurrentFrame)();
					const videoConfig = (0,
					remotion__WEBPACK_IMPORTED_MODULE_2__.useVideoConfig)();
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						Container,
						{
							style: {
								flex: 1,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							},
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							null,
							new Array(types)
								.fill(true)
								.map((_, i) => {
									return i;
								})
								.map((i) => {
									const ratio = i / types;
									const isSecondHalf = frame > videoConfig.durationInFrames / 2;
									const opacity =
										frame / (videoConfig.durationInFrames / 2) > ratio;
									const stroking = (() => {
										if (!isSecondHalf) {
											return i % 2 === 0;
										}
										return Math.ceil(frame / 10) % 2 === i % 2;
									})();
									const color = (0,
									polished__WEBPACK_IMPORTED_MODULE_3__ /* .mix */.CD)(
										ratio,
										'#fff',
										'#000',
									);
									return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
										Label,
										{
											key: i,
											style: __spreadProps(
												__spreadValues(
													{},
													stroking
														? {}
														: {
																WebkitTextStrokeColor: color,
																WebkitTextStrokeWidth: 8,
																WebkitTextFillColor: 'white',
															},
												),
												{
													opacity: Number(opacity),
													width: 2e3,
													marginLeft: -(2e3 - videoConfig.width) / 2,
													marginTop: -20,
												},
											),
										},
										'beta',
									);
								}),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
					StaggerType;

				/***/
			},
	},
]);
//# sourceMappingURL=263.bundle.js.map
