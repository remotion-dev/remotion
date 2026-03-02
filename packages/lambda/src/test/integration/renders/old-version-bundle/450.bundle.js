(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[450],
	{
		/***/ 9450:
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
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_0___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_0__,
					);
				/* harmony import */ var _remotion_gif__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(5129);
				/* harmony import */ var _remotion_gif__WEBPACK_IMPORTED_MODULE_1___default =
					/*#__PURE__*/ __webpack_require__.n(
						_remotion_gif__WEBPACK_IMPORTED_MODULE_1__,
					);

				const GifTest = () => {
					const {width, height} = (0,
					remotion__WEBPACK_IMPORTED_MODULE_0__.useVideoConfig)();
					return /* @__PURE__ */ React.createElement(
						'div',
						{
							style: {flex: 1, backgroundColor: 'black'},
						},
						/* @__PURE__ */ React.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_0__.Sequence,
							{
								from: 0,
								durationInFrames: 50,
							},
							/* @__PURE__ */ React.createElement(
								_remotion_gif__WEBPACK_IMPORTED_MODULE_1__.Gif,
								{
									src: 'https://media.giphy.com/media/S9RJG5q2YnWd2nYLZ3/giphy.gif',
									width,
									height,
									fit: 'fill',
								},
							),
						),
						/* @__PURE__ */ React.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_0__.Sequence,
							{
								from: 50,
								durationInFrames: 50,
							},
							/* @__PURE__ */ React.createElement(
								_remotion_gif__WEBPACK_IMPORTED_MODULE_1__.Gif,
								{
									src: 'https://media.giphy.com/media/xT0GqH01ZyKwd3aT3G/giphy.gif',
									width,
									height,
									fit: 'cover',
								},
							),
						),
						/* @__PURE__ */ React.createElement(
							remotion__WEBPACK_IMPORTED_MODULE_0__.Sequence,
							{
								from: 100,
								durationInFrames: 50,
							},
							/* @__PURE__ */ React.createElement(
								_remotion_gif__WEBPACK_IMPORTED_MODULE_1__.Gif,
								{
									src: 'https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif',
									width,
									height,
									fit: 'contain',
								},
							),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = GifTest;

				/***/
			},

		/***/ 186:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.Gif = void 0;
				const jsx_runtime_1 = __webpack_require__(6922);
				const remotion_1 = __webpack_require__(4783);
				const GifForDevelopment_1 = __webpack_require__(634);
				const GifForRendering_1 = __webpack_require__(7995);
				const Gif = (props) => {
					if (remotion_1.Internals.getRemotionEnvironment() === 'rendering') {
						return (0, jsx_runtime_1.jsx)(
							GifForRendering_1.GifForRendering,
							Object.assign({}, props),
							void 0,
						);
					}
					return (0, jsx_runtime_1.jsx)(
						GifForDevelopment_1.GifForDevelopment,
						Object.assign({}, props),
						void 0,
					);
				};
				exports.Gif = Gif;

				/***/
			},

		/***/ 634:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				var __getOwnPropSymbols = Object.getOwnPropertySymbols;
				var __hasOwnProp = Object.prototype.hasOwnProperty;
				var __propIsEnum = Object.prototype.propertyIsEnumerable;
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
				exports.GifForDevelopment = void 0;
				const jsx_runtime_1 = __webpack_require__(6922);
				const tools_1 = __webpack_require__(7743);
				const lru_map_1 = __webpack_require__(1462);
				const react_1 = __webpack_require__(2386);
				const useCurrentGifIndex_1 = __webpack_require__(394);
				const cache = new lru_map_1.LRUMap(30);
				exports.GifForDevelopment = (0, react_1.forwardRef)((_a, ref) => {
					var _b = _a,
						{src, width, height, onError, onLoad, fit = 'fill'} = _b,
						props = __objRest(_b, [
							'src',
							'width',
							'height',
							'onError',
							'onLoad',
							'fit',
						]);
					const [state, update] = (0, react_1.useState)(() => {
						const parsedGif = cache.get(src);
						if (parsedGif === void 0) {
							return {
								delays: [],
								frames: [],
								width: 0,
								height: 0,
							};
						}
						return parsedGif;
					});
					(0, tools_1.useWorkerParser)(
						Boolean(state.frames.length) || src,
						(info) => {
							if ('error' in info) {
								if (onError) {
									onError(info.error);
								} else {
									console.error(
										'Error loading GIF:',
										info.error,
										'Handle the event using the onError() prop to make this message disappear.',
									);
								}
							} else {
								onLoad === null || onLoad === void 0 ? void 0 : onLoad(info);
								cache.set(src, info);
								update(info);
							}
						},
					);
					const index = (0, useCurrentGifIndex_1.useCurrentGifIndex)(
						state.delays,
					);
					return (0, jsx_runtime_1.jsx)(
						tools_1.Canvas,
						Object.assign(
							{
								fit,
								index,
								frames: state.frames,
								width: width !== null && width !== void 0 ? width : state.width,
								height:
									height !== null && height !== void 0 ? height : state.height,
							},
							props,
							{ref},
						),
						void 0,
					);
				});

				/***/
			},

		/***/ 7995:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				var __getOwnPropSymbols = Object.getOwnPropertySymbols;
				var __hasOwnProp = Object.prototype.hasOwnProperty;
				var __propIsEnum = Object.prototype.propertyIsEnumerable;
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
				exports.GifForRendering = void 0;
				const jsx_runtime_1 = __webpack_require__(6922);
				const tools_1 = __webpack_require__(7743);
				const react_1 = __webpack_require__(2386);
				const remotion_1 = __webpack_require__(4783);
				const useCurrentGifIndex_1 = __webpack_require__(394);
				exports.GifForRendering = (0, react_1.forwardRef)((_a, ref) => {
					var _b = _a,
						{src, width, height, onLoad, onError, fit = 'fill'} = _b,
						props = __objRest(_b, [
							'src',
							'width',
							'height',
							'onLoad',
							'onError',
							'fit',
						]);
					const [state, update] = (0, react_1.useState)({
						delays: [],
						frames: [],
						width: 0,
						height: 0,
					});
					const [id] = (0, react_1.useState)(() =>
						(0, remotion_1.delayRender)(),
					);
					const index = (0, useCurrentGifIndex_1.useCurrentGifIndex)(
						state.delays,
					);
					(0, tools_1.useParser)(src, (info) => {
						if ('error' in info) {
							if (onError) {
								onError(info.error);
							} else {
								console.error(
									'Error loading GIF:',
									info.error,
									'Handle the event using the onError() prop to make this message disappear.',
								);
							}
						} else {
							onLoad === null || onLoad === void 0 ? void 0 : onLoad(info);
							update(info);
						}
						(0, remotion_1.continueRender)(id);
					});
					return (0, jsx_runtime_1.jsx)(
						tools_1.Canvas,
						Object.assign(
							{
								fit,
								index,
								frames: state.frames,
								width: width !== null && width !== void 0 ? width : state.width,
								height:
									height !== null && height !== void 0 ? height : state.height,
							},
							props,
							{ref},
						),
						void 0,
					);
				});

				/***/
			},

		/***/ 5129:
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
				__exportStar(__webpack_require__(186), exports);
				__exportStar(__webpack_require__(1960), exports);

				/***/
			},

		/***/ 1960:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});

				/***/
			},

		/***/ 394:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {value: true});
				exports.useCurrentGifIndex = void 0;
				const react_1 = __webpack_require__(2386);
				const remotion_1 = __webpack_require__(4783);
				function useCurrentGifIndex(delays) {
					const currentFrame = (0, remotion_1.useCurrentFrame)();
					const videoConfig = remotion_1.Internals.useUnsafeVideoConfig();
					const duration = (0, react_1.useMemo)(() => {
						if (delays.length !== 0) {
							return delays.reduce((sum, delay) => sum + delay, 0);
						}
						return 1;
					}, [delays]);
					const index = (0, react_1.useMemo)(() => {
						if (videoConfig && delays.length !== 0) {
							let currentTime =
								((currentFrame / videoConfig.fps) * 1e3) % duration;
							for (const [i, delay] of delays.entries()) {
								if (currentTime < delay) return i;
								currentTime -= delay;
							}
						}
						return 0;
					}, [delays, duration, currentFrame, videoConfig]);
					return index;
				}
				exports.useCurrentGifIndex = useCurrentGifIndex;

				/***/
			},

		/***/ 7743:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				'use strict';
				__webpack_require__.r(__webpack_exports__);
				/* harmony export */ __webpack_require__.d(__webpack_exports__, {
					/* harmony export */ Canvas: () => /* binding */ Canvas,
					/* harmony export */ useParser: () => /* binding */ useParser,
					/* harmony export */ usePlayback: () => /* binding */ usePlayback,
					/* harmony export */ usePlayerState: () =>
						/* binding */ usePlayerState,
					/* harmony export */ useWorkerParser: () =>
						/* binding */ useWorkerParser,
					/* harmony export */
				});
				/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ =
					__webpack_require__(2386);
				/* harmony import */ var gifuct_js__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(1258);

				const reducer = (state, action = {}) => {
					if (typeof action === 'function') {
						action = action(state);
					}

					const isLoadedChange =
						action.loaded && state.loaded !== action.loaded;
					const {playing, ...rest} = action;
					const copy = {...state, ...rest};

					if (isLoadedChange) {
						Object.assign(copy, {
							playing: copy.autoPlay && copy.loaded,
						});
					}

					if (action.delays != null || action.frames != null) {
						Object.assign(copy, {
							length: copy.frames.length,
						});

						if (false) {
						}
					}

					if (action.index != null || action.frames != null) {
						Object.assign(copy, {
							index:
								copy.length === 0
									? 0
									: (copy.length + copy.index) % copy.length,
						});
					}

					if (action.playing != null) {
						Object.assign(
							copy,
							copy.loaded
								? {
										playing,
									}
								: {
										autoPlay: playing,
									},
						);
					}

					return copy;
				};

				const initializer = (stateOrFn) =>
					reducer(
						{
							autoPlay: true,
							playing: false,
							frames: [],
							delays: [],
							index: 0,
							length: 0,
							loaded: false,
						},
						stateOrFn,
					);

				const usePlayerState = (stateOrFn) => {
					return (0, react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(
						reducer,
						stateOrFn,
						initializer,
					);
				};

				var code =
					'function e(e){var r={exports:{}};return e(r,r.exports),r.exports}var r=e((function(e,r){Object.defineProperty(r,"__esModule",{value:!0}),r.loop=r.conditional=r.parse=void 0;r.parse=function e(r,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:n;if(Array.isArray(t))t.forEach((function(t){return e(r,t,n,a)}));else if("function"==typeof t)t(r,n,a,e);else{var i=Object.keys(t)[0];Array.isArray(t[i])?(a[i]={},e(r,t[i],n,a[i])):a[i]=t[i](r,n,a,e)}return n};r.conditional=function(e,r){return function(t,n,a,i){r(t,n,a)&&i(t,e,n,a)}};r.loop=function(e,r){return function(t,n,a,i){for(var o=[];r(t,n,a);){var s={};i(t,e,n,s),o.push(s)}return o}}})),t=e((function(e,r){Object.defineProperty(r,"__esModule",{value:!0}),r.readBits=r.readArray=r.readUnsigned=r.readString=r.peekBytes=r.readBytes=r.peekByte=r.readByte=r.buildStream=void 0;r.buildStream=function(e){return{data:e,pos:0}};var t=function(){return function(e){return e.data[e.pos++]}};r.readByte=t;r.peekByte=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return function(r){return r.data[r.pos+e]}};var n=function(e){return function(r){return r.data.subarray(r.pos,r.pos+=e)}};r.readBytes=n;r.peekBytes=function(e){return function(r){return r.data.subarray(r.pos,r.pos+e)}};r.readString=function(e){return function(r){return Array.from(n(e)(r)).map((function(e){return String.fromCharCode(e)})).join("")}};r.readUnsigned=function(e){return function(r){var t=n(2)(r);return e?(t[1]<<8)+t[0]:(t[0]<<8)+t[1]}};r.readArray=function(e,r){return function(t,a,i){for(var o="function"==typeof r?r(t,a,i):r,s=n(e),d=new Array(o),c=0;c<o;c++)d[c]=s(t);return d}};r.readBits=function(e){return function(r){for(var t=function(e){return e.data[e.pos++]}(r),n=new Array(8),a=0;a<8;a++)n[7-a]=!!(t&1<<a);return Object.keys(e).reduce((function(r,t){var a=e[t];return a.length?r[t]=function(e,r,t){for(var n=0,a=0;a<t;a++)n+=e[r+a]&&Math.pow(2,t-a-1);return n}(n,a.index,a.length):r[t]=n[a.index],r}),{})}}})),n=e((function(e,n){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a={blocks:function(e){for(var r=[],n=e.data.length,a=0,i=(0,t.readByte)()(e);0!==i;i=(0,t.readByte)()(e)){if(e.pos+i>=n){var o=n-e.pos;r.push((0,t.readBytes)(o)(e)),a+=o;break}r.push((0,t.readBytes)(i)(e)),a+=i}for(var s=new Uint8Array(a),d=0,c=0;c<r.length;c++)s.set(r[c],d),d+=r[c].length;return s}},i=(0,r.conditional)({gce:[{codes:(0,t.readBytes)(2)},{byteSize:(0,t.readByte)()},{extras:(0,t.readBits)({future:{index:0,length:3},disposal:{index:3,length:3},userInput:{index:6},transparentColorGiven:{index:7}})},{delay:(0,t.readUnsigned)(!0)},{transparentColorIndex:(0,t.readByte)()},{terminator:(0,t.readByte)()}]},(function(e){var r=(0,t.peekBytes)(2)(e);return 33===r[0]&&249===r[1]})),o=(0,r.conditional)({image:[{code:(0,t.readByte)()},{descriptor:[{left:(0,t.readUnsigned)(!0)},{top:(0,t.readUnsigned)(!0)},{width:(0,t.readUnsigned)(!0)},{height:(0,t.readUnsigned)(!0)},{lct:(0,t.readBits)({exists:{index:0},interlaced:{index:1},sort:{index:2},future:{index:3,length:2},size:{index:5,length:3}})}]},(0,r.conditional)({lct:(0,t.readArray)(3,(function(e,r,t){return Math.pow(2,t.descriptor.lct.size+1)}))},(function(e,r,t){return t.descriptor.lct.exists})),{data:[{minCodeSize:(0,t.readByte)()},a]}]},(function(e){return 44===(0,t.peekByte)()(e)})),s=(0,r.conditional)({text:[{codes:(0,t.readBytes)(2)},{blockSize:(0,t.readByte)()},{preData:function(e,r,n){return(0,t.readBytes)(n.text.blockSize)(e)}},a]},(function(e){var r=(0,t.peekBytes)(2)(e);return 33===r[0]&&1===r[1]})),d=(0,r.conditional)({application:[{codes:(0,t.readBytes)(2)},{blockSize:(0,t.readByte)()},{id:function(e,r,n){return(0,t.readString)(n.blockSize)(e)}},a]},(function(e){var r=(0,t.peekBytes)(2)(e);return 33===r[0]&&255===r[1]})),c=(0,r.conditional)({comment:[{codes:(0,t.readBytes)(2)},a]},(function(e){var r=(0,t.peekBytes)(2)(e);return 33===r[0]&&254===r[1]})),u=[{header:[{signature:(0,t.readString)(3)},{version:(0,t.readString)(3)}]},{lsd:[{width:(0,t.readUnsigned)(!0)},{height:(0,t.readUnsigned)(!0)},{gct:(0,t.readBits)({exists:{index:0},resolution:{index:1,length:3},sort:{index:4},size:{index:5,length:3}})},{backgroundColorIndex:(0,t.readByte)()},{pixelAspectRatio:(0,t.readByte)()}]},(0,r.conditional)({gct:(0,t.readArray)(3,(function(e,r){return Math.pow(2,r.lsd.gct.size+1)}))},(function(e,r){return r.lsd.gct.exists})),{frames:(0,r.loop)([i,d,c,o,s],(function(e){var r=(0,t.peekByte)()(e);return 33===r||44===r}))}];n.default=u})),a=e((function(e,r){Object.defineProperty(r,"__esModule",{value:!0}),r.deinterlace=void 0;r.deinterlace=function(e,r){for(var t=new Array(e.length),n=e.length/r,a=function(n,a){var i=e.slice(a*r,(a+1)*r);t.splice.apply(t,[n*r,r].concat(i))},i=[0,4,2,1],o=[8,8,4,2],s=0,d=0;d<4;d++)for(var c=i[d];c<n;c+=o[d])a(c,s),s++;return t}})),i=e((function(e,r){Object.defineProperty(r,"__esModule",{value:!0}),r.lzw=void 0;r.lzw=function(e,r,t){var n,a,i,o,s,d,c,u,l,f,p,g,y,h,v,m,x=4096,B=t,w=new Array(t),b=new Array(x),k=new Array(x),A=new Array(4097);for(s=(a=1<<(f=e))+1,n=a+2,c=-1,i=(1<<(o=f+1))-1,u=0;u<a;u++)b[u]=0,k[u]=u;for(p=g=y=h=v=m=0,l=0;l<B;){if(0===h){if(g<o){p+=r[m]<<g,g+=8,m++;continue}if(u=p&i,p>>=o,g-=o,u>n||u==s)break;if(u==a){i=(1<<(o=f+1))-1,n=a+2,c=-1;continue}if(-1==c){A[h++]=k[u],c=u,y=u;continue}for(d=u,u==n&&(A[h++]=y,u=c);u>a;)A[h++]=k[u],u=b[u];y=255&k[u],A[h++]=y,n<x&&(b[n]=c,k[n]=y,0==(++n&i)&&n<x&&(o++,i+=n)),c=d}h--,w[v++]=A[h],l++}for(l=v;l<B;l++)w[l]=0;return w}})),o=e((function(e,o){Object.defineProperty(o,"__esModule",{value:!0}),o.decompressFrames=o.decompressFrame=o.parseGIF=void 0;var s,d=(s=n)&&s.__esModule?s:{default:s};o.parseGIF=function(e){var n=new Uint8Array(e);return(0,r.parse)((0,t.buildStream)(n),d.default)};var c=function(e,r,t){if(e.image){var n=e.image,o=n.descriptor.width*n.descriptor.height,s=(0,i.lzw)(n.data.minCodeSize,n.data.blocks,o);n.descriptor.lct.interlaced&&(s=(0,a.deinterlace)(s,n.descriptor.width));var d={pixels:s,dims:{top:e.image.descriptor.top,left:e.image.descriptor.left,width:e.image.descriptor.width,height:e.image.descriptor.height}};return n.descriptor.lct&&n.descriptor.lct.exists?d.colorTable=n.lct:d.colorTable=r,e.gce&&(d.delay=10*(e.gce.delay||10),d.disposalType=e.gce.extras.disposal,e.gce.extras.transparentColorGiven&&(d.transparentIndex=e.gce.transparentColorIndex)),t&&(d.patch=function(e){for(var r=e.pixels.length,t=new Uint8ClampedArray(4*r),n=0;n<r;n++){var a=4*n,i=e.pixels[n],o=e.colorTable[i]||[0,0,0];t[a]=o[0],t[a+1]=o[1],t[a+2]=o[2],t[a+3]=i!==e.transparentIndex?255:0}return t}(d)),d}console.warn("gif frame does not have associated image.")};o.decompressFrame=c;o.decompressFrames=function(e,r){return e.frames.filter((function(e){return e.image})).map((function(t){return c(t,e.gct,r)}))}}));const s=(e,r,t)=>{const{width:n,height:a,top:i,left:o}=r.dims,s=i*t.width+o;for(let i=0;i<a;i++)for(let a=0;a<n;a++){const o=i*n+a,d=r.pixels[o];if(d!==r.transparentIndex){const n=s+i*t.width+a,o=r.colorTable[d]||[0,0,0];e[4*n]=o[0],e[4*n+1]=o[1],e[4*n+2]=o[2],e[4*n+3]=255}}return e},d=new Map;self.addEventListener("message",(e=>{const{type:r,src:t}=e.data||e;switch(r){case"parse":if(!d.has(t)){const e=new AbortController,r={signal:e.signal};d.set(t,e),((e,{signal:r})=>fetch(e,{signal:r}).then((e=>{if(!e.headers.get("Content-Type").includes("image/gif"))throw Error(`Wrong content type: "${e.headers.get("Content-Type")}"`);return e.arrayBuffer()})).then((e=>o.parseGIF(e))).then((e=>((e=>{let r=null;for(const t of e.frames)r=t.gce?t.gce:r,"image"in t&&!("gce"in t)&&(t.gce=r)})(e),e))).then((e=>Promise.all([o.decompressFrames(e,!1),{width:e.lsd.width,height:e.lsd.height}]))).then((([e,r])=>{const t=[],n=r.width*r.height*4;for(let a=0;a<e.length;++a){const i=e[a],o=0===a||2===e[a-1].disposalType?new Uint8ClampedArray(n):t[a-1].slice();t.push(s(o,i,r))}return{...r,loaded:!0,delays:e.map((e=>e.delay)),frames:t}})))(t,r).then((e=>{self.postMessage(Object.assign(e,{src:t}),e.frames.map((e=>e.buffer)))})).catch((e=>{self.postMessage({src:t,error:e,loaded:!0})})).finally((()=>{d.delete(t)}))}break;case"cancel":if(d.has(t)){d.get(t).abort(),d.delete(t)}}}));\n';

				function WorkerFactory(options) {
					const blob = new Blob([code], {
						type: 'application/javascript',
					});
					const url = URL.createObjectURL(blob);
					const worker = new Worker(url, options);
					URL.revokeObjectURL(url);
					return worker;
				}

				const validateAndFix = (gif) => {
					let currentGce = null;

					for (const frame of gif.frames) {
						currentGce = frame.gce ? frame.gce : currentGce; // fix loosing graphic control extension for same frames

						if ('image' in frame && !('gce' in frame)) {
							frame.gce = currentGce;
						}
					}
				};

				const parse = (src, {signal}) =>
					fetch(src, {
						signal,
					})
						.then((resp) => {
							if (!resp.headers.get('Content-Type').includes('image/gif'))
								throw Error(
									`Wrong content type: "${resp.headers.get('Content-Type')}"`,
								);
							return resp.arrayBuffer();
						})
						.then((buffer) =>
							(0, gifuct_js__WEBPACK_IMPORTED_MODULE_1__ /* .parseGIF */.vq)(
								buffer,
							),
						)
						.then((gif) => {
							validateAndFix(gif);
							return gif;
						})
						.then((gif) =>
							Promise.all([
								(0,
								gifuct_js__WEBPACK_IMPORTED_MODULE_1__ /* .decompressFrames */.zw)(
									gif,
									false,
								),
								{
									width: gif.lsd.width,
									height: gif.lsd.height,
								},
							]),
						)
						.then(([frames, options]) => {
							const readyFrames = [];
							const size = options.width * options.height * 4;

							for (let i = 0; i < frames.length; ++i) {
								const frame = frames[i];
								const typedArray =
									i === 0 || frames[i - 1].disposalType === 2
										? new Uint8ClampedArray(size)
										: readyFrames[i - 1].slice();
								readyFrames.push(putPixels(typedArray, frame, options));
							}

							return {
								...options,
								loaded: true,
								delays: frames.map((frame) => frame.delay),
								frames: readyFrames,
							};
						});

				const putPixels = (typedArray, frame, gifSize) => {
					const {width, height, top: dy, left: dx} = frame.dims;
					const offset = dy * gifSize.width + dx;

					for (let y = 0; y < height; y++) {
						for (let x = 0; x < width; x++) {
							const pPos = y * width + x;
							const colorIndex = frame.pixels[pPos];

							if (colorIndex !== frame.transparentIndex) {
								const taPos = offset + y * gifSize.width + x;
								const color = frame.colorTable[colorIndex] || [0, 0, 0];
								typedArray[taPos * 4] = color[0];
								typedArray[taPos * 4 + 1] = color[1];
								typedArray[taPos * 4 + 2] = color[2];
								typedArray[taPos * 4 + 3] = 255;
							}
						}
					}

					return typedArray;
				};

				const genearate = (info) => {
					return {
						...info,
						frames: info.frames.map((buffer) => {
							const image = new ImageData(info.width, info.height);
							image.data.set(new Uint8ClampedArray(buffer));
							return image;
						}),
					};
				};

				const createSingleton = (constructor, destructor) => {
					const ref = {};
					return () => {
						if (!ref.instance) {
							ref.instance = constructor();
						}

						(0, react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
							if (ref.timeout) {
								clearTimeout(ref.timeout);
								delete ref.timeout;
							} else {
								ref.usageCount = (ref.usageCount || 0) + 1;
							}

							return () => {
								ref.timeout = setTimeout(() => {
									ref.usageCount = ref.usageCount - 1;

									if (ref.usageCount === 0) {
										destructor && destructor(ref.instance);
										delete ref.instance;
										delete ref.timeout;
									}
								});
							};
						}, [ref, destructor]);
						return ref.instance;
					};
				};

				const useUpdatedRef = (value) => {
					const ref = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)(value);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
						ref.current = value;
					}, [value]);
					return ref;
				};

				const useEventCallback = (callback) => {
					const ref = useUpdatedRef(callback);
					return (0, react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(
						(arg) => ref.current && ref.current(arg),
						[],
					);
				};

				const useRaf = (callback, pause) => {
					const cb = useEventCallback(callback);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
						if (!pause) {
							let id;
							let prev = null;

							const handleUpdate = () => {
								id = requestAnimationFrame((now) => {
									const dt = now - (prev || now);
									prev = now;
									cb(dt);
									handleUpdate();
								});
							};

							handleUpdate();
							return () => cancelAnimationFrame(id);
						}
					}, [pause, cb]);
				};

				const useAsyncEffect = (fn, deps) => {
					const cb = useEventCallback(fn);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
						const controller = new AbortController();
						const dest = cb(controller);
						return () => {
							controller.abort();
							dest && dest();
						};
					}, [...deps]);
				};

				const useParser = (src, callback) => {
					const cb = useEventCallback(callback);
					useAsyncEffect(
						(controller) => {
							if (typeof src === 'string') {
								parse(src, {
									signal: controller.signal,
								})
									.then((raw) => genearate(raw))
									.then((info) => cb(info))
									.catch((error) =>
										cb({
											error,
											loaded: true,
										}),
									);
							}
						},
						[src],
					);
				};

				const useWorkerSingleton = /*#__PURE__*/ createSingleton(
					() => new WorkerFactory(),
					(worker) => worker.terminate(),
				);

				const useWorkerParser = (src, callback) => {
					const cb = useEventCallback(callback);
					const worker = useWorkerSingleton();
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
						if (typeof src === 'string') {
							const handler = (e) => {
								const message = e.data || e;

								if (message.src === src) {
									const data = message.error ? message : genearate(message);
									cb(data);
								}
							};

							worker.addEventListener('message', handler);
							worker.postMessage({
								src,
								type: 'parse',
							});
							return () => {
								worker.postMessage({
									src,
									type: 'cancel',
								});
								worker.removeEventListener('message', handler);
							};
						}
					}, [worker, src]);
				};

				const usePlayback = (state, updater) => {
					const delay = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);
					useRaf((dt) => {
						const {delays, index: currentIndex} = state;
						delay.current += dt;

						if (delay.current > delays[currentIndex]) {
							delay.current = delay.current % delays[currentIndex];
							updater();
						}
					}, !state.playing);
				};

				const calcArgs = (fit, frameSize, canvasSize) => {
					switch (fit) {
						case 'fill':
							return [
								0,
								0,
								frameSize.width,
								frameSize.height,
								0,
								0,
								canvasSize.width,
								canvasSize.height,
							];

						case 'contain': {
							const ratio = Math.min(
								canvasSize.width / frameSize.width,
								canvasSize.height / frameSize.height,
							);
							const centerX = (canvasSize.width - frameSize.width * ratio) / 2;
							const centerY =
								(canvasSize.height - frameSize.height * ratio) / 2;
							return [
								0,
								0,
								frameSize.width,
								frameSize.height,
								centerX,
								centerY,
								frameSize.width * ratio,
								frameSize.height * ratio,
							];
						}

						case 'cover': {
							const ratio = Math.max(
								canvasSize.width / frameSize.width,
								canvasSize.height / frameSize.height,
							);
							const centerX = (canvasSize.width - frameSize.width * ratio) / 2;
							const centerY =
								(canvasSize.height - frameSize.height * ratio) / 2;
							return [
								0,
								0,
								frameSize.width,
								frameSize.height,
								centerX,
								centerY,
								frameSize.width * ratio,
								frameSize.height * ratio,
							];
						}

						default:
							return [0, 0];
					}
				};

				const combine =
					(...refs) =>
					(value) => {
						refs.forEach((ref) => {
							if (typeof ref === 'function') {
								ref(value);
							} else if (ref != null) {
								ref.current = value;
							}
						});
					};

				const useCanvasSingleton = /*#__PURE__*/ createSingleton(() => {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					canvas.width = 0;
					canvas.height = 0;
					return ctx;
				});
				const Canvas = /*#__PURE__*/ (0,
				react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(function Canvas(
					{index, frames, width, height, fit, className, style},
					ref,
				) {
					const canvasRef = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
					const ctx = (0, react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
					const tempCtx = useCanvasSingleton();
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
						if (canvasRef.current) {
							ctx.current = canvasRef.current.getContext('2d');
						}
					}, [canvasRef]);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
						if (canvasRef.current) {
							canvasRef.current.width = width;
							canvasRef.current.height = height;
						}
					}, [canvasRef, width, height]);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
						const imageData = frames[index];

						if (imageData) {
							if (
								tempCtx.canvas.width < imageData.width ||
								tempCtx.canvas.height < imageData.height
							) {
								tempCtx.canvas.width = imageData.width;
								tempCtx.canvas.height = imageData.height;
							}

							if (width > 0 && height > 0) {
								ctx.current.clearRect(0, 0, width, height);
								tempCtx.clearRect(
									0,
									0,
									tempCtx.canvas.width,
									tempCtx.canvas.height,
								);
							}

							tempCtx.putImageData(imageData, 0, 0);
							ctx.current.drawImage(
								tempCtx.canvas,
								...calcArgs(fit, imageData, {
									width,
									height,
								}),
							);
						}
					}, [index, frames, width, height, fit]);
					return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						'canvas',
						{
							ref: combine(canvasRef, ref),
							className: className,
							style: style,
						},
					);
				});

				/***/
			},

		/***/ 1611:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true,
				});
				exports.deinterlace = void 0;

				/**
				 * Deinterlace function from https://github.com/shachaf/jsgif
				 */
				var deinterlace = function deinterlace(pixels, width) {
					var newPixels = new Array(pixels.length);
					var rows = pixels.length / width;

					var cpRow = function cpRow(toRow, fromRow) {
						var fromPixels = pixels.slice(
							fromRow * width,
							(fromRow + 1) * width,
						);
						newPixels.splice.apply(
							newPixels,
							[toRow * width, width].concat(fromPixels),
						);
					}; // See appendix E.

					var offsets = [0, 4, 2, 1];
					var steps = [8, 8, 4, 2];
					var fromRow = 0;

					for (var pass = 0; pass < 4; pass++) {
						for (
							var toRow = offsets[pass];
							toRow < rows;
							toRow += steps[pass]
						) {
							cpRow(toRow, fromRow);
							fromRow++;
						}
					}

					return newPixels;
				};

				exports.deinterlace = deinterlace;

				/***/
			},

		/***/ 1258:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';
				var __webpack_unused_export__;

				__webpack_unused_export__ = {
					value: true,
				};
				exports.zw = __webpack_unused_export__ = exports.vq = void 0;

				var _gif = _interopRequireDefault(__webpack_require__(8761));

				var _jsBinarySchemaParser = __webpack_require__(1658);

				var _uint = __webpack_require__(2794);

				var _deinterlace = __webpack_require__(1611);

				var _lzw = __webpack_require__(3623);

				function _interopRequireDefault(obj) {
					return obj && obj.__esModule ? obj : {default: obj};
				}

				var parseGIF = function parseGIF(arrayBuffer) {
					var byteData = new Uint8Array(arrayBuffer);
					return (0, _jsBinarySchemaParser.parse)(
						(0, _uint.buildStream)(byteData),
						_gif['default'],
					);
				};

				exports.vq = parseGIF;

				var generatePatch = function generatePatch(image) {
					var totalPixels = image.pixels.length;
					var patchData = new Uint8ClampedArray(totalPixels * 4);

					for (var i = 0; i < totalPixels; i++) {
						var pos = i * 4;
						var colorIndex = image.pixels[i];
						var color = image.colorTable[colorIndex] || [0, 0, 0];
						patchData[pos] = color[0];
						patchData[pos + 1] = color[1];
						patchData[pos + 2] = color[2];
						patchData[pos + 3] =
							colorIndex !== image.transparentIndex ? 255 : 0;
					}

					return patchData;
				};

				var decompressFrame = function decompressFrame(
					frame,
					gct,
					buildImagePatch,
				) {
					if (!frame.image) {
						console.warn('gif frame does not have associated image.');
						return;
					}

					var image = frame.image; // get the number of pixels

					var totalPixels = image.descriptor.width * image.descriptor.height; // do lzw decompression

					var pixels = (0, _lzw.lzw)(
						image.data.minCodeSize,
						image.data.blocks,
						totalPixels,
					); // deal with interlacing if necessary

					if (image.descriptor.lct.interlaced) {
						pixels = (0, _deinterlace.deinterlace)(
							pixels,
							image.descriptor.width,
						);
					}

					var resultImage = {
						pixels: pixels,
						dims: {
							top: frame.image.descriptor.top,
							left: frame.image.descriptor.left,
							width: frame.image.descriptor.width,
							height: frame.image.descriptor.height,
						},
					}; // color table

					if (image.descriptor.lct && image.descriptor.lct.exists) {
						resultImage.colorTable = image.lct;
					} else {
						resultImage.colorTable = gct;
					} // add per frame relevant gce information

					if (frame.gce) {
						resultImage.delay = (frame.gce.delay || 10) * 10; // convert to ms

						resultImage.disposalType = frame.gce.extras.disposal; // transparency

						if (frame.gce.extras.transparentColorGiven) {
							resultImage.transparentIndex = frame.gce.transparentColorIndex;
						}
					} // create canvas usable imagedata if desired

					if (buildImagePatch) {
						resultImage.patch = generatePatch(resultImage);
					}

					return resultImage;
				};

				__webpack_unused_export__ = decompressFrame;

				var decompressFrames = function decompressFrames(
					parsedGif,
					buildImagePatches,
				) {
					return parsedGif.frames
						.filter(function (f) {
							return f.image;
						})
						.map(function (f) {
							return decompressFrame(f, parsedGif.gct, buildImagePatches);
						});
				};

				exports.zw = decompressFrames;

				/***/
			},

		/***/ 3623:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true,
				});
				exports.lzw = void 0;

				/**
				 * javascript port of java LZW decompression
				 * Original java author url: https://gist.github.com/devunwired/4479231
				 */
				var lzw = function lzw(minCodeSize, data, pixelCount) {
					var MAX_STACK_SIZE = 4096;
					var nullCode = -1;
					var npix = pixelCount;
					var available,
						clear,
						code_mask,
						code_size,
						end_of_information,
						in_code,
						old_code,
						bits,
						code,
						i,
						datum,
						data_size,
						first,
						top,
						bi,
						pi;
					var dstPixels = new Array(pixelCount);
					var prefix = new Array(MAX_STACK_SIZE);
					var suffix = new Array(MAX_STACK_SIZE);
					var pixelStack = new Array(MAX_STACK_SIZE + 1); // Initialize GIF data stream decoder.

					data_size = minCodeSize;
					clear = 1 << data_size;
					end_of_information = clear + 1;
					available = clear + 2;
					old_code = nullCode;
					code_size = data_size + 1;
					code_mask = (1 << code_size) - 1;

					for (code = 0; code < clear; code++) {
						prefix[code] = 0;
						suffix[code] = code;
					} // Decode GIF pixel stream.

					var datum, bits, count, first, top, pi, bi;
					datum = bits = count = first = top = pi = bi = 0;

					for (i = 0; i < npix; ) {
						if (top === 0) {
							if (bits < code_size) {
								// get the next byte
								datum += data[bi] << bits;
								bits += 8;
								bi++;
								continue;
							} // Get the next code.

							code = datum & code_mask;
							datum >>= code_size;
							bits -= code_size; // Interpret the code

							if (code > available || code == end_of_information) {
								break;
							}

							if (code == clear) {
								// Reset decoder.
								code_size = data_size + 1;
								code_mask = (1 << code_size) - 1;
								available = clear + 2;
								old_code = nullCode;
								continue;
							}

							if (old_code == nullCode) {
								pixelStack[top++] = suffix[code];
								old_code = code;
								first = code;
								continue;
							}

							in_code = code;

							if (code == available) {
								pixelStack[top++] = first;
								code = old_code;
							}

							while (code > clear) {
								pixelStack[top++] = suffix[code];
								code = prefix[code];
							}

							first = suffix[code] & 0xff;
							pixelStack[top++] = first; // add a new string to the table, but only if space is available
							// if not, just continue with current table until a clear code is found
							// (deferred clear code implementation as per GIF spec)

							if (available < MAX_STACK_SIZE) {
								prefix[available] = old_code;
								suffix[available] = first;
								available++;

								if (
									(available & code_mask) === 0 &&
									available < MAX_STACK_SIZE
								) {
									code_size++;
									code_mask += available;
								}
							}

							old_code = in_code;
						} // Pop a pixel off the pixel stack.

						top--;
						dstPixels[pi++] = pixelStack[top];
						i++;
					}

					for (i = pi; i < npix; i++) {
						dstPixels[i] = 0; // clear missing pixels
					}

					return dstPixels;
				};

				exports.lzw = lzw;

				/***/
			},

		/***/ 1658:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true,
				});
				exports.loop = exports.conditional = exports.parse = void 0;

				var parse = function parse(stream, schema) {
					var result =
						arguments.length > 2 && arguments[2] !== undefined
							? arguments[2]
							: {};
					var parent =
						arguments.length > 3 && arguments[3] !== undefined
							? arguments[3]
							: result;

					if (Array.isArray(schema)) {
						schema.forEach(function (partSchema) {
							return parse(stream, partSchema, result, parent);
						});
					} else if (typeof schema === 'function') {
						schema(stream, result, parent, parse);
					} else {
						var key = Object.keys(schema)[0];

						if (Array.isArray(schema[key])) {
							parent[key] = {};
							parse(stream, schema[key], result, parent[key]);
						} else {
							parent[key] = schema[key](stream, result, parent, parse);
						}
					}

					return result;
				};

				exports.parse = parse;

				var conditional = function conditional(schema, conditionFunc) {
					return function (stream, result, parent, parse) {
						if (conditionFunc(stream, result, parent)) {
							parse(stream, schema, result, parent);
						}
					};
				};

				exports.conditional = conditional;

				var loop = function loop(schema, continueFunc) {
					return function (stream, result, parent, parse) {
						var arr = [];

						while (continueFunc(stream, result, parent)) {
							var newParent = {};
							parse(stream, schema, result, newParent);
							arr.push(newParent);
						}

						return arr;
					};
				};

				exports.loop = loop;

				/***/
			},

		/***/ 2794:
			/***/ (__unused_webpack_module, exports) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true,
				});
				exports.readBits =
					exports.readArray =
					exports.readUnsigned =
					exports.readString =
					exports.peekBytes =
					exports.readBytes =
					exports.peekByte =
					exports.readByte =
					exports.buildStream =
						void 0;

				// Default stream and parsers for Uint8TypedArray data type
				var buildStream = function buildStream(uint8Data) {
					return {
						data: uint8Data,
						pos: 0,
					};
				};

				exports.buildStream = buildStream;

				var readByte = function readByte() {
					return function (stream) {
						return stream.data[stream.pos++];
					};
				};

				exports.readByte = readByte;

				var peekByte = function peekByte() {
					var offset =
						arguments.length > 0 && arguments[0] !== undefined
							? arguments[0]
							: 0;
					return function (stream) {
						return stream.data[stream.pos + offset];
					};
				};

				exports.peekByte = peekByte;

				var readBytes = function readBytes(length) {
					return function (stream) {
						return stream.data.subarray(stream.pos, (stream.pos += length));
					};
				};

				exports.readBytes = readBytes;

				var peekBytes = function peekBytes(length) {
					return function (stream) {
						return stream.data.subarray(stream.pos, stream.pos + length);
					};
				};

				exports.peekBytes = peekBytes;

				var readString = function readString(length) {
					return function (stream) {
						return Array.from(readBytes(length)(stream))
							.map(function (value) {
								return String.fromCharCode(value);
							})
							.join('');
					};
				};

				exports.readString = readString;

				var readUnsigned = function readUnsigned(littleEndian) {
					return function (stream) {
						var bytes = readBytes(2)(stream);
						return littleEndian
							? (bytes[1] << 8) + bytes[0]
							: (bytes[0] << 8) + bytes[1];
					};
				};

				exports.readUnsigned = readUnsigned;

				var readArray = function readArray(byteSize, totalOrFunc) {
					return function (stream, result, parent) {
						var total =
							typeof totalOrFunc === 'function'
								? totalOrFunc(stream, result, parent)
								: totalOrFunc;
						var parser = readBytes(byteSize);
						var arr = new Array(total);

						for (var i = 0; i < total; i++) {
							arr[i] = parser(stream);
						}

						return arr;
					};
				};

				exports.readArray = readArray;

				var subBitsTotal = function subBitsTotal(bits, startIndex, length) {
					var result = 0;

					for (var i = 0; i < length; i++) {
						result += bits[startIndex + i] && Math.pow(2, length - i - 1);
					}

					return result;
				};

				var readBits = function readBits(schema) {
					return function (stream) {
						var _byte = readByte()(stream); // convert the byte to bit array

						var bits = new Array(8);

						for (var i = 0; i < 8; i++) {
							bits[7 - i] = !!(_byte & (1 << i));
						} // convert the bit array to values based on the schema

						return Object.keys(schema).reduce(function (res, key) {
							var def = schema[key];

							if (def.length) {
								res[key] = subBitsTotal(bits, def.index, def.length);
							} else {
								res[key] = bits[def.index];
							}

							return res;
						}, {});
					};
				};

				exports.readBits = readBits;

				/***/
			},

		/***/ 8761:
			/***/ (__unused_webpack_module, exports, __webpack_require__) => {
				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true,
				});
				exports['default'] = void 0;

				var _ = __webpack_require__(1658);

				var _uint = __webpack_require__(2794);

				// a set of 0x00 terminated subblocks
				var subBlocksSchema = {
					blocks: function blocks(stream) {
						var terminator = 0x00;
						var chunks = [];
						var streamSize = stream.data.length;
						var total = 0;

						for (
							var size = (0, _uint.readByte)()(stream);
							size !== terminator;
							size = (0, _uint.readByte)()(stream)
						) {
							// catch corrupted files with no terminator
							if (stream.pos + size >= streamSize) {
								var availableSize = streamSize - stream.pos;
								chunks.push((0, _uint.readBytes)(availableSize)(stream));
								total += availableSize;
								break;
							}

							chunks.push((0, _uint.readBytes)(size)(stream));
							total += size;
						}

						var result = new Uint8Array(total);
						var offset = 0;

						for (var i = 0; i < chunks.length; i++) {
							result.set(chunks[i], offset);
							offset += chunks[i].length;
						}

						return result;
					},
				}; // global control extension

				var gceSchema = (0, _.conditional)(
					{
						gce: [
							{
								codes: (0, _uint.readBytes)(2),
							},
							{
								byteSize: (0, _uint.readByte)(),
							},
							{
								extras: (0, _uint.readBits)({
									future: {
										index: 0,
										length: 3,
									},
									disposal: {
										index: 3,
										length: 3,
									},
									userInput: {
										index: 6,
									},
									transparentColorGiven: {
										index: 7,
									},
								}),
							},
							{
								delay: (0, _uint.readUnsigned)(true),
							},
							{
								transparentColorIndex: (0, _uint.readByte)(),
							},
							{
								terminator: (0, _uint.readByte)(),
							},
						],
					},
					function (stream) {
						var codes = (0, _uint.peekBytes)(2)(stream);
						return codes[0] === 0x21 && codes[1] === 0xf9;
					},
				); // image pipeline block

				var imageSchema = (0, _.conditional)(
					{
						image: [
							{
								code: (0, _uint.readByte)(),
							},
							{
								descriptor: [
									{
										left: (0, _uint.readUnsigned)(true),
									},
									{
										top: (0, _uint.readUnsigned)(true),
									},
									{
										width: (0, _uint.readUnsigned)(true),
									},
									{
										height: (0, _uint.readUnsigned)(true),
									},
									{
										lct: (0, _uint.readBits)({
											exists: {
												index: 0,
											},
											interlaced: {
												index: 1,
											},
											sort: {
												index: 2,
											},
											future: {
												index: 3,
												length: 2,
											},
											size: {
												index: 5,
												length: 3,
											},
										}),
									},
								],
							},
							(0, _.conditional)(
								{
									lct: (0, _uint.readArray)(
										3,
										function (stream, result, parent) {
											return Math.pow(2, parent.descriptor.lct.size + 1);
										},
									),
								},
								function (stream, result, parent) {
									return parent.descriptor.lct.exists;
								},
							),
							{
								data: [
									{
										minCodeSize: (0, _uint.readByte)(),
									},
									subBlocksSchema,
								],
							},
						],
					},
					function (stream) {
						return (0, _uint.peekByte)()(stream) === 0x2c;
					},
				); // plain text block

				var textSchema = (0, _.conditional)(
					{
						text: [
							{
								codes: (0, _uint.readBytes)(2),
							},
							{
								blockSize: (0, _uint.readByte)(),
							},
							{
								preData: function preData(stream, result, parent) {
									return (0, _uint.readBytes)(parent.text.blockSize)(stream);
								},
							},
							subBlocksSchema,
						],
					},
					function (stream) {
						var codes = (0, _uint.peekBytes)(2)(stream);
						return codes[0] === 0x21 && codes[1] === 0x01;
					},
				); // application block

				var applicationSchema = (0, _.conditional)(
					{
						application: [
							{
								codes: (0, _uint.readBytes)(2),
							},
							{
								blockSize: (0, _uint.readByte)(),
							},
							{
								id: function id(stream, result, parent) {
									return (0, _uint.readString)(parent.blockSize)(stream);
								},
							},
							subBlocksSchema,
						],
					},
					function (stream) {
						var codes = (0, _uint.peekBytes)(2)(stream);
						return codes[0] === 0x21 && codes[1] === 0xff;
					},
				); // comment block

				var commentSchema = (0, _.conditional)(
					{
						comment: [
							{
								codes: (0, _uint.readBytes)(2),
							},
							subBlocksSchema,
						],
					},
					function (stream) {
						var codes = (0, _uint.peekBytes)(2)(stream);
						return codes[0] === 0x21 && codes[1] === 0xfe;
					},
				);
				var schema = [
					{
						header: [
							{
								signature: (0, _uint.readString)(3),
							},
							{
								version: (0, _uint.readString)(3),
							},
						],
					},
					{
						lsd: [
							{
								width: (0, _uint.readUnsigned)(true),
							},
							{
								height: (0, _uint.readUnsigned)(true),
							},
							{
								gct: (0, _uint.readBits)({
									exists: {
										index: 0,
									},
									resolution: {
										index: 1,
										length: 3,
									},
									sort: {
										index: 4,
									},
									size: {
										index: 5,
										length: 3,
									},
								}),
							},
							{
								backgroundColorIndex: (0, _uint.readByte)(),
							},
							{
								pixelAspectRatio: (0, _uint.readByte)(),
							},
						],
					},
					(0, _.conditional)(
						{
							gct: (0, _uint.readArray)(3, function (stream, result) {
								return Math.pow(2, result.lsd.gct.size + 1);
							}),
						},
						function (stream, result) {
							return result.lsd.gct.exists;
						},
					), // content frames
					{
						frames: (0, _.loop)(
							[
								gceSchema,
								applicationSchema,
								commentSchema,
								imageSchema,
								textSchema,
							],
							function (stream) {
								var nextCode = (0, _uint.peekByte)()(stream); // rather than check for a terminator, we should check for the existence
								// of an ext or image block to avoid infinite loops
								//var terminator = 0x3B;
								//return nextCode !== terminator;

								return nextCode === 0x21 || nextCode === 0x2c;
							},
						),
					},
				];
				var _default = schema;
				exports['default'] = _default;

				/***/
			},

		/***/ 1462:
			/***/ function (__unused_webpack_module, exports) {
				!(function (g, c) {
					true ? c(exports) : 0;
				})(this, function (g) {
					const c = Symbol('newer'),
						e = Symbol('older');
					class n {
						constructor(a, b) {
							(typeof a !== 'number' && ((b = a), (a = 0)),
								(this.size = 0),
								(this.limit = a),
								(this.oldest = this.newest = void 0),
								(this._keymap = new Map()),
								b && (this.assign(b), a < 1 && (this.limit = this.size)));
						}
						_markEntryAsUsed(a) {
							if (a === this.newest) return;
							(a[c] &&
								(a === this.oldest && (this.oldest = a[c]), (a[c][e] = a[e])),
								a[e] && (a[e][c] = a[c]),
								(a[c] = void 0),
								(a[e] = this.newest),
								this.newest && (this.newest[c] = a),
								(this.newest = a));
						}
						assign(a) {
							let b,
								d = this.limit || Number.MAX_VALUE;
							this._keymap.clear();
							let m = a[Symbol.iterator]();
							for (let h = m.next(); !h.done; h = m.next()) {
								let f = new l(h.value[0], h.value[1]);
								(this._keymap.set(f.key, f),
									b ? ((b[c] = f), (f[e] = b)) : (this.oldest = f),
									(b = f));
								if (d-- == 0) throw new Error('overflow');
							}
							((this.newest = b), (this.size = this._keymap.size));
						}
						get(a) {
							var b = this._keymap.get(a);
							return b ? (this._markEntryAsUsed(b), b.value) : void 0;
						}
						set(a, b) {
							var d = this._keymap.get(a);
							return d
								? ((d.value = b), this._markEntryAsUsed(d), this)
								: (this._keymap.set(a, (d = new l(a, b))),
									this.newest
										? ((this.newest[c] = d), (d[e] = this.newest))
										: (this.oldest = d),
									(this.newest = d),
									++this.size,
									this.size > this.limit && this.shift(),
									this);
						}
						shift() {
							var a = this.oldest;
							if (a)
								return (
									this.oldest[c]
										? ((this.oldest = this.oldest[c]),
											(this.oldest[e] = void 0))
										: ((this.oldest = void 0), (this.newest = void 0)),
									(a[c] = a[e] = void 0),
									this._keymap.delete(a.key),
									--this.size,
									[a.key, a.value]
								);
						}
						find(a) {
							let b = this._keymap.get(a);
							return b ? b.value : void 0;
						}
						has(a) {
							return this._keymap.has(a);
						}
						delete(a) {
							var b = this._keymap.get(a);
							return b
								? (this._keymap.delete(b.key),
									b[c] && b[e]
										? ((b[e][c] = b[c]), (b[c][e] = b[e]))
										: b[c]
											? ((b[c][e] = void 0), (this.oldest = b[c]))
											: b[e]
												? ((b[e][c] = void 0), (this.newest = b[e]))
												: (this.oldest = this.newest = void 0),
									this.size--,
									b.value)
								: void 0;
						}
						clear() {
							((this.oldest = this.newest = void 0),
								(this.size = 0),
								this._keymap.clear());
						}
						keys() {
							return new j(this.oldest);
						}
						values() {
							return new k(this.oldest);
						}
						entries() {
							return this;
						}
						[Symbol.iterator]() {
							return new i(this.oldest);
						}
						forEach(a, b) {
							typeof b !== 'object' && (b = this);
							let d = this.oldest;
							for (; d; ) (a.call(b, d.value, d.key, this), (d = d[c]));
						}
						toJSON() {
							for (var a = new Array(this.size), b = 0, d = this.oldest; d; )
								((a[b++] = {key: d.key, value: d.value}), (d = d[c]));
							return a;
						}
						toString() {
							for (var a = '', b = this.oldest; b; )
								((a += String(b.key) + ':' + b.value),
									(b = b[c]),
									b && (a += ' < '));
							return a;
						}
					}
					g.LRUMap = n;
					function l(a, b) {
						((this.key = a),
							(this.value = b),
							(this[c] = void 0),
							(this[e] = void 0));
					}
					function i(a) {
						this.entry = a;
					}
					((i.prototype[Symbol.iterator] = function () {
						return this;
					}),
						(i.prototype.next = function () {
							let a = this.entry;
							return a
								? ((this.entry = a[c]), {done: !1, value: [a.key, a.value]})
								: {done: !0, value: void 0};
						}));
					function j(a) {
						this.entry = a;
					}
					((j.prototype[Symbol.iterator] = function () {
						return this;
					}),
						(j.prototype.next = function () {
							let a = this.entry;
							return a
								? ((this.entry = a[c]), {done: !1, value: a.key})
								: {done: !0, value: void 0};
						}));
					function k(a) {
						this.entry = a;
					}
					((k.prototype[Symbol.iterator] = function () {
						return this;
					}),
						(k.prototype.next = function () {
							let a = this.entry;
							return a
								? ((this.entry = a[c]), {done: !1, value: a.value})
								: {done: !0, value: void 0};
						}));
				});

				/***/
			},
	},
]);
//# sourceMappingURL=450.bundle.js.map
