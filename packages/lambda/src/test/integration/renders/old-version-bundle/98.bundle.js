'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[98],
	{
		/***/ 9098:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				__webpack_require__.r(__webpack_exports__);
				/* harmony export */ __webpack_require__.d(__webpack_exports__, {
					/* harmony export */ Title: () => /* binding */ Title,
					/* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
					/* harmony export */
				});
				/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(2386);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_1___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_1__,
					);

				const Title = ({line1, line2}) => {
					const {fps} = (0,
					remotion__WEBPACK_IMPORTED_MODULE_1__.useVideoConfig)();
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_1__.useCurrentFrame)();
					const springConfig = {
						damping: 10,
						mass: 0.1,
						stiffness: 100,
						overshootClamping: false,
					};
					const firstWord = (0, remotion__WEBPACK_IMPORTED_MODULE_1__.spring)({
						config: springConfig,
						from: 0,
						to: 1,
						fps,
						frame,
					});
					const secondWord = (0, remotion__WEBPACK_IMPORTED_MODULE_1__.spring)({
						config: springConfig,
						frame: Math.max(0, frame - 5),
						from: 0,
						to: 1,
						fps,
					});
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						'div',
						{
							style: {
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
								display: 'flex',
								backgroundColor: 'white',
								textAlign: 'center',
							},
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							{
								style: {
									fontSize: 110,
									fontWeight: 'bold',
									fontFamily: 'SF Pro Text',
								},
							},
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								'span',
								{
									style: {
										display: 'inline-block',
										transform: `scale(${firstWord})`,
									},
								},
								line1,
							),
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								'span',
								{
									style: {
										transform: `scale(${secondWord})`,
										display: 'inline-block',
									},
								},
								' ',
								line2,
							),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Title;

				/***/
			},
	},
]);
//# sourceMappingURL=98.bundle.js.map
