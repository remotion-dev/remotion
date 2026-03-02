'use strict';
(this['webpackChunk_remotion_example'] =
	this['webpackChunk_remotion_example'] || []).push([
	[143],
	{
		/***/ 1143:
			/***/ (
				__unused_webpack_module,
				__webpack_exports__,
				__webpack_require__,
			) => {
				// ESM COMPAT FLAG
				__webpack_require__.r(__webpack_exports__);

				// EXPORTS
				__webpack_require__.d(__webpack_exports__, {
					default: () => /* binding */ src_MdxTest,
				});

				// EXTERNAL MODULE: ../../node_modules/.pnpm/react@17.0.2/node_modules/react/index.js
				var react = __webpack_require__(2386);
				// EXTERNAL MODULE: ../core/dist/index.js
				var dist = __webpack_require__(4783);
				// CONCATENATED MODULE: ../../node_modules/.pnpm/@mdx-js+react@1.6.22_react@17.0.2/node_modules/@mdx-js/react/dist/esm.js

				function _defineProperty(obj, key, value) {
					if (key in obj) {
						Object.defineProperty(obj, key, {
							value: value,
							enumerable: true,
							configurable: true,
							writable: true,
						});
					} else {
						obj[key] = value;
					}

					return obj;
				}

				function _extends() {
					_extends =
						Object.assign ||
						function (target) {
							for (var i = 1; i < arguments.length; i++) {
								var source = arguments[i];

								for (var key in source) {
									if (Object.prototype.hasOwnProperty.call(source, key)) {
										target[key] = source[key];
									}
								}
							}

							return target;
						};

					return _extends.apply(this, arguments);
				}

				function ownKeys(object, enumerableOnly) {
					var keys = Object.keys(object);

					if (Object.getOwnPropertySymbols) {
						var symbols = Object.getOwnPropertySymbols(object);
						if (enumerableOnly)
							symbols = symbols.filter(function (sym) {
								return Object.getOwnPropertyDescriptor(object, sym).enumerable;
							});
						keys.push.apply(keys, symbols);
					}

					return keys;
				}

				function _objectSpread2(target) {
					for (var i = 1; i < arguments.length; i++) {
						var source = arguments[i] != null ? arguments[i] : {};

						if (i % 2) {
							ownKeys(Object(source), true).forEach(function (key) {
								_defineProperty(target, key, source[key]);
							});
						} else if (Object.getOwnPropertyDescriptors) {
							Object.defineProperties(
								target,
								Object.getOwnPropertyDescriptors(source),
							);
						} else {
							ownKeys(Object(source)).forEach(function (key) {
								Object.defineProperty(
									target,
									key,
									Object.getOwnPropertyDescriptor(source, key),
								);
							});
						}
					}

					return target;
				}

				function _objectWithoutPropertiesLoose(source, excluded) {
					if (source == null) return {};
					var target = {};
					var sourceKeys = Object.keys(source);
					var key, i;

					for (i = 0; i < sourceKeys.length; i++) {
						key = sourceKeys[i];
						if (excluded.indexOf(key) >= 0) continue;
						target[key] = source[key];
					}

					return target;
				}

				function _objectWithoutProperties(source, excluded) {
					if (source == null) return {};

					var target = _objectWithoutPropertiesLoose(source, excluded);

					var key, i;

					if (Object.getOwnPropertySymbols) {
						var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

						for (i = 0; i < sourceSymbolKeys.length; i++) {
							key = sourceSymbolKeys[i];
							if (excluded.indexOf(key) >= 0) continue;
							if (!Object.prototype.propertyIsEnumerable.call(source, key))
								continue;
							target[key] = source[key];
						}
					}

					return target;
				}

				var isFunction = function isFunction(obj) {
					return typeof obj === 'function';
				};

				var MDXContext = /*#__PURE__*/ react.createContext({});
				var withMDXComponents = function withMDXComponents(Component) {
					return function (props) {
						var allComponents = useMDXComponents(props.components);
						return /*#__PURE__*/ React.createElement(
							Component,
							_extends({}, props, {
								components: allComponents,
							}),
						);
					};
				};
				var useMDXComponents = function useMDXComponents(components) {
					var contextComponents = react.useContext(MDXContext);
					var allComponents = contextComponents;

					if (components) {
						allComponents = isFunction(components)
							? components(contextComponents)
							: _objectSpread2(
									_objectSpread2({}, contextComponents),
									components,
								);
					}

					return allComponents;
				};
				var MDXProvider = function MDXProvider(props) {
					var allComponents = useMDXComponents(props.components);
					return /*#__PURE__*/ React.createElement(
						MDXContext.Provider,
						{
							value: allComponents,
						},
						props.children,
					);
				};

				var TYPE_PROP_NAME = 'mdxType';
				var DEFAULTS = {
					inlineCode: 'code',
					wrapper: function wrapper(_ref) {
						var children = _ref.children;
						return /*#__PURE__*/ react.createElement(
							react.Fragment,
							{},
							children,
						);
					},
				};
				var MDXCreateElement = /*#__PURE__*/ react.forwardRef(
					function (props, ref) {
						var propComponents = props.components,
							mdxType = props.mdxType,
							originalType = props.originalType,
							parentName = props.parentName,
							etc = _objectWithoutProperties(props, [
								'components',
								'mdxType',
								'originalType',
								'parentName',
							]);

						var components = useMDXComponents(propComponents);
						var type = mdxType;
						var Component =
							components[''.concat(parentName, '.').concat(type)] ||
							components[type] ||
							DEFAULTS[type] ||
							originalType;

						if (propComponents) {
							return /*#__PURE__*/ react.createElement(
								Component,
								_objectSpread2(
									_objectSpread2(
										{
											ref: ref,
										},
										etc,
									),
									{},
									{
										components: propComponents,
									},
								),
							);
						}

						return /*#__PURE__*/ react.createElement(
							Component,
							_objectSpread2(
								{
									ref: ref,
								},
								etc,
							),
						);
					},
				);
				MDXCreateElement.displayName = 'MDXCreateElement';
				function createElement(type, props) {
					var args = arguments;
					var mdxType = props && props.mdxType;

					if (typeof type === 'string' || mdxType) {
						var argsLength = args.length;
						var createElementArgArray = new Array(argsLength);
						createElementArgArray[0] = MDXCreateElement;
						var newProps = {};

						for (var key in props) {
							if (hasOwnProperty.call(props, key)) {
								newProps[key] = props[key];
							}
						}

						newProps.originalType = type;
						newProps[TYPE_PROP_NAME] =
							typeof type === 'string' ? type : mdxType;
						createElementArgArray[1] = newProps;

						for (var i = 2; i < argsLength; i++) {
							createElementArgArray[i] = args[i];
						}

						return react.createElement.apply(null, createElementArgArray);
					}

					return react.createElement.apply(null, args);
				}
				// CONCATENATED MODULE: ./src/MdxTest/hmm.mdx
				var _excluded = ['components'];

				function hmm_extends() {
					hmm_extends =
						Object.assign ||
						function (target) {
							for (var i = 1; i < arguments.length; i++) {
								var source = arguments[i];
								for (var key in source) {
									if (Object.prototype.hasOwnProperty.call(source, key)) {
										target[key] = source[key];
									}
								}
							}
							return target;
						};
					return hmm_extends.apply(this, arguments);
				}

				function hmm_objectWithoutProperties(source, excluded) {
					if (source == null) return {};
					var target = hmm_objectWithoutPropertiesLoose(source, excluded);
					var key, i;
					if (Object.getOwnPropertySymbols) {
						var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
						for (i = 0; i < sourceSymbolKeys.length; i++) {
							key = sourceSymbolKeys[i];
							if (excluded.indexOf(key) >= 0) continue;
							if (!Object.prototype.propertyIsEnumerable.call(source, key))
								continue;
							target[key] = source[key];
						}
					}
					return target;
				}

				function hmm_objectWithoutPropertiesLoose(source, excluded) {
					if (source == null) return {};
					var target = {};
					var sourceKeys = Object.keys(source);
					var key, i;
					for (i = 0; i < sourceKeys.length; i++) {
						key = sourceKeys[i];
						if (excluded.indexOf(key) >= 0) continue;
						target[key] = source[key];
					}
					return target;
				}

				var readingTime = {
					text: '1 min read',
					minutes: 0.055,
					time: 3300,
					words: 11,
				};
				/* @jsxRuntime classic */

				/* @jsx mdx */

				var layoutProps = {};
				var MDXLayout = 'wrapper';
				function MDXContent(_ref) {
					var components = _ref.components,
						props = hmm_objectWithoutProperties(_ref, _excluded);

					return createElement(
						MDXLayout,
						hmm_extends({}, layoutProps, props, {
							components: components,
							mdxType: 'MDXLayout',
						}),
						createElement(
							'h2',
							{
								id: 'hi-there',
							},
							'Hi there',
						),
						createElement(
							'ul',
							null,
							createElement(
								'li',
								{
									parentName: 'ul',
								},
								'List support',
							),
							createElement(
								'li',
								{
									parentName: 'ul',
								},
								'wow',
							),
						),
						createElement(
							'div',
							{
								style: {
									color: 'green',
								},
							},
							'MDX',
						),
					);
				}
				MDXContent.isMDXComponent = true;
				var tableOfContents = function tableOfContents() {
					var components =
						arguments.length > 0 && arguments[0] !== undefined
							? arguments[0]
							: {};
					return [
						{
							id: 'hi-there',
							level: 2,
							title: 'Hi there',
							children: [],
						},
					];
				};
				var frontMatter = {};
				// CONCATENATED MODULE: ./src/MdxTest/index.tsx

				const MdxTest = () => {
					return /* @__PURE__ */ react.createElement(
						dist.AbsoluteFill,
						{
							style: {
								backgroundColor: 'white',
								fontSize: 40,
								fontFamily: 'Helvetica',
								padding: 30,
							},
						},
						/* @__PURE__ */ react.createElement(MDXContent, null),
					);
				};
				/* harmony default export */ const src_MdxTest = MdxTest;

				/***/
			},
	},
]);
//# sourceMappingURL=143.bundle.js.map
