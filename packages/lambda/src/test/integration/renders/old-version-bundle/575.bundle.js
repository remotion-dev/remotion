'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[575],
	{
		/***/ 7575:
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
				/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(2386);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_1___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_1__,
					);

				const NestedSequences = () => {
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						remotion__WEBPACK_IMPORTED_MODULE_1__.Sequence,
						{
							from: 20,
							durationInFrames: 40,
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							NestedTwo,
							null,
						),
					);
				};
				const NestedTwo = () => {
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						remotion__WEBPACK_IMPORTED_MODULE_1__.Sequence,
						{
							from: 20,
							durationInFrames: 60,
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							Child,
							null,
						),
					);
				};
				const Child = () => {
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_1__.useCurrentFrame)();
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						'div',
						{
							style: {
								backgroundColor: 'white',
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
								display: 'flex',
								fontSize: 50,
							},
						},
						frame,
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
					NestedSequences;

				/***/
			},
	},
]);
//# sourceMappingURL=575.bundle.js.map
