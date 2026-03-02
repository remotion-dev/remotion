(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[378],
	{
		/***/ 8378:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				'use strict';
				__webpack_require__.r(__webpack_exports__);
				/* harmony export */ __webpack_require__.d(__webpack_exports__, {
					/* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
					/* harmony export */
				});
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_1___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_1__,
					);
				/* harmony import */ var _music_mp3__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(1747);
				/* harmony import */ var _music_mp3__WEBPACK_IMPORTED_MODULE_0___default =
					/*#__PURE__*/ __webpack_require__.n(
						_music_mp3__WEBPACK_IMPORTED_MODULE_0__,
					);

				const AudioTesting = () => {
					return /* @__PURE__ */ React.createElement(
						'div',
						null,
						/* @__PURE__ */ React.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_1__.Sequence,
							{
								from: 100,
								durationInFrames: 100,
							},
							/* @__PURE__ */ React.createElement(
								remotion__WEBPACK_IMPORTED_MODULE_1__.Audio,
								{
									startFrom: 100,
									endAt: 200,
									src: _music_mp3__WEBPACK_IMPORTED_MODULE_0___default(),
									volume: (f) =>
										(0, remotion__WEBPACK_IMPORTED_MODULE_1__.interpolate)(
											f,
											[0, 50, 100],
											[0, 1, 0],
											{
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											},
										),
								},
							),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
					AudioTesting;

				/***/
			},

		/***/ 1747:
			/***/ (module, __unused_webpack_exports, __webpack_require__) => {
				module.exports =
					__webpack_require__.p + 'bff822b868a2b87b31877f3606c9cc13.mp3';

				/***/
			},
	},
]);
//# sourceMappingURL=378.bundle.js.map
