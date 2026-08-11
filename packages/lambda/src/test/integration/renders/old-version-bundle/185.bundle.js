'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[185],
	{
		/***/ 1185:
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
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_2__ =
					__webpack_require__(4783);
				/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_2___default =
					/*#__PURE__*/ __webpack_require__.n(
						remotion__WEBPACK_IMPORTED_MODULE_2__,
					);
				/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ =
					__webpack_require__(2922);

				const Title = styled_components__WEBPACK_IMPORTED_MODULE_1__ /* ["default"].div */
					.ZP.div`
	font-size: 80px;
	font-family: 'Roboto';
	color: white;
	font-weight: bold;
`;
				const Subtitle = styled_components__WEBPACK_IMPORTED_MODULE_1__ /* ["default"].div */
					.ZP.div`
	font-family: 'Roboto';
	font-size: 50px;
	color: white;
	margin-top: 20px;
	margin-bottom: 80px;
`;
				const Link = styled_components__WEBPACK_IMPORTED_MODULE_1__ /* ["default"].div */
					.ZP.div`
	color: white;
	font-size: 45px;
	font-family: 'Roboto';
`;
				const getStickerScale = (frame, index) => {
					const duration = 10;
					const start = index * 10;
					if (frame < start) {
						return 0;
					}
					if (frame > start + duration) {
						return 1;
					}
					return (frame - start) / duration;
				};
				const Rating = () => {
					const [handle] = (0, react__WEBPACK_IMPORTED_MODULE_0__.useState)(
						() => (0, remotion__WEBPACK_IMPORTED_MODULE_2__.delayRender)(),
					);
					const [data, setData] = (0,
					react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
					const fetchData = (0,
					react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
						const resource = await fetch('http://localhost:8000/packs/xoloi');
						const json = await resource.json();
						setData(json);
					}, []);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
						(0, remotion__WEBPACK_IMPORTED_MODULE_2__.continueRender)(handle);
					}, [data, handle]);
					(0, react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
						fetchData();
					}, [fetchData]);
					const frame = (0,
					remotion__WEBPACK_IMPORTED_MODULE_2__.useCurrentFrame)();
					if (!data) {
						return null;
					}
					return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
						'div',
						{
							style: {
								flex: 1,
								padding: 80,
								flexDirection: 'column',
								display: 'flex',
								background: 'linear-gradient(to bottom left, #5851db, #405de6)',
							},
						},
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							null,
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								Title,
								null,
								'New Pack available',
							),
							data
								? /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
										Subtitle,
										null,
										data.data.pack.name,
										' by ',
										data.data.pack.publisher,
									)
								: null,
							data
								? data == null
									? void 0
									: data.data.pack.stickers.slice(0, 12).map((d, i) =>
											/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
												remotion__WEBPACK_IMPORTED_MODULE_2__.Img,
												{
													key: d.id,
													src: `https://anysticker.imgix.net/${d.source}`,
													style: {
														height: 306,
														width: 306,
														transform: `scale(${getStickerScale(frame, i)})`,
													},
												},
											),
										)
								: null,
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							{
								style: {flex: 1},
							},
						),
						/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
							'div',
							{
								style: {
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									opacity:
										frame < 140 ? 0 : frame > 160 ? 1 : (frame - 140) / 20,
								},
							},
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								remotion__WEBPACK_IMPORTED_MODULE_2__.Img,
								{
									src: 'https://www.anysticker.app/logo-transparent.png',
									style: {height: 200, width: 200, marginRight: 40},
								},
							),
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								'div',
								{
									style: {flex: 1},
								},
							),
							/* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(
								Link,
								null,
								'anysticker.app/',
								data.data.pack.id,
							),
						),
					);
				};
				/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Rating;

				/***/
			},
	},
]);
//# sourceMappingURL=185.bundle.js.map
