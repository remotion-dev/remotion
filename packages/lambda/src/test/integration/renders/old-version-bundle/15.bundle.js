(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[15, 268],
	{
		/***/ 9015:
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
				/* harmony import */ var _remotion_media_utils__WEBPACK_IMPORTED_MODULE_5__ =
					__webpack_require__(8006);
				/* harmony import */ var _remotion_media_utils__WEBPACK_IMPORTED_MODULE_5___default =
					/*#__PURE__*/ __webpack_require__.n(
						_remotion_media_utils__WEBPACK_IMPORTED_MODULE_5__,
					);
				/* harmony import */ var polished__WEBPACK_IMPORTED_MODULE_6__ =
					__webpack_require__(6416);
				/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(2386);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_4__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_4___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_4__,
					);
				/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_3__ =
					__webpack_require__(2922);
				/* harmony import */ var _DropDots_DropDots__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(7268);
				/* harmony import */ var _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2__ =
					__webpack_require__(7120);
				/* harmony import */ var _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default =
					/*#__PURE__*/ __webpack_require__.n(
						_resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2__,
					);

				const Background = (0,
				styled_components__WEBPACK_IMPORTED_MODULE_3__ /* ["default"] */.ZP)(
					remotion__WEBPACK_IMPORTED_MODULE_4__.Img,
				)`
	height: 100%;
	width: 120%;
	margin-left: -15%;
`;
				const Blur = (0,
				styled_components__WEBPACK_IMPORTED_MODULE_3__ /* ["default"] */.ZP)(
					remotion__WEBPACK_IMPORTED_MODULE_4__.AbsoluteFill,
				)`
	backdrop-filter: blur(5px);
`;
				const FullSize = (0,
				styled_components__WEBPACK_IMPORTED_MODULE_3__ /* ["default"] */.ZP)(
					remotion__WEBPACK_IMPORTED_MODULE_4__.AbsoluteFill,
				)`
	display: flex;
	justify-content: center;
	align-items: center;
`;
				const Orb = styled_components__WEBPACK_IMPORTED_MODULE_3__ /* ["default"].div */
					.ZP.div`
	height: 400px;
	width: 400px;
	border-radius: 200px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 70px;
	font-family: --apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
		Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	font-weight: bold;
	text-transform: lowercase;
	flex-direction: column;
`;
				const Text = ({color, transform, blur}) => {
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_4__.useCurrentFrame)();
					const cool = (offset) => Math.sin((frame + offset) / 10);
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						remotion__WEBPACK_IMPORTED_MODULE_4__.AbsoluteFill,
						{
							style: {
								textAlign: 'center',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								color,
								transform,
								filter: `blur(${blur}px)`,
							},
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							{
								style: {
									transform: `translateY(${cool(0) * 8}px)`,
								},
							},
							'Remotion',
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							{
								style: {
									transform: `translateY(${cool(5) * 8}px)`,
								},
							},
							'Nation',
						),
					);
				};
				const AudioVisualization = () => {
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_4__.useCurrentFrame)();
					const {width, height, fps} = (0,
					remotion__WEBPACK_IMPORTED_MODULE_4__.useVideoConfig)();
					const audioData = (0,
					_remotion_media_utils__WEBPACK_IMPORTED_MODULE_5__.useAudioData)(
						_resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default(),
					);
					if (!audioData) {
						return null;
					}
					const visualization = (0,
					_remotion_media_utils__WEBPACK_IMPORTED_MODULE_5__.visualizeAudio)({
						fps,
						frame,
						audioData,
						numberOfSamples: 32,
					});
					const scale =
						1 +
						(0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
							visualization[1],
							[0.14, 1],
							[0, 0.6],
							{
								extrapolateLeft: 'clamp',
							},
						);
					const backgroundScale =
						1 +
						(0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
							visualization[visualization.length - 1],
							[0, 0.7],
							[0, 1],
						);
					const circlesOut = visualization.slice(4);
					const rgbEffect = (0,
					remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
						visualization[Math.floor(visualization.length / 3)],
						[0, 0.5],
						[0, 30],
					);
					const dropStart = 1989;
					const dropEnd = 3310;
					const dayInterpolation = [
						dropStart - 5,
						dropStart,
						dropEnd,
						dropEnd + 5,
					];
					const day = (0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
						frame,
						dayInterpolation,
						[1, 0, 0, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					);
					const night = (0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
						frame,
						dayInterpolation,
						[0, 1, 1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					);
					const orbRgb = Math.round(
						(0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
							day,
							[0, 1],
							[30, 255],
						),
					);
					const textRgb = Math.round(
						(0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
							night,
							[0, 1],
							[0, 255],
						),
					);
					const orbBackground = `rgb(${orbRgb}, ${orbRgb}, ${orbRgb})`;
					const textColor = `rgba(${textRgb}, ${textRgb}, ${textRgb}, 0.8)`;
					const onlySeconds = circlesOut.filter((x, i) => i % 2 === 0);
					const circlesToUse = [...onlySeconds, ...onlySeconds];
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						'div',
						{
							style: {flex: 1},
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_4__.AbsoluteFill,
							null,
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								remotion__WEBPACK_IMPORTED_MODULE_4__.AbsoluteFill,
								null,
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									Background,
									{
										style: {
											transform: `scale(${backgroundScale})`,
											opacity: night,
										},
										src: 'https://fast-cdn.dynamicwallpaper.club/wallpapers%2Feq8ggec3apr%2Fthumbs%2F800%2F0.jpg?generation=1614257969409557&alt=media',
									},
								),
							),
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								remotion__WEBPACK_IMPORTED_MODULE_4__.AbsoluteFill,
								null,
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									Background,
									{
										style: {
											transform: `scale(${backgroundScale})`,
											opacity: day,
										},
										src: 'https://fast-cdn.dynamicwallpaper.club/wallpapers%2Feq8ggec3apr%2Fthumbs%2F800%2F4.jpg?generation=1614257969529252&alt=media',
									},
								),
							),
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							Blur,
							null,
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							_DropDots_DropDots__WEBPACK_IMPORTED_MODULE_1__['default'],
							{
								opacity: night,
								volume: (0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
									visualization[1],
									[0, 0.24],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
									},
								),
							},
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_4__.Audio,
							{
								src: _resources_sound1_mp3__WEBPACK_IMPORTED_MODULE_2___default(),
							},
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							FullSize,
							null,
							circlesToUse.map((v, i) => {
								const leftNeighbour =
									i === circlesToUse.length - 1
										? circlesToUse[0]
										: circlesToUse[i + 1];
								const rightNeighbour =
									i === 0
										? circlesToUse[circlesToUse.length - 1]
										: circlesToUse[i - 1];
								const a = (i / circlesToUse.length) * Math.PI * 2;
								const offset =
									(300 +
										Math.log(
											(0, remotion__WEBPACK_IMPORTED_MODULE_4__.interpolate)(
												(v + leftNeighbour + rightNeighbour) / 3,
												[0, 1],
												[0, 1],
												{
													extrapolateLeft: 'clamp',
												},
											) * 600,
										) *
											6) *
									day;
								const x = Math.sin(a) * offset;
								const y = Math.cos(a) * offset;
								return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									'div',
									{
										style: {
											backgroundColor: 'white',
											height: 20,
											width: 20,
											borderRadius: 10,
											position: 'absolute',
											left: x + width / 2,
											top: y + height / 2,
										},
									},
								);
							}),
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								Orb,
								{
									style: {
										transform: `scale(${scale})`,
										backgroundColor: orbBackground,
										boxShadow: `0 0 50px ${(0, polished__WEBPACK_IMPORTED_MODULE_6__ /* .transparentize */.DZ)(0.5, textColor)}`,
									},
								},
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									Text,
									{
										blur: 2,
										color: 'rgba(255, 0, 0, 0.3)',
										transform: `translateY(${-rgbEffect}px) translateX(${rgbEffect * 2}px)`,
									},
								),
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									Text,
									{
										blur: 2,
										color: 'rgba(0, 255, 0, 0.3)',
										transform: `translateX(${rgbEffect * 3}px) translateY(${rgbEffect * 3}px)`,
									},
								),
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									Text,
									{
										blur: 2,
										color: 'rgba(0, 0, 255, 0.3)',
										transform: `translateX(${-rgbEffect * 3}px)`,
									},
								),
								/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
									Text,
									{
										blur: 0,
										color: textColor,
										transform: `translateY(${rgbEffect}px)`,
									},
								),
							),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
					AudioVisualization;

				/***/
			},

		/***/ 7268:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				'use strict';
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

		/***/ 7955:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.audioBufferToWav = void 0;
				function audioBufferToWav(buffer, opt) {
					const numChannels = buffer.numberOfChannels;
					const {sampleRate} = buffer;
					const format = opt.float32 ? 3 : 1;
					const bitDepth = format === 3 ? 32 : 16;
					let result;
					if (numChannels === 2) {
						result = interleave(
							buffer.getChannelData(0),
							buffer.getChannelData(1),
						);
					} else {
						result = buffer.getChannelData(0);
					}
					return encodeWAV({
						samples: result,
						format,
						sampleRate,
						numChannels,
						bitDepth,
					});
				}
				exports.audioBufferToWav = audioBufferToWav;
				function encodeWAV({
					samples,
					format,
					sampleRate,
					numChannels,
					bitDepth,
				}) {
					const bytesPerSample = bitDepth / 8;
					const blockAlign = numChannels * bytesPerSample;
					const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
					const view = new DataView(buffer);
					writeString(view, 0, 'RIFF');
					view.setUint32(4, 36 + samples.length * bytesPerSample, true);
					writeString(view, 8, 'WAVE');
					writeString(view, 12, 'fmt ');
					view.setUint32(16, 16, true);
					view.setUint16(20, format, true);
					view.setUint16(22, numChannels, true);
					view.setUint32(24, sampleRate, true);
					view.setUint32(28, sampleRate * blockAlign, true);
					view.setUint16(32, blockAlign, true);
					view.setUint16(34, bitDepth, true);
					writeString(view, 36, 'data');
					view.setUint32(40, samples.length * bytesPerSample, true);
					if (format === 1) {
						floatTo16BitPCM(view, 44, samples);
					} else {
						writeFloat32(view, 44, samples);
					}
					return buffer;
				}
				function interleave(inputL, inputR) {
					const length = inputL.length + inputR.length;
					const result = new Float32Array(length);
					let index = 0;
					let inputIndex = 0;
					while (index < length) {
						result[index++] = inputL[inputIndex];
						result[index++] = inputR[inputIndex];
						inputIndex++;
					}
					return result;
				}
				function writeFloat32(output, offset, input) {
					for (let i = 0; i < input.length; i++, offset += 4) {
						output.setFloat32(offset, input[i], true);
					}
				}
				function floatTo16BitPCM(output, offset, input) {
					for (let i = 0; i < input.length; i++, offset += 2) {
						const s = Math.max(-1, Math.min(1, input[i]));
						output.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
					}
				}
				function writeString(view, offset, string) {
					for (let i = 0; i < string.length; i++) {
						view.setUint8(offset + i, string.charCodeAt(i));
					}
				}

				/***/
			},

		/***/ 4675:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.audioBufferToDataUrl = void 0;
				const audio_buffer_to_wav_1 = __webpack_require__(7955);
				const audioBufferToDataUrl = (buffer) => {
					const wavAsArrayBuffer = (0, audio_buffer_to_wav_1.audioBufferToWav)(
						buffer,
						{
							float32: true,
						},
					);
					let binary = '';
					const bytes = new Uint8Array(wavAsArrayBuffer);
					const len = bytes.byteLength;
					for (let i = 0; i < len; i++) {
						binary += String.fromCharCode(bytes[i]);
					}
					return 'data:audio/wav;base64,' + window.btoa(binary);
				};
				exports.audioBufferToDataUrl = audioBufferToDataUrl;

				/***/
			},

		/***/ 4273:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.complexMagnitude =
					exports.complexMultiply =
					exports.complexSubtract =
					exports.complexAdd =
						void 0;
				const complexAdd = function (a, b) {
					return [a[0] + b[0], a[1] + b[1]];
				};
				exports.complexAdd = complexAdd;
				const complexSubtract = function (a, b) {
					return [a[0] - b[0], a[1] - b[1]];
				};
				exports.complexSubtract = complexSubtract;
				const complexMultiply = function (a, b) {
					return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
				};
				exports.complexMultiply = complexMultiply;
				const complexMagnitude = function (c) {
					return Math.sqrt(c[0] * c[0] + c[1] * c[1]);
				};
				exports.complexMagnitude = complexMagnitude;

				/***/
			},

		/***/ 7400:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.exponent = void 0;
				const mapExponent = {};
				const exponent = function (k, N) {
					const x = -2 * Math.PI * (k / N);
					mapExponent[N] = mapExponent[N] || {};
					mapExponent[N][k] = mapExponent[N][k] || [Math.cos(x), Math.sin(x)];
					return mapExponent[N][k];
				};
				exports.exponent = exponent;

				/***/
			},

		/***/ 7541:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.fft = void 0;
				const complex_1 = __webpack_require__(4273);
				const exponent_1 = __webpack_require__(7400);
				const fft = function (vector) {
					const X = [];
					const N = vector.length;
					if (N === 1) {
						if (Array.isArray(vector[0])) {
							return [[vector[0][0], vector[0][1]]];
						}
						return [[vector[0], 0]];
					}
					const X_evens = (0, exports.fft)(
						vector.filter((_, ix) => ix % 2 === 0),
					);
					const X_odds = (0, exports.fft)(
						vector.filter((__, ix) => ix % 2 === 1),
					);
					for (let k = 0; k < N / 2; k++) {
						const t = X_evens[k];
						const e = (0, complex_1.complexMultiply)(
							(0, exponent_1.exponent)(k, N),
							X_odds[k],
						);
						X[k] = (0, complex_1.complexAdd)(t, e);
						X[k + N / 2] = (0, complex_1.complexSubtract)(t, e);
					}
					return X;
				};
				exports.fft = fft;

				/***/
			},

		/***/ 5447:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getVisualization = void 0;
				const fft_1 = __webpack_require__(7541);
				const mag_1 = __webpack_require__(4471);
				const smoothing_1 = __webpack_require__(9401);
				const to_int_16_1 = __webpack_require__(9445);
				const getVisualization = ({
					sampleSize,
					data,
					sampleRate,
					frame,
					fps,
					maxInt,
				}) => {
					const isPowerOfTwo =
						sampleSize > 0 && (sampleSize & (sampleSize - 1)) === 0;
					if (!isPowerOfTwo) {
						throw new TypeError(
							`The argument "bars" must be a power of two. For example: 64, 128. Got instead: ${sampleSize}`,
						);
					}
					if (!fps) {
						throw new TypeError('The argument "fps" was not provided');
					}
					if (data.length < sampleSize) {
						throw new TypeError(
							'Audio data is not big enough to provide ' +
								sampleSize +
								' bars.',
						);
					}
					const start = Math.floor((frame / fps) * sampleRate);
					const actualStart = Math.max(0, start - sampleSize / 2);
					const ints = new Int16Array({
						length: sampleSize,
					});
					ints.set(
						data
							.subarray(actualStart, actualStart + sampleSize)
							.map((x) => (0, to_int_16_1.toInt16)(x)),
					);
					const phasors = (0, fft_1.fft)(ints);
					const magnitudes = (0, mag_1.fftMag)(phasors).map((p) => p);
					return (0, smoothing_1.smoothen)(magnitudes).map(
						(m) => m / (sampleSize / 2) / maxInt,
					);
				};
				exports.getVisualization = getVisualization;

				/***/
			},

		/***/ 4471:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.fftMag = void 0;
				const complex_1 = __webpack_require__(4273);
				const fftMag = function (fftBins) {
					const ret = fftBins.map((f) => (0, complex_1.complexMagnitude)(f));
					return ret.slice(0, ret.length / 2);
				};
				exports.fftMag = fftMag;

				/***/
			},

		/***/ 7581:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getMaxPossibleMagnitude = void 0;
				const to_int_16_1 = __webpack_require__(9445);
				const getMax = (array) => {
					let max = 0;
					for (let i = 0; i < array.length; i++) {
						const val = array[i];
						if (val > max) {
							max = val;
						}
					}
					return max;
				};
				const cache = {};
				const getMaxPossibleMagnitude = (metadata) => {
					if (cache[metadata.resultId]) {
						return cache[metadata.resultId];
					}
					const result = (0, to_int_16_1.toInt16)(
						getMax(metadata.channelWaveforms[0]),
					);
					cache[metadata.resultId] = result;
					return result;
				};
				exports.getMaxPossibleMagnitude = getMaxPossibleMagnitude;

				/***/
			},

		/***/ 9401:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.smoothen = void 0;
				const smoothingPasses = 3;
				const smoothingPoints = 3;
				const smoothen = function (array) {
					let lastArray = array;
					const newArr = [];
					for (let pass = 0; pass < smoothingPasses; pass++) {
						const sidePoints = Math.floor(smoothingPoints / 2);
						const cn = 1 / (2 * sidePoints + 1);
						for (let i = 0; i < sidePoints; i++) {
							newArr[i] = lastArray[i];
							newArr[lastArray.length - i - 1] =
								lastArray[lastArray.length - i - 1];
						}
						for (let i = sidePoints; i < lastArray.length - sidePoints; i++) {
							let sum = 0;
							for (let n = -sidePoints; n <= sidePoints; n++) {
								sum += cn * lastArray[i + n] + n;
							}
							newArr[i] = sum;
						}
						lastArray = newArr;
					}
					return newArr;
				};
				exports.smoothen = smoothen;

				/***/
			},

		/***/ 9445:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.toInt16 = void 0;
				const toInt16 = (x) => (x > 0 ? x * 32767 : x * 32768);
				exports.toInt16 = toInt16;

				/***/
			},

		/***/ 889:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getAudioData = void 0;
				const is_remote_asset_1 = __webpack_require__(6104);
				const metadataCache = {};
				const getAudioData = async (src) => {
					if (metadataCache[src]) {
						return metadataCache[src];
					}
					const audioContext = new AudioContext();
					const response = await fetch(src);
					const arrayBuffer = await response.arrayBuffer();
					const wave = await audioContext.decodeAudioData(arrayBuffer);
					const channelWaveforms = new Array(wave.numberOfChannels)
						.fill(true)
						.map((_, channel) => {
							return wave.getChannelData(channel);
						});
					const metadata = {
						channelWaveforms,
						sampleRate: audioContext.sampleRate,
						durationInSeconds: wave.duration,
						numberOfChannels: wave.numberOfChannels,
						resultId: String(Math.random()),
						isRemote: (0, is_remote_asset_1.isRemoteAsset)(src),
					};
					metadataCache[src] = metadata;
					return metadata;
				};
				exports.getAudioData = getAudioData;

				/***/
			},

		/***/ 4447:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getAudioDuration = void 0;
				const getAudioDuration = (src) => {
					const audio = document.createElement('audio');
					audio.src = src;
					return new Promise((resolve, reject) => {
						const onError = () => {
							reject(audio.error);
							cleanup();
						};
						const onLoadedMetadata = () => {
							resolve(audio.duration);
							cleanup();
						};
						const cleanup = () => {
							audio.removeEventListener('loadedmetadata', onLoadedMetadata);
							audio.removeEventListener('error', onError);
						};
						audio.addEventListener('loadedmetadata', onLoadedMetadata, {
							once: true,
						});
						audio.addEventListener('error', onError, {once: true});
					});
				};
				exports.getAudioDuration = getAudioDuration;

				/***/
			},

		/***/ 7621:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getVideoMetadata = void 0;
				const is_remote_asset_1 = __webpack_require__(6104);
				const cache = {};
				const getVideoMetadata = async (src) => {
					if (cache[src]) {
						return cache[src];
					}
					const video = document.createElement('video');
					video.src = src;
					return new Promise((resolve, reject) => {
						const onError = () => {
							reject(video.error);
							cleanup();
						};
						const onLoadedMetadata = () => {
							const metadata = {
								durationInSeconds: video.duration,
								width: video.videoWidth,
								height: video.videoHeight,
								aspectRatio: video.videoWidth / video.videoHeight,
								isRemote: (0, is_remote_asset_1.isRemoteAsset)(src),
							};
							resolve(metadata);
							cache[src] = metadata;
							cleanup();
						};
						const cleanup = () => {
							video.removeEventListener('loadedmetadata', onLoadedMetadata);
							video.removeEventListener('error', onError);
						};
						video.addEventListener('loadedmetadata', onLoadedMetadata, {
							once: true,
						});
						video.addEventListener('error', onError, {once: true});
					});
				};
				exports.getVideoMetadata = getVideoMetadata;

				/***/
			},

		/***/ 1579:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getWaveformSamples = void 0;
				const filterData = (audioBuffer, samples) => {
					const blockSize = Math.floor(audioBuffer.length / samples);
					if (blockSize === 0) {
						return [];
					}
					const filteredData = [];
					for (let i = 0; i < samples; i++) {
						const blockStart = blockSize * i;
						let sum = 0;
						for (let j = 0; j < blockSize; j++) {
							sum += Math.abs(audioBuffer[blockStart + j]);
						}
						filteredData.push(sum / blockSize);
					}
					return filteredData;
				};
				const normalizeData = (filteredData) => {
					const multiplier = Math.max(...filteredData) ** -1;
					return filteredData.map((n) => n * multiplier);
				};
				const getWaveformSamples = (waveform, sampleAmount) => {
					return normalizeData(filterData(waveform, sampleAmount));
				};
				exports.getWaveformSamples = getWaveformSamples;

				/***/
			},

		/***/ 5699:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.getWaveformPortion = void 0;
				const get_wave_form_samples_1 = __webpack_require__(1579);
				const getWaveformPortion = ({
					audioData,
					startTimeInSeconds,
					durationInSeconds,
					numberOfSamples,
				}) => {
					const startSample = Math.floor(
						(startTimeInSeconds / audioData.durationInSeconds) *
							audioData.channelWaveforms[0].length,
					);
					const endSample = Math.floor(
						((startTimeInSeconds + durationInSeconds) /
							audioData.durationInSeconds) *
							audioData.channelWaveforms[0].length,
					);
					return (0, get_wave_form_samples_1.getWaveformSamples)(
						audioData.channelWaveforms[0].slice(startSample, endSample),
						numberOfSamples,
					).map((w, i) => {
						return {
							index: i,
							amplitude: w,
						};
					});
				};
				exports.getWaveformPortion = getWaveformPortion;

				/***/
			},

		/***/ 8006:
			/***/ function (__unused_webpack_module, exports, __webpack_require__) {
				'use strict';

				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === void 0) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
							}
						: function (o, m, k, k2) {
								if (k2 === void 0) k2 = k;
								o[k2] = m[k];
							});
				var __exportStar =
					(this && this.__exportStar) ||
					function (m, exports2) {
						for (var p in m)
							if (
								p !== 'default' &&
								!Object.prototype.hasOwnProperty.call(exports2, p)
							)
								__createBinding(exports2, m, p);
					};
				Object.defineProperty(exports, '__esModule', {value: true});
				exports.audioBufferToDataUrl =
					exports.visualizeAudio =
					exports.useAudioData =
					exports.getWaveformPortion =
					exports.getVideoMetadata =
					exports.getAudioDuration =
					exports.getAudioData =
						void 0;
				var get_audio_data_1 = __webpack_require__(889);
				Object.defineProperty(exports, 'getAudioData', {
					enumerable: true,
					get: function () {
						return get_audio_data_1.getAudioData;
					},
				});
				var get_audio_duration_1 = __webpack_require__(4447);
				Object.defineProperty(exports, 'getAudioDuration', {
					enumerable: true,
					get: function () {
						return get_audio_duration_1.getAudioDuration;
					},
				});
				var get_video_metadata_1 = __webpack_require__(7621);
				Object.defineProperty(exports, 'getVideoMetadata', {
					enumerable: true,
					get: function () {
						return get_video_metadata_1.getVideoMetadata;
					},
				});
				var get_waveform_portion_1 = __webpack_require__(5699);
				Object.defineProperty(exports, 'getWaveformPortion', {
					enumerable: true,
					get: function () {
						return get_waveform_portion_1.getWaveformPortion;
					},
				});
				__exportStar(__webpack_require__(5237), exports);
				var use_audio_metadata_1 = __webpack_require__(5241);
				Object.defineProperty(exports, 'useAudioData', {
					enumerable: true,
					get: function () {
						return use_audio_metadata_1.useAudioData;
					},
				});
				var visualize_audio_1 = __webpack_require__(6808);
				Object.defineProperty(exports, 'visualizeAudio', {
					enumerable: true,
					get: function () {
						return visualize_audio_1.visualizeAudio;
					},
				});
				var audio_url_helpers_1 = __webpack_require__(4675);
				Object.defineProperty(exports, 'audioBufferToDataUrl', {
					enumerable: true,
					get: function () {
						return audio_url_helpers_1.audioBufferToDataUrl;
					},
				});

				/***/
			},

		/***/ 6104:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.isRemoteAsset = void 0;
				const isRemoteAsset = (asset) =>
					!asset.startsWith(window.location.origin) &&
					!asset.startsWith('data');
				exports.isRemoteAsset = isRemoteAsset;

				/***/
			},

		/***/ 5237:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});

				/***/
			},

		/***/ 5241:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.useAudioData = void 0;
				const react_1 = __webpack_require__(2386);
				const remotion_1 = __webpack_require__(4783);
				const get_audio_data_1 = __webpack_require__(889);
				const useAudioData = (src) => {
					if (!src) {
						throw new TypeError("useAudioMetadata requires a 'src' parameter");
					}
					const mountState = (0, react_1.useRef)({isMounted: true});
					(0, react_1.useEffect)(() => {
						const {current} = mountState;
						current.isMounted = true;
						return () => {
							current.isMounted = false;
						};
					}, []);
					const [metadata, setMetadata] = (0, react_1.useState)(null);
					const fetchMetadata = (0, react_1.useCallback)(async () => {
						const handle = (0, remotion_1.delayRender)();
						const data = await (0, get_audio_data_1.getAudioData)(src);
						if (mountState.current.isMounted) {
							setMetadata(data);
						}
						(0, remotion_1.continueRender)(handle);
					}, [src]);
					(0, react_1.useEffect)(() => {
						fetchMetadata();
					}, [fetchMetadata]);
					return metadata;
				};
				exports.useAudioData = useAudioData;

				/***/
			},

		/***/ 6808:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

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
				var __objRest = (source, exclude) => {
					var target = {};
					for (var prop in source)
						if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
							target[prop] = source[prop];
					if (source != null && __getOwnPropSymbols)
						for (var prop of __getOwnPropSymbols(source)) {
							if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
								target[prop] = source[prop];
						}
					return target;
				};
				Object.defineProperty(exports, '__esModule', {value: true});
				exports.visualizeAudio = void 0;
				const get_visualization_1 = __webpack_require__(5447);
				const max_value_cached_1 = __webpack_require__(7581);
				const cache = {};
				const visualizeAudioFrame = ({
					audioData: metadata,
					frame,
					fps,
					numberOfSamples,
				}) => {
					const cacheKey = metadata.resultId + frame + fps + numberOfSamples;
					if (cache[cacheKey]) {
						return cache[cacheKey];
					}
					const maxInt = (0, max_value_cached_1.getMaxPossibleMagnitude)(
						metadata,
					);
					return (0, get_visualization_1.getVisualization)({
						sampleSize: numberOfSamples * 2,
						data: metadata.channelWaveforms[0],
						frame,
						fps,
						sampleRate: metadata.sampleRate,
						maxInt,
					});
				};
				const visualizeAudio = (_a) => {
					var _b = _a,
						{smoothing = true} = _b,
						parameters = __objRest(_b, ['smoothing']);
					if (!smoothing) {
						return visualizeAudioFrame(parameters);
					}
					const toSmooth = [
						parameters.frame - 1,
						parameters.frame,
						parameters.frame + 1,
					];
					const all = toSmooth.map((s) => {
						return visualizeAudioFrame(
							__spreadProps(__spreadValues({}, parameters), {frame: s}),
						);
					});
					return new Array(parameters.numberOfSamples)
						.fill(true)
						.map((x, i) => {
							return (
								new Array(toSmooth.length)
									.fill(true)
									.map((_, j) => {
										return all[j][i];
									})
									.reduce((a, b) => a + b, 0) / toSmooth.length
							);
						});
				};
				exports.visualizeAudio = visualizeAudio;

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
//# sourceMappingURL=15.bundle.js.map
