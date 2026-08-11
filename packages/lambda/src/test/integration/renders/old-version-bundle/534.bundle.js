(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[534],
	{
		/***/ 534:
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
				/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(2386);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_3__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_3___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_3__,
					);
				/* harmony import */ var _resources_framer_music_mp4__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(9951);
				/* harmony import */ var _resources_framer_music_mp4__WEBPACK_IMPORTED_MODULE_1___default =
					/*#__PURE__*/ __webpack_require__.n(
						_resources_framer_music_mp4__WEBPACK_IMPORTED_MODULE_1__,
					);
				/* harmony import */ var _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2__ =
					__webpack_require__(7120);
				/* harmony import */ var _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default =
					/*#__PURE__*/ __webpack_require__.n(
						_resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2__,
					);

				const AudioTestingMute = () => {
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_3__.useCurrentFrame)();
					const {fps} = (0,
					remotion__WEBPACK_IMPORTED_MODULE_3__.useVideoConfig)();
					const getMuteState = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
						(type) => {
							const muteParts = [
								{start: 1 * fps, end: 2 * fps},
								{start: 4 * fps, end: 5 * fps},
							];
							const toMute = muteParts.some(
								(mp) => frame >= mp.start && frame <= mp.end,
							);
							return type == 'movie' ? toMute : !toMute;
						},
						[fps, frame],
					);
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						'div',
						null,
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_3__.Video,
							{
								src: _resources_framer_music_mp4__WEBPACK_IMPORTED_MODULE_1___default(),
								muted: getMuteState('movie'),
							},
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_3__.Sequence,
							{
								from: 20,
								durationInFrames: 200,
							},
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								remotion__WEBPACK_IMPORTED_MODULE_3__.Sequence,
								{
									from: 20,
									durationInFrames: 200,
								},
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									remotion__WEBPACK_IMPORTED_MODULE_3__.Sequence,
									{
										from: 20,
										durationInFrames: 200,
									},
									/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
										remotion__WEBPACK_IMPORTED_MODULE_3__.Sequence,
										{
											from: 20,
											durationInFrames: 200,
										},
										/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
											remotion__WEBPACK_IMPORTED_MODULE_3__.Sequence,
											{
												from: 20,
												durationInFrames: 200,
											},
											/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
												remotion__WEBPACK_IMPORTED_MODULE_3__.Audio,
												{
													src: _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default(),
													muted: getMuteState('music'),
												},
											),
											/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
												remotion__WEBPACK_IMPORTED_MODULE_3__.Audio,
												{
													src: _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default(),
													muted: getMuteState('music'),
												},
											),
											/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
												remotion__WEBPACK_IMPORTED_MODULE_3__.Audio,
												{
													src: _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default(),
													muted: getMuteState('music'),
												},
											),
										),
									),
								),
							),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
					AudioTestingMute;

				/***/
			},

		/***/ 7120:
			/***/ (module, __unused_webpack_exports, __webpack_require__) => {
				module.exports =
					__webpack_require__.p + 'a2f36e3a48b4989e0da1fea9959fb35f.mp3';

				/***/
			},
	},
]);
//# sourceMappingURL=534.bundle.js.map
