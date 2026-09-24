(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/core/dist/esm/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbsoluteFill",
    ()=>AbsoluteFill,
    "AnimatedImage",
    ()=>AnimatedImage,
    "Artifact",
    ()=>Artifact,
    "Audio",
    ()=>Audio,
    "Composition",
    ()=>Composition,
    "Config",
    ()=>Config,
    "Easing",
    ()=>Easing,
    "Experimental",
    ()=>Experimental,
    "Folder",
    ()=>Folder,
    "FolderContext",
    ()=>FolderContext,
    "Freeze",
    ()=>Freeze,
    "Html5Audio",
    ()=>Html5Audio,
    "Html5Video",
    ()=>Html5Video,
    "IFrame",
    ()=>IFrame,
    "Img",
    ()=>Img,
    "Internals",
    ()=>Internals,
    "Loop",
    ()=>Loop,
    "OffthreadVideo",
    ()=>OffthreadVideo,
    "Sequence",
    ()=>Sequence,
    "Series",
    ()=>Series,
    "Still",
    ()=>Still,
    "VERSION",
    ()=>VERSION,
    "Video",
    ()=>Video,
    "cancelRender",
    ()=>cancelRender,
    "continueRender",
    ()=>continueRender,
    "delayRender",
    ()=>delayRender,
    "getInputProps",
    ()=>getInputProps,
    "getRemotionEnvironment",
    ()=>getRemotionEnvironment,
    "getStaticFiles",
    ()=>getStaticFiles,
    "interpolate",
    ()=>interpolate,
    "interpolateColors",
    ()=>interpolateColors,
    "measureSpring",
    ()=>measureSpring,
    "prefetch",
    ()=>prefetch,
    "random",
    ()=>random,
    "registerRoot",
    ()=>registerRoot,
    "spring",
    ()=>spring,
    "staticFile",
    ()=>staticFile,
    "useBufferState",
    ()=>useBufferState,
    "useCurrentFrame",
    ()=>useCurrentFrame,
    "useCurrentScale",
    ()=>useCurrentScale,
    "useDelayRender",
    ()=>useDelayRender,
    "useRemotionEnvironment",
    ()=>useRemotionEnvironment,
    "useVideoConfig",
    ()=>useVideoConfig,
    "watchStaticFile",
    ()=>watchStaticFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// src/_check-rsc.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature(), _s17 = __turbopack_context__.k.signature(), _s18 = __turbopack_context__.k.signature(), _s19 = __turbopack_context__.k.signature(), _s20 = __turbopack_context__.k.signature(), _s21 = __turbopack_context__.k.signature(), _s22 = __turbopack_context__.k.signature(), _s23 = __turbopack_context__.k.signature(), _s24 = __turbopack_context__.k.signature(), _s25 = __turbopack_context__.k.signature(), _s26 = __turbopack_context__.k.signature(), _s27 = __turbopack_context__.k.signature(), _s28 = __turbopack_context__.k.signature(), _s29 = __turbopack_context__.k.signature(), _s30 = __turbopack_context__.k.signature(), _s31 = __turbopack_context__.k.signature(), _s32 = __turbopack_context__.k.signature(), _s33 = __turbopack_context__.k.signature(), _s34 = __turbopack_context__.k.signature(), _s35 = __turbopack_context__.k.signature(), _s36 = __turbopack_context__.k.signature(), _s37 = __turbopack_context__.k.signature(), _s38 = __turbopack_context__.k.signature(), _s39 = __turbopack_context__.k.signature(), _s40 = __turbopack_context__.k.signature(), _s41 = __turbopack_context__.k.signature(), _s42 = __turbopack_context__.k.signature(), _s43 = __turbopack_context__.k.signature(), _s44 = __turbopack_context__.k.signature(), _s45 = __turbopack_context__.k.signature(), _s46 = __turbopack_context__.k.signature(), _s47 = __turbopack_context__.k.signature(), _s48 = __turbopack_context__.k.signature(), _s49 = __turbopack_context__.k.signature(), _s50 = __turbopack_context__.k.signature(), _s51 = __turbopack_context__.k.signature(), _s52 = __turbopack_context__.k.signature(), _s53 = __turbopack_context__.k.signature(), _s54 = __turbopack_context__.k.signature(), _s55 = __turbopack_context__.k.signature(), _s56 = __turbopack_context__.k.signature(), _s57 = __turbopack_context__.k.signature(), _s58 = __turbopack_context__.k.signature(), _s59 = __turbopack_context__.k.signature(), _s60 = __turbopack_context__.k.signature(), _s61 = __turbopack_context__.k.signature(), _s62 = __turbopack_context__.k.signature(), _s63 = __turbopack_context__.k.signature(), _s64 = __turbopack_context__.k.signature(), _s65 = __turbopack_context__.k.signature(), _s66 = __turbopack_context__.k.signature(), _s67 = __turbopack_context__.k.signature(), _s68 = __turbopack_context__.k.signature(), _s69 = __turbopack_context__.k.signature(), _s70 = __turbopack_context__.k.signature(), _s71 = __turbopack_context__.k.signature(), _s72 = __turbopack_context__.k.signature(), _s73 = __turbopack_context__.k.signature(), _s74 = __turbopack_context__.k.signature(), _s75 = __turbopack_context__.k.signature(), _s76 = __turbopack_context__.k.signature(), _s77 = __turbopack_context__.k.signature();
var __defProp = Object.defineProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue)=>all[name] = ()=>newValue
    });
};
;
if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"] !== "function") {
    const err = [
        'Remotion requires React.createContext, but it is "undefined".',
        'If you are in a React Server Component, turn it into a client component by adding "use client" at the top of the file.',
        "",
        "Before:",
        '  import {useCurrentFrame} from "remotion";',
        "",
        "After:",
        '  "use client";',
        '  import {useCurrentFrame} from "remotion";'
    ];
    throw new Error(err.join(`
`));
}
// src/Clipper.tsx
var Clipper = ()=>{
    throw new Error("<Clipper> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.");
};
_c = Clipper;
;
;
// src/get-remotion-environment.ts
function getNodeEnvString() {
    return [
        "NOD",
        "E_EN",
        "V"
    ].join("");
}
var getEnvString = ()=>{
    return [
        "e",
        "nv"
    ].join("");
};
var getRemotionEnvironment = ()=>{
    const isPlayer = ("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_isPlayer;
    const isRendering = ("TURBOPACK compile-time value", "object") !== "undefined" && typeof window.process !== "undefined" && typeof window.process.env !== "undefined" && (window.process[getEnvString()][getNodeEnvString()] === "test" || window.process[getEnvString()][getNodeEnvString()] === "production" && ("TURBOPACK compile-time value", "object") !== "undefined" && typeof window.remotion_puppeteerTimeout !== "undefined");
    const isStudio = ("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_isStudio;
    const isReadOnlyStudio = ("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_isReadOnlyStudio;
    return {
        isStudio,
        isRendering,
        isPlayer,
        isReadOnlyStudio,
        isClientSideRendering: false
    };
};
// src/enable-sequence-stack-traces.ts
var originalCreateElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement;
var originalJsx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].jsx;
var componentsToAddStacksTo = [];
var enableProxy = (api)=>{
    return new Proxy(api, {
        apply (target, thisArg, argArray) {
            if (componentsToAddStacksTo.includes(argArray[0])) {
                const [first, props, ...rest] = argArray;
                const newProps = {
                    ...props ?? {},
                    stack: new Error().stack
                };
                return Reflect.apply(target, thisArg, [
                    first,
                    newProps,
                    ...rest
                ]);
            }
            return Reflect.apply(target, thisArg, argArray);
        }
    });
};
var enableSequenceStackTraces = ()=>{
    if (!getRemotionEnvironment().isStudio) {
        return;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement = enableProxy(originalCreateElement);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].jsx = enableProxy(originalJsx);
};
var addSequenceStackTraces = (component)=>{
    componentsToAddStacksTo.push(component);
    enableSequenceStackTraces();
};
;
;
var IsPlayerContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(false);
var IsPlayerContextProvider = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(IsPlayerContext.Provider, {
        value: true,
        children
    });
};
_c1 = IsPlayerContextProvider;
var useIsPlayer = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(IsPlayerContext);
};
_s(useIsPlayer, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
// src/truthy.ts
function truthy(value) {
    return Boolean(value);
}
// src/version.ts
var VERSION = "4.0.365";
// src/multiple-versions-warning.ts
var checkMultipleRemotionVersions = ()=>{
    if (typeof globalThis === "undefined") {
        return;
    }
    const set = ()=>{
        globalThis.remotion_imported = VERSION;
        if ("TURBOPACK compile-time truthy", 1) {
            window.remotion_imported = VERSION;
        }
    };
    const alreadyImported = globalThis.remotion_imported || ("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_imported;
    if (alreadyImported) {
        if (alreadyImported === VERSION) {
            return;
        }
        if (typeof alreadyImported === "string" && alreadyImported.includes("webcodecs")) {
            set();
            return;
        }
        throw new TypeError(`\uD83D\uDEA8 Multiple versions of Remotion detected: ${[
            VERSION,
            typeof alreadyImported === "string" ? alreadyImported : "an older version"
        ].filter(truthy).join(" and ")}. This will cause things to break in an unexpected way.
Check that all your Remotion packages are on the same version. If your dependencies depend on Remotion, make them peer dependencies. You can also run \`npx remotion versions\` from your terminal to see which versions are mismatching.`);
    }
    set();
};
// src/Null.tsx
var Null = ()=>{
    throw new Error("<Null> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.");
};
_c2 = Null;
;
;
;
var hasTailwindClassName = ({ className, classPrefix, type })=>{
    if (!className) {
        return false;
    }
    if (type === "exact") {
        const split = className.split(" ");
        return classPrefix.some((token)=>{
            return split.some((part)=>{
                return part.trim() === token || part.trim().endsWith(`:${token}`) || part.trim().endsWith(`!${token}`);
            });
        });
    }
    return classPrefix.some((prefix)=>{
        return className.startsWith(prefix) || className.includes(` ${prefix}`) || className.includes(`!${prefix}`) || className.includes(`:${prefix}`);
    });
};
var AbsoluteFillRefForwarding = (props, ref)=>{
    _s1();
    const { style, ...other } = props;
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AbsoluteFillRefForwarding.useMemo[actualStyle]": ()=>{
            return {
                position: "absolute",
                top: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "top-",
                        "inset-"
                    ],
                    type: "prefix"
                }) ? undefined : 0,
                left: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "left-",
                        "inset-"
                    ],
                    type: "prefix"
                }) ? undefined : 0,
                right: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "right-",
                        "inset-"
                    ],
                    type: "prefix"
                }) ? undefined : 0,
                bottom: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "bottom-",
                        "inset-"
                    ],
                    type: "prefix"
                }) ? undefined : 0,
                width: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "w-"
                    ],
                    type: "prefix"
                }) ? undefined : "100%",
                height: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "h-"
                    ],
                    type: "prefix"
                }) ? undefined : "100%",
                display: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "block",
                        "inline-block",
                        "inline",
                        "flex",
                        "inline-flex",
                        "flow-root",
                        "grid",
                        "inline-grid",
                        "contents",
                        "list-item",
                        "hidden"
                    ],
                    type: "exact"
                }) ? undefined : "flex",
                flexDirection: hasTailwindClassName({
                    className: other.className,
                    classPrefix: [
                        "flex-row",
                        "flex-col",
                        "flex-row-reverse",
                        "flex-col-reverse"
                    ],
                    type: "exact"
                }) ? undefined : "column",
                ...style
            };
        }
    }["AbsoluteFillRefForwarding.useMemo[actualStyle]"], [
        other.className,
        style
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref,
        style: actualStyle,
        ...other
    });
};
_s1(AbsoluteFillRefForwarding, "66dr8DYHP1ewqkjJjoMI4wd74SE=");
_c3 = AbsoluteFillRefForwarding;
var AbsoluteFill = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(AbsoluteFillRefForwarding);
_c4 = AbsoluteFill;
;
var SequenceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
;
;
var SequenceManager = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext({
    registerSequence: ()=>{
        throw new Error("SequenceManagerContext not initialized");
    },
    unregisterSequence: ()=>{
        throw new Error("SequenceManagerContext not initialized");
    },
    sequences: []
});
var SequenceVisibilityToggleContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext({
    hidden: {},
    setHidden: ()=>{
        throw new Error("SequenceVisibilityToggle not initialized");
    }
});
var SequenceManagerProvider = ({ children })=>{
    _s2();
    const [sequences, setSequences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hidden, setHidden] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const registerSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SequenceManagerProvider.useCallback[registerSequence]": (seq)=>{
            setSequences({
                "SequenceManagerProvider.useCallback[registerSequence]": (seqs)=>{
                    return [
                        ...seqs,
                        seq
                    ];
                }
            }["SequenceManagerProvider.useCallback[registerSequence]"]);
        }
    }["SequenceManagerProvider.useCallback[registerSequence]"], []);
    const unregisterSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SequenceManagerProvider.useCallback[unregisterSequence]": (seq)=>{
            setSequences({
                "SequenceManagerProvider.useCallback[unregisterSequence]": (seqs)=>seqs.filter({
                        "SequenceManagerProvider.useCallback[unregisterSequence]": (s)=>s.id !== seq
                    }["SequenceManagerProvider.useCallback[unregisterSequence]"])
            }["SequenceManagerProvider.useCallback[unregisterSequence]"]);
        }
    }["SequenceManagerProvider.useCallback[unregisterSequence]"], []);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SequenceManagerProvider.useMemo2[sequenceContext]": ()=>{
            return {
                registerSequence,
                sequences,
                unregisterSequence
            };
        }
    }["SequenceManagerProvider.useMemo2[sequenceContext]"], [
        registerSequence,
        sequences,
        unregisterSequence
    ]);
    const hiddenContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SequenceManagerProvider.useMemo2[hiddenContext]": ()=>{
            return {
                hidden,
                setHidden
            };
        }
    }["SequenceManagerProvider.useMemo2[hiddenContext]"], [
        hidden
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceManager.Provider, {
        value: sequenceContext,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceVisibilityToggleContext.Provider, {
            value: hiddenContext,
            children
        })
    });
};
_s2(SequenceManagerProvider, "Wj63vH0e9O+gCzvgyv/Og8MZVvs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c5 = SequenceManagerProvider;
;
var NonceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    getNonce: ()=>0,
    fastRefreshes: 0,
    manualRefreshes: 0
});
var SetNonceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    increaseManualRefreshes: ()=>{}
});
var useNonce = ()=>{
    _s3();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(NonceContext);
    const [nonce, setNonce] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useNonce.useState2": ()=>context.getNonce()
    }["useNonce.useState2"]);
    const lastContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(context);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useNonce.useEffect": ()=>{
            if (lastContext.current === context) {
                return;
            }
            lastContext.current = context;
            setNonce(context.getNonce);
        }
    }["useNonce.useEffect"], [
        context
    ]);
    return nonce;
};
_s3(useNonce, "LH2V1TQeb+WMAYA6lyjnXPhCjfM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]
    ];
});
// src/timeline-position-state.ts
var exports_timeline_position_state = {};
__export(exports_timeline_position_state, {
    useTimelineSetFrame: ()=>useTimelineSetFrame,
    useTimelinePosition: ()=>useTimelinePosition,
    usePlayingState: ()=>usePlayingState,
    persistCurrentFrame: ()=>persistCurrentFrame,
    getInitialFrameState: ()=>getInitialFrameState,
    getFrameForComposition: ()=>getFrameForComposition,
    TimelineContext: ()=>TimelineContext,
    SetTimelineContext: ()=>SetTimelineContext
});
;
;
;
var RemotionEnvironmentContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(null);
// src/use-remotion-environment.ts
var useRemotionEnvironment = ()=>{
    _s4();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(RemotionEnvironmentContext);
    const [env] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useRemotionEnvironment.useState3": ()=>getRemotionEnvironment()
    }["useRemotionEnvironment.useState3"]);
    return context ?? env;
};
_s4(useRemotionEnvironment, "L1GEh4JBqnmyOXYk5eiwutC5Jqw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]
    ];
});
;
;
var CompositionManager = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    compositions: [],
    folders: [],
    currentCompositionMetadata: null,
    canvasContent: null
});
var CompositionSetters = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    registerComposition: ()=>{
        return;
    },
    unregisterComposition: ()=>{
        return;
    },
    registerFolder: ()=>{
        return;
    },
    unregisterFolder: ()=>{
        return;
    },
    setCanvasContent: ()=>{
        return;
    },
    updateCompositionDefaultProps: ()=>{
        return;
    },
    onlyRenderComposition: null
});
;
;
;
var EditorPropsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    props: {},
    updateProps: ()=>{
        throw new Error("Not implemented");
    },
    resetUnsaved: ()=>{
        throw new Error("Not implemented");
    }
});
var editorPropsProviderRef = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createRef();
var timeValueRef = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createRef();
var EditorPropsProvider = ({ children })=>{
    _s5();
    const [props, setProps] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState({});
    const updateProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EditorPropsProvider.useCallback2[updateProps]": ({ defaultProps, id, newProps })=>{
            setProps({
                "EditorPropsProvider.useCallback2[updateProps]": (prev)=>{
                    return {
                        ...prev,
                        [id]: typeof newProps === "function" ? newProps(prev[id] ?? defaultProps) : newProps
                    };
                }
            }["EditorPropsProvider.useCallback2[updateProps]"]);
        }
    }["EditorPropsProvider.useCallback2[updateProps]"], []);
    const resetUnsaved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EditorPropsProvider.useCallback2[resetUnsaved]": (compositionId)=>{
            setProps({
                "EditorPropsProvider.useCallback2[resetUnsaved]": (prev)=>{
                    if (prev[compositionId]) {
                        const newProps = {
                            ...prev
                        };
                        delete newProps[compositionId];
                        return newProps;
                    }
                    return prev;
                }
            }["EditorPropsProvider.useCallback2[resetUnsaved]"]);
        }
    }["EditorPropsProvider.useCallback2[resetUnsaved]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(editorPropsProviderRef, {
        "EditorPropsProvider.useImperativeHandle": ()=>{
            return {
                getProps: ({
                    "EditorPropsProvider.useImperativeHandle": ()=>props
                })["EditorPropsProvider.useImperativeHandle"],
                setProps
            };
        }
    }["EditorPropsProvider.useImperativeHandle"], [
        props
    ]);
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EditorPropsProvider.useMemo3[ctx]": ()=>{
            return {
                props,
                updateProps,
                resetUnsaved
            };
        }
    }["EditorPropsProvider.useMemo3[ctx]"], [
        props,
        resetUnsaved,
        updateProps
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(EditorPropsContext.Provider, {
        value: ctx,
        children
    });
};
_s5(EditorPropsProvider, "yboaiQSCYFa1ZKLunbNyYLE9Ke0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c6 = EditorPropsProvider;
// src/input-props-override.ts
var getKey = ()=>{
    return `remotion_inputPropsOverride` + window.location.origin;
};
var getInputPropsOverride = ()=>{
    if (typeof localStorage === "undefined") return null;
    const override = localStorage.getItem(getKey());
    if (!override) return null;
    return JSON.parse(override);
};
var setInputPropsOverride = (override)=>{
    if (typeof localStorage === "undefined") return;
    if (override === null) {
        localStorage.removeItem(getKey());
        return;
    }
    localStorage.setItem(getKey(), JSON.stringify(override));
};
// src/input-props-serialization.ts
var DATE_TOKEN = "remotion-date:";
var FILE_TOKEN = "remotion-file:";
var serializeJSONWithSpecialTypes = ({ data, indent, staticBase })=>{
    let customDateUsed = false;
    let customFileUsed = false;
    let mapUsed = false;
    let setUsed = false;
    try {
        const serializedString = JSON.stringify(data, function(key, value) {
            const item = this[key];
            if (item instanceof Date) {
                customDateUsed = true;
                return `${DATE_TOKEN}${item.toISOString()}`;
            }
            if (item instanceof Map) {
                mapUsed = true;
                return value;
            }
            if (item instanceof Set) {
                setUsed = true;
                return value;
            }
            if (typeof item === "string" && staticBase !== null && item.startsWith(staticBase)) {
                customFileUsed = true;
                return `${FILE_TOKEN}${item.replace(staticBase + "/", "")}`;
            }
            return value;
        }, indent);
        return {
            serializedString,
            customDateUsed,
            customFileUsed,
            mapUsed,
            setUsed
        };
    } catch (err) {
        throw new Error("Could not serialize the passed input props to JSON: " + err.message);
    }
};
var deserializeJSONWithSpecialTypes = (data)=>{
    return JSON.parse(data, (_, value)=>{
        if (typeof value === "string" && value.startsWith(DATE_TOKEN)) {
            return new Date(value.replace(DATE_TOKEN, ""));
        }
        if (typeof value === "string" && value.startsWith(FILE_TOKEN)) {
            return `${window.remotion_staticBase}/${value.replace(FILE_TOKEN, "")}`;
        }
        return value;
    });
};
var serializeThenDeserialize = (props)=>{
    return deserializeJSONWithSpecialTypes(serializeJSONWithSpecialTypes({
        data: props,
        indent: 2,
        staticBase: window.remotion_staticBase
    }).serializedString);
};
var serializeThenDeserializeInStudio = (props)=>{
    if (getRemotionEnvironment().isStudio) {
        return serializeThenDeserialize(props);
    }
    return props;
};
// src/config/input-props.ts
var didWarnSSRImport = false;
var warnOnceSSRImport = ()=>{
    if (didWarnSSRImport) {
        return;
    }
    didWarnSSRImport = true;
    console.warn("Called `getInputProps()` on the server. This function is not available server-side and has returned an empty object.");
    console.warn("To hide this warning, don't call this function on the server:");
    console.warn("  typeof window === 'undefined' ? {} : getInputProps()");
};
var getInputProps = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (getRemotionEnvironment().isPlayer) {
        throw new Error("You cannot call `getInputProps()` from a <Player>. Instead, the props are available as React props from component that you passed as `component` prop.");
    }
    const override = getInputPropsOverride();
    if (override) {
        return override;
    }
    const param = window.remotion_inputProps;
    if (!param) {
        return {};
    }
    const parsed = deserializeJSONWithSpecialTypes(param);
    return parsed;
};
// src/codec.ts
var validCodecs = [
    "h264",
    "h265",
    "vp8",
    "vp9",
    "mp3",
    "aac",
    "wav",
    "prores",
    "h264-mkv",
    "h264-ts",
    "gif"
];
// src/validation/validate-default-codec.ts
function validateCodec(defaultCodec, location, name) {
    if (typeof defaultCodec === "undefined") {
        return;
    }
    if (typeof defaultCodec !== "string") {
        throw new TypeError(`The "${name}" prop ${location} must be a string, but you passed a value of type ${typeof defaultCodec}.`);
    }
    if (!validCodecs.includes(defaultCodec)) {
        throw new Error(`The "${name}" prop ${location} must be one of ${validCodecs.join(", ")}, but you passed ${defaultCodec}.`);
    }
}
// src/validation/validate-dimensions.ts
function validateDimension(amount, nameOfProp, location) {
    if (typeof amount !== "number") {
        throw new Error(`The "${nameOfProp}" prop ${location} must be a number, but you passed a value of type ${typeof amount}`);
    }
    if (isNaN(amount)) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must not be NaN, but is NaN.`);
    }
    if (!Number.isFinite(amount)) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be finite, but is ${amount}.`);
    }
    if (amount % 1 !== 0) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be an integer, but is ${amount}.`);
    }
    if (amount <= 0) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be positive, but got ${amount}.`);
    }
}
// src/validation/validate-duration-in-frames.ts
function validateDurationInFrames(durationInFrames, options) {
    const { allowFloats, component } = options;
    if (typeof durationInFrames === "undefined") {
        throw new Error(`The "durationInFrames" prop ${component} is missing.`);
    }
    if (typeof durationInFrames !== "number") {
        throw new Error(`The "durationInFrames" prop ${component} must be a number, but you passed a value of type ${typeof durationInFrames}`);
    }
    if (durationInFrames <= 0) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be positive, but got ${durationInFrames}.`);
    }
    if (!allowFloats && durationInFrames % 1 !== 0) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be an integer, but got ${durationInFrames}.`);
    }
    if (!Number.isFinite(durationInFrames)) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be finite, but got ${durationInFrames}.`);
    }
}
// src/validation/validate-fps.ts
function validateFps(fps, location, isGif) {
    if (typeof fps !== "number") {
        throw new Error(`"fps" must be a number, but you passed a value of type ${typeof fps} ${location}`);
    }
    if (!Number.isFinite(fps)) {
        throw new Error(`"fps" must be a finite, but you passed ${fps} ${location}`);
    }
    if (isNaN(fps)) {
        throw new Error(`"fps" must not be NaN, but got ${fps} ${location}`);
    }
    if (fps <= 0) {
        throw new TypeError(`"fps" must be positive, but got ${fps} ${location}`);
    }
    if (isGif && fps > 50) {
        throw new TypeError(`The FPS for a GIF cannot be higher than 50. Use the --every-nth-frame option to lower the FPS: https://remotion.dev/docs/render-as-gif`);
    }
}
// src/resolve-video-config.ts
var validateCalculated = ({ calculated, compositionId, compositionFps, compositionHeight, compositionWidth, compositionDurationInFrames })=>{
    const calculateMetadataErrorLocation = `calculated by calculateMetadata() for the composition "${compositionId}"`;
    const defaultErrorLocation = `of the "<Composition />" component with the id "${compositionId}"`;
    const width = calculated?.width ?? compositionWidth ?? undefined;
    validateDimension(width, "width", calculated?.width ? calculateMetadataErrorLocation : defaultErrorLocation);
    const height = calculated?.height ?? compositionHeight ?? undefined;
    validateDimension(height, "height", calculated?.height ? calculateMetadataErrorLocation : defaultErrorLocation);
    const fps = calculated?.fps ?? compositionFps ?? null;
    validateFps(fps, calculated?.fps ? calculateMetadataErrorLocation : defaultErrorLocation, false);
    const durationInFrames = calculated?.durationInFrames ?? compositionDurationInFrames ?? null;
    validateDurationInFrames(durationInFrames, {
        allowFloats: false,
        component: `of the "<Composition />" component with the id "${compositionId}"`
    });
    const defaultCodec = calculated?.defaultCodec;
    validateCodec(defaultCodec, calculateMetadataErrorLocation, "defaultCodec");
    const defaultOutName = calculated?.defaultOutName;
    const defaultVideoImageFormat = calculated?.defaultVideoImageFormat;
    const defaultPixelFormat = calculated?.defaultPixelFormat;
    return {
        width,
        height,
        fps,
        durationInFrames,
        defaultCodec,
        defaultOutName,
        defaultVideoImageFormat,
        defaultPixelFormat
    };
};
var resolveVideoConfig = ({ calculateMetadata, signal, defaultProps, originalProps, compositionId, compositionDurationInFrames, compositionFps, compositionHeight, compositionWidth })=>{
    const calculatedProm = calculateMetadata ? calculateMetadata({
        defaultProps,
        props: originalProps,
        abortSignal: signal,
        compositionId,
        isRendering: getRemotionEnvironment().isRendering
    }) : null;
    if (calculatedProm !== null && typeof calculatedProm === "object" && "then" in calculatedProm) {
        return calculatedProm.then((c)=>{
            const { height, width, durationInFrames, fps, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat } = validateCalculated({
                calculated: c,
                compositionDurationInFrames,
                compositionFps,
                compositionHeight,
                compositionWidth,
                compositionId
            });
            return {
                width,
                height,
                fps,
                durationInFrames,
                id: compositionId,
                defaultProps: serializeThenDeserializeInStudio(defaultProps),
                props: serializeThenDeserializeInStudio(c.props ?? originalProps),
                defaultCodec: defaultCodec ?? null,
                defaultOutName: defaultOutName ?? null,
                defaultVideoImageFormat: defaultVideoImageFormat ?? null,
                defaultPixelFormat: defaultPixelFormat ?? null
            };
        });
    }
    const data = validateCalculated({
        calculated: calculatedProm,
        compositionDurationInFrames,
        compositionFps,
        compositionHeight,
        compositionWidth,
        compositionId
    });
    if (calculatedProm === null) {
        return {
            ...data,
            id: compositionId,
            defaultProps: serializeThenDeserializeInStudio(defaultProps ?? {}),
            props: serializeThenDeserializeInStudio(originalProps),
            defaultCodec: null,
            defaultOutName: null,
            defaultVideoImageFormat: null,
            defaultPixelFormat: null
        };
    }
    return {
        ...data,
        id: compositionId,
        defaultProps: serializeThenDeserializeInStudio(defaultProps ?? {}),
        props: serializeThenDeserializeInStudio(calculatedProm.props ?? originalProps),
        defaultCodec: calculatedProm.defaultCodec ?? null,
        defaultOutName: calculatedProm.defaultOutName ?? null,
        defaultVideoImageFormat: calculatedProm.defaultVideoImageFormat ?? null,
        defaultPixelFormat: calculatedProm.defaultPixelFormat ?? null
    };
};
var resolveVideoConfigOrCatch = (params)=>{
    try {
        const promiseOrReturnValue = resolveVideoConfig(params);
        return {
            type: "success",
            result: promiseOrReturnValue
        };
    } catch (err) {
        return {
            type: "error",
            error: err
        };
    }
};
;
var ResolveCompositionContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
var resolveCompositionsRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createRef"])();
var needsResolution = (composition)=>{
    return Boolean(composition.calculateMetadata);
};
var PROPS_UPDATED_EXTERNALLY = "remotion.propsUpdatedExternally";
var ResolveCompositionConfig = ({ children })=>{
    _s6();
    const [currentRenderModalComposition, setCurrentRenderModalComposition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompositionManager);
    const { fastRefreshes, manualRefreshes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(NonceContext);
    if (manualRefreshes) {}
    const selectedComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[selectedComposition]": ()=>{
            return compositions.find({
                "ResolveCompositionConfig.useMemo4[selectedComposition]": (c)=>canvasContent && canvasContent.type === "composition" && canvasContent.compositionId === c.id
            }["ResolveCompositionConfig.useMemo4[selectedComposition]"]);
        }
    }["ResolveCompositionConfig.useMemo4[selectedComposition]"], [
        canvasContent,
        compositions
    ]);
    const renderModalComposition = compositions.find((c)=>c.id === currentRenderModalComposition);
    const { props: allEditorProps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(EditorPropsContext);
    const env = useRemotionEnvironment();
    const inputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[inputProps]": ()=>{
            return ("TURBOPACK compile-time value", "object") === "undefined" || env.isPlayer ? {} : getInputProps() ?? {};
        }
    }["ResolveCompositionConfig.useMemo4[inputProps]"], [
        env.isPlayer
    ]);
    const [resolvedConfigs, setResolvedConfigs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const selectedEditorProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[selectedEditorProps]": ()=>{
            return selectedComposition ? allEditorProps[selectedComposition.id] ?? {} : {};
        }
    }["ResolveCompositionConfig.useMemo4[selectedEditorProps]"], [
        allEditorProps,
        selectedComposition
    ]);
    const renderModalProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[renderModalProps]": ()=>{
            return renderModalComposition ? allEditorProps[renderModalComposition.id] ?? {} : {};
        }
    }["ResolveCompositionConfig.useMemo4[renderModalProps]"], [
        allEditorProps,
        renderModalComposition
    ]);
    const hasResolution = Boolean(currentCompositionMetadata);
    const doResolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ResolveCompositionConfig.useCallback3[doResolution]": ({ calculateMetadata, combinedProps, compositionDurationInFrames, compositionFps, compositionHeight, compositionId, compositionWidth, defaultProps })=>{
            const controller = new AbortController;
            if (hasResolution) {
                return controller;
            }
            const { signal } = controller;
            const result = resolveVideoConfigOrCatch({
                compositionId,
                calculateMetadata,
                originalProps: combinedProps,
                signal,
                defaultProps,
                compositionDurationInFrames,
                compositionFps,
                compositionHeight,
                compositionWidth
            });
            if (result.type === "error") {
                setResolvedConfigs({
                    "ResolveCompositionConfig.useCallback3[doResolution]": (r)=>({
                            ...r,
                            [compositionId]: {
                                type: "error",
                                error: result.error
                            }
                        })
                }["ResolveCompositionConfig.useCallback3[doResolution]"]);
                return controller;
            }
            const promOrNot = result.result;
            if (typeof promOrNot === "object" && "then" in promOrNot) {
                setResolvedConfigs({
                    "ResolveCompositionConfig.useCallback3[doResolution]": (r)=>{
                        const prev = r[compositionId];
                        if (prev?.type === "success" || prev?.type === "success-and-refreshing") {
                            return {
                                ...r,
                                [compositionId]: {
                                    type: "success-and-refreshing",
                                    result: prev.result
                                }
                            };
                        }
                        return {
                            ...r,
                            [compositionId]: {
                                type: "loading"
                            }
                        };
                    }
                }["ResolveCompositionConfig.useCallback3[doResolution]"]);
                promOrNot.then({
                    "ResolveCompositionConfig.useCallback3[doResolution]": (c)=>{
                        if (controller.signal.aborted) {
                            return;
                        }
                        setResolvedConfigs({
                            "ResolveCompositionConfig.useCallback3[doResolution]": (r)=>({
                                    ...r,
                                    [compositionId]: {
                                        type: "success",
                                        result: c
                                    }
                                })
                        }["ResolveCompositionConfig.useCallback3[doResolution]"]);
                    }
                }["ResolveCompositionConfig.useCallback3[doResolution]"]).catch({
                    "ResolveCompositionConfig.useCallback3[doResolution]": (err)=>{
                        if (controller.signal.aborted) {
                            return;
                        }
                        setResolvedConfigs({
                            "ResolveCompositionConfig.useCallback3[doResolution]": (r)=>({
                                    ...r,
                                    [compositionId]: {
                                        type: "error",
                                        error: err
                                    }
                                })
                        }["ResolveCompositionConfig.useCallback3[doResolution]"]);
                    }
                }["ResolveCompositionConfig.useCallback3[doResolution]"]);
            } else {
                setResolvedConfigs({
                    "ResolveCompositionConfig.useCallback3[doResolution]": (r)=>({
                            ...r,
                            [compositionId]: {
                                type: "success",
                                result: promOrNot
                            }
                        })
                }["ResolveCompositionConfig.useCallback3[doResolution]"]);
            }
            return controller;
        }
    }["ResolveCompositionConfig.useCallback3[doResolution]"], [
        hasResolution
    ]);
    const currentComposition = canvasContent?.type === "composition" ? canvasContent.compositionId : null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(resolveCompositionsRef, {
        "ResolveCompositionConfig.useImperativeHandle2": ()=>{
            return {
                setCurrentRenderModalComposition: ({
                    "ResolveCompositionConfig.useImperativeHandle2": (id)=>{
                        setCurrentRenderModalComposition(id);
                    }
                })["ResolveCompositionConfig.useImperativeHandle2"],
                reloadCurrentlySelectedComposition: ({
                    "ResolveCompositionConfig.useImperativeHandle2": ()=>{
                        if (!currentComposition) {
                            return;
                        }
                        const composition = compositions.find({
                            "ResolveCompositionConfig.useImperativeHandle2.composition": (c)=>c.id === currentComposition
                        }["ResolveCompositionConfig.useImperativeHandle2.composition"]);
                        if (!composition) {
                            throw new Error(`Could not find composition with id ${currentComposition}`);
                        }
                        const editorProps = allEditorProps[currentComposition] ?? {};
                        const defaultProps = {
                            ...composition.defaultProps ?? {},
                            ...editorProps ?? {}
                        };
                        const props = {
                            ...defaultProps,
                            ...inputProps ?? {}
                        };
                        doResolution({
                            defaultProps,
                            calculateMetadata: composition.calculateMetadata,
                            combinedProps: props,
                            compositionDurationInFrames: composition.durationInFrames ?? null,
                            compositionFps: composition.fps ?? null,
                            compositionHeight: composition.height ?? null,
                            compositionWidth: composition.width ?? null,
                            compositionId: composition.id
                        });
                    }
                })["ResolveCompositionConfig.useImperativeHandle2"]
            };
        }
    }["ResolveCompositionConfig.useImperativeHandle2"], [
        allEditorProps,
        compositions,
        currentComposition,
        doResolution,
        inputProps
    ]);
    const isTheSame = selectedComposition?.id === renderModalComposition?.id;
    const currentDefaultProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[currentDefaultProps]": ()=>{
            return {
                ...selectedComposition?.defaultProps ?? {},
                ...selectedEditorProps ?? {}
            };
        }
    }["ResolveCompositionConfig.useMemo4[currentDefaultProps]"], [
        selectedComposition?.defaultProps,
        selectedEditorProps
    ]);
    const originalProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[originalProps]": ()=>{
            return {
                ...currentDefaultProps,
                ...inputProps ?? {}
            };
        }
    }["ResolveCompositionConfig.useMemo4[originalProps]"], [
        currentDefaultProps,
        inputProps
    ]);
    const canResolve = selectedComposition && needsResolution(selectedComposition);
    const shouldIgnoreUpdate = ("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_ignoreFastRefreshUpdate && fastRefreshes <= window.remotion_ignoreFastRefreshUpdate;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResolveCompositionConfig.useEffect2": ()=>{
            if (shouldIgnoreUpdate) {
                return;
            }
            if (canResolve) {
                const controller = doResolution({
                    calculateMetadata: selectedComposition.calculateMetadata,
                    combinedProps: originalProps,
                    compositionDurationInFrames: selectedComposition.durationInFrames ?? null,
                    compositionFps: selectedComposition.fps ?? null,
                    compositionHeight: selectedComposition.height ?? null,
                    compositionWidth: selectedComposition.width ?? null,
                    defaultProps: currentDefaultProps,
                    compositionId: selectedComposition.id
                });
                return ({
                    "ResolveCompositionConfig.useEffect2": ()=>{
                        controller.abort();
                    }
                })["ResolveCompositionConfig.useEffect2"];
            }
        }
    }["ResolveCompositionConfig.useEffect2"], [
        canResolve,
        currentDefaultProps,
        doResolution,
        originalProps,
        selectedComposition?.calculateMetadata,
        selectedComposition?.durationInFrames,
        selectedComposition?.fps,
        selectedComposition?.height,
        selectedComposition?.id,
        selectedComposition?.width,
        shouldIgnoreUpdate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResolveCompositionConfig.useEffect2": ()=>{
            if (renderModalComposition && !isTheSame) {
                const combinedProps = {
                    ...renderModalComposition.defaultProps ?? {},
                    ...renderModalProps ?? {},
                    ...inputProps ?? {}
                };
                const controller = doResolution({
                    calculateMetadata: renderModalComposition.calculateMetadata,
                    compositionDurationInFrames: renderModalComposition.durationInFrames ?? null,
                    compositionFps: renderModalComposition.fps ?? null,
                    compositionHeight: renderModalComposition.height ?? null,
                    compositionId: renderModalComposition.id,
                    compositionWidth: renderModalComposition.width ?? null,
                    defaultProps: currentDefaultProps,
                    combinedProps
                });
                return ({
                    "ResolveCompositionConfig.useEffect2": ()=>{
                        controller.abort();
                    }
                })["ResolveCompositionConfig.useEffect2"];
            }
        }
    }["ResolveCompositionConfig.useEffect2"], [
        currentDefaultProps,
        doResolution,
        inputProps,
        isTheSame,
        renderModalComposition,
        renderModalProps
    ]);
    const resolvedConfigsIncludingStaticOnes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResolveCompositionConfig.useMemo4[resolvedConfigsIncludingStaticOnes]": ()=>{
            const staticComps = compositions.filter({
                "ResolveCompositionConfig.useMemo4[resolvedConfigsIncludingStaticOnes].staticComps": (c)=>{
                    return c.calculateMetadata === null;
                }
            }["ResolveCompositionConfig.useMemo4[resolvedConfigsIncludingStaticOnes].staticComps"]);
            return {
                ...resolvedConfigs,
                ...staticComps.reduce({
                    "ResolveCompositionConfig.useMemo4[resolvedConfigsIncludingStaticOnes]": (acc, curr)=>{
                        return {
                            ...acc,
                            [curr.id]: {
                                type: "success",
                                result: {
                                    ...curr,
                                    defaultProps: curr.defaultProps ?? {}
                                }
                            }
                        };
                    }
                }["ResolveCompositionConfig.useMemo4[resolvedConfigsIncludingStaticOnes]"], {})
            };
        }
    }["ResolveCompositionConfig.useMemo4[resolvedConfigsIncludingStaticOnes]"], [
        compositions,
        resolvedConfigs
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ResolveCompositionContext.Provider, {
        value: resolvedConfigsIncludingStaticOnes,
        children
    });
};
_s6(ResolveCompositionConfig, "ZYyvzwWDw1PQhZsvj3bjziC6AXQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c7 = ResolveCompositionConfig;
var useResolvedVideoConfig = (preferredCompositionId)=>{
    _s7();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ResolveCompositionContext);
    const { props: allEditorProps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(EditorPropsContext);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompositionManager);
    const currentComposition = canvasContent?.type === "composition" ? canvasContent.compositionId : null;
    const compositionId = preferredCompositionId ?? currentComposition;
    const composition = compositions.find((c)=>c.id === compositionId);
    const selectedEditorProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useResolvedVideoConfig.useMemo4[selectedEditorProps]": ()=>{
            return composition ? allEditorProps[composition.id] ?? {} : {};
        }
    }["useResolvedVideoConfig.useMemo4[selectedEditorProps]"], [
        allEditorProps,
        composition
    ]);
    const env = useRemotionEnvironment();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useResolvedVideoConfig.useMemo4": ()=>{
            if (!composition) {
                return null;
            }
            if (currentCompositionMetadata) {
                return {
                    type: "success",
                    result: {
                        ...currentCompositionMetadata,
                        id: composition.id,
                        defaultProps: composition.defaultProps ?? {}
                    }
                };
            }
            if (!needsResolution(composition)) {
                validateDurationInFrames(composition.durationInFrames, {
                    allowFloats: false,
                    component: `in <Composition id="${composition.id}">`
                });
                validateFps(composition.fps, `in <Composition id="${composition.id}">`, false);
                validateDimension(composition.width, "width", `in <Composition id="${composition.id}">`);
                validateDimension(composition.height, "height", `in <Composition id="${composition.id}">`);
                return {
                    type: "success",
                    result: {
                        width: composition.width,
                        height: composition.height,
                        fps: composition.fps,
                        id: composition.id,
                        durationInFrames: composition.durationInFrames,
                        defaultProps: composition.defaultProps ?? {},
                        props: {
                            ...composition.defaultProps ?? {},
                            ...selectedEditorProps ?? {},
                            ...("TURBOPACK compile-time value", "object") === "undefined" || env.isPlayer ? {} : getInputProps() ?? {}
                        },
                        defaultCodec: null,
                        defaultOutName: null,
                        defaultVideoImageFormat: null,
                        defaultPixelFormat: null
                    }
                };
            }
            if (!context[composition.id]) {
                return null;
            }
            return context[composition.id];
        }
    }["useResolvedVideoConfig.useMemo4"], [
        composition,
        context,
        currentCompositionMetadata,
        selectedEditorProps,
        env.isPlayer
    ]);
};
_s7(useResolvedVideoConfig, "EgS8w3GbeZv5LfHR4KnwmOTo2UU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/use-video.ts
var useVideo = ()=>{
    _s8();
    const { canvasContent, compositions, currentCompositionMetadata } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompositionManager);
    const selected = compositions.find((c)=>{
        return canvasContent?.type === "composition" && c.id === canvasContent.compositionId;
    });
    const resolved = useResolvedVideoConfig(selected?.id ?? null);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useVideo.useMemo5": ()=>{
            if (!resolved) {
                return null;
            }
            if (resolved.type === "error") {
                return null;
            }
            if (resolved.type === "loading") {
                return null;
            }
            if (!selected) {
                return null;
            }
            return {
                ...resolved.result,
                defaultProps: selected.defaultProps ?? {},
                id: selected.id,
                ...currentCompositionMetadata ?? {},
                component: selected.component
            };
        }
    }["useVideo.useMemo5"], [
        currentCompositionMetadata,
        resolved,
        selected
    ]);
};
_s8(useVideo, "FL+oJKdM9yEmIlkTEHZoKauoZMs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useResolvedVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/timeline-position-state.ts
var TimelineContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    frame: {},
    playing: false,
    playbackRate: 1,
    rootId: "",
    imperativePlaying: {
        current: false
    },
    setPlaybackRate: ()=>{
        throw new Error("default");
    },
    audioAndVideoTags: {
        current: []
    }
});
var SetTimelineContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    setFrame: ()=>{
        throw new Error("default");
    },
    setPlaying: ()=>{
        throw new Error("default");
    }
});
var makeKey = ()=>{
    return `remotion.time-all`;
};
var persistCurrentFrame = (time)=>{
    localStorage.setItem(makeKey(), JSON.stringify(time));
};
var getInitialFrameState = ()=>{
    const item = localStorage.getItem(makeKey()) ?? "{}";
    const obj = JSON.parse(item);
    return obj;
};
var getFrameForComposition = (composition)=>{
    const item = localStorage.getItem(makeKey()) ?? "{}";
    const obj = JSON.parse(item);
    if (obj[composition] !== undefined) {
        return Number(obj[composition]);
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.remotion_initialFrame ?? 0;
};
var useTimelinePosition = ()=>{
    _s9();
    const videoConfig = useVideo();
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const env = useRemotionEnvironment();
    if (!videoConfig) {
        return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : window.remotion_initialFrame ?? 0;
    }
    const unclamped = state.frame[videoConfig.id] ?? (env.isPlayer ? 0 : getFrameForComposition(videoConfig.id));
    return Math.min(videoConfig.durationInFrames - 1, unclamped);
};
_s9(useTimelinePosition, "29GJrxuUIvYK2PC83v7qeWHAdaA=", false, function() {
    return [
        useVideo,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useRemotionEnvironment
    ];
});
var useTimelineSetFrame = ()=>{
    _s10();
    const { setFrame } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SetTimelineContext);
    return setFrame;
};
_s10(useTimelineSetFrame, "MyqxSOcQifXqj7n50pkVDERq48k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
var usePlayingState = ()=>{
    _s11();
    const { playing, imperativePlaying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const { setPlaying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SetTimelineContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "usePlayingState.useMemo6": ()=>[
                playing,
                setPlaying,
                imperativePlaying
            ]
    }["usePlayingState.useMemo6"], [
        imperativePlaying,
        playing,
        setPlaying
    ]);
};
_s11(usePlayingState, "coNUb58adqxc86vI9Z2O3dk1Li8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
;
;
;
var CanUseRemotionHooks = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(false);
var CanUseRemotionHooksProvider = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooks.Provider, {
        value: true,
        children
    });
};
_c8 = CanUseRemotionHooksProvider;
;
var useUnsafeVideoConfig = ()=>{
    _s12();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const ctxWidth = context?.width ?? null;
    const ctxHeight = context?.height ?? null;
    const ctxDuration = context?.durationInFrames ?? null;
    const video = useVideo();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useUnsafeVideoConfig.useMemo7": ()=>{
            if (!video) {
                return null;
            }
            const { id, durationInFrames, fps, height, width, defaultProps, props, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat } = video;
            return {
                id,
                width: ctxWidth ?? width,
                height: ctxHeight ?? height,
                fps,
                durationInFrames: ctxDuration ?? durationInFrames,
                defaultProps,
                props,
                defaultCodec,
                defaultOutName,
                defaultVideoImageFormat,
                defaultPixelFormat
            };
        }
    }["useUnsafeVideoConfig.useMemo7"], [
        ctxDuration,
        ctxHeight,
        ctxWidth,
        video
    ]);
};
_s12(useUnsafeVideoConfig, "Xj3qEVL18xeDo2TenB+G8yagiHI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useVideo,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/use-video-config.ts
var useVideoConfig = ()=>{
    _s13();
    const videoConfig = useUnsafeVideoConfig();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CanUseRemotionHooks);
    const isPlayer = useIsPlayer();
    if (!videoConfig) {
        if (("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_isPlayer || isPlayer) {
            throw new Error([
                "No video config found. Likely reasons:",
                "- You are probably calling useVideoConfig() from outside the component passed to <Player />. See https://www.remotion.dev/docs/player/examples for how to set up the Player correctly.",
                "- You have multiple versions of Remotion installed which causes the React context to get lost."
            ].join("-"));
        }
        throw new Error("No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.");
    }
    if (!context) {
        throw new Error("Called useVideoConfig() outside a Remotion composition.");
    }
    return videoConfig;
};
_s13(useVideoConfig, "ZWVog00dETkqGLoBukvvZzu9hWo=", false, function() {
    return [
        useUnsafeVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useIsPlayer
    ];
});
;
;
var useCurrentFrame = ()=>{
    _s14();
    const canUseRemotionHooks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CanUseRemotionHooks);
    const env = useRemotionEnvironment();
    if (!canUseRemotionHooks) {
        if (env.isPlayer) {
            throw new Error(`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`);
        }
        throw new Error(`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`);
    }
    const frame = useTimelinePosition();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const contextOffset = context ? context.cumulatedFrom + context.relativeFrom : 0;
    return frame - contextOffset;
};
_s14(useCurrentFrame, "cghgtqYk8/3K/hNefs7FfbryU2c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useRemotionEnvironment,
        useTimelinePosition,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
;
var Freeze = ({ frame: frameToFreeze, children, active = true })=>{
    _s15();
    const frame = useCurrentFrame();
    const videoConfig = useVideoConfig();
    if (typeof frameToFreeze === "undefined") {
        throw new Error(`The <Freeze /> component requires a 'frame' prop, but none was passed.`);
    }
    if (typeof frameToFreeze !== "number") {
        throw new Error(`The 'frame' prop of <Freeze /> must be a number, but is of type ${typeof frameToFreeze}`);
    }
    if (Number.isNaN(frameToFreeze)) {
        throw new Error(`The 'frame' prop of <Freeze /> must be a real number, but it is NaN.`);
    }
    if (!Number.isFinite(frameToFreeze)) {
        throw new Error(`The 'frame' prop of <Freeze /> must be a finite number, but it is ${frameToFreeze}.`);
    }
    const isActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Freeze.useMemo8[isActive]": ()=>{
            if (typeof active === "boolean") {
                return active;
            }
            if (typeof active === "function") {
                return active(frame);
            }
        }
    }["Freeze.useMemo8[isActive]"], [
        active,
        frame
    ]);
    const timelineContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const relativeFrom = sequenceContext?.relativeFrom ?? 0;
    const timelineValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Freeze.useMemo8[timelineValue]": ()=>{
            if (!isActive) {
                return timelineContext;
            }
            return {
                ...timelineContext,
                playing: false,
                imperativePlaying: {
                    current: false
                },
                frame: {
                    [videoConfig.id]: frameToFreeze + relativeFrom
                }
            };
        }
    }["Freeze.useMemo8[timelineValue]"], [
        isActive,
        timelineContext,
        videoConfig.id,
        frameToFreeze,
        relativeFrom
    ]);
    const newSequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Freeze.useMemo8[newSequenceContext]": ()=>{
            if (!sequenceContext) {
                return null;
            }
            if (!isActive) {
                return sequenceContext;
            }
            return {
                ...sequenceContext,
                relativeFrom: 0,
                cumulatedFrom: 0
            };
        }
    }["Freeze.useMemo8[newSequenceContext]"], [
        sequenceContext,
        isActive
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(TimelineContext.Provider, {
        value: timelineValue,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceContext.Provider, {
            value: newSequenceContext,
            children
        })
    });
};
_s15(Freeze, "77tvsvcCeygotPP8mx5xLz4ZJyk=", false, function() {
    return [
        useCurrentFrame,
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c9 = Freeze;
;
var RegularSequenceRefForwardingFunction = ({ from = 0, durationInFrames = Infinity, children, name, height, width, showInTimeline = true, _remotionInternalLoopDisplay: loopDisplay, _remotionInternalStack: stack, _remotionInternalPremountDisplay: premountDisplay, _remotionInternalPostmountDisplay: postmountDisplay, ...other }, ref)=>{
    _s16();
    const { layout = "absolute-fill" } = other;
    const [id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "RegularSequenceRefForwardingFunction.useState5": ()=>String(Math.random())
    }["RegularSequenceRefForwardingFunction.useState5"]);
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const { rootId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const cumulatedFrom = parentSequence ? parentSequence.cumulatedFrom + parentSequence.relativeFrom : 0;
    const nonce = useNonce();
    if (layout !== "absolute-fill" && layout !== "none") {
        throw new TypeError(`The layout prop of <Sequence /> expects either "absolute-fill" or "none", but you passed: ${layout}`);
    }
    if (layout === "none" && typeof other.style !== "undefined") {
        throw new TypeError('If layout="none", you may not pass a style.');
    }
    if (typeof durationInFrames !== "number") {
        throw new TypeError(`You passed to durationInFrames an argument of type ${typeof durationInFrames}, but it must be a number.`);
    }
    if (durationInFrames <= 0) {
        throw new TypeError(`durationInFrames must be positive, but got ${durationInFrames}`);
    }
    if (typeof from !== "number") {
        throw new TypeError(`You passed to the "from" props of your <Sequence> an argument of type ${typeof from}, but it must be a number.`);
    }
    if (!Number.isFinite(from)) {
        throw new TypeError(`The "from" prop of a sequence must be finite, but got ${from}.`);
    }
    const absoluteFrame = useTimelinePosition();
    const videoConfig = useVideoConfig();
    const parentSequenceDuration = parentSequence ? Math.min(parentSequence.durationInFrames - from, durationInFrames) : durationInFrames;
    const actualDurationInFrames = Math.max(0, Math.min(videoConfig.durationInFrames - from, parentSequenceDuration));
    const { registerSequence, unregisterSequence } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceManager);
    const { hidden } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceVisibilityToggleContext);
    const premounting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RegularSequenceRefForwardingFunction.useMemo9[premounting]": ()=>{
            return parentSequence?.premounting || Boolean(other._remotionInternalIsPremounting);
        }
    }["RegularSequenceRefForwardingFunction.useMemo9[premounting]"], [
        other._remotionInternalIsPremounting,
        parentSequence?.premounting
    ]);
    const postmounting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RegularSequenceRefForwardingFunction.useMemo9[postmounting]": ()=>{
            return parentSequence?.postmounting || Boolean(other._remotionInternalIsPostmounting);
        }
    }["RegularSequenceRefForwardingFunction.useMemo9[postmounting]"], [
        other._remotionInternalIsPostmounting,
        parentSequence?.postmounting
    ]);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RegularSequenceRefForwardingFunction.useMemo9[contextValue]": ()=>{
            return {
                cumulatedFrom,
                relativeFrom: from,
                durationInFrames: actualDurationInFrames,
                parentFrom: parentSequence?.relativeFrom ?? 0,
                id,
                height: height ?? parentSequence?.height ?? null,
                width: width ?? parentSequence?.width ?? null,
                premounting,
                postmounting,
                premountDisplay: premountDisplay ?? null,
                postmountDisplay: postmountDisplay ?? null
            };
        }
    }["RegularSequenceRefForwardingFunction.useMemo9[contextValue]"], [
        cumulatedFrom,
        from,
        actualDurationInFrames,
        parentSequence,
        id,
        height,
        width,
        premounting,
        postmounting,
        premountDisplay,
        postmountDisplay
    ]);
    const timelineClipName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RegularSequenceRefForwardingFunction.useMemo9[timelineClipName]": ()=>{
            return name ?? "";
        }
    }["RegularSequenceRefForwardingFunction.useMemo9[timelineClipName]"], [
        name
    ]);
    const env = useRemotionEnvironment();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RegularSequenceRefForwardingFunction.useEffect3": ()=>{
            if (!env.isStudio) {
                return;
            }
            registerSequence({
                from,
                duration: actualDurationInFrames,
                id,
                displayName: timelineClipName,
                parent: parentSequence?.id ?? null,
                type: "sequence",
                rootId,
                showInTimeline,
                nonce,
                loopDisplay,
                stack: stack ?? null,
                premountDisplay: premountDisplay ?? null,
                postmountDisplay: postmountDisplay ?? null
            });
            return ({
                "RegularSequenceRefForwardingFunction.useEffect3": ()=>{
                    unregisterSequence(id);
                }
            })["RegularSequenceRefForwardingFunction.useEffect3"];
        }
    }["RegularSequenceRefForwardingFunction.useEffect3"], [
        durationInFrames,
        id,
        name,
        registerSequence,
        timelineClipName,
        unregisterSequence,
        parentSequence?.id,
        actualDurationInFrames,
        rootId,
        from,
        showInTimeline,
        nonce,
        loopDisplay,
        stack,
        premountDisplay,
        postmountDisplay,
        env.isStudio
    ]);
    const endThreshold = Math.ceil(cumulatedFrom + from + durationInFrames - 1);
    const content = absoluteFrame < cumulatedFrom + from ? null : absoluteFrame > endThreshold ? null : children;
    const styleIfThere = other.layout === "none" ? undefined : other.style;
    const defaultStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RegularSequenceRefForwardingFunction.useMemo9[defaultStyle]": ()=>{
            return {
                flexDirection: undefined,
                ...width ? {
                    width
                } : {},
                ...height ? {
                    height
                } : {},
                ...styleIfThere ?? {}
            };
        }
    }["RegularSequenceRefForwardingFunction.useMemo9[defaultStyle]"], [
        height,
        styleIfThere,
        width
    ]);
    if (ref !== null && layout === "none") {
        throw new TypeError('It is not supported to pass both a `ref` and `layout="none"` to <Sequence />.');
    }
    const isSequenceHidden = hidden[id] ?? false;
    if (isSequenceHidden) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceContext.Provider, {
        value: contextValue,
        children: content === null ? null : other.layout === "none" ? content : /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(AbsoluteFill, {
            ref,
            style: defaultStyle,
            className: other.className,
            children: content
        })
    });
};
_s16(RegularSequenceRefForwardingFunction, "RxeuRc7mN+JJUw7D4BADz6INyhY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useNonce,
        useTimelinePosition,
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c10 = RegularSequenceRefForwardingFunction;
var RegularSequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(RegularSequenceRefForwardingFunction);
_c11 = RegularSequence;
var PremountedPostmountedSequenceRefForwardingFunction = (props, ref)=>{
    _s17();
    const frame = useCurrentFrame();
    if (props.layout === "none") {
        throw new Error('`<Sequence>` with `premountFor` and `postmountFor` props does not support layout="none"');
    }
    const { style: passedStyle, from = 0, durationInFrames = Infinity, premountFor = 0, postmountFor = 0, styleWhilePremounted, styleWhilePostmounted, ...otherProps } = props;
    const endThreshold = Math.ceil(from + durationInFrames - 1);
    const premountingActive = frame < from && frame >= from - premountFor;
    const postmountingActive = frame > endThreshold && frame <= endThreshold + postmountFor;
    const freezeFrame = premountingActive ? from : postmountingActive ? from + durationInFrames - 1 : 0;
    const isFreezingActive = premountingActive || postmountingActive;
    const style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PremountedPostmountedSequenceRefForwardingFunction.useMemo9[style]": ()=>{
            return {
                ...passedStyle,
                opacity: premountingActive || postmountingActive ? 0 : 1,
                pointerEvents: premountingActive || postmountingActive ? "none" : passedStyle?.pointerEvents ?? undefined,
                ...premountingActive ? styleWhilePremounted : {},
                ...postmountingActive ? styleWhilePostmounted : {}
            };
        }
    }["PremountedPostmountedSequenceRefForwardingFunction.useMemo9[style]"], [
        passedStyle,
        premountingActive,
        postmountingActive,
        styleWhilePremounted,
        styleWhilePostmounted
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Freeze, {
        frame: freezeFrame,
        active: isFreezingActive,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            ref,
            from,
            durationInFrames,
            style,
            _remotionInternalPremountDisplay: premountFor,
            _remotionInternalPostmountDisplay: postmountFor,
            _remotionInternalIsPremounting: premountingActive,
            _remotionInternalIsPostmounting: postmountingActive,
            ...otherProps
        })
    });
};
_s17(PremountedPostmountedSequenceRefForwardingFunction, "Zp0m5eqVpCSkQnhnxLrOIL80vBg=", false, function() {
    return [
        useCurrentFrame,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c12 = PremountedPostmountedSequenceRefForwardingFunction;
var PremountedPostmountedSequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(PremountedPostmountedSequenceRefForwardingFunction);
_c13 = PremountedPostmountedSequence;
var SequenceRefForwardingFunction = (props, ref)=>{
    _s18();
    const env = useRemotionEnvironment();
    if (props.layout !== "none" && !env.isRendering) {
        if (props.premountFor || props.postmountFor) {
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PremountedPostmountedSequence, {
                ...props,
                ref
            });
        }
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RegularSequence, {
        ...props,
        ref
    });
};
_s18(SequenceRefForwardingFunction, "w9xR/KOgGaVj+z25QsOyD6U/dtc=", false, function() {
    return [
        useRemotionEnvironment
    ];
});
_c14 = SequenceRefForwardingFunction;
var Sequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(SequenceRefForwardingFunction);
_c15 = Sequence;
;
// src/cancel-render.ts
var isErrorLike = (err)=>{
    if (err instanceof Error) {
        return true;
    }
    if (err === null) {
        return false;
    }
    if (typeof err !== "object") {
        return false;
    }
    if (!("stack" in err)) {
        return false;
    }
    if (typeof err.stack !== "string") {
        return false;
    }
    if (!("message" in err)) {
        return false;
    }
    if (typeof err.message !== "string") {
        return false;
    }
    return true;
};
function cancelRender(err) {
    let error;
    if (isErrorLike(err)) {
        error = err;
        if (!error.stack) {
            error.stack = new Error(error.message).stack;
        }
    } else if (typeof err === "string") {
        error = Error(err);
    } else {
        error = Error("Rendering was cancelled");
    }
    window.remotion_cancelledError = error.stack;
    throw error;
}
;
// src/log.ts
var logLevels = [
    "trace",
    "verbose",
    "info",
    "warn",
    "error"
];
var getNumberForLogLevel = (level)=>{
    return logLevels.indexOf(level);
};
var isEqualOrBelowLogLevel = (currentLevel, level)=>{
    return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};
var transformArgs = ({ args, logLevel, tag })=>{
    const arr = [
        ...args
    ];
    if (getRemotionEnvironment().isRendering && !getRemotionEnvironment().isClientSideRendering) {
        arr.unshift(Symbol.for(`__remotion_level_${logLevel}`));
    }
    if (tag && getRemotionEnvironment().isRendering && !getRemotionEnvironment().isClientSideRendering) {
        arr.unshift(Symbol.for(`__remotion_tag_${tag}`));
    }
    return arr;
};
var verbose = (options, ...args)=>{
    if (isEqualOrBelowLogLevel(options.logLevel, "verbose")) {
        return console.debug(...transformArgs({
            args,
            logLevel: "verbose",
            tag: options.tag
        }));
    }
};
var trace = (options, ...args)=>{
    if (isEqualOrBelowLogLevel(options.logLevel, "trace")) {
        return console.debug(...transformArgs({
            args,
            logLevel: "trace",
            tag: options.tag
        }));
    }
};
var info = (options, ...args)=>{
    if (isEqualOrBelowLogLevel(options.logLevel, "info")) {
        return console.log(...transformArgs({
            args,
            logLevel: "info",
            tag: options.tag
        }));
    }
};
var warn = (options, ...args)=>{
    if (isEqualOrBelowLogLevel(options.logLevel, "warn")) {
        return console.warn(...transformArgs({
            args,
            logLevel: "warn",
            tag: options.tag
        }));
    }
};
var error = (options, ...args)=>{
    return console.error(...transformArgs({
        args,
        logLevel: "error",
        tag: options.tag
    }));
};
var Log = {
    trace,
    verbose,
    info,
    warn,
    error
};
// src/delay-render.ts
var handles = [];
if ("TURBOPACK compile-time truthy", 1) {
    window.remotion_renderReady = false;
    if (!window.remotion_delayRenderTimeouts) {
        window.remotion_delayRenderTimeouts = {};
    }
}
var DELAY_RENDER_CALLSTACK_TOKEN = "The delayRender was called:";
var DELAY_RENDER_RETRIES_LEFT = "Retries left: ";
var DELAY_RENDER_RETRY_TOKEN = "- Rendering the frame will be retried.";
var DELAY_RENDER_CLEAR_TOKEN = "handle was cleared after";
var defaultTimeout = 30000;
var delayRenderInternal = (environment, label, options)=>{
    if (typeof label !== "string" && typeof label !== "undefined") {
        throw new Error("The label parameter of delayRender() must be a string or undefined, got: " + JSON.stringify(label));
    }
    const handle = Math.random();
    handles.push(handle);
    const called = Error().stack?.replace(/^Error/g, "") ?? "";
    if (environment.isRendering) {
        const timeoutToUse = (options?.timeoutInMilliseconds ?? (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : window.remotion_puppeteerTimeout ?? defaultTimeout)) - 2000;
        if ("TURBOPACK compile-time truthy", 1) {
            const retriesLeft = (options?.retries ?? 0) - (window.remotion_attempt - 1);
            window.remotion_delayRenderTimeouts[handle] = {
                label: label ?? null,
                startTime: Date.now(),
                timeout: setTimeout(()=>{
                    const message = [
                        `A delayRender()`,
                        label ? `"${label}"` : null,
                        `was called but not cleared after ${timeoutToUse}ms. See https://remotion.dev/docs/timeout for help.`,
                        retriesLeft > 0 ? DELAY_RENDER_RETRIES_LEFT + retriesLeft : null,
                        retriesLeft > 0 ? DELAY_RENDER_RETRY_TOKEN : null,
                        DELAY_RENDER_CALLSTACK_TOKEN,
                        called
                    ].filter(truthy).join(" ");
                    cancelRender(Error(message));
                }, timeoutToUse)
            };
        }
    }
    if ("TURBOPACK compile-time truthy", 1) {
        window.remotion_renderReady = false;
    }
    return handle;
};
var delayRender = (label, options)=>{
    return delayRenderInternal(getRemotionEnvironment(), label, options);
};
var continueRenderInternal = (handle, environment)=>{
    if (typeof handle === "undefined") {
        throw new TypeError("The continueRender() method must be called with a parameter that is the return value of delayRender(). No value was passed.");
    }
    if (typeof handle !== "number") {
        throw new TypeError("The parameter passed into continueRender() must be the return value of delayRender() which is a number. Got: " + JSON.stringify(handle));
    }
    handles = handles.filter((h)=>{
        if (h === handle) {
            if (environment.isRendering) {
                if (!window.remotion_delayRenderTimeouts[handle]) {
                    return false;
                }
                const { label, startTime, timeout } = window.remotion_delayRenderTimeouts[handle];
                clearTimeout(timeout);
                const message = [
                    label ? `"${label}"` : "A handle",
                    DELAY_RENDER_CLEAR_TOKEN,
                    `${Date.now() - startTime}ms`
                ].filter(truthy).join(" ");
                Log.verbose({
                    logLevel: window.remotion_logLevel,
                    tag: "delayRender()"
                }, message);
                delete window.remotion_delayRenderTimeouts[handle];
            }
            return false;
        }
        return true;
    });
    if (handles.length === 0 && ("TURBOPACK compile-time value", "object") !== "undefined") {
        window.remotion_renderReady = true;
    }
};
var continueRender = (handle)=>{
    continueRenderInternal(handle, getRemotionEnvironment());
};
// src/use-delay-render.ts
var useDelayRender = ()=>{
    _s19();
    const environment = useRemotionEnvironment();
    const delayRender2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDelayRender.useCallback4[delayRender2]": (label, options)=>{
            return delayRenderInternal(environment, label, options);
        }
    }["useDelayRender.useCallback4[delayRender2]"], [
        environment
    ]);
    const continueRender2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDelayRender.useCallback4[continueRender2]": (handle)=>{
            continueRenderInternal(handle, environment);
        }
    }["useDelayRender.useCallback4[continueRender2]"], [
        environment
    ]);
    return {
        delayRender: delayRender2,
        continueRender: continueRender2
    };
};
_s19(useDelayRender, "VsBhuRVzT4jYt1hINV6iTjkGvQQ=", false, function() {
    return [
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
;
;
var calcArgs = (fit, frameSize, canvasSize)=>{
    switch(fit){
        case "fill":
            {
                return [
                    0,
                    0,
                    frameSize.width,
                    frameSize.height,
                    0,
                    0,
                    canvasSize.width,
                    canvasSize.height
                ];
            }
        case "contain":
            {
                const ratio = Math.min(canvasSize.width / frameSize.width, canvasSize.height / frameSize.height);
                const centerX = (canvasSize.width - frameSize.width * ratio) / 2;
                const centerY = (canvasSize.height - frameSize.height * ratio) / 2;
                return [
                    0,
                    0,
                    frameSize.width,
                    frameSize.height,
                    centerX,
                    centerY,
                    frameSize.width * ratio,
                    frameSize.height * ratio
                ];
            }
        case "cover":
            {
                const ratio = Math.max(canvasSize.width / frameSize.width, canvasSize.height / frameSize.height);
                const centerX = (canvasSize.width - frameSize.width * ratio) / 2;
                const centerY = (canvasSize.height - frameSize.height * ratio) / 2;
                return [
                    0,
                    0,
                    frameSize.width,
                    frameSize.height,
                    centerX,
                    centerY,
                    frameSize.width * ratio,
                    frameSize.height * ratio
                ];
            }
        default:
            throw new Error("Unknown fit: " + fit);
    }
};
var CanvasRefForwardingFunction = ({ width, height, fit, className, style }, ref)=>{
    _s20();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const draw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CanvasRefForwardingFunction.useCallback5[draw]": (imageData)=>{
            const canvas = canvasRef.current;
            const canvasWidth = width ?? imageData.displayWidth;
            const canvasHeight = height ?? imageData.displayHeight;
            if (!canvas) {
                throw new Error("Canvas ref is not set");
            }
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) {
                throw new Error("Could not get 2d context");
            }
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            ctx.drawImage(imageData, ...calcArgs(fit, {
                height: imageData.displayHeight,
                width: imageData.displayWidth
            }, {
                width: canvasWidth,
                height: canvasHeight
            }));
        }
    }["CanvasRefForwardingFunction.useCallback5[draw]"], [
        fit,
        height,
        width
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "CanvasRefForwardingFunction.useImperativeHandle3": ()=>{
            return {
                draw,
                getCanvas: ({
                    "CanvasRefForwardingFunction.useImperativeHandle3": ()=>{
                        if (!canvasRef.current) {
                            throw new Error("Canvas ref is not set");
                        }
                        return canvasRef.current;
                    }
                })["CanvasRefForwardingFunction.useImperativeHandle3"],
                clear: ({
                    "CanvasRefForwardingFunction.useImperativeHandle3": ()=>{
                        const ctx = canvasRef.current?.getContext("2d");
                        if (!ctx) {
                            throw new Error("Could not get 2d context");
                        }
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                })["CanvasRefForwardingFunction.useImperativeHandle3"]
            };
        }
    }["CanvasRefForwardingFunction.useImperativeHandle3"], [
        draw
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("canvas", {
        ref: canvasRef,
        className,
        style
    });
};
_s20(CanvasRefForwardingFunction, "wbLxtuD4V5shvucqN4tpSoGCKTw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"]
    ];
});
_c16 = CanvasRefForwardingFunction;
var Canvas = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(CanvasRefForwardingFunction);
_c17 = Canvas;
// src/animated-image/decode-image.ts
var CACHE_SIZE = 5;
var getActualTime = ({ loopBehavior, durationFound, timeInSec })=>{
    return loopBehavior === "loop" ? durationFound ? timeInSec % durationFound : timeInSec : Math.min(timeInSec, durationFound || Infinity);
};
var decodeImage = async ({ resolvedSrc, signal, currentTime, initialLoopBehavior })=>{
    if (typeof ImageDecoder === "undefined") {
        throw new Error("Your browser does not support the WebCodecs ImageDecoder API.");
    }
    const res = await fetch(resolvedSrc, {
        signal
    });
    const { body } = res;
    if (!body) {
        throw new Error("Got no body");
    }
    const decoder = new ImageDecoder({
        data: body,
        type: res.headers.get("Content-Type") || "image/gif"
    });
    await decoder.completed;
    const { selectedTrack } = decoder.tracks;
    if (!selectedTrack) {
        throw new Error("No selected track");
    }
    const cache = [];
    let durationFound = null;
    const getFrameByIndex = async (frameIndex)=>{
        const foundInCache = cache.find((c)=>c.frameIndex === frameIndex);
        if (foundInCache && foundInCache.frame) {
            return foundInCache;
        }
        const frame = await decoder.decode({
            frameIndex,
            completeFramesOnly: true
        });
        if (foundInCache) {
            foundInCache.frame = frame.image;
        } else {
            cache.push({
                frame: frame.image,
                frameIndex,
                timeInSeconds: frame.image.timestamp / 1e6
            });
        }
        return {
            frame: frame.image,
            frameIndex,
            timeInSeconds: frame.image.timestamp / 1e6
        };
    };
    const clearCache = (closeToTimeInSec)=>{
        const itemsInCache = cache.filter((c)=>c.frame);
        const sortByClosestToCurrentTime = itemsInCache.sort((a, b)=>{
            const aDiff = Math.abs(a.timeInSeconds - closeToTimeInSec);
            const bDiff = Math.abs(b.timeInSeconds - closeToTimeInSec);
            return aDiff - bDiff;
        });
        for(let i = 0; i < sortByClosestToCurrentTime.length; i++){
            if (i < CACHE_SIZE) {
                continue;
            }
            const item = sortByClosestToCurrentTime[i];
            item.frame = null;
        }
    };
    const ensureFrameBeforeAndAfter = async ({ timeInSec, loopBehavior })=>{
        const actualTimeInSec = getActualTime({
            durationFound,
            loopBehavior,
            timeInSec
        });
        const framesBefore = cache.filter((c)=>c.timeInSeconds <= actualTimeInSec);
        const biggestIndex = framesBefore.map((c)=>c.frameIndex).reduce((a, b)=>Math.max(a, b), 0);
        let i = biggestIndex;
        while(true){
            const f = await getFrameByIndex(i);
            i++;
            if (!f.frame) {
                throw new Error("No frame found");
            }
            if (!f.frame.duration) {
                break;
            }
            if (i === selectedTrack.frameCount && durationFound === null) {
                const duration = (f.frame.timestamp + f.frame.duration) / 1e6;
                durationFound = duration;
            }
            if (f.timeInSeconds > actualTimeInSec || i === selectedTrack.frameCount) {
                break;
            }
        }
        if (selectedTrack.frameCount - biggestIndex < 3 && loopBehavior === "loop") {
            await getFrameByIndex(0);
        }
        clearCache(actualTimeInSec);
    };
    await ensureFrameBeforeAndAfter({
        timeInSec: currentTime,
        loopBehavior: initialLoopBehavior
    });
    await ensureFrameBeforeAndAfter({
        timeInSec: currentTime,
        loopBehavior: initialLoopBehavior
    });
    const getFrame = async (timeInSec, loopBehavior)=>{
        if (durationFound !== null && timeInSec > durationFound && loopBehavior === "clear-after-finish") {
            return null;
        }
        const actualTimeInSec = getActualTime({
            loopBehavior,
            durationFound,
            timeInSec
        });
        await ensureFrameBeforeAndAfter({
            timeInSec: actualTimeInSec,
            loopBehavior
        });
        const itemsInCache = cache.filter((c)=>c.frame);
        const closest = itemsInCache.reduce((a, b)=>{
            const aDiff = Math.abs(a.timeInSeconds - actualTimeInSec);
            const bDiff = Math.abs(b.timeInSeconds - actualTimeInSec);
            return aDiff < bDiff ? a : b;
        });
        if (!closest.frame) {
            throw new Error("No frame found");
        }
        return closest;
    };
    return {
        getFrame,
        frameCount: selectedTrack.frameCount
    };
};
// src/animated-image/resolve-image-source.tsx
var resolveAnimatedImageSource = (src)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return new URL(src, window.origin).href;
};
;
var AnimatedImage = /*#__PURE__*/ _s21((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c18 = _s21(({ src, width, height, onError, loopBehavior = "loop", playbackRate = 1, fit = "fill", ...props }, canvasRef)=>{
    _s21();
    const mountState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        isMounted: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AnimatedImage.useEffect4": ()=>{
            const { current } = mountState;
            current.isMounted = true;
            return ({
                "AnimatedImage.useEffect4": ()=>{
                    current.isMounted = false;
                }
            })["AnimatedImage.useEffect4"];
        }
    }["AnimatedImage.useEffect4"], []);
    const resolvedSrc = resolveAnimatedImageSource(src);
    const [imageDecoder, setImageDecoder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const [decodeHandle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AnimatedImage.useState6": ()=>delayRender2(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`)
    }["AnimatedImage.useState6"]);
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / playbackRate / fps;
    const currentTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(currentTime);
    currentTimeRef.current = currentTime;
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(canvasRef, {
        "AnimatedImage.useImperativeHandle4": ()=>{
            const c = ref.current?.getCanvas();
            if (!c) {
                throw new Error("Canvas ref is not set");
            }
            return c;
        }
    }["AnimatedImage.useImperativeHandle4"], []);
    const [initialLoopBehavior] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AnimatedImage.useState6": ()=>loopBehavior
    }["AnimatedImage.useState6"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AnimatedImage.useEffect4": ()=>{
            const controller = new AbortController;
            decodeImage({
                resolvedSrc,
                signal: controller.signal,
                currentTime: currentTimeRef.current,
                initialLoopBehavior
            }).then({
                "AnimatedImage.useEffect4": (d)=>{
                    setImageDecoder(d);
                    continueRender2(decodeHandle);
                }
            }["AnimatedImage.useEffect4"]).catch({
                "AnimatedImage.useEffect4": (err)=>{
                    if (err.name === "AbortError") {
                        continueRender2(decodeHandle);
                        return;
                    }
                    if (onError) {
                        onError?.(err);
                        continueRender2(decodeHandle);
                    } else {
                        cancelRender(err);
                    }
                }
            }["AnimatedImage.useEffect4"]);
            return ({
                "AnimatedImage.useEffect4": ()=>{
                    controller.abort();
                }
            })["AnimatedImage.useEffect4"];
        }
    }["AnimatedImage.useEffect4"], [
        resolvedSrc,
        decodeHandle,
        onError,
        initialLoopBehavior,
        continueRender2
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "AnimatedImage.useLayoutEffect": ()=>{
            if (!imageDecoder) {
                return;
            }
            const delay = delayRender2(`Rendering frame at ${currentTime} of <AnimatedImage src="${src}"/>`);
            imageDecoder.getFrame(currentTime, loopBehavior).then({
                "AnimatedImage.useLayoutEffect": (videoFrame)=>{
                    if (mountState.current.isMounted) {
                        if (videoFrame === null) {
                            ref.current?.clear();
                        } else {
                            ref.current?.draw(videoFrame.frame);
                        }
                    }
                    continueRender2(delay);
                }
            }["AnimatedImage.useLayoutEffect"]).catch({
                "AnimatedImage.useLayoutEffect": (err)=>{
                    if (onError) {
                        onError(err);
                        continueRender2(delay);
                    } else {
                        cancelRender(err);
                    }
                }
            }["AnimatedImage.useLayoutEffect"]);
        }
    }["AnimatedImage.useLayoutEffect"], [
        currentTime,
        imageDecoder,
        loopBehavior,
        onError,
        src,
        continueRender2,
        delayRender2
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Canvas, {
        ref,
        width,
        height,
        fit,
        ...props
    });
}, "kiW3easb32CDfgDBxTKJXQOfB6U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useCurrentFrame,
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
})), "kiW3easb32CDfgDBxTKJXQOfB6U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useCurrentFrame,
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c19 = AnimatedImage;
;
;
// src/validation/validate-artifact.ts
var validateArtifactFilename = (filename)=>{
    if (typeof filename !== "string") {
        throw new TypeError(`The "filename" must be a string, but you passed a value of type ${typeof filename}`);
    }
    if (filename.trim() === "") {
        throw new Error("The `filename` must not be empty");
    }
    if (!filename.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g)) {
        throw new Error('The `filename` must match "/^([0-9a-zA-Z-!_.*\'()/:&$@=;+,?]+)/g". Use forward slashes only, even on Windows.');
    }
};
var validateContent = (content)=>{
    if (typeof content !== "string" && !(content instanceof Uint8Array)) {
        throw new TypeError(`The "content" must be a string or Uint8Array, but you passed a value of type ${typeof content}`);
    }
    if (typeof content === "string" && content.trim() === "") {
        throw new Error("The `content` must not be empty");
    }
};
var validateRenderAsset = (artifact)=>{
    if (artifact.type !== "artifact") {
        return;
    }
    validateArtifactFilename(artifact.filename);
    if (artifact.contentType === "thumbnail") {
        return;
    }
    validateContent(artifact.content);
};
;
var RenderAssetManager = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    registerRenderAsset: ()=>{
        return;
    },
    unregisterRenderAsset: ()=>{
        return;
    },
    renderAssets: []
});
var RenderAssetManagerProvider = ({ children })=>{
    _s22();
    const [renderAssets, setRenderAssets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const registerRenderAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RenderAssetManagerProvider.useCallback6[registerRenderAsset]": (renderAsset)=>{
            validateRenderAsset(renderAsset);
            setRenderAssets({
                "RenderAssetManagerProvider.useCallback6[registerRenderAsset]": (assets)=>{
                    return [
                        ...assets,
                        renderAsset
                    ];
                }
            }["RenderAssetManagerProvider.useCallback6[registerRenderAsset]"]);
        }
    }["RenderAssetManagerProvider.useCallback6[registerRenderAsset]"], []);
    const unregisterRenderAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RenderAssetManagerProvider.useCallback6[unregisterRenderAsset]": (id)=>{
            setRenderAssets({
                "RenderAssetManagerProvider.useCallback6[unregisterRenderAsset]": (assts)=>{
                    return assts.filter({
                        "RenderAssetManagerProvider.useCallback6[unregisterRenderAsset]": (a)=>a.id !== id
                    }["RenderAssetManagerProvider.useCallback6[unregisterRenderAsset]"]);
                }
            }["RenderAssetManagerProvider.useCallback6[unregisterRenderAsset]"]);
        }
    }["RenderAssetManagerProvider.useCallback6[unregisterRenderAsset]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "RenderAssetManagerProvider.useLayoutEffect2": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                window.remotion_collectAssets = ({
                    "RenderAssetManagerProvider.useLayoutEffect2": ()=>{
                        setRenderAssets([]);
                        return renderAssets;
                    }
                })["RenderAssetManagerProvider.useLayoutEffect2"];
            }
        }
    }["RenderAssetManagerProvider.useLayoutEffect2"], [
        renderAssets
    ]);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RenderAssetManagerProvider.useMemo10[contextValue]": ()=>{
            return {
                registerRenderAsset,
                unregisterRenderAsset,
                renderAssets
            };
        }
    }["RenderAssetManagerProvider.useMemo10[contextValue]"], [
        renderAssets,
        registerRenderAsset,
        unregisterRenderAsset
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderAssetManager.Provider, {
        value: contextValue,
        children
    });
};
_s22(RenderAssetManagerProvider, "GAYtcelSEk7UT599IVwZsnFcK/A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c20 = RenderAssetManagerProvider;
// src/Artifact.tsx
var ArtifactThumbnail = Symbol("Thumbnail");
var Artifact = ({ filename, content, downloadBehavior })=>{
    _s23();
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    const env = useRemotionEnvironment();
    const frame = useCurrentFrame();
    const [id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Artifact.useState8": ()=>{
            return String(Math.random());
        }
    }["Artifact.useState8"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Artifact.useEffect5": ()=>{
            if (!env.isRendering) {
                return;
            }
            if (content instanceof Uint8Array) {
                registerRenderAsset({
                    type: "artifact",
                    id,
                    content: btoa(new TextDecoder("utf8").decode(content)),
                    filename,
                    frame,
                    contentType: "binary",
                    downloadBehavior: downloadBehavior ?? null
                });
            } else if (content === ArtifactThumbnail) {
                registerRenderAsset({
                    type: "artifact",
                    id,
                    filename,
                    frame,
                    contentType: "thumbnail",
                    downloadBehavior: downloadBehavior ?? null
                });
            } else {
                registerRenderAsset({
                    type: "artifact",
                    id,
                    content,
                    filename,
                    frame,
                    contentType: "text",
                    downloadBehavior: downloadBehavior ?? null
                });
            }
            return ({
                "Artifact.useEffect5": ()=>{
                    return unregisterRenderAsset(id);
                }
            })["Artifact.useEffect5"];
        }
    }["Artifact.useEffect5"], [
        content,
        env.isRendering,
        filename,
        frame,
        id,
        registerRenderAsset,
        unregisterRenderAsset,
        downloadBehavior
    ]);
    return null;
};
_s23(Artifact, "Bhk/QDvJxfl6XRXcWAarO2eaaks=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useRemotionEnvironment,
        useCurrentFrame,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c21 = Artifact;
Artifact.Thumbnail = ArtifactThumbnail;
;
// src/absolute-src.ts
var getAbsoluteSrc = (relativeSrc)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (relativeSrc.startsWith("http://") || relativeSrc.startsWith("https://") || relativeSrc.startsWith("file://") || relativeSrc.startsWith("blob:") || relativeSrc.startsWith("data:")) {
        return relativeSrc;
    }
    return new URL(relativeSrc, window.origin).href;
};
// src/calculate-media-duration.ts
var calculateMediaDuration = ({ trimAfter, mediaDurationInFrames, playbackRate, trimBefore })=>{
    let duration = mediaDurationInFrames;
    if (typeof trimAfter !== "undefined") {
        duration = trimAfter;
    }
    if (typeof trimBefore !== "undefined") {
        duration -= trimBefore;
    }
    const actualDuration = duration / playbackRate;
    return Math.floor(actualDuration);
};
;
;
var LoopContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
var useLoop = ()=>{
    _s24();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(LoopContext);
};
_s24(useLoop, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var Loop = ({ durationInFrames, times = Infinity, children, name, ...props })=>{
    _s25();
    const currentFrame = useCurrentFrame();
    const { durationInFrames: compDuration } = useVideoConfig();
    validateDurationInFrames(durationInFrames, {
        component: "of the <Loop /> component",
        allowFloats: true
    });
    if (typeof times !== "number") {
        throw new TypeError(`You passed to "times" an argument of type ${typeof times}, but it must be a number.`);
    }
    if (times !== Infinity && times % 1 !== 0) {
        throw new TypeError(`The "times" prop of a loop must be an integer, but got ${times}.`);
    }
    if (times < 0) {
        throw new TypeError(`The "times" prop of a loop must be at least 0, but got ${times}`);
    }
    const maxTimes = Math.ceil(compDuration / durationInFrames);
    const actualTimes = Math.min(maxTimes, times);
    const style = props.layout === "none" ? undefined : props.style;
    const maxFrame = durationInFrames * (actualTimes - 1);
    const iteration = Math.floor(currentFrame / durationInFrames);
    const start = iteration * durationInFrames;
    const from = Math.min(start, maxFrame);
    const loopDisplay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Loop.useMemo11[loopDisplay]": ()=>{
            return {
                numberOfTimes: actualTimes,
                startOffset: -from,
                durationInFrames
            };
        }
    }["Loop.useMemo11[loopDisplay]"], [
        actualTimes,
        durationInFrames,
        from
    ]);
    const loopContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Loop.useMemo11[loopContext]": ()=>{
            return {
                iteration: Math.floor(currentFrame / durationInFrames),
                durationInFrames
            };
        }
    }["Loop.useMemo11[loopContext]"], [
        currentFrame,
        durationInFrames
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(LoopContext.Provider, {
        value: loopContext,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            durationInFrames,
            from,
            name: name ?? "<Loop>",
            _remotionInternalLoopDisplay: loopDisplay,
            layout: props.layout,
            style,
            children
        })
    });
};
_s25(Loop, "E0Co9FBlGMr219xNs9t8UPM1amY=", false, function() {
    return [
        useCurrentFrame,
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c22 = Loop;
Loop.useLoop = useLoop;
;
// src/playback-logging.ts
var playbackLogging = ({ logLevel, tag, message, mountTime })=>{
    const tags = [
        mountTime ? Date.now() - mountTime + "ms " : null,
        tag
    ].filter(Boolean).join(" ");
    Log.trace({
        logLevel,
        tag: null
    }, `[${tags}]`, message);
};
;
;
var PreloadContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({});
var preloads = {};
var updaters = [];
var setPreloads = (updater)=>{
    preloads = updater(preloads);
    updaters.forEach((u)=>u());
};
var PrefetchProvider = ({ children })=>{
    _s26();
    const [_preloads, _setPreloads] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PrefetchProvider.useState9": ()=>preloads
    }["PrefetchProvider.useState9"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PrefetchProvider.useEffect6": ()=>{
            const updaterFunction = {
                "PrefetchProvider.useEffect6.updaterFunction": ()=>{
                    _setPreloads(preloads);
                }
            }["PrefetchProvider.useEffect6.updaterFunction"];
            updaters.push(updaterFunction);
            return ({
                "PrefetchProvider.useEffect6": ()=>{
                    updaters = updaters.filter({
                        "PrefetchProvider.useEffect6": (u)=>u !== updaterFunction
                    }["PrefetchProvider.useEffect6"]);
                }
            })["PrefetchProvider.useEffect6"];
        }
    }["PrefetchProvider.useEffect6"], []);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PreloadContext.Provider, {
        value: _preloads,
        children
    });
};
_s26(PrefetchProvider, "jEO4gkQYI3R86Ly6KWM3UymaDzU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c23 = PrefetchProvider;
// src/prefetch.ts
var removeAndGetHashFragment = (src)=>{
    const hashIndex = src.indexOf("#");
    if (hashIndex === -1) {
        return null;
    }
    return hashIndex;
};
var getSrcWithoutHash = (src)=>{
    const hashIndex = removeAndGetHashFragment(src);
    if (hashIndex === null) {
        return src;
    }
    return src.slice(0, hashIndex);
};
var usePreload = (src)=>{
    _s27();
    const preloads2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PreloadContext);
    const hashFragmentIndex = removeAndGetHashFragment(src);
    const withoutHashFragment = getSrcWithoutHash(src);
    if (!preloads2[withoutHashFragment]) {
        return src;
    }
    if (hashFragmentIndex !== null) {
        return preloads2[withoutHashFragment] + src.slice(hashFragmentIndex);
    }
    return preloads2[withoutHashFragment];
};
_s27(usePreload, "A0S4N/4OX0WjHZKT41S68svCPXo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
var blobToBase64 = function(blob) {
    const reader = new FileReader;
    return new Promise((resolve, reject)=>{
        reader.onload = function() {
            const dataUrl = reader.result;
            resolve(dataUrl);
        };
        reader.onerror = (err)=>{
            return reject(err);
        };
        reader.readAsDataURL(blob);
    });
};
var getBlobFromReader = async ({ reader, contentType, contentLength, onProgress })=>{
    let receivedLength = 0;
    const chunks = [];
    while(true){
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        receivedLength += value.length;
        if (onProgress) {
            onProgress({
                loadedBytes: receivedLength,
                totalBytes: contentLength
            });
        }
    }
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks){
        chunksAll.set(chunk, position);
        position += chunk.length;
    }
    return new Blob([
        chunksAll
    ], {
        type: contentType ?? undefined
    });
};
var prefetch = (src, options)=>{
    const method = options?.method ?? "blob-url";
    const logLevel = options?.logLevel ?? "info";
    const srcWithoutHash = getSrcWithoutHash(src);
    if (getRemotionEnvironment().isRendering) {
        return {
            free: ()=>{
                return;
            },
            waitUntilDone: ()=>Promise.resolve(srcWithoutHash)
        };
    }
    Log.verbose({
        logLevel,
        tag: "prefetch"
    }, `Starting prefetch ${srcWithoutHash}`);
    let canceled = false;
    let objectUrl = null;
    let resolve = ()=>{
        return;
    };
    let reject = ()=>{
        return;
    };
    const waitUntilDone = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    const controller = new AbortController;
    let canBeAborted = true;
    fetch(srcWithoutHash, {
        signal: controller.signal,
        credentials: options?.credentials ?? undefined
    }).then((res)=>{
        canBeAborted = false;
        if (canceled) {
            return null;
        }
        if (!res.ok) {
            throw new Error(`HTTP error, status = ${res.status}`);
        }
        const headerContentType = res.headers.get("Content-Type");
        const contentType = options?.contentType ?? headerContentType;
        const hasProperContentType = contentType && (contentType.startsWith("video/") || contentType.startsWith("audio/") || contentType.startsWith("image/"));
        if (!hasProperContentType) {
            console.warn(`Called prefetch() on ${srcWithoutHash} which returned a "Content-Type" of ${headerContentType}. Prefetched content should have a proper content type (video/... or audio/...) or a contentType passed the options of prefetch(). Otherwise, prefetching will not work properly in all browsers.`);
        }
        if (!res.body) {
            throw new Error(`HTTP response of ${srcWithoutHash} has no body`);
        }
        const reader = res.body.getReader();
        return getBlobFromReader({
            reader,
            contentType: options?.contentType ?? headerContentType ?? null,
            contentLength: res.headers.get("Content-Length") ? parseInt(res.headers.get("Content-Length"), 10) : null,
            onProgress: options?.onProgress
        });
    }).then((buf)=>{
        if (!buf) {
            return;
        }
        const actualBlob = options?.contentType ? new Blob([
            buf
        ], {
            type: options.contentType
        }) : buf;
        if (method === "base64") {
            return blobToBase64(actualBlob);
        }
        return URL.createObjectURL(actualBlob);
    }).then((url)=>{
        if (canceled) {
            return;
        }
        playbackLogging({
            logLevel,
            tag: "prefetch",
            message: `Finished prefetch ${srcWithoutHash} with method ${method}`,
            mountTime: null
        });
        objectUrl = url;
        setPreloads((p)=>({
                ...p,
                [srcWithoutHash]: objectUrl
            }));
        resolve(objectUrl);
    }).catch((err)=>{
        if (err?.message.includes("free() called")) {
            return;
        }
        reject(err);
    });
    return {
        free: ()=>{
            playbackLogging({
                logLevel,
                tag: "prefetch",
                message: `Freeing ${srcWithoutHash}`,
                mountTime: null
            });
            if (objectUrl) {
                if (method === "blob-url") {
                    URL.revokeObjectURL(objectUrl);
                }
                setPreloads((p)=>{
                    const copy = {
                        ...p
                    };
                    delete copy[srcWithoutHash];
                    return copy;
                });
            } else {
                canceled = true;
                if (canBeAborted) {
                    try {
                        controller.abort(new Error("free() called"));
                    } catch  {}
                }
            }
        },
        waitUntilDone: ()=>{
            return waitUntilDone;
        }
    };
};
// src/validate-media-props.ts
var validateMediaProps = (props, component)=>{
    if (typeof props.volume !== "number" && typeof props.volume !== "function" && typeof props.volume !== "undefined") {
        throw new TypeError(`You have passed a volume of type ${typeof props.volume} to your <${component} /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined.`);
    }
    if (typeof props.volume === "number" && props.volume < 0) {
        throw new TypeError(`You have passed a volume below 0 to your <${component} /> component. Volume must be between 0 and 1`);
    }
    if (typeof props.playbackRate !== "number" && typeof props.playbackRate !== "undefined") {
        throw new TypeError(`You have passed a playbackRate of type ${typeof props.playbackRate} to your <${component} /> component. Playback rate must a real number or undefined.`);
    }
    if (typeof props.playbackRate === "number" && (isNaN(props.playbackRate) || !Number.isFinite(props.playbackRate) || props.playbackRate <= 0)) {
        throw new TypeError(`You have passed a playbackRate of ${props.playbackRate} to your <${component} /> component. Playback rate must be a real number above 0.`);
    }
};
// src/validate-start-from-props.ts
var validateStartFromProps = (startFrom, endAt)=>{
    if (typeof startFrom !== "undefined") {
        if (typeof startFrom !== "number") {
            throw new TypeError(`type of startFrom prop must be a number, instead got type ${typeof startFrom}.`);
        }
        if (isNaN(startFrom) || startFrom === Infinity) {
            throw new TypeError("startFrom prop can not be NaN or Infinity.");
        }
        if (startFrom < 0) {
            throw new TypeError(`startFrom must be greater than equal to 0 instead got ${startFrom}.`);
        }
    }
    if (typeof endAt !== "undefined") {
        if (typeof endAt !== "number") {
            throw new TypeError(`type of endAt prop must be a number, instead got type ${typeof endAt}.`);
        }
        if (isNaN(endAt)) {
            throw new TypeError("endAt prop can not be NaN.");
        }
        if (endAt <= 0) {
            throw new TypeError(`endAt must be a positive number, instead got ${endAt}.`);
        }
    }
    if (endAt < startFrom) {
        throw new TypeError("endAt prop must be greater than startFrom prop.");
    }
};
var validateTrimProps = (trimBefore, trimAfter)=>{
    if (typeof trimBefore !== "undefined") {
        if (typeof trimBefore !== "number") {
            throw new TypeError(`type of trimBefore prop must be a number, instead got type ${typeof trimBefore}.`);
        }
        if (isNaN(trimBefore) || trimBefore === Infinity) {
            throw new TypeError("trimBefore prop can not be NaN or Infinity.");
        }
        if (trimBefore < 0) {
            throw new TypeError(`trimBefore must be greater than equal to 0 instead got ${trimBefore}.`);
        }
    }
    if (typeof trimAfter !== "undefined") {
        if (typeof trimAfter !== "number") {
            throw new TypeError(`type of trimAfter prop must be a number, instead got type ${typeof trimAfter}.`);
        }
        if (isNaN(trimAfter)) {
            throw new TypeError("trimAfter prop can not be NaN.");
        }
        if (trimAfter <= 0) {
            throw new TypeError(`trimAfter must be a positive number, instead got ${trimAfter}.`);
        }
    }
    if (trimAfter <= trimBefore) {
        throw new TypeError("trimAfter prop must be greater than trimBefore prop.");
    }
};
var validateMediaTrimProps = ({ startFrom, endAt, trimBefore, trimAfter })=>{
    if (typeof startFrom !== "undefined" && typeof trimBefore !== "undefined") {
        throw new TypeError("Cannot use both startFrom and trimBefore props. Use trimBefore instead as startFrom is deprecated.");
    }
    if (typeof endAt !== "undefined" && typeof trimAfter !== "undefined") {
        throw new TypeError("Cannot use both endAt and trimAfter props. Use trimAfter instead as endAt is deprecated.");
    }
    const hasNewProps = typeof trimBefore !== "undefined" || typeof trimAfter !== "undefined";
    const hasOldProps = typeof startFrom !== "undefined" || typeof endAt !== "undefined";
    if (hasNewProps) {
        validateTrimProps(trimBefore, trimAfter);
    } else if (hasOldProps) {
        validateStartFromProps(startFrom, endAt);
    }
};
var resolveTrimProps = ({ startFrom, endAt, trimBefore, trimAfter })=>{
    const trimBeforeValue = trimBefore ?? startFrom ?? undefined;
    const trimAfterValue = trimAfter ?? endAt ?? undefined;
    return {
        trimBeforeValue,
        trimAfterValue
    };
};
;
;
var durationReducer = (state, action)=>{
    switch(action.type){
        case "got-duration":
            {
                const absoluteSrc = getAbsoluteSrc(action.src);
                if (state[absoluteSrc] === action.durationInSeconds) {
                    return state;
                }
                return {
                    ...state,
                    [absoluteSrc]: action.durationInSeconds
                };
            }
        default:
            return state;
    }
};
var DurationsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    durations: {},
    setDurations: ()=>{
        throw new Error("context missing");
    }
});
var DurationsContextProvider = ({ children })=>{
    _s28();
    const [durations, setDurations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducer"])(durationReducer, {});
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DurationsContextProvider.useMemo12[value]": ()=>{
            return {
                durations,
                setDurations
            };
        }
    }["DurationsContextProvider.useMemo12[value]"], [
        durations
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(DurationsContext.Provider, {
        value,
        children
    });
};
_s28(DurationsContextProvider, "f7Ta2y0r//NFqDNZDQIPj/iQhfQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c24 = DurationsContextProvider;
;
// src/get-cross-origin-value.ts
var getCrossOriginValue = ({ crossOrigin, requestsVideoFrame })=>{
    if (crossOrigin !== undefined && crossOrigin !== null) {
        return crossOrigin;
    }
    if (requestsVideoFrame) {
        return "anonymous";
    }
    return;
};
;
;
var LogLevelContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    logLevel: "info",
    mountTime: 0
});
var useLogLevel = ()=>{
    _s29();
    const { logLevel } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](LogLevelContext);
    if (logLevel === null) {
        throw new Error("useLogLevel must be used within a LogLevelProvider");
    }
    return logLevel;
};
_s29(useLogLevel, "ebhmYayI3F2DgKEKloXTKOWziaA=");
var useMountTime = ()=>{
    _s30();
    const { mountTime } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](LogLevelContext);
    if (mountTime === null) {
        throw new Error("useMountTime must be used within a LogLevelProvider");
    }
    return mountTime;
};
_s30(useMountTime, "GMrgSk8geQKlYSdGgAdfSK1FnAk=");
// src/random.ts
function mulberry32(a) {
    let t = a + 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function hashCode(str) {
    let i = 0;
    let chr = 0;
    let hash = 0;
    for(i = 0; i < str.length; i++){
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}
var random = (seed, dummy)=>{
    if (dummy !== undefined) {
        throw new TypeError("random() takes only one argument");
    }
    if (seed === null) {
        return Math.random();
    }
    if (typeof seed === "string") {
        return mulberry32(hashCode(seed));
    }
    if (typeof seed === "number") {
        return mulberry32(seed * 10000000000);
    }
    throw new Error("random() argument must be a number or a string");
};
;
;
// src/play-and-handle-not-allowed-error.ts
var playAndHandleNotAllowedError = ({ mediaRef, mediaType, onAutoPlayError, logLevel, mountTime, reason, isPlayer })=>{
    const { current } = mediaRef;
    if (!current) {
        return;
    }
    playbackLogging({
        logLevel,
        tag: "play",
        message: `Attempting to play ${current.src}. Reason: ${reason}`,
        mountTime
    });
    const prom = current.play();
    if (!prom.catch) {
        return;
    }
    prom.catch((err)=>{
        if (!current) {
            return;
        }
        if (err.message.includes("request was interrupted by a call to pause")) {
            return;
        }
        if (err.message.includes("The operation was aborted.")) {
            return;
        }
        if (err.message.includes("The fetching process for the media resource was aborted by the user agent")) {
            return;
        }
        if (err.message.includes("request was interrupted by a new load request")) {
            return;
        }
        if (err.message.includes("because the media was removed from the document")) {
            return;
        }
        if (err.message.includes("user didn't interact with the document") && current.muted) {
            return;
        }
        console.log(`Could not play ${mediaType} due to following error: `, err);
        if (!current.muted) {
            if (onAutoPlayError) {
                onAutoPlayError();
                return;
            }
            console.log(`The video will be muted and we'll retry playing it.`);
            if (mediaType === "video" && isPlayer) {
                console.log("Use onAutoPlayError() to handle this error yourself.");
            }
            current.muted = true;
            current.play();
        }
    });
};
// src/audio/shared-element-source-node.ts
var makeSharedElementSourceNode = ({ audioContext, ref })=>{
    let connected = null;
    return {
        attemptToConnect: ()=>{
            if (!connected && ref.current) {
                const mediaElementSourceNode = audioContext.createMediaElementSource(ref.current);
                connected = mediaElementSourceNode;
            }
        },
        get: ()=>{
            if (!connected) {
                throw new Error("Audio element not connected");
            }
            return connected;
        }
    };
};
;
var warned = false;
var warnOnce = (logLevel)=>{
    if (warned) {
        return;
    }
    warned = true;
    if ("TURBOPACK compile-time truthy", 1) {
        Log.warn({
            logLevel,
            tag: null
        }, "AudioContext is not supported in this browser");
    }
};
var useSingletonAudioContext = (logLevel, latencyHint)=>{
    _s31();
    const audioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useSingletonAudioContext.useMemo13[audioContext]": ()=>{
            if (typeof AudioContext === "undefined") {
                warnOnce(logLevel);
                return null;
            }
            return new AudioContext({
                latencyHint
            });
        }
    }["useSingletonAudioContext.useMemo13[audioContext]"], [
        logLevel,
        latencyHint
    ]);
    return audioContext;
};
_s31(useSingletonAudioContext, "2bwJEup7Enr/ObHylrg4Rbhx8/c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
;
var EMPTY_AUDIO = "data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
var compareProps = (obj1, obj2)=>{
    const keysA = Object.keys(obj1).sort();
    const keysB = Object.keys(obj2).sort();
    if (keysA.length !== keysB.length) {
        return false;
    }
    for(let i = 0; i < keysA.length; i++){
        if (keysA[i] !== keysB[i]) {
            return false;
        }
        if (obj1[keysA[i]] !== obj2[keysB[i]]) {
            return false;
        }
    }
    return true;
};
var didPropChange = (key, newProp, prevProp)=>{
    if (key === "src" && !prevProp.startsWith("data:") && !newProp.startsWith("data:")) {
        return new URL(prevProp, window.origin).toString() !== new URL(newProp, window.origin).toString();
    }
    if (prevProp === newProp) {
        return false;
    }
    return true;
};
var SharedAudioContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
var SharedAudioContextProvider = ({ children, numberOfAudioTags, component, audioLatencyHint })=>{
    _s32();
    const audios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const [initialNumberOfAudioTags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(numberOfAudioTags);
    if (numberOfAudioTags !== initialNumberOfAudioTags) {
        throw new Error("The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.");
    }
    const logLevel = useLogLevel();
    const audioContext = useSingletonAudioContext(logLevel, audioLatencyHint);
    const refs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedAudioContextProvider.useMemo14[refs]": ()=>{
            return new Array(numberOfAudioTags).fill(true).map({
                "SharedAudioContextProvider.useMemo14[refs]": ()=>{
                    const ref = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createRef"])();
                    return {
                        id: Math.random(),
                        ref,
                        mediaElementSourceNode: audioContext ? makeSharedElementSourceNode({
                            audioContext,
                            ref
                        }) : null
                    };
                }
            }["SharedAudioContextProvider.useMemo14[refs]"]);
        }
    }["SharedAudioContextProvider.useMemo14[refs]"], [
        audioContext,
        numberOfAudioTags
    ]);
    const takenAudios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Array(numberOfAudioTags).fill(false));
    const rerenderAudios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedAudioContextProvider.useCallback7[rerenderAudios]": ()=>{
            refs.forEach({
                "SharedAudioContextProvider.useCallback7[rerenderAudios]": ({ ref, id })=>{
                    const data = audios.current?.find({
                        "SharedAudioContextProvider.useCallback7[rerenderAudios]": (a)=>a.id === id
                    }["SharedAudioContextProvider.useCallback7[rerenderAudios]"]);
                    const { current } = ref;
                    if (!current) {
                        return;
                    }
                    if (data === undefined) {
                        current.src = EMPTY_AUDIO;
                        return;
                    }
                    if (!data) {
                        throw new TypeError("Expected audio data to be there");
                    }
                    Object.keys(data.props).forEach({
                        "SharedAudioContextProvider.useCallback7[rerenderAudios]": (key)=>{
                            if (didPropChange(key, data.props[key], current[key])) {
                                current[key] = data.props[key];
                            }
                        }
                    }["SharedAudioContextProvider.useCallback7[rerenderAudios]"]);
                }
            }["SharedAudioContextProvider.useCallback7[rerenderAudios]"]);
        }
    }["SharedAudioContextProvider.useCallback7[rerenderAudios]"], [
        refs
    ]);
    const registerAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedAudioContextProvider.useCallback7[registerAudio]": (options)=>{
            const { aud, audioId, premounting } = options;
            const found = audios.current?.find({
                "SharedAudioContextProvider.useCallback7[registerAudio]": (a)=>a.audioId === audioId
            }["SharedAudioContextProvider.useCallback7[registerAudio]"]);
            if (found) {
                return found;
            }
            const firstFreeAudio = takenAudios.current.findIndex({
                "SharedAudioContextProvider.useCallback7[registerAudio].firstFreeAudio": (a)=>a === false
            }["SharedAudioContextProvider.useCallback7[registerAudio].firstFreeAudio"]);
            if (firstFreeAudio === -1) {
                throw new Error(`Tried to simultaneously mount ${numberOfAudioTags + 1} <Html5Audio /> tags at the same time. With the current settings, the maximum amount of <Html5Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop for more information on how to increase this limit.`);
            }
            const { id, ref, mediaElementSourceNode } = refs[firstFreeAudio];
            const cloned = [
                ...takenAudios.current
            ];
            cloned[firstFreeAudio] = id;
            takenAudios.current = cloned;
            const newElem = {
                props: aud,
                id,
                el: ref,
                audioId,
                mediaElementSourceNode,
                premounting
            };
            audios.current?.push(newElem);
            rerenderAudios();
            return newElem;
        }
    }["SharedAudioContextProvider.useCallback7[registerAudio]"], [
        numberOfAudioTags,
        refs,
        rerenderAudios
    ]);
    const unregisterAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedAudioContextProvider.useCallback7[unregisterAudio]": (id)=>{
            const cloned = [
                ...takenAudios.current
            ];
            const index = refs.findIndex({
                "SharedAudioContextProvider.useCallback7[unregisterAudio].index": (r)=>r.id === id
            }["SharedAudioContextProvider.useCallback7[unregisterAudio].index"]);
            if (index === -1) {
                throw new TypeError("Error occured in ");
            }
            cloned[index] = false;
            takenAudios.current = cloned;
            audios.current = audios.current?.filter({
                "SharedAudioContextProvider.useCallback7[unregisterAudio]": (a)=>a.id !== id
            }["SharedAudioContextProvider.useCallback7[unregisterAudio]"]);
            rerenderAudios();
        }
    }["SharedAudioContextProvider.useCallback7[unregisterAudio]"], [
        refs,
        rerenderAudios
    ]);
    const updateAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedAudioContextProvider.useCallback7[updateAudio]": ({ aud, audioId, id, premounting })=>{
            let changed = false;
            audios.current = audios.current?.map({
                "SharedAudioContextProvider.useCallback7[updateAudio]": (prevA)=>{
                    if (prevA.id === id) {
                        const isTheSame = compareProps(aud, prevA.props) && prevA.premounting === premounting;
                        if (isTheSame) {
                            return prevA;
                        }
                        changed = true;
                        return {
                            ...prevA,
                            props: aud,
                            premounting,
                            audioId
                        };
                    }
                    return prevA;
                }
            }["SharedAudioContextProvider.useCallback7[updateAudio]"]);
            if (changed) {
                rerenderAudios();
            }
        }
    }["SharedAudioContextProvider.useCallback7[updateAudio]"], [
        rerenderAudios
    ]);
    const mountTime = useMountTime();
    const env = useRemotionEnvironment();
    const playAllAudios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedAudioContextProvider.useCallback7[playAllAudios]": ()=>{
            refs.forEach({
                "SharedAudioContextProvider.useCallback7[playAllAudios]": (ref)=>{
                    const audio = audios.current.find({
                        "SharedAudioContextProvider.useCallback7[playAllAudios].audio": (a)=>a.el === ref.ref
                    }["SharedAudioContextProvider.useCallback7[playAllAudios].audio"]);
                    if (audio?.premounting) {
                        return;
                    }
                    playAndHandleNotAllowedError({
                        mediaRef: ref.ref,
                        mediaType: "audio",
                        onAutoPlayError: null,
                        logLevel,
                        mountTime,
                        reason: "playing all audios",
                        isPlayer: env.isPlayer
                    });
                }
            }["SharedAudioContextProvider.useCallback7[playAllAudios]"]);
            audioContext?.resume();
        }
    }["SharedAudioContextProvider.useCallback7[playAllAudios]"], [
        audioContext,
        logLevel,
        mountTime,
        refs,
        env.isPlayer
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedAudioContextProvider.useMemo14[value]": ()=>{
            return {
                registerAudio,
                unregisterAudio,
                updateAudio,
                playAllAudios,
                numberOfAudioTags,
                audioContext
            };
        }
    }["SharedAudioContextProvider.useMemo14[value]"], [
        numberOfAudioTags,
        playAllAudios,
        registerAudio,
        unregisterAudio,
        updateAudio,
        audioContext
    ]);
    const resetAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedAudioContextProvider.useCallback7[resetAudio]": ()=>{
            takenAudios.current = new Array(numberOfAudioTags).fill(false);
            audios.current = [];
            rerenderAudios();
        }
    }["SharedAudioContextProvider.useCallback7[resetAudio]"], [
        numberOfAudioTags,
        rerenderAudios
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SharedAudioContextProvider.useEffect7": ()=>{
            return ({
                "SharedAudioContextProvider.useEffect7": ()=>{
                    resetAudio();
                }
            })["SharedAudioContextProvider.useEffect7"];
        }
    }["SharedAudioContextProvider.useEffect7"], [
        component,
        resetAudio
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])(SharedAudioContext.Provider, {
        value,
        children: [
            refs.map(({ id, ref })=>{
                return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("audio", {
                    ref,
                    preload: "metadata",
                    src: EMPTY_AUDIO
                }, id);
            }),
            children
        ]
    });
};
_s32(SharedAudioContextProvider, "VqFUsQHHb/a0q2S4CzzinlWDkh8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useLogLevel,
        useSingletonAudioContext,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        useMountTime,
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c25 = SharedAudioContextProvider;
var useSharedAudio = ({ aud, audioId, premounting })=>{
    _s33();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    const [elem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useSharedAudio.useState10": ()=>{
            if (ctx && ctx.numberOfAudioTags > 0) {
                return ctx.registerAudio({
                    aud,
                    audioId,
                    premounting
                });
            }
            const el = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createRef();
            const mediaElementSourceNode = ctx?.audioContext ? makeSharedElementSourceNode({
                audioContext: ctx.audioContext,
                ref: el
            }) : null;
            return {
                el,
                id: Math.random(),
                props: aud,
                audioId,
                mediaElementSourceNode,
                premounting
            };
        }
    }["useSharedAudio.useState10"]);
    const effectToUse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useInsertionEffect ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useLayoutEffect;
    if (typeof document !== "undefined") {
        effectToUse(()=>{
            if (ctx && ctx.numberOfAudioTags > 0) {
                ctx.updateAudio({
                    id: elem.id,
                    aud,
                    audioId,
                    premounting
                });
            }
        }, [
            aud,
            ctx,
            elem.id,
            audioId,
            premounting
        ]);
        effectToUse(()=>{
            return ()=>{
                if (ctx && ctx.numberOfAudioTags > 0) {
                    ctx.unregisterAudio(elem.id);
                }
            };
        }, [
            ctx,
            elem.id
        ]);
    }
    return elem;
};
_s33(useSharedAudio, "TKnCexlU0UVT/IqJcZxhdGtHT4w=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]
    ];
});
// src/is-approximately-the-same.ts
var FLOATING_POINT_ERROR_THRESHOLD = 0.00001;
var isApproximatelyTheSame = (num1, num2)=>{
    return Math.abs(num1 - num2) < FLOATING_POINT_ERROR_THRESHOLD;
};
;
var toSeconds = (time, fps)=>{
    return Math.round(time / fps * 100) / 100;
};
var isSafari = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const isAppleWebKit = /AppleWebKit/.test(window.navigator.userAgent);
    if (!isAppleWebKit) {
        return false;
    }
    const isNotChrome = !window.navigator.userAgent.includes("Chrome/");
    return isNotChrome;
};
var isIosSafari = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const isIpadIPodIPhone = /iP(ad|od|hone)/i.test(window.navigator.userAgent);
    return isIpadIPodIPhone && isSafari();
};
var isIOSSafariAndBlob = (actualSrc)=>{
    return isIosSafari() && actualSrc.startsWith("blob:");
};
var getVideoFragmentStart = ({ actualFrom, fps })=>{
    return toSeconds(Math.max(0, -actualFrom), fps);
};
var getVideoFragmentEnd = ({ duration, fps })=>{
    return toSeconds(duration, fps);
};
var appendVideoFragment = ({ actualSrc, actualFrom, duration, fps })=>{
    if (isIOSSafariAndBlob(actualSrc)) {
        return actualSrc;
    }
    if (actualSrc.startsWith("data:")) {
        return actualSrc;
    }
    const existingHash = Boolean(new URL(actualSrc, (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : window.location.href) ?? "http://localhost:3000").hash);
    if (existingHash) {
        return actualSrc;
    }
    if (!Number.isFinite(actualFrom)) {
        return actualSrc;
    }
    const withStartHash = `${actualSrc}#t=${getVideoFragmentStart({
        actualFrom,
        fps
    })}`;
    if (!Number.isFinite(duration)) {
        return withStartHash;
    }
    return `${withStartHash},${getVideoFragmentEnd({
        duration,
        fps
    })}`;
};
var isSubsetOfDuration = ({ prevStartFrom, newStartFrom, prevDuration, newDuration, fps })=>{
    const previousFrom = getVideoFragmentStart({
        actualFrom: prevStartFrom,
        fps
    });
    const newFrom = getVideoFragmentStart({
        actualFrom: newStartFrom,
        fps
    });
    const previousEnd = getVideoFragmentEnd({
        duration: prevDuration,
        fps
    });
    const newEnd = getVideoFragmentEnd({
        duration: newDuration,
        fps
    });
    if (newFrom < previousFrom) {
        return false;
    }
    if (newEnd > previousEnd) {
        return false;
    }
    return true;
};
var useAppendVideoFragment = ({ actualSrc: initialActualSrc, actualFrom: initialActualFrom, duration: initialDuration, fps })=>{
    _s34();
    const actualFromRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(initialActualFrom);
    const actualDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(initialDuration);
    const actualSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(initialActualSrc);
    if (!isSubsetOfDuration({
        prevStartFrom: actualFromRef.current,
        newStartFrom: initialActualFrom,
        prevDuration: actualDuration.current,
        newDuration: initialDuration,
        fps
    }) || initialActualSrc !== actualSrc.current) {
        actualFromRef.current = initialActualFrom;
        actualDuration.current = initialDuration;
        actualSrc.current = initialActualSrc;
    }
    const appended = appendVideoFragment({
        actualSrc: actualSrc.current,
        actualFrom: actualFromRef.current,
        duration: actualDuration.current,
        fps
    });
    return appended;
};
_s34(useAppendVideoFragment, "PHELLDc3tEFHFTbM7N507mEvtmU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"]
    ];
});
// src/use-amplification.ts
var warned2 = false;
var warnSafariOnce = (logLevel)=>{
    if (warned2) {
        return;
    }
    warned2 = true;
    Log.warn({
        logLevel,
        tag: null
    }, "In Safari, setting a volume and a playback rate at the same time is buggy.");
    Log.warn({
        logLevel,
        tag: null
    }, "In Desktop Safari, only volumes <= 1 will be applied.");
    Log.warn({
        logLevel,
        tag: null
    }, logLevel, "In Mobile Safari, the volume will be ignored and set to 1 if a playbackRate is set.");
};
var useVolume = ({ mediaRef, volume, logLevel, source, shouldUseWebAudioApi })=>{
    _s35();
    const audioStuffRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentVolumeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(volume);
    currentVolumeRef.current = volume;
    const sharedAudioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    if (!sharedAudioContext) {
        throw new Error("useAmplification must be used within a SharedAudioContext");
    }
    const { audioContext } = sharedAudioContext;
    if ("TURBOPACK compile-time truthy", 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "useVolume.useLayoutEffect3": ()=>{
                if (!audioContext) {
                    return;
                }
                if (!mediaRef.current) {
                    return;
                }
                if (!shouldUseWebAudioApi) {
                    return;
                }
                if (mediaRef.current.playbackRate !== 1 && isSafari()) {
                    warnSafariOnce(logLevel);
                    return;
                }
                if (!source) {
                    return;
                }
                const gainNode = new GainNode(audioContext, {
                    gain: currentVolumeRef.current
                });
                source.attemptToConnect();
                source.get().connect(gainNode);
                gainNode.connect(audioContext.destination);
                audioStuffRef.current = {
                    gainNode
                };
                Log.trace({
                    logLevel,
                    tag: null
                }, `Starting to amplify ${mediaRef.current?.src}. Gain = ${currentVolumeRef.current}, playbackRate = ${mediaRef.current?.playbackRate}`);
                return ({
                    "useVolume.useLayoutEffect3": ()=>{
                        audioStuffRef.current = null;
                        gainNode.disconnect();
                        source.get().disconnect();
                    }
                })["useVolume.useLayoutEffect3"];
            }
        }["useVolume.useLayoutEffect3"], [
            logLevel,
            mediaRef,
            audioContext,
            source,
            shouldUseWebAudioApi
        ]);
    }
    if (audioStuffRef.current) {
        const valueToSet = volume;
        if (!isApproximatelyTheSame(audioStuffRef.current.gainNode.gain.value, valueToSet)) {
            audioStuffRef.current.gainNode.gain.value = valueToSet;
            Log.trace({
                logLevel,
                tag: null
            }, `Setting gain to ${valueToSet} for ${mediaRef.current?.src}`);
        }
    }
    const safariCase = isSafari() && mediaRef.current && mediaRef.current?.playbackRate !== 1;
    const shouldUseTraditionalVolume = safariCase || !shouldUseWebAudioApi;
    if (shouldUseTraditionalVolume && mediaRef.current && !isApproximatelyTheSame(volume, mediaRef.current?.volume)) {
        mediaRef.current.volume = Math.min(volume, 1);
    }
    return audioStuffRef;
};
_s35(useVolume, "iMOTBg4zMd83X/n0tbWhdyR+pDA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
;
;
var useMediaStartsAt = ()=>{
    _s36();
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
    return startsAt;
};
_s36(useMediaStartsAt, "rd0xGzB/gsOOO90v1ZRbKNjVMAA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
var useFrameForVolumeProp = (behavior)=>{
    _s37();
    const loop = Loop.useLoop();
    const frame = useCurrentFrame();
    const startsAt = useMediaStartsAt();
    if (behavior === "repeat" || loop === null) {
        return frame + startsAt;
    }
    return frame + startsAt + loop.durationInFrames * loop.iteration;
};
_s37(useFrameForVolumeProp, "hbUR+S/OxkfRHdMaAxzx05OzZGI=", false, function() {
    return [
        Loop.useLoop,
        useCurrentFrame,
        useMediaStartsAt
    ];
});
// src/get-asset-file-name.ts
var getAssetDisplayName = (filename)=>{
    if (/data:|blob:/.test(filename.substring(0, 5))) {
        return "Data URL";
    }
    const splitted = filename.split("/").map((s)=>s.split("\\")).flat(1);
    return splitted[splitted.length - 1];
};
// src/volume-prop.ts
var evaluateVolume = ({ frame, volume, mediaVolume = 1 })=>{
    if (typeof volume === "number") {
        return volume * mediaVolume;
    }
    if (typeof volume === "undefined") {
        return Number(mediaVolume);
    }
    const evaluated = volume(frame) * mediaVolume;
    if (typeof evaluated !== "number") {
        throw new TypeError(`You passed in a a function to the volume prop but it did not return a number but a value of type ${typeof evaluated} for frame ${frame}`);
    }
    if (Number.isNaN(evaluated)) {
        throw new TypeError(`You passed in a function to the volume prop but it returned NaN for frame ${frame}.`);
    }
    if (!Number.isFinite(evaluated)) {
        throw new TypeError(`You passed in a function to the volume prop but it returned a non-finite number for frame ${frame}.`);
    }
    return Math.max(0, evaluated);
};
// src/use-media-in-timeline.ts
var didWarn = {};
var warnOnce2 = (message)=>{
    if (didWarn[message]) {
        return;
    }
    console.warn(message);
    didWarn[message] = true;
};
var useBasicMediaInTimeline = ({ volume, mediaVolume, mediaType, src, displayName, trimBefore, trimAfter, playbackRate })=>{
    _s38();
    if (!src) {
        throw new Error("No src passed");
    }
    const startsAt = useMediaStartsAt();
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const videoConfig = useVideoConfig();
    const [initialVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useBasicMediaInTimeline.useState11": ()=>volume
    }["useBasicMediaInTimeline.useState11"]);
    const mediaDuration = calculateMediaDuration({
        mediaDurationInFrames: videoConfig.durationInFrames,
        playbackRate,
        trimBefore,
        trimAfter
    });
    const duration = parentSequence ? Math.min(parentSequence.durationInFrames, mediaDuration) : mediaDuration;
    const volumes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useBasicMediaInTimeline.useMemo15[volumes]": ()=>{
            if (typeof volume === "number") {
                return volume;
            }
            return new Array(Math.floor(Math.max(0, duration + startsAt))).fill(true).map({
                "useBasicMediaInTimeline.useMemo15[volumes]": (_, i)=>{
                    return evaluateVolume({
                        frame: i + startsAt,
                        volume,
                        mediaVolume
                    });
                }
            }["useBasicMediaInTimeline.useMemo15[volumes]"]).join(",");
        }
    }["useBasicMediaInTimeline.useMemo15[volumes]"], [
        duration,
        startsAt,
        volume,
        mediaVolume
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBasicMediaInTimeline.useEffect8": ()=>{
            if (typeof volume === "number" && volume !== initialVolume) {
                warnOnce2(`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/audio/volume`);
            }
        }
    }["useBasicMediaInTimeline.useEffect8"], [
        initialVolume,
        mediaType,
        src,
        volume
    ]);
    const doesVolumeChange = typeof volume === "function";
    const nonce = useNonce();
    const { rootId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const env = useRemotionEnvironment();
    return {
        volumes,
        duration,
        doesVolumeChange,
        nonce,
        rootId,
        isStudio: env.isStudio,
        finalDisplayName: displayName ?? getAssetDisplayName(src)
    };
};
_s38(useBasicMediaInTimeline, "1YmPjSFZtQzIVc1dYDAcq9Vji2E=", false, function() {
    return [
        useMediaStartsAt,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        useNonce,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useRemotionEnvironment
    ];
});
var useMediaInTimeline = ({ volume, mediaVolume, src, mediaType, playbackRate, displayName, id, stack, showInTimeline, premountDisplay, postmountDisplay, loopDisplay })=>{
    _s39();
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const startsAt = useMediaStartsAt();
    const { registerSequence, unregisterSequence } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceManager);
    const { volumes, duration, doesVolumeChange, nonce, rootId, isStudio, finalDisplayName } = useBasicMediaInTimeline({
        volume,
        mediaVolume,
        mediaType,
        src,
        displayName,
        trimAfter: undefined,
        trimBefore: undefined,
        playbackRate
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMediaInTimeline.useEffect8": ()=>{
            if (!src) {
                throw new Error("No src passed");
            }
            if (!isStudio && window.process?.env?.NODE_ENV !== "test") {
                return;
            }
            if (!showInTimeline) {
                return;
            }
            registerSequence({
                type: mediaType,
                src,
                id,
                duration,
                from: 0,
                parent: parentSequence?.id ?? null,
                displayName: finalDisplayName,
                rootId,
                volume: volumes,
                showInTimeline: true,
                nonce,
                startMediaFrom: 0 - startsAt,
                doesVolumeChange,
                loopDisplay,
                playbackRate,
                stack,
                premountDisplay,
                postmountDisplay
            });
            return ({
                "useMediaInTimeline.useEffect8": ()=>{
                    unregisterSequence(id);
                }
            })["useMediaInTimeline.useEffect8"];
        }
    }["useMediaInTimeline.useEffect8"], [
        duration,
        id,
        parentSequence,
        src,
        registerSequence,
        unregisterSequence,
        volumes,
        doesVolumeChange,
        nonce,
        mediaType,
        startsAt,
        playbackRate,
        stack,
        showInTimeline,
        premountDisplay,
        postmountDisplay,
        isStudio,
        loopDisplay,
        rootId,
        finalDisplayName
    ]);
};
_s39(useMediaInTimeline, "yL/aoFDXvZohH5IBaQzOHUqlRBY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useMediaStartsAt,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useBasicMediaInTimeline,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
;
;
;
;
var useBufferManager = (logLevel, mountTime)=>{
    _s40();
    const [blocks, setBlocks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [onBufferingCallbacks, setOnBufferingCallbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [onResumeCallbacks, setOnResumeCallbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const buffering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const addBlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useBufferManager.useCallback8[addBlock]": (block)=>{
            setBlocks({
                "useBufferManager.useCallback8[addBlock]": (b)=>[
                        ...b,
                        block
                    ]
            }["useBufferManager.useCallback8[addBlock]"]);
            return {
                unblock: ({
                    "useBufferManager.useCallback8[addBlock]": ()=>{
                        setBlocks({
                            "useBufferManager.useCallback8[addBlock]": (b)=>{
                                const newArr = b.filter({
                                    "useBufferManager.useCallback8[addBlock].newArr": (bx)=>bx !== block
                                }["useBufferManager.useCallback8[addBlock].newArr"]);
                                if (newArr.length === b.length) {
                                    return b;
                                }
                                return newArr;
                            }
                        }["useBufferManager.useCallback8[addBlock]"]);
                    }
                })["useBufferManager.useCallback8[addBlock]"]
            };
        }
    }["useBufferManager.useCallback8[addBlock]"], []);
    const listenForBuffering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useBufferManager.useCallback8[listenForBuffering]": (callback)=>{
            setOnBufferingCallbacks({
                "useBufferManager.useCallback8[listenForBuffering]": (c)=>[
                        ...c,
                        callback
                    ]
            }["useBufferManager.useCallback8[listenForBuffering]"]);
            return {
                remove: ({
                    "useBufferManager.useCallback8[listenForBuffering]": ()=>{
                        setOnBufferingCallbacks({
                            "useBufferManager.useCallback8[listenForBuffering]": (c)=>c.filter({
                                    "useBufferManager.useCallback8[listenForBuffering]": (cb)=>cb !== callback
                                }["useBufferManager.useCallback8[listenForBuffering]"])
                        }["useBufferManager.useCallback8[listenForBuffering]"]);
                    }
                })["useBufferManager.useCallback8[listenForBuffering]"]
            };
        }
    }["useBufferManager.useCallback8[listenForBuffering]"], []);
    const listenForResume = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useBufferManager.useCallback8[listenForResume]": (callback)=>{
            setOnResumeCallbacks({
                "useBufferManager.useCallback8[listenForResume]": (c)=>[
                        ...c,
                        callback
                    ]
            }["useBufferManager.useCallback8[listenForResume]"]);
            return {
                remove: ({
                    "useBufferManager.useCallback8[listenForResume]": ()=>{
                        setOnResumeCallbacks({
                            "useBufferManager.useCallback8[listenForResume]": (c)=>c.filter({
                                    "useBufferManager.useCallback8[listenForResume]": (cb)=>cb !== callback
                                }["useBufferManager.useCallback8[listenForResume]"])
                        }["useBufferManager.useCallback8[listenForResume]"]);
                    }
                })["useBufferManager.useCallback8[listenForResume]"]
            };
        }
    }["useBufferManager.useCallback8[listenForResume]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBufferManager.useEffect9": ()=>{
            if (blocks.length > 0) {
                onBufferingCallbacks.forEach({
                    "useBufferManager.useEffect9": (c)=>c()
                }["useBufferManager.useEffect9"]);
                playbackLogging({
                    logLevel,
                    message: "Player is entering buffer state",
                    mountTime,
                    tag: "player"
                });
            }
        }
    }["useBufferManager.useEffect9"], [
        blocks
    ]);
    if ("TURBOPACK compile-time truthy", 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "useBufferManager.useLayoutEffect4": ()=>{
                if (blocks.length === 0) {
                    onResumeCallbacks.forEach({
                        "useBufferManager.useLayoutEffect4": (c)=>c()
                    }["useBufferManager.useLayoutEffect4"]);
                    playbackLogging({
                        logLevel,
                        message: "Player is exiting buffer state",
                        mountTime,
                        tag: "player"
                    });
                }
            }
        }["useBufferManager.useLayoutEffect4"], [
            blocks
        ]);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useBufferManager.useMemo16": ()=>{
            return {
                addBlock,
                listenForBuffering,
                listenForResume,
                buffering
            };
        }
    }["useBufferManager.useMemo16"], [
        addBlock,
        buffering,
        listenForBuffering,
        listenForResume
    ]);
};
_s40(useBufferManager, "YURrUF9c8Eb2kCzXA7UJgS1O8YQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
var BufferingContextReact = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(null);
var BufferingProvider = ({ children })=>{
    _s41();
    const { logLevel, mountTime } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LogLevelContext);
    const bufferManager = useBufferManager(logLevel ?? "info", mountTime);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(BufferingContextReact.Provider, {
        value: bufferManager,
        children
    });
};
_s41(BufferingProvider, "cRuFmp9tU+ubE95tCmd7fBTfHG4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useBufferManager
    ];
});
_c26 = BufferingProvider;
var useIsPlayerBuffering = (bufferManager)=>{
    _s42();
    const [isBuffering, setIsBuffering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(bufferManager.buffering.current);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIsPlayerBuffering.useEffect9": ()=>{
            const onBuffer = {
                "useIsPlayerBuffering.useEffect9.onBuffer": ()=>{
                    setIsBuffering(true);
                }
            }["useIsPlayerBuffering.useEffect9.onBuffer"];
            const onResume = {
                "useIsPlayerBuffering.useEffect9.onResume": ()=>{
                    setIsBuffering(false);
                }
            }["useIsPlayerBuffering.useEffect9.onResume"];
            bufferManager.listenForBuffering(onBuffer);
            bufferManager.listenForResume(onResume);
            return ({
                "useIsPlayerBuffering.useEffect9": ()=>{
                    bufferManager.listenForBuffering({
                        "useIsPlayerBuffering.useEffect9": ()=>{
                            return;
                        }
                    }["useIsPlayerBuffering.useEffect9"]);
                    bufferManager.listenForResume({
                        "useIsPlayerBuffering.useEffect9": ()=>{
                            return;
                        }
                    }["useIsPlayerBuffering.useEffect9"]);
                }
            })["useIsPlayerBuffering.useEffect9"];
        }
    }["useIsPlayerBuffering.useEffect9"], [
        bufferManager
    ]);
    return isBuffering;
};
_s42(useIsPlayerBuffering, "5sUYdbNPG1IAasidAXoxho5j6eU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
// src/use-buffer-state.ts
var useBufferState = ()=>{
    _s43();
    const buffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(BufferingContextReact);
    const addBlock = buffer ? buffer.addBlock : null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useBufferState.useMemo17": ()=>({
                delayPlayback: ({
                    "useBufferState.useMemo17": ()=>{
                        if (!addBlock) {
                            throw new Error("Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state");
                        }
                        const { unblock } = addBlock({
                            id: String(Math.random())
                        });
                        return {
                            unblock
                        };
                    }
                })["useBufferState.useMemo17"]
            })
    }["useBufferState.useMemo17"], [
        addBlock
    ]);
};
_s43(useBufferState, "nkYVfgym7ubsaa/jAuDb7ZTucMM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/buffer-until-first-frame.ts
var isSafariWebkit = ()=>{
    const isSafari2 = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    return isSafari2;
};
var useBufferUntilFirstFrame = ({ mediaRef, mediaType, onVariableFpsVideoDetected, pauseWhenBuffering, logLevel, mountTime })=>{
    _s44();
    const bufferingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const { delayPlayback } = useBufferState();
    const bufferUntilFirstFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame]": (requestedTime)=>{
            if (mediaType !== "video") {
                return;
            }
            if (!pauseWhenBuffering) {
                return;
            }
            const current = mediaRef.current;
            if (!current) {
                return;
            }
            if (current.readyState >= current.HAVE_FUTURE_DATA && !isSafariWebkit()) {
                playbackLogging({
                    logLevel,
                    message: `Not using buffer until first frame, because readyState is ${current.readyState} and is not Safari or Desktop Chrome`,
                    mountTime,
                    tag: "buffer"
                });
                return;
            }
            if (!current.requestVideoFrameCallback) {
                playbackLogging({
                    logLevel,
                    message: `Not using buffer until first frame, because requestVideoFrameCallback is not supported`,
                    mountTime,
                    tag: "buffer"
                });
                return;
            }
            bufferingRef.current = true;
            playbackLogging({
                logLevel,
                message: `Buffering ${mediaRef.current?.src} until the first frame is received`,
                mountTime,
                tag: "buffer"
            });
            const playback = delayPlayback();
            const unblock = {
                "useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame].unblock": ()=>{
                    playback.unblock();
                    current.removeEventListener("ended", unblock, {
                        once: true
                    });
                    current.removeEventListener("pause", unblock, {
                        once: true
                    });
                    bufferingRef.current = false;
                }
            }["useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame].unblock"];
            const onEndedOrPauseOrCanPlay = {
                "useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame].onEndedOrPauseOrCanPlay": ()=>{
                    unblock();
                }
            }["useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame].onEndedOrPauseOrCanPlay"];
            current.requestVideoFrameCallback({
                "useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame]": (_, info2)=>{
                    const differenceFromRequested = Math.abs(info2.mediaTime - requestedTime);
                    if (differenceFromRequested > 0.5) {
                        onVariableFpsVideoDetected();
                    }
                    unblock();
                }
            }["useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame]"]);
            current.addEventListener("ended", onEndedOrPauseOrCanPlay, {
                once: true
            });
            current.addEventListener("pause", onEndedOrPauseOrCanPlay, {
                once: true
            });
            current.addEventListener("canplay", onEndedOrPauseOrCanPlay, {
                once: true
            });
        }
    }["useBufferUntilFirstFrame.useCallback9[bufferUntilFirstFrame]"], [
        delayPlayback,
        logLevel,
        mediaRef,
        mediaType,
        mountTime,
        onVariableFpsVideoDetected,
        pauseWhenBuffering
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useBufferUntilFirstFrame.useMemo18": ()=>{
            return {
                isBuffering: ({
                    "useBufferUntilFirstFrame.useMemo18": ()=>bufferingRef.current
                })["useBufferUntilFirstFrame.useMemo18"],
                bufferUntilFirstFrame
            };
        }
    }["useBufferUntilFirstFrame.useMemo18"], [
        bufferUntilFirstFrame
    ]);
};
_s44(useBufferUntilFirstFrame, "aQnNPv6hfuc8g2P4emaKv5WRH2k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useBufferState,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
;
var useCurrentTimeOfMediaTagWithUpdateTimeStamp = (mediaRef)=>{
    _s45();
    const lastUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef({
        time: mediaRef.current?.currentTime ?? 0,
        lastUpdate: performance.now()
    });
    const nowCurrentTime = mediaRef.current?.currentTime ?? null;
    if (nowCurrentTime !== null) {
        if (lastUpdate.current.time !== nowCurrentTime) {
            lastUpdate.current.time = nowCurrentTime;
            lastUpdate.current.lastUpdate = performance.now();
        }
    }
    return lastUpdate;
};
_s45(useCurrentTimeOfMediaTagWithUpdateTimeStamp, "UQQ+rAOi2R+odCWAmHwzkcng35k=");
// src/seek.ts
var seek = ({ mediaRef, time, logLevel, why, mountTime })=>{
    const timeToSet = isIosSafari() ? Number(time.toFixed(1)) : time;
    playbackLogging({
        logLevel,
        tag: "seek",
        message: `Seeking from ${mediaRef.currentTime} to ${timeToSet}. src= ${mediaRef.src} Reason: ${why}`,
        mountTime
    });
    mediaRef.currentTime = timeToSet;
    return timeToSet;
};
;
var useMediaBuffering = ({ element, shouldBuffer, isPremounting, isPostmounting, logLevel, mountTime, src })=>{
    _s46();
    const buffer = useBufferState();
    const [isBuffering, setIsBuffering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMediaBuffering.useEffect10": ()=>{
            let cleanupFns = [];
            const { current } = element;
            if (!current) {
                return;
            }
            if (!shouldBuffer) {
                return;
            }
            if (isPremounting || isPostmounting) {
                if ((isPremounting || isPostmounting) && current.readyState < current.HAVE_FUTURE_DATA) {
                    if (!navigator.userAgent.includes("Firefox/")) {
                        playbackLogging({
                            logLevel,
                            message: `Calling .load() on ${current.src} because readyState is ${current.readyState} and it is not Firefox. Element is premounted ${current.playbackRate}`,
                            tag: "load",
                            mountTime
                        });
                        const previousPlaybackRate = current.playbackRate;
                        current.load();
                        current.playbackRate = previousPlaybackRate;
                    }
                }
                return;
            }
            const cleanup = {
                "useMediaBuffering.useEffect10.cleanup": (reason)=>{
                    let didDoSomething = false;
                    cleanupFns.forEach({
                        "useMediaBuffering.useEffect10.cleanup": (fn)=>{
                            fn(reason);
                            didDoSomething = true;
                        }
                    }["useMediaBuffering.useEffect10.cleanup"]);
                    cleanupFns = [];
                    setIsBuffering({
                        "useMediaBuffering.useEffect10.cleanup": (previous)=>{
                            if (previous) {
                                didDoSomething = true;
                            }
                            return false;
                        }
                    }["useMediaBuffering.useEffect10.cleanup"]);
                    if (didDoSomething) {
                        playbackLogging({
                            logLevel,
                            message: `Unmarking as buffering: ${current.src}. Reason: ${reason}`,
                            tag: "buffer",
                            mountTime
                        });
                    }
                }
            }["useMediaBuffering.useEffect10.cleanup"];
            const blockMedia = {
                "useMediaBuffering.useEffect10.blockMedia": (reason)=>{
                    setIsBuffering(true);
                    playbackLogging({
                        logLevel,
                        message: `Marking as buffering: ${current.src}. Reason: ${reason}`,
                        tag: "buffer",
                        mountTime
                    });
                    const { unblock } = buffer.delayPlayback();
                    const onCanPlay = {
                        "useMediaBuffering.useEffect10.blockMedia.onCanPlay": ()=>{
                            cleanup('"canplay" was fired');
                            init();
                        }
                    }["useMediaBuffering.useEffect10.blockMedia.onCanPlay"];
                    const onError = {
                        "useMediaBuffering.useEffect10.blockMedia.onError": ()=>{
                            cleanup('"error" event was occurred');
                            init();
                        }
                    }["useMediaBuffering.useEffect10.blockMedia.onError"];
                    current.addEventListener("canplay", onCanPlay, {
                        once: true
                    });
                    cleanupFns.push({
                        "useMediaBuffering.useEffect10.blockMedia": ()=>{
                            current.removeEventListener("canplay", onCanPlay);
                        }
                    }["useMediaBuffering.useEffect10.blockMedia"]);
                    current.addEventListener("error", onError, {
                        once: true
                    });
                    cleanupFns.push({
                        "useMediaBuffering.useEffect10.blockMedia": ()=>{
                            current.removeEventListener("error", onError);
                        }
                    }["useMediaBuffering.useEffect10.blockMedia"]);
                    cleanupFns.push({
                        "useMediaBuffering.useEffect10.blockMedia": (cleanupReason)=>{
                            playbackLogging({
                                logLevel,
                                message: `Unblocking ${current.src} from buffer. Reason: ${cleanupReason}`,
                                tag: "buffer",
                                mountTime
                            });
                            unblock();
                        }
                    }["useMediaBuffering.useEffect10.blockMedia"]);
                }
            }["useMediaBuffering.useEffect10.blockMedia"];
            const init = {
                "useMediaBuffering.useEffect10.init": ()=>{
                    if (current.readyState < current.HAVE_FUTURE_DATA) {
                        blockMedia(`readyState is ${current.readyState}, which is less than HAVE_FUTURE_DATA`);
                        if (!navigator.userAgent.includes("Firefox/")) {
                            playbackLogging({
                                logLevel,
                                message: `Calling .load() on ${src} because readyState is ${current.readyState} and it is not Firefox. ${current.playbackRate}`,
                                tag: "load",
                                mountTime
                            });
                            const previousPlaybackRate = current.playbackRate;
                            current.load();
                            current.playbackRate = previousPlaybackRate;
                        }
                    } else {
                        const onWaiting = {
                            "useMediaBuffering.useEffect10.init.onWaiting": ()=>{
                                blockMedia('"waiting" event was fired');
                            }
                        }["useMediaBuffering.useEffect10.init.onWaiting"];
                        current.addEventListener("waiting", onWaiting);
                        cleanupFns.push({
                            "useMediaBuffering.useEffect10.init": ()=>{
                                current.removeEventListener("waiting", onWaiting);
                            }
                        }["useMediaBuffering.useEffect10.init"]);
                    }
                }
            }["useMediaBuffering.useEffect10.init"];
            init();
            return ({
                "useMediaBuffering.useEffect10": ()=>{
                    cleanup("element was unmounted or prop changed");
                }
            })["useMediaBuffering.useEffect10"];
        }
    }["useMediaBuffering.useEffect10"], [
        buffer,
        src,
        element,
        isPremounting,
        isPostmounting,
        logLevel,
        shouldBuffer,
        mountTime
    ]);
    return isBuffering;
};
_s46(useMediaBuffering, "4lSxEIDJXFkQS5nrIT1id2WutM4=", false, function() {
    return [
        useBufferState,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
var useRequestVideoCallbackTime = ({ mediaRef, mediaType, lastSeek, onVariableFpsVideoDetected })=>{
    _s47();
    const currentTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRequestVideoCallbackTime.useEffect11": ()=>{
            const { current } = mediaRef;
            if (current) {
                currentTime.current = {
                    time: current.currentTime,
                    lastUpdate: performance.now()
                };
            } else {
                currentTime.current = null;
                return;
            }
            if (mediaType !== "video") {
                currentTime.current = null;
                return;
            }
            const videoTag = current;
            if (!videoTag.requestVideoFrameCallback) {
                return;
            }
            let cancel = {
                "useRequestVideoCallbackTime.useEffect11.cancel": ()=>{
                    return;
                }
            }["useRequestVideoCallbackTime.useEffect11.cancel"];
            const request = {
                "useRequestVideoCallbackTime.useEffect11.request": ()=>{
                    if (!videoTag) {
                        return;
                    }
                    const cb = videoTag.requestVideoFrameCallback({
                        "useRequestVideoCallbackTime.useEffect11.request.cb": (_, info2)=>{
                            if (currentTime.current !== null) {
                                const difference = Math.abs(currentTime.current.time - info2.mediaTime);
                                const differenceToLastSeek = Math.abs(lastSeek.current === null ? Infinity : info2.mediaTime - lastSeek.current);
                                if (difference > 0.5 && differenceToLastSeek > 0.5 && info2.mediaTime > currentTime.current.time) {
                                    onVariableFpsVideoDetected();
                                }
                            }
                            currentTime.current = {
                                time: info2.mediaTime,
                                lastUpdate: performance.now()
                            };
                            request();
                        }
                    }["useRequestVideoCallbackTime.useEffect11.request.cb"]);
                    cancel = ({
                        "useRequestVideoCallbackTime.useEffect11.request": ()=>{
                            videoTag.cancelVideoFrameCallback(cb);
                            cancel = ({
                                "useRequestVideoCallbackTime.useEffect11.request": ()=>{
                                    return;
                                }
                            })["useRequestVideoCallbackTime.useEffect11.request"];
                        }
                    })["useRequestVideoCallbackTime.useEffect11.request"];
                }
            }["useRequestVideoCallbackTime.useEffect11.request"];
            request();
            return ({
                "useRequestVideoCallbackTime.useEffect11": ()=>{
                    cancel();
                }
            })["useRequestVideoCallbackTime.useEffect11"];
        }
    }["useRequestVideoCallbackTime.useEffect11"], [
        lastSeek,
        mediaRef,
        mediaType,
        onVariableFpsVideoDetected
    ]);
    return currentTime;
};
_s47(useRequestVideoCallbackTime, "S980Yly31PxMh0iNZfoiF9hyaTg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
// src/interpolate.ts
function interpolateFunction(input, inputRange, outputRange, options) {
    const { extrapolateLeft, extrapolateRight, easing } = options;
    let result = input;
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    if (result < inputMin) {
        if (extrapolateLeft === "identity") {
            return result;
        }
        if (extrapolateLeft === "clamp") {
            result = inputMin;
        } else if (extrapolateLeft === "wrap") {
            const range = inputMax - inputMin;
            result = ((result - inputMin) % range + range) % range + inputMin;
        } else if (extrapolateLeft === "extend") {}
    }
    if (result > inputMax) {
        if (extrapolateRight === "identity") {
            return result;
        }
        if (extrapolateRight === "clamp") {
            result = inputMax;
        } else if (extrapolateRight === "wrap") {
            const range = inputMax - inputMin;
            result = ((result - inputMin) % range + range) % range + inputMin;
        } else if (extrapolateRight === "extend") {}
    }
    if (outputMin === outputMax) {
        return outputMin;
    }
    result = (result - inputMin) / (inputMax - inputMin);
    result = easing(result);
    result = result * (outputMax - outputMin) + outputMin;
    return result;
}
function findRange(input, inputRange) {
    let i;
    for(i = 1; i < inputRange.length - 1; ++i){
        if (inputRange[i] >= input) {
            break;
        }
    }
    return i - 1;
}
function checkValidInputRange(arr) {
    for(let i = 1; i < arr.length; ++i){
        if (!(arr[i] > arr[i - 1])) {
            throw new Error(`inputRange must be strictly monotonically increasing but got [${arr.join(",")}]`);
        }
    }
}
function checkInfiniteRange(name, arr) {
    if (arr.length < 2) {
        throw new Error(name + " must have at least 2 elements");
    }
    for (const element of arr){
        if (typeof element !== "number") {
            throw new Error(`${name} must contain only numbers`);
        }
        if (!Number.isFinite(element)) {
            throw new Error(`${name} must contain only finite numbers, but got [${arr.join(",")}]`);
        }
    }
}
function interpolate(input, inputRange, outputRange, options) {
    if (typeof input === "undefined") {
        throw new Error("input can not be undefined");
    }
    if (typeof inputRange === "undefined") {
        throw new Error("inputRange can not be undefined");
    }
    if (typeof outputRange === "undefined") {
        throw new Error("outputRange can not be undefined");
    }
    if (inputRange.length !== outputRange.length) {
        throw new Error("inputRange (" + inputRange.length + ") and outputRange (" + outputRange.length + ") must have the same length");
    }
    checkInfiniteRange("inputRange", inputRange);
    checkInfiniteRange("outputRange", outputRange);
    checkValidInputRange(inputRange);
    const easing = options?.easing ?? ((num)=>num);
    let extrapolateLeft = "extend";
    if (options?.extrapolateLeft !== undefined) {
        extrapolateLeft = options.extrapolateLeft;
    }
    let extrapolateRight = "extend";
    if (options?.extrapolateRight !== undefined) {
        extrapolateRight = options.extrapolateRight;
    }
    if (typeof input !== "number") {
        throw new TypeError("Cannot interpolate an input which is not a number");
    }
    const range = findRange(input, inputRange);
    return interpolateFunction(input, [
        inputRange[range],
        inputRange[range + 1]
    ], [
        outputRange[range],
        outputRange[range + 1]
    ], {
        easing,
        extrapolateLeft,
        extrapolateRight
    });
}
// src/video/get-current-time.ts
var getExpectedMediaFrameUncorrected = ({ frame, playbackRate, startFrom })=>{
    return interpolate(frame, [
        -1,
        startFrom,
        startFrom + 1
    ], [
        -1,
        startFrom,
        startFrom + playbackRate
    ]);
};
var getMediaTime = ({ fps, frame, playbackRate, startFrom })=>{
    const expectedFrame = getExpectedMediaFrameUncorrected({
        frame,
        playbackRate,
        startFrom
    });
    const msPerFrame = 1000 / fps;
    return expectedFrame * msPerFrame / 1000;
};
// src/warn-about-non-seekable-media.ts
var alreadyWarned = {};
var warnAboutNonSeekableMedia = (ref, type)=>{
    if (ref === null) {
        return;
    }
    if (ref.seekable.length === 0) {
        return;
    }
    if (ref.seekable.length > 1) {
        return;
    }
    if (alreadyWarned[ref.src]) {
        return;
    }
    const range = {
        start: ref.seekable.start(0),
        end: ref.seekable.end(0)
    };
    if (range.start === 0 && range.end === 0) {
        const msg = [
            `The media ${ref.src} cannot be seeked. This could be one of few reasons:`,
            "1) The media resource was replaced while the video is playing but it was not loaded yet.",
            "2) The media does not support seeking.",
            "3) The media was loaded with security headers prventing it from being included.",
            "Please see https://remotion.dev/docs/non-seekable-media for assistance."
        ].join(`
`);
        if (type === "console-error") {
            console.error(msg);
        } else if (type === "console-warning") {
            console.warn(`The media ${ref.src} does not support seeking. The video will render fine, but may not play correctly in the Remotion Studio and in the <Player>. See https://remotion.dev/docs/non-seekable-media for an explanation.`);
        } else {
            throw new Error(msg);
        }
        alreadyWarned[ref.src] = true;
    }
};
// src/use-media-playback.ts
var useMediaPlayback = ({ mediaRef, src, mediaType, playbackRate: localPlaybackRate, onlyWarnForMediaSeekingError, acceptableTimeshift, pauseWhenBuffering, isPremounting, isPostmounting, onAutoPlayError })=>{
    _s48();
    const { playbackRate: globalPlaybackRate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const frame = useCurrentFrame();
    const absoluteFrame = useTimelinePosition();
    const [playing] = usePlayingState();
    const buffering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(BufferingContextReact);
    const { fps } = useVideoConfig();
    const mediaStartsAt = useMediaStartsAt();
    const lastSeekDueToShift = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastSeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    if (!buffering) {
        throw new Error("useMediaPlayback must be used inside a <BufferingContext>");
    }
    const isVariableFpsVideoMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const onVariableFpsVideoDetected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMediaPlayback.useCallback10[onVariableFpsVideoDetected]": ()=>{
            if (!src) {
                return;
            }
            if (isVariableFpsVideoMap.current[src]) {
                return;
            }
            Log.verbose({
                logLevel,
                tag: null
            }, `Detected ${src} as a variable FPS video. Disabling buffering while seeking.`);
            isVariableFpsVideoMap.current[src] = true;
        }
    }["useMediaPlayback.useCallback10[onVariableFpsVideoDetected]"], [
        logLevel,
        src
    ]);
    const rvcCurrentTime = useRequestVideoCallbackTime({
        mediaRef,
        mediaType,
        lastSeek,
        onVariableFpsVideoDetected
    });
    const mediaTagCurrentTime = useCurrentTimeOfMediaTagWithUpdateTimeStamp(mediaRef);
    const desiredUnclampedTime = getMediaTime({
        frame,
        playbackRate: localPlaybackRate,
        startFrom: -mediaStartsAt,
        fps
    });
    const isMediaTagBuffering = useMediaBuffering({
        element: mediaRef,
        shouldBuffer: pauseWhenBuffering,
        isPremounting,
        isPostmounting,
        logLevel,
        mountTime,
        src: src ?? null
    });
    const { bufferUntilFirstFrame, isBuffering } = useBufferUntilFirstFrame({
        mediaRef,
        mediaType,
        onVariableFpsVideoDetected,
        pauseWhenBuffering,
        logLevel,
        mountTime
    });
    const playbackRate = localPlaybackRate * globalPlaybackRate;
    const acceptableTimeShiftButLessThanDuration = (()=>{
        const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_NORMAL_PLAYBACK = 0.45;
        const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION = DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_NORMAL_PLAYBACK + 0.2;
        const defaultAcceptableTimeshift = DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION;
        if (mediaRef.current?.duration) {
            return Math.min(mediaRef.current.duration, acceptableTimeshift ?? defaultAcceptableTimeshift);
        }
        return acceptableTimeshift ?? defaultAcceptableTimeshift;
    })();
    const isPlayerBuffering = useIsPlayerBuffering(buffering);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMediaPlayback.useEffect12": ()=>{
            if (mediaRef.current?.paused) {
                return;
            }
            if (!playing) {
                playbackLogging({
                    logLevel,
                    tag: "pause",
                    message: `Pausing ${mediaRef.current?.src} because ${isPremounting ? "media is premounting" : isPostmounting ? "media is postmounting" : "Player is not playing"}`,
                    mountTime
                });
                mediaRef.current?.pause();
                return;
            }
            const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();
            const playerBufferingNotStateButLive = buffering.buffering.current;
            if (playerBufferingNotStateButLive && !isMediaTagBufferingOrStalled) {
                playbackLogging({
                    logLevel,
                    tag: "pause",
                    message: `Pausing ${mediaRef.current?.src} because player is buffering but media tag is not`,
                    mountTime
                });
                mediaRef.current?.pause();
            }
        }
    }["useMediaPlayback.useEffect12"], [
        isBuffering,
        isMediaTagBuffering,
        buffering,
        isPlayerBuffering,
        isPremounting,
        logLevel,
        mediaRef,
        mediaType,
        mountTime,
        playing,
        isPostmounting
    ]);
    const env = useRemotionEnvironment();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "useMediaPlayback.useLayoutEffect5": ()=>{
            const playbackRateToSet = Math.max(0, playbackRate);
            if (mediaRef.current && mediaRef.current.playbackRate !== playbackRateToSet) {
                mediaRef.current.playbackRate = playbackRateToSet;
            }
        }
    }["useMediaPlayback.useLayoutEffect5"], [
        mediaRef,
        playbackRate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMediaPlayback.useEffect12": ()=>{
            const tagName = mediaType === "audio" ? "<Html5Audio>" : "<Html5Video>";
            if (!mediaRef.current) {
                throw new Error(`No ${mediaType} ref found`);
            }
            if (!src) {
                throw new Error(`No 'src' attribute was passed to the ${tagName} element.`);
            }
            const { duration } = mediaRef.current;
            const shouldBeTime = !Number.isNaN(duration) && Number.isFinite(duration) ? Math.min(duration, desiredUnclampedTime) : desiredUnclampedTime;
            const mediaTagTime = mediaTagCurrentTime.current.time;
            const rvcTime = rvcCurrentTime.current?.time ?? null;
            const isVariableFpsVideo = isVariableFpsVideoMap.current[src];
            const timeShiftMediaTag = Math.abs(shouldBeTime - mediaTagTime);
            const timeShiftRvcTag = rvcTime ? Math.abs(shouldBeTime - rvcTime) : null;
            const mostRecentTimeshift = rvcCurrentTime.current?.lastUpdate && rvcCurrentTime.current.time > mediaTagCurrentTime.current.lastUpdate ? timeShiftRvcTag : timeShiftMediaTag;
            const timeShift = timeShiftRvcTag && !isVariableFpsVideo ? mostRecentTimeshift : timeShiftMediaTag;
            if (timeShift > acceptableTimeShiftButLessThanDuration && lastSeekDueToShift.current !== shouldBeTime) {
                lastSeek.current = seek({
                    mediaRef: mediaRef.current,
                    time: shouldBeTime,
                    logLevel,
                    why: `because time shift is too big. shouldBeTime = ${shouldBeTime}, isTime = ${mediaTagTime}, requestVideoCallbackTime = ${rvcTime}, timeShift = ${timeShift}${isVariableFpsVideo ? ", isVariableFpsVideo = true" : ""}, isPremounting = ${isPremounting}, isPostmounting = ${isPostmounting}, pauseWhenBuffering = ${pauseWhenBuffering}`,
                    mountTime
                });
                lastSeekDueToShift.current = lastSeek.current;
                if (playing) {
                    if (playbackRate > 0) {
                        bufferUntilFirstFrame(shouldBeTime);
                    }
                    if (mediaRef.current.paused) {
                        playAndHandleNotAllowedError({
                            mediaRef,
                            mediaType,
                            onAutoPlayError,
                            logLevel,
                            mountTime,
                            reason: "player is playing but media tag is paused, and just seeked",
                            isPlayer: env.isPlayer
                        });
                    }
                }
                if (!onlyWarnForMediaSeekingError) {
                    warnAboutNonSeekableMedia(mediaRef.current, onlyWarnForMediaSeekingError ? "console-warning" : "console-error");
                }
                return;
            }
            const seekThreshold = playing ? 0.15 : 0.01;
            const makesSenseToSeek = Math.abs(mediaRef.current.currentTime - shouldBeTime) > seekThreshold;
            const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();
            const isSomethingElseBuffering = buffering.buffering.current && !isMediaTagBufferingOrStalled;
            if (!playing || isSomethingElseBuffering) {
                if (makesSenseToSeek) {
                    lastSeek.current = seek({
                        mediaRef: mediaRef.current,
                        time: shouldBeTime,
                        logLevel,
                        why: `not playing or something else is buffering. time offset is over seek threshold (${seekThreshold})`,
                        mountTime
                    });
                }
                return;
            }
            if (!playing || buffering.buffering.current) {
                return;
            }
            const pausedCondition = mediaRef.current.paused && !mediaRef.current.ended;
            const firstFrameCondition = absoluteFrame === 0;
            if (pausedCondition || firstFrameCondition) {
                const reason = pausedCondition ? "media tag is paused" : "absolute frame is 0";
                if (makesSenseToSeek) {
                    lastSeek.current = seek({
                        mediaRef: mediaRef.current,
                        time: shouldBeTime,
                        logLevel,
                        why: `is over timeshift threshold (threshold = ${seekThreshold}) and ${reason}`,
                        mountTime
                    });
                }
                playAndHandleNotAllowedError({
                    mediaRef,
                    mediaType,
                    onAutoPlayError,
                    logLevel,
                    mountTime,
                    reason: `player is playing and ${reason}`,
                    isPlayer: env.isPlayer
                });
                if (!isVariableFpsVideo && playbackRate > 0) {
                    bufferUntilFirstFrame(shouldBeTime);
                }
            }
        }
    }["useMediaPlayback.useEffect12"], [
        absoluteFrame,
        acceptableTimeShiftButLessThanDuration,
        bufferUntilFirstFrame,
        buffering.buffering,
        rvcCurrentTime,
        logLevel,
        desiredUnclampedTime,
        isBuffering,
        isMediaTagBuffering,
        mediaRef,
        mediaType,
        onlyWarnForMediaSeekingError,
        playbackRate,
        playing,
        src,
        onAutoPlayError,
        isPremounting,
        isPostmounting,
        pauseWhenBuffering,
        mountTime,
        mediaTagCurrentTime,
        env.isPlayer
    ]);
};
_s48(useMediaPlayback, "eP4Q/KxJGch1tqax/TYxAd9uFHQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useCurrentFrame,
        useTimelinePosition,
        usePlayingState,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useVideoConfig,
        useMediaStartsAt,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useLogLevel,
        useMountTime,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        useRequestVideoCallbackTime,
        useCurrentTimeOfMediaTagWithUpdateTimeStamp,
        useMediaBuffering,
        useBufferUntilFirstFrame,
        useIsPlayerBuffering,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
var useMediaTag = ({ mediaRef, id, mediaType, onAutoPlayError, isPremounting, isPostmounting })=>{
    _s49();
    const { audioAndVideoTags, imperativePlaying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    const env = useRemotionEnvironment();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMediaTag.useEffect13": ()=>{
            const tag = {
                id,
                play: {
                    "useMediaTag.useEffect13": (reason)=>{
                        if (!imperativePlaying.current) {
                            return;
                        }
                        if (isPremounting || isPostmounting) {
                            return;
                        }
                        return playAndHandleNotAllowedError({
                            mediaRef,
                            mediaType,
                            onAutoPlayError,
                            logLevel,
                            mountTime,
                            reason,
                            isPlayer: env.isPlayer
                        });
                    }
                }["useMediaTag.useEffect13"]
            };
            audioAndVideoTags.current.push(tag);
            return ({
                "useMediaTag.useEffect13": ()=>{
                    audioAndVideoTags.current = audioAndVideoTags.current.filter({
                        "useMediaTag.useEffect13": (a)=>a.id !== id
                    }["useMediaTag.useEffect13"]);
                }
            })["useMediaTag.useEffect13"];
        }
    }["useMediaTag.useEffect13"], [
        audioAndVideoTags,
        id,
        mediaRef,
        mediaType,
        onAutoPlayError,
        imperativePlaying,
        isPremounting,
        isPostmounting,
        logLevel,
        mountTime,
        env.isPlayer
    ]);
};
_s49(useMediaTag, "ewiHxP0re8PR8UrpQzUx8w8cPi4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useLogLevel,
        useMountTime,
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
var MediaVolumeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    mediaMuted: false,
    mediaVolume: 1
});
var SetMediaVolumeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    setMediaMuted: ()=>{
        throw new Error("default");
    },
    setMediaVolume: ()=>{
        throw new Error("default");
    }
});
var useMediaVolumeState = ()=>{
    _s50();
    const { mediaVolume } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MediaVolumeContext);
    const { setMediaVolume } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SetMediaVolumeContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useMediaVolumeState.useMemo19": ()=>{
            return [
                mediaVolume,
                setMediaVolume
            ];
        }
    }["useMediaVolumeState.useMemo19"], [
        mediaVolume,
        setMediaVolume
    ]);
};
_s50(useMediaVolumeState, "XPW6kIO73KvKFOfhBqw73vhwPF4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
var useMediaMutedState = ()=>{
    _s51();
    const { mediaMuted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MediaVolumeContext);
    const { setMediaMuted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SetMediaVolumeContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useMediaMutedState.useMemo19": ()=>{
            return [
                mediaMuted,
                setMediaMuted
            ];
        }
    }["useMediaMutedState.useMemo19"], [
        mediaMuted,
        setMediaMuted
    ]);
};
_s51(useMediaMutedState, "yBDrBCI3Jet/kSV1LSzxhzhhrjg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/volume-safeguard.ts
var warnAboutTooHighVolume = (volume)=>{
    if (volume >= 100) {
        throw new Error(`Volume was set to ${volume}, but regular volume is 1, not 100. Did you forget to divide by 100? Set a volume of less than 100 to dismiss this error.`);
    }
};
;
var AudioForDevelopmentForwardRefFunction = (props, ref)=>{
    _s52();
    const [initialShouldPreMountAudioElements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(props.shouldPreMountAudioTags);
    if (props.shouldPreMountAudioTags !== initialShouldPreMountAudioElements) {
        throw new Error("Cannot change the behavior for pre-mounting audio tags dynamically.");
    }
    const logLevel = useLogLevel();
    const { volume, muted, playbackRate, shouldPreMountAudioTags, src, onDuration, acceptableTimeShiftInSeconds, _remotionInternalNeedsDurationCalculation, _remotionInternalNativeLoopPassed, _remotionInternalStack, allowAmplificationDuringRender, name, pauseWhenBuffering, showInTimeline, loopVolumeCurveBehavior, stack, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, toneFrequency, useWebAudioApi, onError, onNativeError, audioStreamIndex, ...nativeProps } = props;
    const _propsValid = true;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const [mediaVolume] = useMediaVolumeState();
    const [mediaMuted] = useMediaMutedState();
    const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const { hidden } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceVisibilityToggleContext);
    if (!src) {
        throw new TypeError("No 'src' was passed to <Html5Audio>.");
    }
    const preloadedSrc = usePreload(src);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const [timelineId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AudioForDevelopmentForwardRefFunction.useState14": ()=>String(Math.random())
    }["AudioForDevelopmentForwardRefFunction.useState14"]);
    const isSequenceHidden = hidden[timelineId] ?? false;
    const userPreferredVolume = evaluateVolume({
        frame: volumePropFrame,
        volume,
        mediaVolume
    });
    warnAboutTooHighVolume(userPreferredVolume);
    const crossOriginValue = getCrossOriginValue({
        crossOrigin,
        requestsVideoFrame: false
    });
    const propsToPass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AudioForDevelopmentForwardRefFunction.useMemo20[propsToPass]": ()=>{
            return {
                muted: muted || mediaMuted || isSequenceHidden || userPreferredVolume <= 0,
                src: preloadedSrc,
                loop: _remotionInternalNativeLoopPassed,
                crossOrigin: crossOriginValue,
                ...nativeProps
            };
        }
    }["AudioForDevelopmentForwardRefFunction.useMemo20[propsToPass]"], [
        _remotionInternalNativeLoopPassed,
        isSequenceHidden,
        mediaMuted,
        muted,
        nativeProps,
        preloadedSrc,
        userPreferredVolume,
        crossOriginValue
    ]);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AudioForDevelopmentForwardRefFunction.useMemo20[id]": ()=>`audio-${random(src ?? "")}-${sequenceContext?.relativeFrom}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.durationInFrames}-muted:${props.muted}-loop:${props.loop}`
    }["AudioForDevelopmentForwardRefFunction.useMemo20[id]"], [
        src,
        sequenceContext?.relativeFrom,
        sequenceContext?.cumulatedFrom,
        sequenceContext?.durationInFrames,
        props.muted,
        props.loop
    ]);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    if (!context) {
        throw new Error("SharedAudioContext not found");
    }
    const { el: audioRef, mediaElementSourceNode } = useSharedAudio({
        aud: propsToPass,
        audioId: id,
        premounting: Boolean(sequenceContext?.premounting)
    });
    useMediaInTimeline({
        volume,
        mediaVolume,
        src,
        mediaType: "audio",
        playbackRate: playbackRate ?? 1,
        displayName: name ?? null,
        id: timelineId,
        stack: _remotionInternalStack,
        showInTimeline,
        premountDisplay: sequenceContext?.premountDisplay ?? null,
        postmountDisplay: sequenceContext?.postmountDisplay ?? null,
        loopDisplay: undefined
    });
    useMediaPlayback({
        mediaRef: audioRef,
        src,
        mediaType: "audio",
        playbackRate: playbackRate ?? 1,
        onlyWarnForMediaSeekingError: false,
        acceptableTimeshift: acceptableTimeShiftInSeconds ?? null,
        isPremounting: Boolean(sequenceContext?.premounting),
        isPostmounting: Boolean(sequenceContext?.postmounting),
        pauseWhenBuffering,
        onAutoPlayError: null
    });
    useMediaTag({
        id: timelineId,
        isPostmounting: Boolean(sequenceContext?.postmounting),
        isPremounting: Boolean(sequenceContext?.premounting),
        mediaRef: audioRef,
        mediaType: "audio",
        onAutoPlayError: null
    });
    useVolume({
        logLevel,
        mediaRef: audioRef,
        source: mediaElementSourceNode,
        volume: userPreferredVolume,
        shouldUseWebAudioApi: useWebAudioApi ?? false
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "AudioForDevelopmentForwardRefFunction.useImperativeHandle5": ()=>{
            return audioRef.current;
        }
    }["AudioForDevelopmentForwardRefFunction.useImperativeHandle5"], [
        audioRef
    ]);
    const currentOnDurationCallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onDuration);
    currentOnDurationCallback.current = onDuration;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AudioForDevelopmentForwardRefFunction.useEffect14": ()=>{
            const { current } = audioRef;
            if (!current) {
                return;
            }
            if (current.duration) {
                currentOnDurationCallback.current?.(current.src, current.duration);
                return;
            }
            const onLoadedMetadata = {
                "AudioForDevelopmentForwardRefFunction.useEffect14.onLoadedMetadata": ()=>{
                    currentOnDurationCallback.current?.(current.src, current.duration);
                }
            }["AudioForDevelopmentForwardRefFunction.useEffect14.onLoadedMetadata"];
            current.addEventListener("loadedmetadata", onLoadedMetadata);
            return ({
                "AudioForDevelopmentForwardRefFunction.useEffect14": ()=>{
                    current.removeEventListener("loadedmetadata", onLoadedMetadata);
                }
            })["AudioForDevelopmentForwardRefFunction.useEffect14"];
        }
    }["AudioForDevelopmentForwardRefFunction.useEffect14"], [
        audioRef,
        src
    ]);
    if (initialShouldPreMountAudioElements) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("audio", {
        ref: audioRef,
        preload: "metadata",
        crossOrigin: crossOriginValue,
        ...propsToPass
    });
};
_s52(AudioForDevelopmentForwardRefFunction, "tLpHEf7i9JHAPtP6d9UdfrRbZZ0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useLogLevel,
        useMediaVolumeState,
        useMediaMutedState,
        useFrameForVolumeProp,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        usePreload,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useSharedAudio,
        useMediaInTimeline,
        useMediaPlayback,
        useMediaTag,
        useVolume,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c27 = AudioForDevelopmentForwardRefFunction;
var AudioForPreview = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(AudioForDevelopmentForwardRefFunction);
_c28 = AudioForPreview;
;
;
var AudioForRenderingRefForwardingFunction = (props, ref)=>{
    _s53();
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { volume: volumeProp, playbackRate, allowAmplificationDuringRender, onDuration, toneFrequency, _remotionInternalNeedsDurationCalculation, _remotionInternalNativeLoopPassed, acceptableTimeShiftInSeconds, name, onNativeError, delayRenderRetries, delayRenderTimeoutInMilliseconds, loopVolumeCurveBehavior, pauseWhenBuffering, audioStreamIndex, ...nativeProps } = props;
    const absoluteFrame = useTimelinePosition();
    const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const frame = useCurrentFrame();
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AudioForRenderingRefForwardingFunction.useMemo21[id]": ()=>`audio-${random(props.src ?? "")}-${sequenceContext?.relativeFrom}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.durationInFrames}`
    }["AudioForRenderingRefForwardingFunction.useMemo21[id]"], [
        props.src,
        sequenceContext?.relativeFrom,
        sequenceContext?.cumulatedFrom,
        sequenceContext?.durationInFrames
    ]);
    const volume = evaluateVolume({
        volume: volumeProp,
        frame: volumePropFrame,
        mediaVolume: 1
    });
    warnAboutTooHighVolume(volume);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "AudioForRenderingRefForwardingFunction.useImperativeHandle6": ()=>{
            return audioRef.current;
        }
    }["AudioForRenderingRefForwardingFunction.useImperativeHandle6"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AudioForRenderingRefForwardingFunction.useEffect15": ()=>{
            if (!props.src) {
                throw new Error("No src passed");
            }
            if (!window.remotion_audioEnabled) {
                return;
            }
            if (props.muted) {
                return;
            }
            if (volume <= 0) {
                return;
            }
            registerRenderAsset({
                type: "audio",
                src: getAbsoluteSrc(props.src),
                id,
                frame: absoluteFrame,
                volume,
                mediaFrame: frame,
                playbackRate: props.playbackRate ?? 1,
                toneFrequency: toneFrequency ?? 1,
                audioStartFrame: Math.max(0, -(sequenceContext?.relativeFrom ?? 0)),
                audioStreamIndex: audioStreamIndex ?? 0
            });
            return ({
                "AudioForRenderingRefForwardingFunction.useEffect15": ()=>unregisterRenderAsset(id)
            })["AudioForRenderingRefForwardingFunction.useEffect15"];
        }
    }["AudioForRenderingRefForwardingFunction.useEffect15"], [
        props.muted,
        props.src,
        registerRenderAsset,
        absoluteFrame,
        id,
        unregisterRenderAsset,
        volume,
        volumePropFrame,
        frame,
        playbackRate,
        props.playbackRate,
        toneFrequency,
        sequenceContext?.relativeFrom,
        audioStreamIndex
    ]);
    const { src } = props;
    const needsToRenderAudioTag = ref || _remotionInternalNeedsDurationCalculation;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "AudioForRenderingRefForwardingFunction.useLayoutEffect6": ()=>{
            if (window.process?.env?.NODE_ENV === "test") {
                return;
            }
            if (!needsToRenderAudioTag) {
                return;
            }
            const newHandle = delayRender2("Loading <Html5Audio> duration with src=" + src, {
                retries: delayRenderRetries ?? undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
            });
            const { current } = audioRef;
            const didLoad = {
                "AudioForRenderingRefForwardingFunction.useLayoutEffect6.didLoad": ()=>{
                    if (current?.duration) {
                        onDuration(current.src, current.duration);
                    }
                    continueRender2(newHandle);
                }
            }["AudioForRenderingRefForwardingFunction.useLayoutEffect6.didLoad"];
            if (current?.duration) {
                onDuration(current.src, current.duration);
                continueRender2(newHandle);
            } else {
                current?.addEventListener("loadedmetadata", didLoad, {
                    once: true
                });
            }
            return ({
                "AudioForRenderingRefForwardingFunction.useLayoutEffect6": ()=>{
                    current?.removeEventListener("loadedmetadata", didLoad);
                    continueRender2(newHandle);
                }
            })["AudioForRenderingRefForwardingFunction.useLayoutEffect6"];
        }
    }["AudioForRenderingRefForwardingFunction.useLayoutEffect6"], [
        src,
        onDuration,
        needsToRenderAudioTag,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        continueRender2,
        delayRender2
    ]);
    if (!needsToRenderAudioTag) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("audio", {
        ref: audioRef,
        ...nativeProps,
        onError: onNativeError
    });
};
_s53(AudioForRenderingRefForwardingFunction, "GjVRqLhkeePLVa1d1uvOYUbR/K8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useTimelinePosition,
        useFrameForVolumeProp,
        useCurrentFrame,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"]
    ];
});
_c29 = AudioForRenderingRefForwardingFunction;
var AudioForRendering = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(AudioForRenderingRefForwardingFunction);
_c30 = AudioForRendering;
;
var AudioRefForwardingFunction = (props, ref)=>{
    _s54();
    const audioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    const { startFrom, endAt, trimBefore, trimAfter, name, stack, pauseWhenBuffering, showInTimeline, onError: onRemotionError, ...otherProps } = props;
    const { loop, ...propsOtherThanLoop } = props;
    const { fps } = useVideoConfig();
    const environment = useRemotionEnvironment();
    const { durations, setDurations } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DurationsContext);
    if (typeof props.src !== "string") {
        throw new TypeError(`The \`<Html5Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(props.src)} instead.`);
    }
    const preloadedSrc = usePreload(props.src);
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AudioRefForwardingFunction.useCallback11[onError]": (e)=>{
            console.log(e.currentTarget.error);
            const errMessage = `Could not play audio with src ${preloadedSrc}: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`;
            if (loop) {
                if (onRemotionError) {
                    onRemotionError(new Error(errMessage));
                    return;
                }
                cancelRender(new Error(errMessage));
            } else {
                onRemotionError?.(new Error(errMessage));
                console.warn(errMessage);
            }
        }
    }["AudioRefForwardingFunction.useCallback11[onError]"], [
        loop,
        onRemotionError,
        preloadedSrc
    ]);
    const onDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AudioRefForwardingFunction.useCallback11[onDuration]": (src, durationInSeconds)=>{
            setDurations({
                type: "got-duration",
                durationInSeconds,
                src
            });
        }
    }["AudioRefForwardingFunction.useCallback11[onDuration]"], [
        setDurations
    ]);
    const durationFetched = durations[getAbsoluteSrc(preloadedSrc)] ?? durations[getAbsoluteSrc(props.src)];
    validateMediaTrimProps({
        startFrom,
        endAt,
        trimBefore,
        trimAfter
    });
    const { trimBeforeValue, trimAfterValue } = resolveTrimProps({
        startFrom,
        endAt,
        trimBefore,
        trimAfter
    });
    if (loop && durationFetched !== undefined) {
        if (!Number.isFinite(durationFetched)) {
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Html5Audio, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            });
        }
        const duration = durationFetched * fps;
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Loop, {
            layout: "none",
            durationInFrames: calculateMediaDuration({
                trimAfter: trimAfterValue,
                mediaDurationInFrames: duration,
                playbackRate: props.playbackRate ?? 1,
                trimBefore: trimBeforeValue
            }),
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Html5Audio, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            })
        });
    }
    if (typeof trimBeforeValue !== "undefined" || typeof trimAfterValue !== "undefined") {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            layout: "none",
            from: 0 - (trimBeforeValue ?? 0),
            showInTimeline: false,
            durationInFrames: trimAfterValue,
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Html5Audio, {
                _remotionInternalNeedsDurationCalculation: Boolean(loop),
                pauseWhenBuffering: pauseWhenBuffering ?? false,
                ...otherProps,
                ref
            })
        });
    }
    validateMediaProps({
        playbackRate: props.playbackRate,
        volume: props.volume
    }, "Html5Audio");
    if (environment.isRendering) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(AudioForRendering, {
            onDuration,
            ...props,
            ref,
            onNativeError: onError,
            _remotionInternalNeedsDurationCalculation: Boolean(loop)
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(AudioForPreview, {
        _remotionInternalNativeLoopPassed: props._remotionInternalNativeLoopPassed ?? false,
        _remotionInternalStack: stack ?? null,
        shouldPreMountAudioTags: audioContext !== null && audioContext.numberOfAudioTags > 0,
        ...props,
        ref,
        onNativeError: onError,
        onDuration,
        pauseWhenBuffering: pauseWhenBuffering ?? false,
        _remotionInternalNeedsDurationCalculation: Boolean(loop),
        showInTimeline: showInTimeline ?? true
    });
};
_s54(AudioRefForwardingFunction, "kIx+oQj6/F82EyuX1zPYTkUoVyo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useVideoConfig,
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        usePreload,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c31 = AudioRefForwardingFunction;
var Html5Audio = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(AudioRefForwardingFunction);
_c32 = Html5Audio;
addSequenceStackTraces(Html5Audio);
var Audio = Html5Audio;
;
;
;
// src/validation/validate-folder-name.ts
var getRegex = ()=>/^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;
var isFolderNameValid = (name)=>name.match(getRegex());
var validateFolderName = (name)=>{
    if (name === undefined || name === null) {
        throw new TypeError("You must pass a name to a <Folder />.");
    }
    if (typeof name !== "string") {
        throw new TypeError(`The "name" you pass into <Folder /> must be a string. Got: ${typeof name}`);
    }
    if (!isFolderNameValid(name)) {
        throw new Error(`Folder name can only contain a-z, A-Z, 0-9 and -. You passed ${name}`);
    }
};
var invalidFolderNameErrorMessage = `Folder name must match ${String(getRegex())}`;
;
var FolderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    folderName: null,
    parentName: null
});
var Folder = ({ name, children })=>{
    _s55();
    const parent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(FolderContext);
    const { registerFolder, unregisterFolder } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompositionSetters);
    validateFolderName(name);
    const parentNameArr = [
        parent.parentName,
        parent.folderName
    ].filter(truthy);
    const parentName = parentNameArr.length === 0 ? null : parentNameArr.join("/");
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Folder.useMemo22[value]": ()=>{
            return {
                folderName: name,
                parentName
            };
        }
    }["Folder.useMemo22[value]"], [
        name,
        parentName
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Folder.useEffect16": ()=>{
            registerFolder(name, parentName);
            return ({
                "Folder.useEffect16": ()=>{
                    unregisterFolder(name, parentName);
                }
            })["Folder.useEffect16"];
        }
    }["Folder.useEffect16"], [
        name,
        parent.folderName,
        parentName,
        registerFolder,
        unregisterFolder
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(FolderContext.Provider, {
        value,
        children
    });
};
_s55(Folder, "4W9F5RgpWjlwmo39aNiHUC84NwM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c33 = Folder;
;
var rotate = {
    transform: `rotate(90deg)`
};
var ICON_SIZE = 40;
var label = {
    color: "white",
    fontSize: 14,
    fontFamily: "sans-serif"
};
var container = {
    justifyContent: "center",
    alignItems: "center"
};
var Loading = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])(AbsoluteFill, {
        style: container,
        id: "remotion-comp-loading",
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("style", {
                type: "text/css",
                children: `
				@keyframes anim {
					from {
						opacity: 0
					}
					to {
						opacity: 1
					}
				}
				#remotion-comp-loading {
					animation: anim 2s;
					animation-fill-mode: forwards;
				}
			`
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("svg", {
                width: ICON_SIZE,
                height: ICON_SIZE,
                viewBox: "-100 -100 400 400",
                style: rotate,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                    fill: "#555",
                    stroke: "#555",
                    strokeWidth: "100",
                    strokeLinejoin: "round",
                    d: "M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
                })
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("p", {
                style: label,
                children: [
                    "Resolving ",
                    "<Suspense>",
                    "..."
                ]
            })
        ]
    });
};
_c34 = Loading;
// src/portal-node.ts
var _portalNode = null;
var portalNode = ()=>{
    if (!_portalNode) {
        if (typeof document === "undefined") {
            throw new Error("Tried to call an API that only works in the browser from outside the browser");
        }
        _portalNode = document.createElement("div");
        _portalNode.style.position = "absolute";
        _portalNode.style.top = "0px";
        _portalNode.style.left = "0px";
        _portalNode.style.right = "0px";
        _portalNode.style.bottom = "0px";
        _portalNode.style.width = "100%";
        _portalNode.style.height = "100%";
        _portalNode.style.display = "flex";
        _portalNode.style.flexDirection = "column";
        const containerNode = document.createElement("div");
        containerNode.style.position = "fixed";
        containerNode.style.top = -999999 + "px";
        containerNode.appendChild(_portalNode);
        document.body.appendChild(containerNode);
    }
    return _portalNode;
};
;
var useLazyComponent = ({ compProps, componentName, noSuspense })=>{
    _s56();
    const lazy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useLazyComponent.useMemo23[lazy]": ()=>{
            if ("component" in compProps) {
                if (typeof document === "undefined" || noSuspense) {
                    return compProps.component;
                }
                if (typeof compProps.component === "undefined") {
                    throw new Error(`A value of \`undefined\` was passed to the \`component\` prop. Check the value you are passing to the <${componentName}/> component.`);
                }
                return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].lazy({
                    "useLazyComponent.useMemo23[lazy]": ()=>Promise.resolve({
                            default: compProps.component
                        })
                }["useLazyComponent.useMemo23[lazy]"]);
            }
            if ("lazyComponent" in compProps && typeof compProps.lazyComponent !== "undefined") {
                if (typeof compProps.lazyComponent === "undefined") {
                    throw new Error(`A value of \`undefined\` was passed to the \`lazyComponent\` prop. Check the value you are passing to the <${componentName}/> component.`);
                }
                return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].lazy(compProps.lazyComponent);
            }
            throw new Error("You must pass either 'component' or 'lazyComponent'");
        }
    }["useLazyComponent.useMemo23[lazy]"], [
        compProps.component,
        compProps.lazyComponent
    ]);
    return lazy;
};
_s56(useLazyComponent, "eVnKRmbcKyzVBYGh/JS7sWGv+lA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/validation/validate-composition-id.ts
var getRegex2 = ()=>/^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;
var isCompositionIdValid = (id)=>id.match(getRegex2());
var validateCompositionId = (id)=>{
    if (!isCompositionIdValid(id)) {
        throw new Error(`Composition id can only contain a-z, A-Z, 0-9, CJK characters and -. You passed ${id}`);
    }
};
var invalidCompositionErrorMessage = `Composition ID must match ${String(getRegex2())}`;
// src/validation/validate-default-props.ts
var validateDefaultAndInputProps = (defaultProps, name, compositionId)=>{
    if (!defaultProps) {
        return;
    }
    if (typeof defaultProps !== "object") {
        throw new Error(`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`);
    }
    if (Array.isArray(defaultProps)) {
        throw new Error(`"${name}" must be an object, an array was passed ${compositionId ? `for composition "${compositionId}"` : ""}`);
    }
};
;
var Fallback = ()=>{
    _s57();
    const { continueRender: continueRender2, delayRender: delayRender2 } = useDelayRender();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Fallback.useEffect17": ()=>{
            const fallback = delayRender2("Waiting for Root component to unsuspend");
            return ({
                "Fallback.useEffect17": ()=>continueRender2(fallback)
            })["Fallback.useEffect17"];
        }
    }["Fallback.useEffect17"], [
        continueRender2,
        delayRender2
    ]);
    return null;
};
_s57(Fallback, "t8hKP9wZ/vkkOoEFOjYyV2Mli/8=", false, function() {
    return [
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c35 = Fallback;
var InnerComposition = ({ width, height, fps, durationInFrames, id, defaultProps, schema, ...compProps })=>{
    _s58();
    const compManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompositionSetters);
    const { registerComposition, unregisterComposition } = compManager;
    const video = useVideo();
    const lazy = useLazyComponent({
        compProps,
        componentName: "Composition",
        noSuspense: false
    });
    const nonce = useNonce();
    const isPlayer = useIsPlayer();
    const environment = useRemotionEnvironment();
    const canUseComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CanUseRemotionHooks);
    if ("TURBOPACK compile-time truthy", 1) {
        window.remotion_seenCompositionIds = Array.from(new Set([
            ...window.remotion_seenCompositionIds ?? [],
            id
        ]));
    }
    if (canUseComposition) {
        if (isPlayer) {
            throw new Error("<Composition> was mounted inside the `component` that was passed to the <Player>. See https://remotion.dev/docs/wrong-composition-mount for help.");
        }
        throw new Error("<Composition> mounted inside another composition. See https://remotion.dev/docs/wrong-composition-mount for help.");
    }
    const { folderName, parentName } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(FolderContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InnerComposition.useEffect17": ()=>{
            if (!id) {
                throw new Error("No id for composition passed.");
            }
            validateCompositionId(id);
            validateDefaultAndInputProps(defaultProps, "defaultProps", id);
            registerComposition({
                durationInFrames: durationInFrames ?? undefined,
                fps: fps ?? undefined,
                height: height ?? undefined,
                width: width ?? undefined,
                id,
                folderName,
                component: lazy,
                defaultProps: serializeThenDeserializeInStudio(defaultProps ?? {}),
                nonce,
                parentFolderName: parentName,
                schema: schema ?? null,
                calculateMetadata: compProps.calculateMetadata ?? null
            });
            return ({
                "InnerComposition.useEffect17": ()=>{
                    unregisterComposition(id);
                }
            })["InnerComposition.useEffect17"];
        }
    }["InnerComposition.useEffect17"], [
        durationInFrames,
        fps,
        height,
        lazy,
        id,
        folderName,
        defaultProps,
        width,
        nonce,
        parentName,
        schema,
        compProps.calculateMetadata,
        registerComposition,
        unregisterComposition
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InnerComposition.useEffect17": ()=>{
            window.dispatchEvent(new CustomEvent(PROPS_UPDATED_EXTERNALLY, {
                detail: {
                    resetUnsaved: id
                }
            }));
        }
    }["InnerComposition.useEffect17"], [
        defaultProps,
        id
    ]);
    const resolved = useResolvedVideoConfig(id);
    if (environment.isStudio && video && video.component === lazy) {
        const Comp = lazy;
        if (resolved === null || resolved.type !== "success" && resolved.type !== "success-and-refreshing") {
            return null;
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooksProvider, {
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Loading, {}),
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Comp, {
                    ...resolved.result.props ?? {}
                })
            })
        }), portalNode());
    }
    if (environment.isRendering && video && video.component === lazy) {
        const Comp = lazy;
        if (resolved === null || resolved.type !== "success" && resolved.type !== "success-and-refreshing") {
            return null;
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooksProvider, {
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Fallback, {}),
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Comp, {
                    ...resolved.result.props ?? {}
                })
            })
        }), portalNode());
    }
    return null;
};
_s58(InnerComposition, "ZLFb4QNeLb8bRtfIubqhdSWXgGw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useVideo,
        useLazyComponent,
        useNonce,
        useIsPlayer,
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        useResolvedVideoConfig
    ];
});
_c36 = InnerComposition;
var Composition = (props2)=>{
    _s59();
    const { onlyRenderComposition } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompositionSetters);
    if (onlyRenderComposition && onlyRenderComposition !== props2.id) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(InnerComposition, {
        ...props2
    });
};
_s59(Composition, "u7po9TW/1X9u75mGZNkEZX68Bjs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
_c37 = Composition;
// src/bezier.ts
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1 / (kSplineTableSize - 1);
var float32ArraySupported = typeof Float32Array === "function";
function a(aA1, aA2) {
    return 1 - 3 * aA2 + 3 * aA1;
}
function b(aA1, aA2) {
    return 3 * aA2 - 6 * aA1;
}
function c(aA1) {
    return 3 * aA1;
}
function calcBezier(aT, aA1, aA2) {
    return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
}
function getSlope(aT, aA1, aA2) {
    return 3 * a(aA1, aA2) * aT * aT + 2 * b(aA1, aA2) * aT + c(aA1);
}
function binarySubdivide({ aX, _aA, _aB, mX1, mX2 }) {
    let currentX;
    let currentT;
    let i = 0;
    let aA = _aA;
    let aB = _aB;
    do {
        currentT = aA + (aB - aA) / 2;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0) {
            aB = currentT;
        } else {
            aA = currentT;
        }
    }while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS)
    return currentT;
}
function newtonRaphsonIterate(aX, _aGuessT, mX1, mX2) {
    let aGuessT = _aGuessT;
    for(let i = 0; i < NEWTON_ITERATIONS; ++i){
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0) {
            return aGuessT;
        }
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
}
function bezier(mX1, mY1, mX2, mY2) {
    if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
        throw new Error("bezier x values must be in [0, 1] range");
    }
    const sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
    if (mX1 !== mY1 || mX2 !== mY2) {
        for(let i = 0; i < kSplineTableSize; ++i){
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
    }
    function getTForX(aX) {
        let intervalStart = 0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;
        for(; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample){
            intervalStart += kSampleStepSize;
        }
        --currentSample;
        const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        if (initialSlope === 0) {
            return guessForT;
        }
        return binarySubdivide({
            aX,
            _aA: intervalStart,
            _aB: intervalStart + kSampleStepSize,
            mX1,
            mX2
        });
    }
    return function(x) {
        if (mX1 === mY1 && mX2 === mY2) {
            return x;
        }
        if (x === 0) {
            return 0;
        }
        if (x === 1) {
            return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
    };
}
// src/easing.ts
class Easing {
    static step0(n) {
        return n > 0 ? 1 : 0;
    }
    static step1(n) {
        return n >= 1 ? 1 : 0;
    }
    static linear(t) {
        return t;
    }
    static ease(t) {
        return Easing.bezier(0.42, 0, 1, 1)(t);
    }
    static quad(t) {
        return t * t;
    }
    static cubic(t) {
        return t * t * t;
    }
    static poly(n) {
        return (t)=>t ** n;
    }
    static sin(t) {
        return 1 - Math.cos(t * Math.PI / 2);
    }
    static circle(t) {
        return 1 - Math.sqrt(1 - t * t);
    }
    static exp(t) {
        return 2 ** (10 * (t - 1));
    }
    static elastic(bounciness = 1) {
        const p = bounciness * Math.PI;
        return (t)=>1 - Math.cos(t * Math.PI / 2) ** 3 * Math.cos(t * p);
    }
    static back(s = 1.70158) {
        return (t)=>t * t * ((s + 1) * t - s);
    }
    static bounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        }
        if (t < 2 / 2.75) {
            const t2_ = t - 1.5 / 2.75;
            return 7.5625 * t2_ * t2_ + 0.75;
        }
        if (t < 2.5 / 2.75) {
            const t2_ = t - 2.25 / 2.75;
            return 7.5625 * t2_ * t2_ + 0.9375;
        }
        const t2 = t - 2.625 / 2.75;
        return 7.5625 * t2 * t2 + 0.984375;
    }
    static bezier(x1, y1, x2, y2) {
        return bezier(x1, y1, x2, y2);
    }
    static in(easing) {
        return easing;
    }
    static out(easing) {
        return (t)=>1 - easing(1 - t);
    }
    static inOut(easing) {
        return (t)=>{
            if (t < 0.5) {
                return easing(t * 2) / 2;
            }
            return 1 - easing((1 - t) * 2) / 2;
        };
    }
}
// src/v5-flag.ts
var ENABLE_V5_BREAKING_CHANGES = false;
// src/get-static-files.ts
var warnedServer = false;
var warnedPlayer = false;
var warnServerOnce = ()=>{
    if (warnedServer) {
        return;
    }
    warnedServer = true;
    console.warn("Called getStaticFiles() on the server. The API is only available in the browser. An empty array was returned.");
};
var warnPlayerOnce = ()=>{
    if (warnedPlayer) {
        return;
    }
    warnedPlayer = true;
    console.warn("Called getStaticFiles() while using the Remotion Player. The API is only available while using the Remotion Studio. An empty array was returned.");
};
var getStaticFiles = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (typeof document === "undefined") {
        warnServerOnce();
        return [];
    }
    if (window.remotion_isPlayer) {
        warnPlayerOnce();
        return [];
    }
    return window.remotion_staticFiles;
};
;
;
var IFrameRefForwarding = ({ onLoad, onError, delayRenderRetries, delayRenderTimeoutInMilliseconds, ...props2 }, ref)=>{
    _s60();
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const [handle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "IFrameRefForwarding.useState15": ()=>delayRender2(`Loading <IFrame> with source ${props2.src}`, {
                retries: delayRenderRetries ?? undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
            })
    }["IFrameRefForwarding.useState15"]);
    const didLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IFrameRefForwarding.useCallback12[didLoad]": (e)=>{
            continueRender2(handle);
            onLoad?.(e);
        }
    }["IFrameRefForwarding.useCallback12[didLoad]"], [
        handle,
        onLoad,
        continueRender2
    ]);
    const didGetError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "IFrameRefForwarding.useCallback12[didGetError]": (e)=>{
            continueRender2(handle);
            if (onError) {
                onError(e);
            } else {
                console.error("Error loading iframe:", e, "Handle the event using the onError() prop to make this message disappear.");
            }
        }
    }["IFrameRefForwarding.useCallback12[didGetError]"], [
        handle,
        onError,
        continueRender2
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("iframe", {
        ...props2,
        ref,
        onError: didGetError,
        onLoad: didLoad
    });
};
_s60(IFrameRefForwarding, "n+VXl5u46Zn/WkR5hXwds9Qyo/g=", false, function() {
    return [
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c38 = IFrameRefForwarding;
var IFrame = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(IFrameRefForwarding);
_c39 = IFrame;
;
;
function exponentialBackoff(errorCount) {
    return 1000 * 2 ** (errorCount - 1);
}
var ImgRefForwarding = ({ onError, maxRetries = 2, src, pauseWhenLoading, delayRenderRetries, delayRenderTimeoutInMilliseconds, onImageFrame, crossOrigin, ...props2 }, ref)=>{
    _s61();
    const imageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const errors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const { delayPlayback } = useBufferState();
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    if (!src) {
        throw new Error('No "src" prop was passed to <Img>.');
    }
    const _propsValid = true;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "ImgRefForwarding.useImperativeHandle7": ()=>{
            return imageRef.current;
        }
    }["ImgRefForwarding.useImperativeHandle7"], []);
    const actualSrc = usePreload(src);
    const retryIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ImgRefForwarding.useCallback13[retryIn]": (timeout)=>{
            if (!imageRef.current) {
                return;
            }
            const currentSrc = imageRef.current.src;
            setTimeout({
                "ImgRefForwarding.useCallback13[retryIn]": ()=>{
                    if (!imageRef.current) {
                        return;
                    }
                    const newSrc = imageRef.current?.src;
                    if (newSrc !== currentSrc) {
                        return;
                    }
                    imageRef.current.removeAttribute("src");
                    imageRef.current.setAttribute("src", newSrc);
                }
            }["ImgRefForwarding.useCallback13[retryIn]"], timeout);
        }
    }["ImgRefForwarding.useCallback13[retryIn]"], []);
    const didGetError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ImgRefForwarding.useCallback13[didGetError]": (e)=>{
            if (!errors.current) {
                return;
            }
            errors.current[imageRef.current?.src] = (errors.current[imageRef.current?.src] ?? 0) + 1;
            if (onError && (errors.current[imageRef.current?.src] ?? 0) > maxRetries) {
                onError(e);
                return;
            }
            if ((errors.current[imageRef.current?.src] ?? 0) <= maxRetries) {
                const backoff = exponentialBackoff(errors.current[imageRef.current?.src] ?? 0);
                console.warn(`Could not load image with source ${imageRef.current?.src}, retrying again in ${backoff}ms`);
                retryIn(backoff);
                return;
            }
            cancelRender("Error loading image with src: " + imageRef.current?.src);
        }
    }["ImgRefForwarding.useCallback13[didGetError]"], [
        maxRetries,
        onError,
        retryIn
    ]);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    if ("TURBOPACK compile-time truthy", 1) {
        const isPremounting = Boolean(sequenceContext?.premounting);
        const isPostmounting = Boolean(sequenceContext?.postmounting);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "ImgRefForwarding.useLayoutEffect7": ()=>{
                if (window.process?.env?.NODE_ENV === "test") {
                    if (imageRef.current) {
                        imageRef.current.src = actualSrc;
                    }
                    return;
                }
                const { current } = imageRef;
                if (!current) {
                    return;
                }
                const newHandle = delayRender2("Loading <Img> with src=" + actualSrc, {
                    retries: delayRenderRetries ?? undefined,
                    timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
                });
                const unblock = pauseWhenLoading && !isPremounting && !isPostmounting ? delayPlayback().unblock : ({
                    "ImgRefForwarding.useLayoutEffect7": ()=>{
                        return;
                    }
                })["ImgRefForwarding.useLayoutEffect7"];
                let unmounted = false;
                const onComplete = {
                    "ImgRefForwarding.useLayoutEffect7.onComplete": ()=>{
                        if (unmounted) {
                            continueRender2(newHandle);
                            return;
                        }
                        if ((errors.current[imageRef.current?.src] ?? 0) > 0) {
                            delete errors.current[imageRef.current?.src];
                            console.info(`Retry successful - ${imageRef.current?.src} is now loaded`);
                        }
                        if (current) {
                            onImageFrame?.(current);
                        }
                        unblock();
                        continueRender2(newHandle);
                    }
                }["ImgRefForwarding.useLayoutEffect7.onComplete"];
                if (!imageRef.current) {
                    onComplete();
                    return;
                }
                current.src = actualSrc;
                current.decode().then(onComplete).catch({
                    "ImgRefForwarding.useLayoutEffect7": (err)=>{
                        console.warn(err);
                        if (current.complete) {
                            onComplete();
                        } else {
                            current.addEventListener("load", onComplete);
                        }
                    }
                }["ImgRefForwarding.useLayoutEffect7"]);
                return ({
                    "ImgRefForwarding.useLayoutEffect7": ()=>{
                        unmounted = true;
                        current.removeEventListener("load", onComplete);
                        unblock();
                        continueRender2(newHandle);
                    }
                })["ImgRefForwarding.useLayoutEffect7"];
            }
        }["ImgRefForwarding.useLayoutEffect7"], [
            actualSrc,
            delayPlayback,
            delayRenderRetries,
            delayRenderTimeoutInMilliseconds,
            pauseWhenLoading,
            isPremounting,
            isPostmounting,
            onImageFrame,
            continueRender2,
            delayRender2
        ]);
    }
    const crossOriginValue = getCrossOriginValue({
        crossOrigin,
        requestsVideoFrame: false
    });
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("img", {
        ...props2,
        ref: imageRef,
        crossOrigin: crossOriginValue,
        onError: didGetError,
        decoding: "sync"
    });
};
_s61(ImgRefForwarding, "uZi6k2MwaMyMV23EhvXGEvNScRY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useBufferState,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        usePreload,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        useDelayRender
    ];
});
_c40 = ImgRefForwarding;
var Img = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(ImgRefForwarding);
_c41 = Img;
;
;
;
var compositionsRef = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createRef();
var CompositionManagerProvider = ({ children, numberOfAudioTags, onlyRenderComposition, currentCompositionMetadata, audioLatencyHint })=>{
    _s62();
    const [compositions, setCompositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const currentcompositionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(compositions);
    const [folders, setFolders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [canvasContent, setCanvasContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const updateCompositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompositionManagerProvider.useCallback14[updateCompositions]": (updateComps)=>{
            setCompositions({
                "CompositionManagerProvider.useCallback14[updateCompositions]": (comps)=>{
                    const updated = updateComps(comps);
                    currentcompositionsRef.current = updated;
                    return updated;
                }
            }["CompositionManagerProvider.useCallback14[updateCompositions]"]);
        }
    }["CompositionManagerProvider.useCallback14[updateCompositions]"], []);
    const registerComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompositionManagerProvider.useCallback14[registerComposition]": (comp)=>{
            updateCompositions({
                "CompositionManagerProvider.useCallback14[registerComposition]": (comps)=>{
                    if (comps.find({
                        "CompositionManagerProvider.useCallback14[registerComposition]": (c2)=>c2.id === comp.id
                    }["CompositionManagerProvider.useCallback14[registerComposition]"])) {
                        throw new Error(`Multiple composition with id ${comp.id} are registered.`);
                    }
                    const value = [
                        ...comps,
                        comp
                    ].slice().sort({
                        "CompositionManagerProvider.useCallback14[registerComposition].value": (a2, b2)=>a2.nonce - b2.nonce
                    }["CompositionManagerProvider.useCallback14[registerComposition].value"]);
                    return value;
                }
            }["CompositionManagerProvider.useCallback14[registerComposition]"]);
        }
    }["CompositionManagerProvider.useCallback14[registerComposition]"], [
        updateCompositions
    ]);
    const unregisterComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompositionManagerProvider.useCallback14[unregisterComposition]": (id)=>{
            setCompositions({
                "CompositionManagerProvider.useCallback14[unregisterComposition]": (comps)=>{
                    return comps.filter({
                        "CompositionManagerProvider.useCallback14[unregisterComposition]": (c2)=>c2.id !== id
                    }["CompositionManagerProvider.useCallback14[unregisterComposition]"]);
                }
            }["CompositionManagerProvider.useCallback14[unregisterComposition]"]);
        }
    }["CompositionManagerProvider.useCallback14[unregisterComposition]"], []);
    const registerFolder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompositionManagerProvider.useCallback14[registerFolder]": (name, parent)=>{
            setFolders({
                "CompositionManagerProvider.useCallback14[registerFolder]": (prevFolders)=>{
                    return [
                        ...prevFolders,
                        {
                            name,
                            parent
                        }
                    ];
                }
            }["CompositionManagerProvider.useCallback14[registerFolder]"]);
        }
    }["CompositionManagerProvider.useCallback14[registerFolder]"], []);
    const unregisterFolder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompositionManagerProvider.useCallback14[unregisterFolder]": (name, parent)=>{
            setFolders({
                "CompositionManagerProvider.useCallback14[unregisterFolder]": (prevFolders)=>{
                    return prevFolders.filter({
                        "CompositionManagerProvider.useCallback14[unregisterFolder]": (p)=>!(p.name === name && p.parent === parent)
                    }["CompositionManagerProvider.useCallback14[unregisterFolder]"]);
                }
            }["CompositionManagerProvider.useCallback14[unregisterFolder]"]);
        }
    }["CompositionManagerProvider.useCallback14[unregisterFolder]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(compositionsRef, {
        "CompositionManagerProvider.useImperativeHandle8": ()=>{
            return {
                getCompositions: ({
                    "CompositionManagerProvider.useImperativeHandle8": ()=>currentcompositionsRef.current
                })["CompositionManagerProvider.useImperativeHandle8"]
            };
        }
    }["CompositionManagerProvider.useImperativeHandle8"], []);
    const composition = compositions.find((c2)=>canvasContent?.type === "composition" ? c2.id === canvasContent.compositionId : null);
    const updateCompositionDefaultProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompositionManagerProvider.useCallback14[updateCompositionDefaultProps]": (id, newDefaultProps)=>{
            setCompositions({
                "CompositionManagerProvider.useCallback14[updateCompositionDefaultProps]": (comps)=>{
                    const updated = comps.map({
                        "CompositionManagerProvider.useCallback14[updateCompositionDefaultProps].updated": (c2)=>{
                            if (c2.id === id) {
                                return {
                                    ...c2,
                                    defaultProps: newDefaultProps
                                };
                            }
                            return c2;
                        }
                    }["CompositionManagerProvider.useCallback14[updateCompositionDefaultProps].updated"]);
                    return updated;
                }
            }["CompositionManagerProvider.useCallback14[updateCompositionDefaultProps]"]);
        }
    }["CompositionManagerProvider.useCallback14[updateCompositionDefaultProps]"], []);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CompositionManagerProvider.useMemo24[contextValue]": ()=>{
            return {
                compositions,
                folders,
                currentCompositionMetadata,
                canvasContent
            };
        }
    }["CompositionManagerProvider.useMemo24[contextValue]"], [
        compositions,
        folders,
        currentCompositionMetadata,
        canvasContent
    ]);
    const setters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CompositionManagerProvider.useMemo24[setters]": ()=>{
            return {
                registerComposition,
                unregisterComposition,
                registerFolder,
                unregisterFolder,
                setCanvasContent,
                updateCompositionDefaultProps,
                onlyRenderComposition
            };
        }
    }["CompositionManagerProvider.useMemo24[setters]"], [
        registerComposition,
        registerFolder,
        unregisterComposition,
        unregisterFolder,
        updateCompositionDefaultProps,
        onlyRenderComposition
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CompositionManager.Provider, {
        value: contextValue,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CompositionSetters.Provider, {
            value: setters,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceManagerProvider, {
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderAssetManagerProvider, {
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ResolveCompositionConfig, {
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SharedAudioContextProvider, {
                            numberOfAudioTags,
                            component: composition?.component ?? null,
                            audioLatencyHint,
                            children
                        })
                    })
                })
            })
        })
    });
};
_s62(CompositionManagerProvider, "GoDCFyimD9cmKSNqAxiMv5M1xI0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c42 = CompositionManagerProvider;
// src/default-css.ts
var exports_default_css = {};
__export(exports_default_css, {
    makeDefaultPreviewCSS: ()=>makeDefaultPreviewCSS,
    injectCSS: ()=>injectCSS,
    OBJECTFIT_CONTAIN_CLASS_NAME: ()=>OBJECTFIT_CONTAIN_CLASS_NAME
});
var injected = {};
var injectCSS = (css)=>{
    if (typeof document === "undefined") {
        return;
    }
    if (injected[css]) {
        return;
    }
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    head.prepend(style);
    injected[css] = true;
};
var OBJECTFIT_CONTAIN_CLASS_NAME = "__remotion_objectfitcontain";
var makeDefaultPreviewCSS = (scope, backgroundColor)=>{
    if (!scope) {
        return `
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
	    background-color: ${backgroundColor};
    }
    .${OBJECTFIT_CONTAIN_CLASS_NAME} {
      object-fit: contain;
    }
    `;
    }
    return `
    ${scope} * {
      box-sizing: border-box;
    }
    ${scope} *:-webkit-full-screen {
      width: 100%;
      height: 100%;
    }
    ${scope} .${OBJECTFIT_CONTAIN_CLASS_NAME} {
      object-fit: contain;
    }
  `;
};
// src/get-preview-dom-element.ts
var REMOTION_STUDIO_CONTAINER_ELEMENT = "__remotion-studio-container";
var getPreviewDomElement = ()=>{
    return document.getElementById(REMOTION_STUDIO_CONTAINER_ELEMENT);
};
// src/register-root.ts
var Root = null;
var listeners = [];
var registerRoot = (comp)=>{
    if (!comp) {
        throw new Error(`You must pass a React component to registerRoot(), but ${JSON.stringify(comp)} was passed.`);
    }
    if (Root) {
        throw new Error("registerRoot() was called more than once.");
    }
    Root = comp;
    listeners.forEach((l)=>{
        l(comp);
    });
};
var getRoot = ()=>{
    return Root;
};
var waitForRoot = (fn)=>{
    if (Root) {
        fn(Root);
        return ()=>{
            return;
        };
    }
    listeners.push(fn);
    return ()=>{
        listeners = listeners.filter((l)=>l !== fn);
    };
};
;
;
;
var MediaEnabledContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
var useVideoEnabled = ()=>{
    _s63();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MediaEnabledContext);
    if (!context) {
        return window.remotion_videoEnabled;
    }
    if (context.videoEnabled === null) {
        return window.remotion_videoEnabled;
    }
    return context.videoEnabled;
};
_s63(useVideoEnabled, "QEI1boguP4CKmctOF2OSEFDpySI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
var useAudioEnabled = ()=>{
    _s64();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MediaEnabledContext);
    if (!context) {
        return window.remotion_audioEnabled;
    }
    if (context.audioEnabled === null) {
        return window.remotion_audioEnabled;
    }
    return context.audioEnabled;
};
_s64(useAudioEnabled, "QEI1boguP4CKmctOF2OSEFDpySI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"]
    ];
});
var MediaEnabledProvider = ({ children, videoEnabled, audioEnabled })=>{
    _s65();
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MediaEnabledProvider.useMemo25[value]": ()=>({
                videoEnabled,
                audioEnabled
            })
    }["MediaEnabledProvider.useMemo25[value]"], [
        videoEnabled,
        audioEnabled
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(MediaEnabledContext.Provider, {
        value,
        children
    });
};
_s65(MediaEnabledProvider, "qt0gyMua/kfrO7TUMMZP/g8CNM8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c43 = MediaEnabledProvider;
;
var RemotionRoot = ({ children, numberOfAudioTags, logLevel, onlyRenderComposition, currentCompositionMetadata, audioLatencyHint, videoEnabled, audioEnabled })=>{
    _s66();
    const [remotionRootId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "RemotionRoot.useState17": ()=>String(random(null))
    }["RemotionRoot.useState17"]);
    const [frame, setFrame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "RemotionRoot.useState17": ()=>getInitialFrameState()
    }["RemotionRoot.useState17"]);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const imperativePlaying = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [fastRefreshes, setFastRefreshes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [manualRefreshes, setManualRefreshes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [playbackRate, setPlaybackRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const audioAndVideoTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    if ("TURBOPACK compile-time truthy", 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "RemotionRoot.useLayoutEffect8": ()=>{
                window.remotion_setFrame = ({
                    "RemotionRoot.useLayoutEffect8": (f, composition, attempt)=>{
                        window.remotion_attempt = attempt;
                        const id = delayRender2(`Setting the current frame to ${f}`);
                        let asyncUpdate = true;
                        setFrame({
                            "RemotionRoot.useLayoutEffect8": (s)=>{
                                const currentFrame = s[composition] ?? window.remotion_initialFrame;
                                if (currentFrame === f) {
                                    asyncUpdate = false;
                                    return s;
                                }
                                return {
                                    ...s,
                                    [composition]: f
                                };
                            }
                        }["RemotionRoot.useLayoutEffect8"]);
                        if (asyncUpdate) {
                            requestAnimationFrame({
                                "RemotionRoot.useLayoutEffect8": ()=>continueRender2(id)
                            }["RemotionRoot.useLayoutEffect8"]);
                        } else {
                            continueRender2(id);
                        }
                    }
                })["RemotionRoot.useLayoutEffect8"];
                window.remotion_isPlayer = false;
            }
        }["RemotionRoot.useLayoutEffect8"], [
            continueRender2,
            delayRender2
        ]);
    }
    const timelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RemotionRoot.useMemo26[timelineContextValue]": ()=>{
            return {
                frame,
                playing,
                imperativePlaying,
                rootId: remotionRootId,
                playbackRate,
                setPlaybackRate,
                audioAndVideoTags
            };
        }
    }["RemotionRoot.useMemo26[timelineContextValue]"], [
        frame,
        playbackRate,
        playing,
        remotionRootId
    ]);
    const setTimelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RemotionRoot.useMemo26[setTimelineContextValue]": ()=>{
            return {
                setFrame,
                setPlaying
            };
        }
    }["RemotionRoot.useMemo26[setTimelineContextValue]"], []);
    const nonceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RemotionRoot.useMemo26[nonceContext]": ()=>{
            let counter = 0;
            return {
                getNonce: ({
                    "RemotionRoot.useMemo26[nonceContext]": ()=>counter++
                })["RemotionRoot.useMemo26[nonceContext]"],
                fastRefreshes,
                manualRefreshes
            };
        }
    }["RemotionRoot.useMemo26[nonceContext]"], [
        fastRefreshes,
        manualRefreshes
    ]);
    const setNonceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RemotionRoot.useMemo26[setNonceContext]": ()=>{
            return {
                increaseManualRefreshes: ({
                    "RemotionRoot.useMemo26[setNonceContext]": ()=>{
                        setManualRefreshes({
                            "RemotionRoot.useMemo26[setNonceContext]": (i)=>i + 1
                        }["RemotionRoot.useMemo26[setNonceContext]"]);
                    }
                })["RemotionRoot.useMemo26[setNonceContext]"]
            };
        }
    }["RemotionRoot.useMemo26[setNonceContext]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RemotionRoot.useEffect18": ()=>{
            if (typeof __webpack_module__ !== "undefined") {
                if (__webpack_module__.hot) {
                    __webpack_module__.hot.addStatusHandler({
                        "RemotionRoot.useEffect18": (status)=>{
                            if (status === "idle") {
                                setFastRefreshes({
                                    "RemotionRoot.useEffect18": (i)=>i + 1
                                }["RemotionRoot.useEffect18"]);
                            }
                        }
                    }["RemotionRoot.useEffect18"]);
                }
            }
        }
    }["RemotionRoot.useEffect18"], []);
    const logging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RemotionRoot.useMemo26[logging]": ()=>{
            return {
                logLevel,
                mountTime: Date.now()
            };
        }
    }["RemotionRoot.useMemo26[logging]"], [
        logLevel
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(LogLevelContext.Provider, {
        value: logging,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(NonceContext.Provider, {
            value: nonceContext,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SetNonceContext.Provider, {
                value: setNonceContext,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(TimelineContext.Provider, {
                    value: timelineContextValue,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SetTimelineContext.Provider, {
                        value: setTimelineContextValue,
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(MediaEnabledProvider, {
                            videoEnabled,
                            audioEnabled,
                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(EditorPropsProvider, {
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PrefetchProvider, {
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CompositionManagerProvider, {
                                        numberOfAudioTags,
                                        onlyRenderComposition,
                                        currentCompositionMetadata,
                                        audioLatencyHint,
                                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(DurationsContextProvider, {
                                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(BufferingProvider, {
                                                children
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    });
};
_s66(RemotionRoot, "LbvcE+chSCjaO2SqDbIqxW+x1zE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c44 = RemotionRoot;
// src/setup-env-variables.ts
var getEnvVariables = ()=>{
    if (getRemotionEnvironment().isRendering) {
        const param = window.remotion_envVariables;
        if (!param) {
            return {};
        }
        return {
            ...JSON.parse(param),
            NODE_ENV: "production"
        };
    }
    if (false) {}
    return {
        NODE_ENV: "production"
    };
};
var setupEnvVariables = ()=>{
    const env = getEnvVariables();
    if (!window.process) {
        window.process = {};
    }
    if (!window.process.env) {
        window.process.env = {};
    }
    Object.keys(env).forEach((key)=>{
        window.process.env[key] = env[key];
    });
};
;
var CurrentScaleContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(null);
var PreviewSizeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    setSize: ()=>{
        return;
    },
    size: {
        size: "auto",
        translation: {
            x: 0,
            y: 0
        }
    }
});
var calculateScale = ({ canvasSize, compositionHeight, compositionWidth, previewSize })=>{
    const heightRatio = canvasSize.height / compositionHeight;
    const widthRatio = canvasSize.width / compositionWidth;
    const ratio = Math.min(heightRatio, widthRatio);
    if (previewSize === "auto") {
        if (ratio === 0) {
            return 1;
        }
        return ratio;
    }
    return Number(previewSize);
};
var useCurrentScale = (options)=>{
    _s67();
    const hasContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(CurrentScaleContext);
    const zoomContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(PreviewSizeContext);
    const config = useUnsafeVideoConfig();
    const env = useRemotionEnvironment();
    if (hasContext === null || config === null || zoomContext === null) {
        if (options?.dontThrowIfOutsideOfRemotion) {
            return 1;
        }
        if (env.isRendering) {
            return 1;
        }
        throw new Error([
            "useCurrentScale() was called outside of a Remotion context.",
            "This hook can only be called in a component that is being rendered by Remotion.",
            "If you want to this hook to return 1 outside of Remotion, pass {dontThrowIfOutsideOfRemotion: true} as an option.",
            "If you think you called this hook in a Remotion component, make sure all versions of Remotion are aligned."
        ].join(`
`));
    }
    if (hasContext.type === "scale") {
        return hasContext.scale;
    }
    return calculateScale({
        canvasSize: hasContext.canvasSize,
        compositionHeight: config.height,
        compositionWidth: config.width,
        previewSize: zoomContext.size.size
    });
};
_s67(useCurrentScale, "TFoMaDM4rInQoMB6Oq7SbuuTD34=", false, function() {
    return [
        useUnsafeVideoConfig,
        useRemotionEnvironment
    ];
});
;
;
// src/video/offthread-video-source.ts
var getOffthreadVideoSource = ({ src, transparent, currentTime, toneMapped })=>{
    return `http://localhost:${window.remotion_proxyPort}/proxy?src=${encodeURIComponent(getAbsoluteSrc(src))}&time=${encodeURIComponent(Math.max(0, currentTime))}&transparent=${String(transparent)}&toneMapped=${String(toneMapped)}`;
};
;
var OffthreadVideoForRendering = ({ onError, volume: volumeProp, playbackRate, src, muted, allowAmplificationDuringRender, transparent, toneMapped, toneFrequency, name, loopVolumeCurveBehavior, delayRenderRetries, delayRenderTimeoutInMilliseconds, onVideoFrame, crossOrigin, audioStreamIndex, ...props2 })=>{
    _s68();
    const absoluteFrame = useTimelinePosition();
    const frame = useCurrentFrame();
    const volumePropsFrame = useFrameForVolumeProp(loopVolumeCurveBehavior);
    const videoConfig = useUnsafeVideoConfig();
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const mediaStartsAt = useMediaStartsAt();
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    if (!src) {
        throw new TypeError("No `src` was passed to <OffthreadVideo>.");
    }
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffthreadVideoForRendering.useMemo27[id]": ()=>`offthreadvideo-${random(src)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`
    }["OffthreadVideoForRendering.useMemo27[id]"], [
        src,
        sequenceContext?.cumulatedFrom,
        sequenceContext?.relativeFrom,
        sequenceContext?.durationInFrames
    ]);
    if (!videoConfig) {
        throw new Error("No video config found");
    }
    const volume = evaluateVolume({
        volume: volumeProp,
        frame: volumePropsFrame,
        mediaVolume: 1
    });
    warnAboutTooHighVolume(volume);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OffthreadVideoForRendering.useEffect19": ()=>{
            if (!src) {
                throw new Error("No src passed");
            }
            if (!window.remotion_audioEnabled) {
                return;
            }
            if (muted) {
                return;
            }
            if (volume <= 0) {
                return;
            }
            registerRenderAsset({
                type: "video",
                src: getAbsoluteSrc(src),
                id,
                frame: absoluteFrame,
                volume,
                mediaFrame: frame,
                playbackRate,
                toneFrequency,
                audioStartFrame: Math.max(0, -(sequenceContext?.relativeFrom ?? 0)),
                audioStreamIndex
            });
            return ({
                "OffthreadVideoForRendering.useEffect19": ()=>unregisterRenderAsset(id)
            })["OffthreadVideoForRendering.useEffect19"];
        }
    }["OffthreadVideoForRendering.useEffect19"], [
        muted,
        src,
        registerRenderAsset,
        id,
        unregisterRenderAsset,
        volume,
        frame,
        absoluteFrame,
        playbackRate,
        toneFrequency,
        sequenceContext?.relativeFrom,
        audioStreamIndex
    ]);
    const currentTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffthreadVideoForRendering.useMemo27[currentTime]": ()=>{
            return getExpectedMediaFrameUncorrected({
                frame,
                playbackRate: playbackRate || 1,
                startFrom: -mediaStartsAt
            }) / videoConfig.fps;
        }
    }["OffthreadVideoForRendering.useMemo27[currentTime]"], [
        frame,
        mediaStartsAt,
        playbackRate,
        videoConfig.fps
    ]);
    const actualSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffthreadVideoForRendering.useMemo27[actualSrc]": ()=>{
            return getOffthreadVideoSource({
                src,
                currentTime,
                transparent,
                toneMapped
            });
        }
    }["OffthreadVideoForRendering.useMemo27[actualSrc]"], [
        toneMapped,
        currentTime,
        src,
        transparent
    ]);
    const [imageSrc, setImageSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "OffthreadVideoForRendering.useLayoutEffect9": ()=>{
            if (!window.remotion_videoEnabled) {
                return;
            }
            const cleanup = [];
            setImageSrc(null);
            const controller = new AbortController;
            const newHandle = delayRender2(`Fetching ${actualSrc} from server`, {
                retries: delayRenderRetries ?? undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
            });
            const execute = {
                "OffthreadVideoForRendering.useLayoutEffect9.execute": async ()=>{
                    try {
                        const res = await fetch(actualSrc, {
                            signal: controller.signal,
                            cache: "no-store"
                        });
                        if (res.status !== 200) {
                            if (res.status === 500) {
                                const json = await res.json();
                                if (json.error) {
                                    const cleanedUpErrorMessage = json.error.replace(/^Error: /, "");
                                    throw new Error(cleanedUpErrorMessage);
                                }
                            }
                            throw new Error(`Server returned status ${res.status} while fetching ${actualSrc}`);
                        }
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        cleanup.push({
                            "OffthreadVideoForRendering.useLayoutEffect9.execute": ()=>URL.revokeObjectURL(url)
                        }["OffthreadVideoForRendering.useLayoutEffect9.execute"]);
                        setImageSrc({
                            src: url,
                            handle: newHandle
                        });
                    } catch (err) {
                        if (err.message.includes("aborted")) {
                            continueRender2(newHandle);
                            return;
                        }
                        if (controller.signal.aborted) {
                            continueRender2(newHandle);
                            return;
                        }
                        if (err.message.includes("Failed to fetch")) {
                            err = new Error(`Failed to fetch ${actualSrc}. This could be caused by Chrome rejecting the request because the disk space is low. Consider increasing the disk size of your environment.`, {
                                cause: err
                            });
                        }
                        if (onError) {
                            onError(err);
                        } else {
                            cancelRender(err);
                        }
                    }
                }
            }["OffthreadVideoForRendering.useLayoutEffect9.execute"];
            execute();
            cleanup.push({
                "OffthreadVideoForRendering.useLayoutEffect9": ()=>{
                    if (controller.signal.aborted) {
                        return;
                    }
                    controller.abort();
                }
            }["OffthreadVideoForRendering.useLayoutEffect9"]);
            return ({
                "OffthreadVideoForRendering.useLayoutEffect9": ()=>{
                    cleanup.forEach({
                        "OffthreadVideoForRendering.useLayoutEffect9": (c2)=>c2()
                    }["OffthreadVideoForRendering.useLayoutEffect9"]);
                }
            })["OffthreadVideoForRendering.useLayoutEffect9"];
        }
    }["OffthreadVideoForRendering.useLayoutEffect9"], [
        actualSrc,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        onError,
        continueRender2,
        delayRender2
    ]);
    const onErr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "OffthreadVideoForRendering.useCallback15[onErr]": ()=>{
            if (onError) {
                onError?.(new Error("Failed to load image with src " + imageSrc));
            } else {
                cancelRender("Failed to load image with src " + imageSrc);
            }
        }
    }["OffthreadVideoForRendering.useCallback15[onErr]"], [
        imageSrc,
        onError
    ]);
    const className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffthreadVideoForRendering.useMemo27[className]": ()=>{
            return [
                OBJECTFIT_CONTAIN_CLASS_NAME,
                props2.className
            ].filter(truthy).join(" ");
        }
    }["OffthreadVideoForRendering.useMemo27[className]"], [
        props2.className
    ]);
    const onImageFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "OffthreadVideoForRendering.useCallback15[onImageFrame]": (img)=>{
            if (onVideoFrame) {
                onVideoFrame(img);
            }
        }
    }["OffthreadVideoForRendering.useCallback15[onImageFrame]"], [
        onVideoFrame
    ]);
    if (!imageSrc || !window.remotion_videoEnabled) {
        return null;
    }
    continueRender2(imageSrc.handle);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Img, {
        src: imageSrc.src,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        onImageFrame,
        ...props2,
        onError: onErr,
        className
    });
};
_s68(OffthreadVideoForRendering, "q5CZydtxqoj0x84fX1nJewHWy+g=", false, function() {
    return [
        useTimelinePosition,
        useCurrentFrame,
        useFrameForVolumeProp,
        useUnsafeVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useMediaStartsAt,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c45 = OffthreadVideoForRendering;
;
;
var useEmitVideoFrame = ({ ref, onVideoFrame })=>{
    _s69();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEmitVideoFrame.useEffect20": ()=>{
            const { current } = ref;
            if (!current) {
                return;
            }
            if (!onVideoFrame) {
                return;
            }
            let handle = 0;
            const callback = {
                "useEmitVideoFrame.useEffect20.callback": ()=>{
                    if (!ref.current) {
                        return;
                    }
                    onVideoFrame(ref.current);
                    handle = ref.current.requestVideoFrameCallback(callback);
                }
            }["useEmitVideoFrame.useEffect20.callback"];
            callback();
            return ({
                "useEmitVideoFrame.useEffect20": ()=>{
                    current.cancelVideoFrameCallback(handle);
                }
            })["useEmitVideoFrame.useEffect20"];
        }
    }["useEmitVideoFrame.useEffect20"], [
        onVideoFrame,
        ref
    ]);
};
_s69(useEmitVideoFrame, "9Yd4XTLQCuB51PjFhPyzcVPurcI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
var VideoForDevelopmentRefForwardingFunction = (props2, ref)=>{
    _s70();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    if (!context) {
        throw new Error("SharedAudioContext not found");
    }
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sharedSource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VideoForDevelopmentRefForwardingFunction.useMemo28[sharedSource]": ()=>{
            if (!context.audioContext) {
                return null;
            }
            return makeSharedElementSourceNode({
                audioContext: context.audioContext,
                ref: videoRef
            });
        }
    }["VideoForDevelopmentRefForwardingFunction.useMemo28[sharedSource]"], [
        context.audioContext
    ]);
    const { volume, muted, playbackRate, onlyWarnForMediaSeekingError, src, onDuration, acceptableTimeShift, acceptableTimeShiftInSeconds, toneFrequency, name, _remotionInternalNativeLoopPassed, _remotionInternalStack, style, pauseWhenBuffering, showInTimeline, loopVolumeCurveBehavior, onError, onAutoPlayError, onVideoFrame, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, allowAmplificationDuringRender, useWebAudioApi, audioStreamIndex, ...nativeProps } = props2;
    const _propsValid = true;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const { fps, durationInFrames } = useVideoConfig();
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const { hidden } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceVisibilityToggleContext);
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    const [timelineId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "VideoForDevelopmentRefForwardingFunction.useState19": ()=>String(Math.random())
    }["VideoForDevelopmentRefForwardingFunction.useState19"]);
    const isSequenceHidden = hidden[timelineId] ?? false;
    if (typeof acceptableTimeShift !== "undefined") {
        throw new Error("acceptableTimeShift has been removed. Use acceptableTimeShiftInSeconds instead.");
    }
    const [mediaVolume] = useMediaVolumeState();
    const [mediaMuted] = useMediaMutedState();
    const userPreferredVolume = evaluateVolume({
        frame: volumePropFrame,
        volume,
        mediaVolume
    });
    warnAboutTooHighVolume(userPreferredVolume);
    useMediaInTimeline({
        volume,
        mediaVolume,
        mediaType: "video",
        src,
        playbackRate: props2.playbackRate ?? 1,
        displayName: name ?? null,
        id: timelineId,
        stack: _remotionInternalStack,
        showInTimeline,
        premountDisplay: parentSequence?.premountDisplay ?? null,
        postmountDisplay: parentSequence?.postmountDisplay ?? null,
        loopDisplay: undefined
    });
    useMediaPlayback({
        mediaRef: videoRef,
        src,
        mediaType: "video",
        playbackRate: props2.playbackRate ?? 1,
        onlyWarnForMediaSeekingError,
        acceptableTimeshift: acceptableTimeShiftInSeconds ?? null,
        isPremounting: Boolean(parentSequence?.premounting),
        isPostmounting: Boolean(parentSequence?.postmounting),
        pauseWhenBuffering,
        onAutoPlayError: onAutoPlayError ?? null
    });
    useMediaTag({
        id: timelineId,
        isPostmounting: Boolean(parentSequence?.postmounting),
        isPremounting: Boolean(parentSequence?.premounting),
        mediaRef: videoRef,
        mediaType: "video",
        onAutoPlayError: onAutoPlayError ?? null
    });
    useVolume({
        logLevel,
        mediaRef: videoRef,
        volume: userPreferredVolume,
        source: sharedSource,
        shouldUseWebAudioApi: useWebAudioApi ?? false
    });
    const actualFrom = parentSequence ? parentSequence.relativeFrom : 0;
    const duration = parentSequence ? Math.min(parentSequence.durationInFrames, durationInFrames) : durationInFrames;
    const preloadedSrc = usePreload(src);
    const actualSrc = useAppendVideoFragment({
        actualSrc: preloadedSrc,
        actualFrom,
        duration,
        fps
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "VideoForDevelopmentRefForwardingFunction.useImperativeHandle9": ()=>{
            return videoRef.current;
        }
    }["VideoForDevelopmentRefForwardingFunction.useImperativeHandle9"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "VideoForDevelopmentRefForwardingFunction.useState19": ()=>playbackLogging({
                logLevel,
                message: `Mounting video with source = ${actualSrc}, v=${VERSION}, user agent=${typeof navigator === "undefined" ? "server" : navigator.userAgent}`,
                tag: "video",
                mountTime
            })
    }["VideoForDevelopmentRefForwardingFunction.useState19"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoForDevelopmentRefForwardingFunction.useEffect21": ()=>{
            const { current } = videoRef;
            if (!current) {
                return;
            }
            const errorHandler = {
                "VideoForDevelopmentRefForwardingFunction.useEffect21.errorHandler": ()=>{
                    if (current.error) {
                        console.error("Error occurred in video", current?.error);
                        if (onError) {
                            const err = new Error(`Code ${current.error.code}: ${current.error.message}`);
                            onError(err);
                            return;
                        }
                        throw new Error(`The browser threw an error while playing the video ${src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`);
                    } else {
                        if (onError) {
                            const err = new Error(`The browser threw an error while playing the video ${src}`);
                            onError(err);
                            return;
                        }
                        throw new Error("The browser threw an error while playing the video");
                    }
                }
            }["VideoForDevelopmentRefForwardingFunction.useEffect21.errorHandler"];
            current.addEventListener("error", errorHandler, {
                once: true
            });
            return ({
                "VideoForDevelopmentRefForwardingFunction.useEffect21": ()=>{
                    current.removeEventListener("error", errorHandler);
                }
            })["VideoForDevelopmentRefForwardingFunction.useEffect21"];
        }
    }["VideoForDevelopmentRefForwardingFunction.useEffect21"], [
        onError,
        src
    ]);
    const currentOnDurationCallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onDuration);
    currentOnDurationCallback.current = onDuration;
    useEmitVideoFrame({
        ref: videoRef,
        onVideoFrame
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoForDevelopmentRefForwardingFunction.useEffect21": ()=>{
            const { current } = videoRef;
            if (!current) {
                return;
            }
            if (current.duration) {
                currentOnDurationCallback.current?.(src, current.duration);
                return;
            }
            const onLoadedMetadata = {
                "VideoForDevelopmentRefForwardingFunction.useEffect21.onLoadedMetadata": ()=>{
                    currentOnDurationCallback.current?.(src, current.duration);
                }
            }["VideoForDevelopmentRefForwardingFunction.useEffect21.onLoadedMetadata"];
            current.addEventListener("loadedmetadata", onLoadedMetadata);
            return ({
                "VideoForDevelopmentRefForwardingFunction.useEffect21": ()=>{
                    current.removeEventListener("loadedmetadata", onLoadedMetadata);
                }
            })["VideoForDevelopmentRefForwardingFunction.useEffect21"];
        }
    }["VideoForDevelopmentRefForwardingFunction.useEffect21"], [
        src
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoForDevelopmentRefForwardingFunction.useEffect21": ()=>{
            const { current } = videoRef;
            if (!current) {
                return;
            }
            if (isIosSafari()) {
                current.preload = "metadata";
            } else {
                current.preload = "auto";
            }
        }
    }["VideoForDevelopmentRefForwardingFunction.useEffect21"], []);
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VideoForDevelopmentRefForwardingFunction.useMemo28[actualStyle]": ()=>{
            return {
                ...style,
                opacity: isSequenceHidden ? 0 : style?.opacity ?? 1
            };
        }
    }["VideoForDevelopmentRefForwardingFunction.useMemo28[actualStyle]"], [
        isSequenceHidden,
        style
    ]);
    const crossOriginValue = getCrossOriginValue({
        crossOrigin,
        requestsVideoFrame: Boolean(onVideoFrame)
    });
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("video", {
        ref: videoRef,
        muted: muted || mediaMuted || isSequenceHidden || userPreferredVolume <= 0,
        playsInline: true,
        src: actualSrc,
        loop: _remotionInternalNativeLoopPassed,
        style: actualStyle,
        disableRemotePlayback: true,
        crossOrigin: crossOriginValue,
        ...nativeProps
    });
};
_s70(VideoForDevelopmentRefForwardingFunction, "S8S3Q0GfFRC+yeE6Ogss58rygrE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        useFrameForVolumeProp,
        useVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useLogLevel,
        useMountTime,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useMediaVolumeState,
        useMediaMutedState,
        useMediaInTimeline,
        useMediaPlayback,
        useMediaTag,
        useVolume,
        usePreload,
        useAppendVideoFragment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useEmitVideoFrame,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c46 = VideoForDevelopmentRefForwardingFunction;
var VideoForPreview = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(VideoForDevelopmentRefForwardingFunction);
_c47 = VideoForPreview;
;
var InnerOffthreadVideo = (props2)=>{
    _s71();
    const { startFrom, endAt, trimBefore, trimAfter, name, pauseWhenBuffering, stack, showInTimeline, ...otherProps } = props2;
    const environment = useRemotionEnvironment();
    const onDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InnerOffthreadVideo.useCallback16[onDuration]": ()=>{
            return;
        }
    }["InnerOffthreadVideo.useCallback16[onDuration]"], []);
    if (typeof props2.src !== "string") {
        throw new TypeError(`The \`<OffthreadVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(props2.src)} instead.`);
    }
    validateMediaTrimProps({
        startFrom,
        endAt,
        trimBefore,
        trimAfter
    });
    const { trimBeforeValue, trimAfterValue } = resolveTrimProps({
        startFrom,
        endAt,
        trimBefore,
        trimAfter
    });
    if (typeof trimBeforeValue !== "undefined" || typeof trimAfterValue !== "undefined") {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            layout: "none",
            from: 0 - (trimBeforeValue ?? 0),
            showInTimeline: false,
            durationInFrames: trimAfterValue,
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(InnerOffthreadVideo, {
                pauseWhenBuffering: pauseWhenBuffering ?? false,
                ...otherProps,
                trimAfter: undefined,
                name: undefined,
                showInTimeline,
                trimBefore: undefined,
                stack: undefined,
                startFrom: undefined,
                endAt: undefined
            })
        });
    }
    validateMediaProps(props2, "Video");
    if (environment.isRendering) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(OffthreadVideoForRendering, {
            pauseWhenBuffering: pauseWhenBuffering ?? false,
            ...otherProps,
            trimAfter: undefined,
            name: undefined,
            showInTimeline,
            trimBefore: undefined,
            stack: undefined,
            startFrom: undefined,
            endAt: undefined
        });
    }
    const { transparent, toneMapped, onAutoPlayError, onVideoFrame, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, ...propsForPreview } = otherProps;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VideoForPreview, {
        _remotionInternalStack: stack ?? null,
        onDuration,
        onlyWarnForMediaSeekingError: true,
        pauseWhenBuffering: pauseWhenBuffering ?? false,
        showInTimeline: showInTimeline ?? true,
        onAutoPlayError: onAutoPlayError ?? undefined,
        onVideoFrame: onVideoFrame ?? null,
        crossOrigin,
        ...propsForPreview,
        _remotionInternalNativeLoopPassed: false
    });
};
_s71(InnerOffthreadVideo, "msKQaxLnCnvaEAliBWZdRr5fFJw=", false, function() {
    return [
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c48 = InnerOffthreadVideo;
var OffthreadVideo = ({ src, acceptableTimeShiftInSeconds, allowAmplificationDuringRender, audioStreamIndex, className, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, id, loopVolumeCurveBehavior, muted, name, onAutoPlayError, onError, onVideoFrame, pauseWhenBuffering, playbackRate, showInTimeline, style, toneFrequency, toneMapped, transparent, trimAfter, trimBefore, useWebAudioApi, volume, _remotionInternalNativeLoopPassed, endAt, stack, startFrom, imageFormat })=>{
    if (imageFormat) {
        throw new TypeError(`The \`<OffthreadVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`);
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(InnerOffthreadVideo, {
        acceptableTimeShiftInSeconds,
        allowAmplificationDuringRender: allowAmplificationDuringRender ?? true,
        audioStreamIndex: audioStreamIndex ?? 0,
        className,
        crossOrigin,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        id,
        loopVolumeCurveBehavior: loopVolumeCurveBehavior ?? "repeat",
        muted: muted ?? false,
        name,
        onAutoPlayError: onAutoPlayError ?? null,
        onError,
        onVideoFrame,
        pauseWhenBuffering: pauseWhenBuffering ?? true,
        playbackRate: playbackRate ?? 1,
        toneFrequency: toneFrequency ?? 1,
        showInTimeline: showInTimeline ?? true,
        src,
        stack,
        startFrom,
        _remotionInternalNativeLoopPassed: _remotionInternalNativeLoopPassed ?? false,
        endAt,
        style,
        toneMapped: toneMapped ?? true,
        transparent: transparent ?? false,
        trimAfter,
        trimBefore,
        useWebAudioApi: useWebAudioApi ?? false,
        volume
    });
};
_c49 = OffthreadVideo;
addSequenceStackTraces(OffthreadVideo);
// src/watch-static-file.ts
var WATCH_REMOTION_STATIC_FILES = "remotion_staticFilesChanged";
var watchStaticFile = (fileName, callback)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!getRemotionEnvironment().isStudio) {
        console.warn("The watchStaticFile() API is only available while using the Remotion Studio.");
        return {
            cancel: ()=>{
                return;
            }
        };
    }
    const withoutStaticBase = fileName.startsWith(window.remotion_staticBase) ? fileName.replace(window.remotion_staticBase, "") : fileName;
    const withoutLeadingSlash = withoutStaticBase.startsWith("/") ? withoutStaticBase.slice(1) : withoutStaticBase;
    let prevFileData = window.remotion_staticFiles.find((file)=>file.name === withoutLeadingSlash);
    const checkFile = (event)=>{
        const staticFiles = event.detail.files;
        const newFileData = staticFiles.find((file)=>file.name === withoutLeadingSlash);
        if (!newFileData) {
            if (prevFileData !== undefined) {
                callback(null);
            }
            prevFileData = undefined;
            return;
        }
        if (prevFileData === undefined || prevFileData.lastModified !== newFileData.lastModified) {
            callback(newFileData);
            prevFileData = newFileData;
        }
    };
    window.addEventListener(WATCH_REMOTION_STATIC_FILES, checkFile);
    const cancel = ()=>{
        return window.removeEventListener(WATCH_REMOTION_STATIC_FILES, checkFile);
    };
    return {
        cancel
    };
};
;
;
function useRemotionContexts() {
    _s72();
    const compositionManagerCtx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(CompositionManager);
    const timelineContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(TimelineContext);
    const setTimelineContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(SetTimelineContext);
    const sequenceContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(SequenceContext);
    const nonceContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(NonceContext);
    const canUseRemotionHooksContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(CanUseRemotionHooks);
    const preloadContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(PreloadContext);
    const resolveCompositionContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(ResolveCompositionContext);
    const renderAssetManagerContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(RenderAssetManager);
    const sequenceManagerContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(SequenceManager);
    const bufferManagerContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(BufferingContextReact);
    const logLevelContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(LogLevelContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useRemotionContexts.useMemo29": ()=>({
                compositionManagerCtx,
                timelineContext,
                setTimelineContext,
                sequenceContext,
                nonceContext,
                canUseRemotionHooksContext,
                preloadContext,
                resolveCompositionContext,
                renderAssetManagerContext,
                sequenceManagerContext,
                bufferManagerContext,
                logLevelContext
            })
    }["useRemotionContexts.useMemo29"], [
        compositionManagerCtx,
        nonceContext,
        sequenceContext,
        setTimelineContext,
        timelineContext,
        canUseRemotionHooksContext,
        preloadContext,
        resolveCompositionContext,
        renderAssetManagerContext,
        sequenceManagerContext,
        bufferManagerContext,
        logLevelContext
    ]);
}
_s72(useRemotionContexts, "EQgnAbjWDOC59yXpGSTZjHoR9go=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
var RemotionContextProvider = (props2)=>{
    const { children, contexts } = props2;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(LogLevelContext.Provider, {
        value: contexts.logLevelContext,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooks.Provider, {
            value: contexts.canUseRemotionHooksContext,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(NonceContext.Provider, {
                value: contexts.nonceContext,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PreloadContext.Provider, {
                    value: contexts.preloadContext,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(CompositionManager.Provider, {
                        value: contexts.compositionManagerCtx,
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceManager.Provider, {
                            value: contexts.sequenceManagerContext,
                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderAssetManager.Provider, {
                                value: contexts.renderAssetManagerContext,
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ResolveCompositionContext.Provider, {
                                    value: contexts.resolveCompositionContext,
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(TimelineContext.Provider, {
                                        value: contexts.timelineContext,
                                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SetTimelineContext.Provider, {
                                            value: contexts.setTimelineContext,
                                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SequenceContext.Provider, {
                                                value: contexts.sequenceContext,
                                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(BufferingContextReact.Provider, {
                                                    value: contexts.bufferManagerContext,
                                                    children
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    });
};
_c50 = RemotionContextProvider;
// src/internals.ts
var compositionSelectorRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createRef"])();
var Internals = {
    useUnsafeVideoConfig,
    useFrameForVolumeProp,
    useTimelinePosition,
    evaluateVolume,
    getAbsoluteSrc,
    Timeline: exports_timeline_position_state,
    validateMediaTrimProps,
    validateMediaProps,
    resolveTrimProps,
    VideoForPreview,
    CompositionManager,
    CompositionSetters,
    SequenceManager,
    SequenceVisibilityToggleContext,
    RemotionRoot,
    useVideo,
    getRoot,
    useMediaVolumeState,
    useMediaMutedState,
    useMediaInTimeline,
    useLazyComponent,
    truthy,
    SequenceContext,
    useRemotionContexts,
    RemotionContextProvider,
    CSSUtils: exports_default_css,
    setupEnvVariables,
    MediaVolumeContext,
    SetMediaVolumeContext,
    getRemotionEnvironment,
    SharedAudioContext,
    SharedAudioContextProvider,
    invalidCompositionErrorMessage,
    calculateMediaDuration,
    isCompositionIdValid,
    getPreviewDomElement,
    compositionsRef,
    portalNode,
    waitForRoot,
    CanUseRemotionHooksProvider,
    CanUseRemotionHooks,
    PrefetchProvider,
    DurationsContextProvider,
    IsPlayerContextProvider,
    useIsPlayer,
    EditorPropsProvider,
    EditorPropsContext,
    usePreload,
    NonceContext,
    SetNonceContext,
    resolveVideoConfig,
    useResolvedVideoConfig,
    resolveCompositionsRef,
    ResolveCompositionConfig,
    REMOTION_STUDIO_CONTAINER_ELEMENT,
    RenderAssetManager,
    persistCurrentFrame,
    useTimelineSetFrame,
    isIosSafari,
    WATCH_REMOTION_STATIC_FILES,
    addSequenceStackTraces,
    useMediaStartsAt,
    BufferingProvider,
    BufferingContextReact,
    enableSequenceStackTraces,
    CurrentScaleContext,
    PreviewSizeContext,
    calculateScale,
    editorPropsProviderRef,
    PROPS_UPDATED_EXTERNALLY,
    validateRenderAsset,
    Log,
    LogLevelContext,
    useLogLevel,
    playbackLogging,
    timeValueRef,
    compositionSelectorRef,
    RemotionEnvironmentContext,
    warnAboutTooHighVolume,
    AudioForPreview,
    OBJECTFIT_CONTAIN_CLASS_NAME,
    InnerOffthreadVideo,
    useBasicMediaInTimeline,
    getInputPropsOverride,
    setInputPropsOverride,
    useVideoEnabled,
    useAudioEnabled,
    useIsPlayerBuffering
};
// src/interpolate-colors.ts
var NUMBER = "[-+]?\\d*\\.?\\d+";
var PERCENTAGE = NUMBER + "%";
function call(...args) {
    return "\\(\\s*(" + args.join(")\\s*,\\s*(") + ")\\s*\\)";
}
function getMatchers() {
    const cachedMatchers = {
        rgb: undefined,
        rgba: undefined,
        hsl: undefined,
        hsla: undefined,
        hex3: undefined,
        hex4: undefined,
        hex5: undefined,
        hex6: undefined,
        hex8: undefined
    };
    if (cachedMatchers.rgb === undefined) {
        cachedMatchers.rgb = new RegExp("rgb" + call(NUMBER, NUMBER, NUMBER));
        cachedMatchers.rgba = new RegExp("rgba" + call(NUMBER, NUMBER, NUMBER, NUMBER));
        cachedMatchers.hsl = new RegExp("hsl" + call(NUMBER, PERCENTAGE, PERCENTAGE));
        cachedMatchers.hsla = new RegExp("hsla" + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER));
        cachedMatchers.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
        cachedMatchers.hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
        cachedMatchers.hex6 = /^#([0-9a-fA-F]{6})$/;
        cachedMatchers.hex8 = /^#([0-9a-fA-F]{8})$/;
    }
    return cachedMatchers;
}
function hue2rgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}
function hslToRgb(h, s, l) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b2 = hue2rgb(p, q, h - 1 / 3);
    return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b2 * 255) << 8;
}
function parse255(str) {
    const int = Number.parseInt(str, 10);
    if (int < 0) {
        return 0;
    }
    if (int > 255) {
        return 255;
    }
    return int;
}
function parse360(str) {
    const int = Number.parseFloat(str);
    return (int % 360 + 360) % 360 / 360;
}
function parse1(str) {
    const num = Number.parseFloat(str);
    if (num < 0) {
        return 0;
    }
    if (num > 1) {
        return 255;
    }
    return Math.round(num * 255);
}
function parsePercentage(str) {
    const int = Number.parseFloat(str);
    if (int < 0) {
        return 0;
    }
    if (int > 100) {
        return 1;
    }
    return int / 100;
}
var colorNames = {
    transparent: 0,
    aliceblue: 4042850303,
    antiquewhite: 4209760255,
    aqua: 16777215,
    aquamarine: 2147472639,
    azure: 4043309055,
    beige: 4126530815,
    bisque: 4293182719,
    black: 255,
    blanchedalmond: 4293643775,
    blue: 65535,
    blueviolet: 2318131967,
    brown: 2771004159,
    burlywood: 3736635391,
    burntsienna: 3934150143,
    cadetblue: 1604231423,
    chartreuse: 2147418367,
    chocolate: 3530104575,
    coral: 4286533887,
    cornflowerblue: 1687547391,
    cornsilk: 4294499583,
    crimson: 3692313855,
    cyan: 16777215,
    darkblue: 35839,
    darkcyan: 9145343,
    darkgoldenrod: 3095792639,
    darkgray: 2846468607,
    darkgreen: 6553855,
    darkgrey: 2846468607,
    darkkhaki: 3182914559,
    darkmagenta: 2332068863,
    darkolivegreen: 1433087999,
    darkorange: 4287365375,
    darkorchid: 2570243327,
    darkred: 2332033279,
    darksalmon: 3918953215,
    darkseagreen: 2411499519,
    darkslateblue: 1211993087,
    darkslategray: 793726975,
    darkslategrey: 793726975,
    darkturquoise: 13554175,
    darkviolet: 2483082239,
    deeppink: 4279538687,
    deepskyblue: 12582911,
    dimgray: 1768516095,
    dimgrey: 1768516095,
    dodgerblue: 512819199,
    firebrick: 2988581631,
    floralwhite: 4294635775,
    forestgreen: 579543807,
    fuchsia: 4278255615,
    gainsboro: 3705462015,
    ghostwhite: 4177068031,
    gold: 4292280575,
    goldenrod: 3668254975,
    gray: 2155905279,
    green: 8388863,
    greenyellow: 2919182335,
    grey: 2155905279,
    honeydew: 4043305215,
    hotpink: 4285117695,
    indianred: 3445382399,
    indigo: 1258324735,
    ivory: 4294963455,
    khaki: 4041641215,
    lavender: 3873897215,
    lavenderblush: 4293981695,
    lawngreen: 2096890111,
    lemonchiffon: 4294626815,
    lightblue: 2916673279,
    lightcoral: 4034953471,
    lightcyan: 3774873599,
    lightgoldenrodyellow: 4210742015,
    lightgray: 3553874943,
    lightgreen: 2431553791,
    lightgrey: 3553874943,
    lightpink: 4290167295,
    lightsalmon: 4288707327,
    lightseagreen: 548580095,
    lightskyblue: 2278488831,
    lightslategray: 2005441023,
    lightslategrey: 2005441023,
    lightsteelblue: 2965692159,
    lightyellow: 4294959359,
    lime: 16711935,
    limegreen: 852308735,
    linen: 4210091775,
    magenta: 4278255615,
    maroon: 2147483903,
    mediumaquamarine: 1724754687,
    mediumblue: 52735,
    mediumorchid: 3126187007,
    mediumpurple: 2473647103,
    mediumseagreen: 1018393087,
    mediumslateblue: 2070474495,
    mediumspringgreen: 16423679,
    mediumturquoise: 1221709055,
    mediumvioletred: 3340076543,
    midnightblue: 421097727,
    mintcream: 4127193855,
    mistyrose: 4293190143,
    moccasin: 4293178879,
    navajowhite: 4292783615,
    navy: 33023,
    oldlace: 4260751103,
    olive: 2155872511,
    olivedrab: 1804477439,
    orange: 4289003775,
    orangered: 4282712319,
    orchid: 3664828159,
    palegoldenrod: 4008225535,
    palegreen: 2566625535,
    paleturquoise: 2951671551,
    palevioletred: 3681588223,
    papayawhip: 4293907967,
    peachpuff: 4292524543,
    peru: 3448061951,
    pink: 4290825215,
    plum: 3718307327,
    powderblue: 2967529215,
    purple: 2147516671,
    rebeccapurple: 1714657791,
    red: 4278190335,
    rosybrown: 3163525119,
    royalblue: 1097458175,
    saddlebrown: 2336560127,
    salmon: 4202722047,
    sandybrown: 4104413439,
    seagreen: 780883967,
    seashell: 4294307583,
    sienna: 2689740287,
    silver: 3233857791,
    skyblue: 2278484991,
    slateblue: 1784335871,
    slategray: 1887473919,
    slategrey: 1887473919,
    snow: 4294638335,
    springgreen: 16744447,
    steelblue: 1182971135,
    tan: 3535047935,
    teal: 8421631,
    thistle: 3636451583,
    tomato: 4284696575,
    turquoise: 1088475391,
    violet: 4001558271,
    wheat: 4125012991,
    white: 4294967295,
    whitesmoke: 4126537215,
    yellow: 4294902015,
    yellowgreen: 2597139199
};
function normalizeColor(color) {
    const matchers = getMatchers();
    let match;
    if (matchers.hex6) {
        if (match = matchers.hex6.exec(color)) {
            return Number.parseInt(match[1] + "ff", 16) >>> 0;
        }
    }
    if (colorNames[color] !== undefined) {
        return colorNames[color];
    }
    if (matchers.rgb) {
        if (match = matchers.rgb.exec(color)) {
            return (parse255(match[1]) << 24 | parse255(match[2]) << 16 | parse255(match[3]) << 8 | 255) >>> 0;
        }
    }
    if (matchers.rgba) {
        if (match = matchers.rgba.exec(color)) {
            return (parse255(match[1]) << 24 | parse255(match[2]) << 16 | parse255(match[3]) << 8 | parse1(match[4])) >>> 0;
        }
    }
    if (matchers.hex3) {
        if (match = matchers.hex3.exec(color)) {
            return Number.parseInt(match[1] + match[1] + match[2] + match[2] + match[3] + match[3] + "ff", 16) >>> 0;
        }
    }
    if (matchers.hex8) {
        if (match = matchers.hex8.exec(color)) {
            return Number.parseInt(match[1], 16) >>> 0;
        }
    }
    if (matchers.hex4) {
        if (match = matchers.hex4.exec(color)) {
            return Number.parseInt(match[1] + match[1] + match[2] + match[2] + match[3] + match[3] + match[4] + match[4], 16) >>> 0;
        }
    }
    if (matchers.hsl) {
        if (match = matchers.hsl.exec(color)) {
            return (hslToRgb(parse360(match[1]), parsePercentage(match[2]), parsePercentage(match[3])) | 255) >>> 0;
        }
    }
    if (matchers.hsla) {
        if (match = matchers.hsla.exec(color)) {
            return (hslToRgb(parse360(match[1]), parsePercentage(match[2]), parsePercentage(match[3])) | parse1(match[4])) >>> 0;
        }
    }
    throw new Error(`invalid color string ${color} provided`);
}
var opacity = (c2)=>{
    return (c2 >> 24 & 255) / 255;
};
var red = (c2)=>{
    return c2 >> 16 & 255;
};
var green = (c2)=>{
    return c2 >> 8 & 255;
};
var blue = (c2)=>{
    return c2 & 255;
};
var rgbaColor = (r, g, b2, alpha)=>{
    return `rgba(${r}, ${g}, ${b2}, ${alpha})`;
};
function processColor(color) {
    const normalizedColor = normalizeColor(color);
    return (normalizedColor << 24 | normalizedColor >>> 8) >>> 0;
}
var interpolateColorsRGB = (value, inputRange, colors)=>{
    const [r, g, b2, a2] = [
        red,
        green,
        blue,
        opacity
    ].map((f)=>{
        const unrounded = interpolate(value, inputRange, colors.map((c2)=>f(c2)), {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp"
        });
        if (f === opacity) {
            return Number(unrounded.toFixed(3));
        }
        return Math.round(unrounded);
    });
    return rgbaColor(r, g, b2, a2);
};
var interpolateColors = (input, inputRange, outputRange)=>{
    if (typeof input === "undefined") {
        throw new TypeError("input can not be undefined");
    }
    if (typeof inputRange === "undefined") {
        throw new TypeError("inputRange can not be undefined");
    }
    if (typeof outputRange === "undefined") {
        throw new TypeError("outputRange can not be undefined");
    }
    if (inputRange.length !== outputRange.length) {
        throw new TypeError("inputRange (" + inputRange.length + " values provided) and outputRange (" + outputRange.length + " values provided) must have the same length");
    }
    const processedOutputRange = outputRange.map((c2)=>processColor(c2));
    return interpolateColorsRGB(input, inputRange, processedOutputRange);
};
// src/validate-frame.ts
var validateFrame = ({ allowFloats, durationInFrames, frame })=>{
    if (typeof frame === "undefined") {
        throw new TypeError(`Argument missing for parameter "frame"`);
    }
    if (typeof frame !== "number") {
        throw new TypeError(`Argument passed for "frame" is not a number: ${frame}`);
    }
    if (!Number.isFinite(frame)) {
        throw new RangeError(`Frame ${frame} is not finite`);
    }
    if (frame % 1 !== 0 && !allowFloats) {
        throw new RangeError(`Argument for frame must be an integer, but got ${frame}`);
    }
    if (frame < 0 && frame < -durationInFrames) {
        throw new RangeError(`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the lowest frame that can be rendered is ${-durationInFrames}`);
    }
    if (frame > durationInFrames - 1) {
        throw new RangeError(`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the highest frame that can be rendered is ${durationInFrames - 1}`);
    }
};
;
;
var flattenChildren = (children)=>{
    const childrenArray = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Children.toArray(children);
    return childrenArray.reduce((flatChildren, child)=>{
        if (child.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment) {
            return flatChildren.concat(flattenChildren(child.props.children));
        }
        flatChildren.push(child);
        return flatChildren;
    }, []);
};
;
;
var IsInsideSeriesContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(false);
var IsInsideSeriesContainer = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(IsInsideSeriesContext.Provider, {
        value: true,
        children
    });
};
_c51 = IsInsideSeriesContainer;
var IsNotInsideSeriesProvider = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(IsInsideSeriesContext.Provider, {
        value: false,
        children
    });
};
_c52 = IsNotInsideSeriesProvider;
var useRequireToBeInsideSeries = ()=>{
    _s73();
    const isInsideSeries = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(IsInsideSeriesContext);
    if (!isInsideSeries) {
        throw new Error("This component must be inside a <Series /> component.");
    }
};
_s73(useRequireToBeInsideSeries, "9L7Mp5WcJenAZF1lzPIyatvcT2M=");
;
var SeriesSequenceRefForwardingFunction = ({ children }, _ref)=>{
    _s74();
    useRequireToBeInsideSeries();
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(IsNotInsideSeriesProvider, {
        children
    });
};
_s74(SeriesSequenceRefForwardingFunction, "yaqlCXTx2iUdF5gn178O2YqUSGA=", false, function() {
    return [
        useRequireToBeInsideSeries
    ];
});
_c53 = SeriesSequenceRefForwardingFunction;
var SeriesSequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(SeriesSequenceRefForwardingFunction);
_c54 = SeriesSequence;
var Series = (props2)=>{
    _s75();
    const childrenValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Series.useMemo30[childrenValue]": ()=>{
            let startFrame = 0;
            const flattenedChildren = flattenChildren(props2.children);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Children"].map(flattenedChildren, {
                "Series.useMemo30[childrenValue]": (child, i)=>{
                    const castedChild = child;
                    if (typeof castedChild === "string") {
                        if (castedChild.trim() === "") {
                            return null;
                        }
                        throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but you passed a string "${castedChild}"`);
                    }
                    if (castedChild.type !== SeriesSequence) {
                        throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but got ${castedChild} instead`);
                    }
                    const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;
                    if (!castedChild?.props.children) {
                        throw new TypeError(`A <Series.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`);
                    }
                    const durationInFramesProp = castedChild.props.durationInFrames;
                    const { durationInFrames, children: _children, from, name, ...passedProps } = castedChild.props;
                    if (i !== flattenedChildren.length - 1 || durationInFramesProp !== Infinity) {
                        validateDurationInFrames(durationInFramesProp, {
                            component: `of a <Series.Sequence /> component`,
                            allowFloats: true
                        });
                    }
                    const offset = castedChild.props.offset ?? 0;
                    if (Number.isNaN(offset)) {
                        throw new TypeError(`The "offset" property of a <Series.Sequence /> must not be NaN, but got NaN (${debugInfo}).`);
                    }
                    if (!Number.isFinite(offset)) {
                        throw new TypeError(`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`);
                    }
                    if (offset % 1 !== 0) {
                        throw new TypeError(`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`);
                    }
                    const currentStartFrame = startFrame + offset;
                    startFrame += durationInFramesProp + offset;
                    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
                        name: name || "<Series.Sequence>",
                        from: currentStartFrame,
                        durationInFrames: durationInFramesProp,
                        ...passedProps,
                        ref: castedChild.ref,
                        children: child
                    });
                }
            }["Series.useMemo30[childrenValue]"]);
        }
    }["Series.useMemo30[childrenValue]"], [
        props2.children
    ]);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(IsInsideSeriesContainer, {
        children: childrenValue
    });
};
_s75(Series, "FRx80kOlSuqZxs2T1ooOjNAJwxI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c55 = Series;
Series.Sequence = SeriesSequence;
addSequenceStackTraces(SeriesSequence);
// src/validation/validation-spring-duration.ts
var validateSpringDuration = (dur)=>{
    if (typeof dur === "undefined") {
        return;
    }
    if (typeof dur !== "number") {
        throw new TypeError(`A "duration" of a spring must be a "number" but is "${typeof dur}"`);
    }
    if (Number.isNaN(dur)) {
        throw new TypeError('A "duration" of a spring is NaN, which it must not be');
    }
    if (!Number.isFinite(dur)) {
        throw new TypeError('A "duration" of a spring must be finite, but is ' + dur);
    }
    if (dur <= 0) {
        throw new TypeError('A "duration" of a spring must be positive, but is ' + dur);
    }
};
// src/spring/spring-utils.ts
var defaultSpringConfig = {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false
};
var advanceCache = {};
function advance({ animation, now, config }) {
    const { toValue, lastTimestamp, current, velocity } = animation;
    const deltaTime = Math.min(now - lastTimestamp, 64);
    if (config.damping <= 0) {
        throw new Error("Spring damping must be greater than 0, otherwise the spring() animation will never end, causing an infinite loop.");
    }
    const c2 = config.damping;
    const m = config.mass;
    const k = config.stiffness;
    const cacheKey = [
        toValue,
        lastTimestamp,
        current,
        velocity,
        c2,
        m,
        k,
        now
    ].join("-");
    if (advanceCache[cacheKey]) {
        return advanceCache[cacheKey];
    }
    const v0 = -velocity;
    const x0 = toValue - current;
    const zeta = c2 / (2 * Math.sqrt(k * m));
    const omega0 = Math.sqrt(k / m);
    const omega1 = omega0 * Math.sqrt(1 - zeta ** 2);
    const t = deltaTime / 1000;
    const sin1 = Math.sin(omega1 * t);
    const cos1 = Math.cos(omega1 * t);
    const underDampedEnvelope = Math.exp(-zeta * omega0 * t);
    const underDampedFrag1 = underDampedEnvelope * (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
    const underDampedPosition = toValue - underDampedFrag1;
    const underDampedVelocity = zeta * omega0 * underDampedFrag1 - underDampedEnvelope * (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);
    const criticallyDampedEnvelope = Math.exp(-omega0 * t);
    const criticallyDampedPosition = toValue - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);
    const criticallyDampedVelocity = criticallyDampedEnvelope * (v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);
    const animationNode = {
        toValue,
        prevPosition: current,
        lastTimestamp: now,
        current: zeta < 1 ? underDampedPosition : criticallyDampedPosition,
        velocity: zeta < 1 ? underDampedVelocity : criticallyDampedVelocity
    };
    advanceCache[cacheKey] = animationNode;
    return animationNode;
}
var calculationCache = {};
function springCalculation({ frame, fps, config = {} }) {
    const from = 0;
    const to = 1;
    const cacheKey = [
        frame,
        fps,
        config.damping,
        config.mass,
        config.overshootClamping,
        config.stiffness
    ].join("-");
    if (calculationCache[cacheKey]) {
        return calculationCache[cacheKey];
    }
    let animation = {
        lastTimestamp: 0,
        current: from,
        toValue: to,
        velocity: 0,
        prevPosition: 0
    };
    const frameClamped = Math.max(0, frame);
    const unevenRest = frameClamped % 1;
    for(let f = 0; f <= Math.floor(frameClamped); f++){
        if (f === Math.floor(frameClamped)) {
            f += unevenRest;
        }
        const time = f / fps * 1000;
        animation = advance({
            animation,
            now: time,
            config: {
                ...defaultSpringConfig,
                ...config
            }
        });
    }
    calculationCache[cacheKey] = animation;
    return animation;
}
// src/spring/measure-spring.ts
var cache = new Map;
function measureSpring({ fps, config = {}, threshold = 0.005 }) {
    if (typeof threshold !== "number") {
        throw new TypeError(`threshold must be a number, got ${threshold} of type ${typeof threshold}`);
    }
    if (threshold === 0) {
        return Infinity;
    }
    if (threshold === 1) {
        return 0;
    }
    if (isNaN(threshold)) {
        throw new TypeError("Threshold is NaN");
    }
    if (!Number.isFinite(threshold)) {
        throw new TypeError("Threshold is not finite");
    }
    if (threshold < 0) {
        throw new TypeError("Threshold is below 0");
    }
    const cacheKey = [
        fps,
        config.damping,
        config.mass,
        config.overshootClamping,
        config.stiffness,
        threshold
    ].join("-");
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    validateFps(fps, "to the measureSpring() function", false);
    let frame = 0;
    let finishedFrame = 0;
    const calc = ()=>{
        return springCalculation({
            fps,
            frame,
            config
        });
    };
    let animation = calc();
    const calcDifference = ()=>{
        return Math.abs(animation.current - animation.toValue);
    };
    let difference = calcDifference();
    while(difference >= threshold){
        frame++;
        animation = calc();
        difference = calcDifference();
    }
    finishedFrame = frame;
    for(let i = 0; i < 20; i++){
        frame++;
        animation = calc();
        difference = calcDifference();
        if (difference >= threshold) {
            i = 0;
            finishedFrame = frame + 1;
        }
    }
    cache.set(cacheKey, finishedFrame);
    return finishedFrame;
}
// src/spring/index.ts
function spring({ frame: passedFrame, fps, config = {}, from = 0, to = 1, durationInFrames: passedDurationInFrames, durationRestThreshold, delay = 0, reverse = false }) {
    validateSpringDuration(passedDurationInFrames);
    validateFrame({
        frame: passedFrame,
        durationInFrames: Infinity,
        allowFloats: true
    });
    validateFps(fps, "to spring()", false);
    const needsToCalculateNaturalDuration = reverse || typeof passedDurationInFrames !== "undefined";
    const naturalDuration = needsToCalculateNaturalDuration ? measureSpring({
        fps,
        config,
        threshold: durationRestThreshold
    }) : undefined;
    const naturalDurationGetter = needsToCalculateNaturalDuration ? {
        get: ()=>naturalDuration
    } : {
        get: ()=>{
            throw new Error("did not calculate natural duration, this is an error with Remotion. Please report");
        }
    };
    const reverseProcessed = reverse ? (passedDurationInFrames ?? naturalDurationGetter.get()) - passedFrame : passedFrame;
    const delayProcessed = reverseProcessed + (reverse ? delay : -delay);
    const durationProcessed = passedDurationInFrames === undefined ? delayProcessed : delayProcessed / (passedDurationInFrames / naturalDurationGetter.get());
    if (passedDurationInFrames && delayProcessed > passedDurationInFrames) {
        return to;
    }
    const spr = springCalculation({
        fps,
        frame: durationProcessed,
        config
    });
    const inner = config.overshootClamping ? to >= from ? Math.min(spr.current, to) : Math.max(spr.current, to) : spr.current;
    const interpolated = from === 0 && to === 1 ? inner : interpolate(inner, [
        0,
        1
    ], [
        from,
        to
    ]);
    return interpolated;
}
// src/static-file.ts
var problematicCharacters = {
    "%3A": ":",
    "%2F": "/",
    "%3F": "?",
    "%23": "#",
    "%5B": "[",
    "%5D": "]",
    "%40": "@",
    "%21": "!",
    "%24": "$",
    "%26": "&",
    "%27": "'",
    "%28": "(",
    "%29": ")",
    "%2A": "*",
    "%2B": "+",
    "%2C": ",",
    "%3B": ";"
};
var didWarn2 = {};
var warnOnce3 = (message)=>{
    if (didWarn2[message]) {
        return;
    }
    console.warn(message);
    didWarn2[message] = true;
};
var includesHexOfUnsafeChar = (path)=>{
    for (const key of Object.keys(problematicCharacters)){
        if (path.includes(key)) {
            return {
                containsHex: true,
                hexCode: key
            };
        }
    }
    return {
        containsHex: false
    };
};
var trimLeadingSlash = (path)=>{
    if (path.startsWith("/")) {
        return trimLeadingSlash(path.substring(1));
    }
    return path;
};
var inner = (path)=>{
    if (("TURBOPACK compile-time value", "object") !== "undefined" && window.remotion_staticBase) {
        if (path.startsWith(window.remotion_staticBase)) {
            throw new Error(`The value "${path}" is already prefixed with the static base ${window.remotion_staticBase}. You don't need to call staticFile() on it.`);
        }
        return `${window.remotion_staticBase}/${trimLeadingSlash(path)}`;
    }
    return `/${trimLeadingSlash(path)}`;
};
var encodeBySplitting = (path)=>{
    const splitBySlash = path.split("/");
    const encodedArray = splitBySlash.map((element)=>{
        return encodeURIComponent(element);
    });
    const merged = encodedArray.join("/");
    return merged;
};
var staticFile = (path)=>{
    if (path === null) {
        throw new TypeError("null was passed to staticFile()");
    }
    if (typeof path === "undefined") {
        throw new TypeError("undefined was passed to staticFile()");
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
        throw new TypeError(`staticFile() does not support remote URLs - got "${path}". Instead, pass the URL without wrapping it in staticFile(). See: https://remotion.dev/docs/staticfile-remote-urls`);
    }
    if (path.startsWith("..") || path.startsWith("./")) {
        throw new TypeError(`staticFile() does not support relative paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    if (path.startsWith("/Users") || path.startsWith("/home") || path.startsWith("/tmp") || path.startsWith("/etc") || path.startsWith("/opt") || path.startsWith("/var") || path.startsWith("C:") || path.startsWith("D:") || path.startsWith("E:")) {
        throw new TypeError(`staticFile() does not support absolute paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    if (path.startsWith("public/")) {
        throw new TypeError(`Do not include the public/ prefix when using staticFile() - got "${path}". See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    const includesHex = includesHexOfUnsafeChar(path);
    if (includesHex.containsHex) {
        warnOnce3(`WARNING: You seem to pass an already encoded path (path contains ${includesHex.hexCode}). Since Remotion 4.0, the encoding is done by staticFile() itself. You may want to remove a encodeURIComponent() wrapping.`);
    }
    const preprocessed = encodeBySplitting(path);
    const preparsed = inner(preprocessed);
    if (!preparsed.startsWith("/")) {
        return `/${preparsed}`;
    }
    return preparsed;
};
;
var Still = (props2)=>{
    const newProps = {
        ...props2,
        durationInFrames: 1,
        fps: 1
    };
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(Composition, newProps);
};
_c56 = Still;
;
;
// src/video/seek-until-right.ts
var roundTo6Commas = (num)=>{
    return Math.round(num * 1e5) / 1e5;
};
var seekToTime = ({ element, desiredTime, logLevel, mountTime })=>{
    if (isApproximatelyTheSame(element.currentTime, desiredTime)) {
        return {
            wait: Promise.resolve(desiredTime),
            cancel: ()=>{}
        };
    }
    seek({
        logLevel,
        mediaRef: element,
        time: desiredTime,
        why: "Seeking during rendering",
        mountTime
    });
    let cancel;
    let cancelSeeked = null;
    const prom = new Promise((resolve)=>{
        cancel = element.requestVideoFrameCallback((now, metadata)=>{
            const displayIn = metadata.expectedDisplayTime - now;
            if (displayIn <= 0) {
                resolve(metadata.mediaTime);
                return;
            }
            setTimeout(()=>{
                resolve(metadata.mediaTime);
            }, displayIn + 150);
        });
    });
    const waitForSeekedEvent = new Promise((resolve)=>{
        const onDone = ()=>{
            resolve();
        };
        element.addEventListener("seeked", onDone, {
            once: true
        });
        cancelSeeked = ()=>{
            element.removeEventListener("seeked", onDone);
        };
    });
    return {
        wait: Promise.all([
            prom,
            waitForSeekedEvent
        ]).then(([time])=>time),
        cancel: ()=>{
            cancelSeeked?.();
            element.cancelVideoFrameCallback(cancel);
        }
    };
};
var seekToTimeMultipleUntilRight = ({ element, desiredTime, fps, logLevel, mountTime })=>{
    const threshold = 1 / fps / 2;
    let currentCancel = ()=>{
        return;
    };
    if (Number.isFinite(element.duration) && element.currentTime >= element.duration && desiredTime >= element.duration) {
        return {
            prom: Promise.resolve(),
            cancel: ()=>{}
        };
    }
    const prom = new Promise((resolve, reject)=>{
        const firstSeek = seekToTime({
            element,
            desiredTime: desiredTime + threshold,
            logLevel,
            mountTime
        });
        firstSeek.wait.then((seekedTo)=>{
            const difference = Math.abs(desiredTime - seekedTo);
            if (difference <= threshold) {
                return resolve();
            }
            const sign = desiredTime > seekedTo ? 1 : -1;
            const newSeek = seekToTime({
                element,
                desiredTime: seekedTo + threshold * sign,
                logLevel,
                mountTime
            });
            currentCancel = newSeek.cancel;
            newSeek.wait.then((newTime)=>{
                const newDifference = Math.abs(desiredTime - newTime);
                if (roundTo6Commas(newDifference) <= roundTo6Commas(threshold)) {
                    return resolve();
                }
                const thirdSeek = seekToTime({
                    element,
                    desiredTime: desiredTime + threshold,
                    logLevel,
                    mountTime
                });
                currentCancel = thirdSeek.cancel;
                return thirdSeek.wait.then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            }).catch((err)=>{
                reject(err);
            });
        });
        currentCancel = firstSeek.cancel;
    });
    return {
        prom,
        cancel: ()=>{
            currentCancel();
        }
    };
};
;
var VideoForRenderingForwardFunction = ({ onError, volume: volumeProp, allowAmplificationDuringRender, playbackRate, onDuration, toneFrequency, name, acceptableTimeShiftInSeconds, delayRenderRetries, delayRenderTimeoutInMilliseconds, loopVolumeCurveBehavior, audioStreamIndex, ...props2 }, ref)=>{
    _s76();
    const absoluteFrame = useTimelinePosition();
    const frame = useCurrentFrame();
    const volumePropsFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const videoConfig = useUnsafeVideoConfig();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const mediaStartsAt = useMediaStartsAt();
    const environment = useRemotionEnvironment();
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VideoForRenderingForwardFunction.useMemo31[id]": ()=>`video-${random(props2.src ?? "")}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`
    }["VideoForRenderingForwardFunction.useMemo31[id]"], [
        props2.src,
        sequenceContext?.cumulatedFrom,
        sequenceContext?.relativeFrom,
        sequenceContext?.durationInFrames
    ]);
    if (!videoConfig) {
        throw new Error("No video config found");
    }
    const volume = evaluateVolume({
        volume: volumeProp,
        frame: volumePropsFrame,
        mediaVolume: 1
    });
    warnAboutTooHighVolume(volume);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoForRenderingForwardFunction.useEffect22": ()=>{
            if (!props2.src) {
                throw new Error("No src passed");
            }
            if (props2.muted) {
                return;
            }
            if (volume <= 0) {
                return;
            }
            if (!window.remotion_audioEnabled) {
                return;
            }
            registerRenderAsset({
                type: "video",
                src: getAbsoluteSrc(props2.src),
                id,
                frame: absoluteFrame,
                volume,
                mediaFrame: frame,
                playbackRate: playbackRate ?? 1,
                toneFrequency: toneFrequency ?? 1,
                audioStartFrame: Math.max(0, -(sequenceContext?.relativeFrom ?? 0)),
                audioStreamIndex: audioStreamIndex ?? 0
            });
            return ({
                "VideoForRenderingForwardFunction.useEffect22": ()=>unregisterRenderAsset(id)
            })["VideoForRenderingForwardFunction.useEffect22"];
        }
    }["VideoForRenderingForwardFunction.useEffect22"], [
        props2.muted,
        props2.src,
        registerRenderAsset,
        id,
        unregisterRenderAsset,
        volume,
        frame,
        absoluteFrame,
        playbackRate,
        toneFrequency,
        sequenceContext?.relativeFrom,
        audioStreamIndex
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "VideoForRenderingForwardFunction.useImperativeHandle10": ()=>{
            return videoRef.current;
        }
    }["VideoForRenderingForwardFunction.useImperativeHandle10"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoForRenderingForwardFunction.useEffect22": ()=>{
            if (!window.remotion_videoEnabled) {
                return;
            }
            const { current } = videoRef;
            if (!current) {
                return;
            }
            const currentTime = getMediaTime({
                frame,
                playbackRate: playbackRate || 1,
                startFrom: -mediaStartsAt,
                fps: videoConfig.fps
            });
            const handle = delayRender2(`Rendering <Html5Video /> with src="${props2.src}" at time ${currentTime}`, {
                retries: delayRenderRetries ?? undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
            });
            if (window.process?.env?.NODE_ENV === "test") {
                continueRender2(handle);
                return;
            }
            if (isApproximatelyTheSame(current.currentTime, currentTime)) {
                if (current.readyState >= 2) {
                    continueRender2(handle);
                    return;
                }
                const loadedDataHandler = {
                    "VideoForRenderingForwardFunction.useEffect22.loadedDataHandler": ()=>{
                        continueRender2(handle);
                    }
                }["VideoForRenderingForwardFunction.useEffect22.loadedDataHandler"];
                current.addEventListener("loadeddata", loadedDataHandler, {
                    once: true
                });
                return ({
                    "VideoForRenderingForwardFunction.useEffect22": ()=>{
                        current.removeEventListener("loadeddata", loadedDataHandler);
                    }
                })["VideoForRenderingForwardFunction.useEffect22"];
            }
            const endedHandler = {
                "VideoForRenderingForwardFunction.useEffect22.endedHandler": ()=>{
                    continueRender2(handle);
                }
            }["VideoForRenderingForwardFunction.useEffect22.endedHandler"];
            const seek2 = seekToTimeMultipleUntilRight({
                element: current,
                desiredTime: currentTime,
                fps: videoConfig.fps,
                logLevel,
                mountTime
            });
            seek2.prom.then({
                "VideoForRenderingForwardFunction.useEffect22": ()=>{
                    continueRender2(handle);
                }
            }["VideoForRenderingForwardFunction.useEffect22"]);
            current.addEventListener("ended", endedHandler, {
                once: true
            });
            const errorHandler = {
                "VideoForRenderingForwardFunction.useEffect22.errorHandler": ()=>{
                    if (current?.error) {
                        console.error("Error occurred in video", current?.error);
                        if (onError) {
                            return;
                        }
                        throw new Error(`The browser threw an error while playing the video ${props2.src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`);
                    } else {
                        throw new Error("The browser threw an error");
                    }
                }
            }["VideoForRenderingForwardFunction.useEffect22.errorHandler"];
            current.addEventListener("error", errorHandler, {
                once: true
            });
            return ({
                "VideoForRenderingForwardFunction.useEffect22": ()=>{
                    seek2.cancel();
                    current.removeEventListener("ended", endedHandler);
                    current.removeEventListener("error", errorHandler);
                    continueRender2(handle);
                }
            })["VideoForRenderingForwardFunction.useEffect22"];
        }
    }["VideoForRenderingForwardFunction.useEffect22"], [
        volumePropsFrame,
        props2.src,
        playbackRate,
        videoConfig.fps,
        frame,
        mediaStartsAt,
        onError,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        logLevel,
        mountTime,
        continueRender2,
        delayRender2
    ]);
    const { src } = props2;
    if (environment.isRendering) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "VideoForRenderingForwardFunction.useLayoutEffect10": ()=>{
                if (window.process?.env?.NODE_ENV === "test") {
                    return;
                }
                const newHandle = delayRender2("Loading <Html5Video> duration with src=" + src, {
                    retries: delayRenderRetries ?? undefined,
                    timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
                });
                const { current } = videoRef;
                const didLoad = {
                    "VideoForRenderingForwardFunction.useLayoutEffect10.didLoad": ()=>{
                        if (current?.duration) {
                            onDuration(src, current.duration);
                        }
                        continueRender2(newHandle);
                    }
                }["VideoForRenderingForwardFunction.useLayoutEffect10.didLoad"];
                if (current?.duration) {
                    onDuration(src, current.duration);
                    continueRender2(newHandle);
                } else {
                    current?.addEventListener("loadedmetadata", didLoad, {
                        once: true
                    });
                }
                return ({
                    "VideoForRenderingForwardFunction.useLayoutEffect10": ()=>{
                        current?.removeEventListener("loadedmetadata", didLoad);
                        continueRender2(newHandle);
                    }
                })["VideoForRenderingForwardFunction.useLayoutEffect10"];
            }
        }["VideoForRenderingForwardFunction.useLayoutEffect10"], [
            src,
            onDuration,
            delayRenderRetries,
            delayRenderTimeoutInMilliseconds,
            continueRender2,
            delayRender2
        ]);
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("video", {
        ref: videoRef,
        disableRemotePlayback: true,
        ...props2
    });
};
_s76(VideoForRenderingForwardFunction, "HZkOuwzbffHyJ3o+PW7lChl+2a8=", false, function() {
    return [
        useTimelinePosition,
        useCurrentFrame,
        useFrameForVolumeProp,
        useUnsafeVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useMediaStartsAt,
        useRemotionEnvironment,
        useLogLevel,
        useMountTime,
        useDelayRender,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c57 = VideoForRenderingForwardFunction;
var VideoForRendering = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(VideoForRenderingForwardFunction);
_c58 = VideoForRendering;
;
var VideoForwardingFunction = (props2, ref)=>{
    _s77();
    const { startFrom, endAt, trimBefore, trimAfter, name, pauseWhenBuffering, stack, _remotionInternalNativeLoopPassed, showInTimeline, onAutoPlayError, ...otherProps } = props2;
    const { loop, ...propsOtherThanLoop } = props2;
    const { fps } = useVideoConfig();
    const environment = useRemotionEnvironment();
    const { durations, setDurations } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DurationsContext);
    if (typeof ref === "string") {
        throw new Error("string refs are not supported");
    }
    if (typeof props2.src !== "string") {
        throw new TypeError(`The \`<Html5Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(props2.src)} instead.`);
    }
    const preloadedSrc = usePreload(props2.src);
    const onDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoForwardingFunction.useCallback17[onDuration]": (src, durationInSeconds)=>{
            setDurations({
                type: "got-duration",
                durationInSeconds,
                src
            });
        }
    }["VideoForwardingFunction.useCallback17[onDuration]"], [
        setDurations
    ]);
    const onVideoFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoForwardingFunction.useCallback17[onVideoFrame]": ()=>{}
    }["VideoForwardingFunction.useCallback17[onVideoFrame]"], []);
    const durationFetched = durations[getAbsoluteSrc(preloadedSrc)] ?? durations[getAbsoluteSrc(props2.src)];
    validateMediaTrimProps({
        startFrom,
        endAt,
        trimBefore,
        trimAfter
    });
    const { trimBeforeValue, trimAfterValue } = resolveTrimProps({
        startFrom,
        endAt,
        trimBefore,
        trimAfter
    });
    if (loop && durationFetched !== undefined) {
        if (!Number.isFinite(durationFetched)) {
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Html5Video, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            });
        }
        const mediaDuration = durationFetched * fps;
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Loop, {
            durationInFrames: calculateMediaDuration({
                trimAfter: trimAfterValue,
                mediaDurationInFrames: mediaDuration,
                playbackRate: props2.playbackRate ?? 1,
                trimBefore: trimBeforeValue
            }),
            layout: "none",
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Html5Video, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            })
        });
    }
    if (typeof trimBeforeValue !== "undefined" || typeof trimAfterValue !== "undefined") {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            layout: "none",
            from: 0 - (trimBeforeValue ?? 0),
            showInTimeline: false,
            durationInFrames: trimAfterValue,
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Html5Video, {
                pauseWhenBuffering: pauseWhenBuffering ?? false,
                ...otherProps,
                ref
            })
        });
    }
    validateMediaProps({
        playbackRate: props2.playbackRate,
        volume: props2.volume
    }, "Html5Video");
    if (environment.isRendering) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VideoForRendering, {
            onDuration,
            onVideoFrame: onVideoFrame ?? null,
            ...otherProps,
            ref
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VideoForPreview, {
        onlyWarnForMediaSeekingError: false,
        ...otherProps,
        ref,
        onVideoFrame: null,
        pauseWhenBuffering: pauseWhenBuffering ?? false,
        onDuration,
        _remotionInternalStack: stack ?? null,
        _remotionInternalNativeLoopPassed: _remotionInternalNativeLoopPassed ?? false,
        showInTimeline: showInTimeline ?? true,
        onAutoPlayError: onAutoPlayError ?? undefined
    });
};
_s77(VideoForwardingFunction, "Ozaul3IS3x4SaVP72iv5Gj7M+dc=", false, function() {
    return [
        useVideoConfig,
        useRemotionEnvironment,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        usePreload,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c59 = VideoForwardingFunction;
var Html5Video = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(VideoForwardingFunction);
_c60 = Html5Video;
addSequenceStackTraces(Html5Video);
var Video = Html5Video;
// src/index.ts
checkMultipleRemotionVersions();
var Experimental = {
    Clipper,
    Null,
    useIsPlayer
};
var proxyObj = {};
var Config = new Proxy(proxyObj, {
    get (_, prop) {
        if (prop === "Bundling" || prop === "Rendering" || prop === "Log" || prop === "Puppeteer" || prop === "Output") {
            return Config;
        }
        return ()=>{
            console.warn("⚠️  The CLI configuration has been extracted from Remotion Core.");
            console.warn("Update the import from the config file:");
            console.warn();
            console.warn("- Delete:");
            console.warn('import {Config} from "remotion";');
            console.warn("+ Replace:");
            console.warn('import {Config} from "@remotion/cli/config";');
            console.warn();
            console.warn("For more information, see https://www.remotion.dev/docs/4-0-migration.");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].exit(1);
        };
    }
});
addSequenceStackTraces(Sequence);
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16, _c17, _c18, _c19, _c20, _c21, _c22, _c23, _c24, _c25, _c26, _c27, _c28, _c29, _c30, _c31, _c32, _c33, _c34, _c35, _c36, _c37, _c38, _c39, _c40, _c41, _c42, _c43, _c44, _c45, _c46, _c47, _c48, _c49, _c50, _c51, _c52, _c53, _c54, _c55, _c56, _c57, _c58, _c59, _c60;
__turbopack_context__.k.register(_c, "Clipper");
__turbopack_context__.k.register(_c1, "IsPlayerContextProvider");
__turbopack_context__.k.register(_c2, "Null");
__turbopack_context__.k.register(_c3, "AbsoluteFillRefForwarding");
__turbopack_context__.k.register(_c4, "AbsoluteFill");
__turbopack_context__.k.register(_c5, "SequenceManagerProvider");
__turbopack_context__.k.register(_c6, "EditorPropsProvider");
__turbopack_context__.k.register(_c7, "ResolveCompositionConfig");
__turbopack_context__.k.register(_c8, "CanUseRemotionHooksProvider");
__turbopack_context__.k.register(_c9, "Freeze");
__turbopack_context__.k.register(_c10, "RegularSequenceRefForwardingFunction");
__turbopack_context__.k.register(_c11, "RegularSequence");
__turbopack_context__.k.register(_c12, "PremountedPostmountedSequenceRefForwardingFunction");
__turbopack_context__.k.register(_c13, "PremountedPostmountedSequence");
__turbopack_context__.k.register(_c14, "SequenceRefForwardingFunction");
__turbopack_context__.k.register(_c15, "Sequence");
__turbopack_context__.k.register(_c16, "CanvasRefForwardingFunction");
__turbopack_context__.k.register(_c17, "Canvas");
__turbopack_context__.k.register(_c18, "AnimatedImage$forwardRef3");
__turbopack_context__.k.register(_c19, "AnimatedImage");
__turbopack_context__.k.register(_c20, "RenderAssetManagerProvider");
__turbopack_context__.k.register(_c21, "Artifact");
__turbopack_context__.k.register(_c22, "Loop");
__turbopack_context__.k.register(_c23, "PrefetchProvider");
__turbopack_context__.k.register(_c24, "DurationsContextProvider");
__turbopack_context__.k.register(_c25, "SharedAudioContextProvider");
__turbopack_context__.k.register(_c26, "BufferingProvider");
__turbopack_context__.k.register(_c27, "AudioForDevelopmentForwardRefFunction");
__turbopack_context__.k.register(_c28, "AudioForPreview");
__turbopack_context__.k.register(_c29, "AudioForRenderingRefForwardingFunction");
__turbopack_context__.k.register(_c30, "AudioForRendering");
__turbopack_context__.k.register(_c31, "AudioRefForwardingFunction");
__turbopack_context__.k.register(_c32, "Html5Audio");
__turbopack_context__.k.register(_c33, "Folder");
__turbopack_context__.k.register(_c34, "Loading");
__turbopack_context__.k.register(_c35, "Fallback");
__turbopack_context__.k.register(_c36, "InnerComposition");
__turbopack_context__.k.register(_c37, "Composition");
__turbopack_context__.k.register(_c38, "IFrameRefForwarding");
__turbopack_context__.k.register(_c39, "IFrame");
__turbopack_context__.k.register(_c40, "ImgRefForwarding");
__turbopack_context__.k.register(_c41, "Img");
__turbopack_context__.k.register(_c42, "CompositionManagerProvider");
__turbopack_context__.k.register(_c43, "MediaEnabledProvider");
__turbopack_context__.k.register(_c44, "RemotionRoot");
__turbopack_context__.k.register(_c45, "OffthreadVideoForRendering");
__turbopack_context__.k.register(_c46, "VideoForDevelopmentRefForwardingFunction");
__turbopack_context__.k.register(_c47, "VideoForPreview");
__turbopack_context__.k.register(_c48, "InnerOffthreadVideo");
__turbopack_context__.k.register(_c49, "OffthreadVideo");
__turbopack_context__.k.register(_c50, "RemotionContextProvider");
__turbopack_context__.k.register(_c51, "IsInsideSeriesContainer");
__turbopack_context__.k.register(_c52, "IsNotInsideSeriesProvider");
__turbopack_context__.k.register(_c53, "SeriesSequenceRefForwardingFunction");
__turbopack_context__.k.register(_c54, "SeriesSequence");
__turbopack_context__.k.register(_c55, "Series");
__turbopack_context__.k.register(_c56, "Still");
__turbopack_context__.k.register(_c57, "VideoForRenderingForwardFunction");
__turbopack_context__.k.register(_c58, "VideoForRendering");
__turbopack_context__.k.register(_c59, "VideoForwardingFunction");
__turbopack_context__.k.register(_c60, "Html5Video");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/dist/esm/no-react.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/interpolate.ts
__turbopack_context__.s([
    "NoReactInternals",
    ()=>NoReactInternals,
    "interpolate",
    ()=>interpolate,
    "random",
    ()=>random
]);
function interpolateFunction(input, inputRange, outputRange, options) {
    const { extrapolateLeft, extrapolateRight, easing } = options;
    let result = input;
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    if (result < inputMin) {
        if (extrapolateLeft === "identity") {
            return result;
        }
        if (extrapolateLeft === "clamp") {
            result = inputMin;
        } else if (extrapolateLeft === "wrap") {
            const range = inputMax - inputMin;
            result = ((result - inputMin) % range + range) % range + inputMin;
        } else if (extrapolateLeft === "extend") {}
    }
    if (result > inputMax) {
        if (extrapolateRight === "identity") {
            return result;
        }
        if (extrapolateRight === "clamp") {
            result = inputMax;
        } else if (extrapolateRight === "wrap") {
            const range = inputMax - inputMin;
            result = ((result - inputMin) % range + range) % range + inputMin;
        } else if (extrapolateRight === "extend") {}
    }
    if (outputMin === outputMax) {
        return outputMin;
    }
    result = (result - inputMin) / (inputMax - inputMin);
    result = easing(result);
    result = result * (outputMax - outputMin) + outputMin;
    return result;
}
function findRange(input, inputRange) {
    let i;
    for(i = 1; i < inputRange.length - 1; ++i){
        if (inputRange[i] >= input) {
            break;
        }
    }
    return i - 1;
}
function checkValidInputRange(arr) {
    for(let i = 1; i < arr.length; ++i){
        if (!(arr[i] > arr[i - 1])) {
            throw new Error(`inputRange must be strictly monotonically increasing but got [${arr.join(",")}]`);
        }
    }
}
function checkInfiniteRange(name, arr) {
    if (arr.length < 2) {
        throw new Error(name + " must have at least 2 elements");
    }
    for (const element of arr){
        if (typeof element !== "number") {
            throw new Error(`${name} must contain only numbers`);
        }
        if (!Number.isFinite(element)) {
            throw new Error(`${name} must contain only finite numbers, but got [${arr.join(",")}]`);
        }
    }
}
function interpolate(input, inputRange, outputRange, options) {
    if (typeof input === "undefined") {
        throw new Error("input can not be undefined");
    }
    if (typeof inputRange === "undefined") {
        throw new Error("inputRange can not be undefined");
    }
    if (typeof outputRange === "undefined") {
        throw new Error("outputRange can not be undefined");
    }
    if (inputRange.length !== outputRange.length) {
        throw new Error("inputRange (" + inputRange.length + ") and outputRange (" + outputRange.length + ") must have the same length");
    }
    checkInfiniteRange("inputRange", inputRange);
    checkInfiniteRange("outputRange", outputRange);
    checkValidInputRange(inputRange);
    const easing = options?.easing ?? ((num)=>num);
    let extrapolateLeft = "extend";
    if (options?.extrapolateLeft !== undefined) {
        extrapolateLeft = options.extrapolateLeft;
    }
    let extrapolateRight = "extend";
    if (options?.extrapolateRight !== undefined) {
        extrapolateRight = options.extrapolateRight;
    }
    if (typeof input !== "number") {
        throw new TypeError("Cannot interpolate an input which is not a number");
    }
    const range = findRange(input, inputRange);
    return interpolateFunction(input, [
        inputRange[range],
        inputRange[range + 1]
    ], [
        outputRange[range],
        outputRange[range + 1]
    ], {
        easing,
        extrapolateLeft,
        extrapolateRight
    });
}
// src/random.ts
function mulberry32(a) {
    let t = a + 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function hashCode(str) {
    let i = 0;
    let chr = 0;
    let hash = 0;
    for(i = 0; i < str.length; i++){
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}
var random = (seed, dummy)=>{
    if (dummy !== undefined) {
        throw new TypeError("random() takes only one argument");
    }
    if (seed === null) {
        return Math.random();
    }
    if (typeof seed === "string") {
        return mulberry32(hashCode(seed));
    }
    if (typeof seed === "number") {
        return mulberry32(seed * 10000000000);
    }
    throw new Error("random() argument must be a number or a string");
};
// src/truthy.ts
function truthy(value) {
    return Boolean(value);
}
// src/delay-render.ts
if ("TURBOPACK compile-time truthy", 1) {
    window.remotion_renderReady = false;
    if (!window.remotion_delayRenderTimeouts) {
        window.remotion_delayRenderTimeouts = {};
    }
}
var DELAY_RENDER_CALLSTACK_TOKEN = "The delayRender was called:";
var DELAY_RENDER_RETRIES_LEFT = "Retries left: ";
var DELAY_RENDER_RETRY_TOKEN = "- Rendering the frame will be retried.";
var DELAY_RENDER_CLEAR_TOKEN = "handle was cleared after";
// src/input-props-serialization.ts
var DATE_TOKEN = "remotion-date:";
var FILE_TOKEN = "remotion-file:";
var serializeJSONWithSpecialTypes = ({ data, indent, staticBase })=>{
    let customDateUsed = false;
    let customFileUsed = false;
    let mapUsed = false;
    let setUsed = false;
    try {
        const serializedString = JSON.stringify(data, function(key, value) {
            const item = this[key];
            if (item instanceof Date) {
                customDateUsed = true;
                return `${DATE_TOKEN}${item.toISOString()}`;
            }
            if (item instanceof Map) {
                mapUsed = true;
                return value;
            }
            if (item instanceof Set) {
                setUsed = true;
                return value;
            }
            if (typeof item === "string" && staticBase !== null && item.startsWith(staticBase)) {
                customFileUsed = true;
                return `${FILE_TOKEN}${item.replace(staticBase + "/", "")}`;
            }
            return value;
        }, indent);
        return {
            serializedString,
            customDateUsed,
            customFileUsed,
            mapUsed,
            setUsed
        };
    } catch (err) {
        throw new Error("Could not serialize the passed input props to JSON: " + err.message);
    }
};
var deserializeJSONWithSpecialTypes = (data)=>{
    return JSON.parse(data, (_, value)=>{
        if (typeof value === "string" && value.startsWith(DATE_TOKEN)) {
            return new Date(value.replace(DATE_TOKEN, ""));
        }
        if (typeof value === "string" && value.startsWith(FILE_TOKEN)) {
            return `${window.remotion_staticBase}/${value.replace(FILE_TOKEN, "")}`;
        }
        return value;
    });
};
// src/interpolate-colors.ts
var NUMBER = "[-+]?\\d*\\.?\\d+";
var PERCENTAGE = NUMBER + "%";
function call(...args) {
    return "\\(\\s*(" + args.join(")\\s*,\\s*(") + ")\\s*\\)";
}
function getMatchers() {
    const cachedMatchers = {
        rgb: undefined,
        rgba: undefined,
        hsl: undefined,
        hsla: undefined,
        hex3: undefined,
        hex4: undefined,
        hex5: undefined,
        hex6: undefined,
        hex8: undefined
    };
    if (cachedMatchers.rgb === undefined) {
        cachedMatchers.rgb = new RegExp("rgb" + call(NUMBER, NUMBER, NUMBER));
        cachedMatchers.rgba = new RegExp("rgba" + call(NUMBER, NUMBER, NUMBER, NUMBER));
        cachedMatchers.hsl = new RegExp("hsl" + call(NUMBER, PERCENTAGE, PERCENTAGE));
        cachedMatchers.hsla = new RegExp("hsla" + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER));
        cachedMatchers.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
        cachedMatchers.hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
        cachedMatchers.hex6 = /^#([0-9a-fA-F]{6})$/;
        cachedMatchers.hex8 = /^#([0-9a-fA-F]{8})$/;
    }
    return cachedMatchers;
}
function hue2rgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}
function hslToRgb(h, s, l) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b * 255) << 8;
}
function parse255(str) {
    const int = Number.parseInt(str, 10);
    if (int < 0) {
        return 0;
    }
    if (int > 255) {
        return 255;
    }
    return int;
}
function parse360(str) {
    const int = Number.parseFloat(str);
    return (int % 360 + 360) % 360 / 360;
}
function parse1(str) {
    const num = Number.parseFloat(str);
    if (num < 0) {
        return 0;
    }
    if (num > 1) {
        return 255;
    }
    return Math.round(num * 255);
}
function parsePercentage(str) {
    const int = Number.parseFloat(str);
    if (int < 0) {
        return 0;
    }
    if (int > 100) {
        return 1;
    }
    return int / 100;
}
var colorNames = {
    transparent: 0,
    aliceblue: 4042850303,
    antiquewhite: 4209760255,
    aqua: 16777215,
    aquamarine: 2147472639,
    azure: 4043309055,
    beige: 4126530815,
    bisque: 4293182719,
    black: 255,
    blanchedalmond: 4293643775,
    blue: 65535,
    blueviolet: 2318131967,
    brown: 2771004159,
    burlywood: 3736635391,
    burntsienna: 3934150143,
    cadetblue: 1604231423,
    chartreuse: 2147418367,
    chocolate: 3530104575,
    coral: 4286533887,
    cornflowerblue: 1687547391,
    cornsilk: 4294499583,
    crimson: 3692313855,
    cyan: 16777215,
    darkblue: 35839,
    darkcyan: 9145343,
    darkgoldenrod: 3095792639,
    darkgray: 2846468607,
    darkgreen: 6553855,
    darkgrey: 2846468607,
    darkkhaki: 3182914559,
    darkmagenta: 2332068863,
    darkolivegreen: 1433087999,
    darkorange: 4287365375,
    darkorchid: 2570243327,
    darkred: 2332033279,
    darksalmon: 3918953215,
    darkseagreen: 2411499519,
    darkslateblue: 1211993087,
    darkslategray: 793726975,
    darkslategrey: 793726975,
    darkturquoise: 13554175,
    darkviolet: 2483082239,
    deeppink: 4279538687,
    deepskyblue: 12582911,
    dimgray: 1768516095,
    dimgrey: 1768516095,
    dodgerblue: 512819199,
    firebrick: 2988581631,
    floralwhite: 4294635775,
    forestgreen: 579543807,
    fuchsia: 4278255615,
    gainsboro: 3705462015,
    ghostwhite: 4177068031,
    gold: 4292280575,
    goldenrod: 3668254975,
    gray: 2155905279,
    green: 8388863,
    greenyellow: 2919182335,
    grey: 2155905279,
    honeydew: 4043305215,
    hotpink: 4285117695,
    indianred: 3445382399,
    indigo: 1258324735,
    ivory: 4294963455,
    khaki: 4041641215,
    lavender: 3873897215,
    lavenderblush: 4293981695,
    lawngreen: 2096890111,
    lemonchiffon: 4294626815,
    lightblue: 2916673279,
    lightcoral: 4034953471,
    lightcyan: 3774873599,
    lightgoldenrodyellow: 4210742015,
    lightgray: 3553874943,
    lightgreen: 2431553791,
    lightgrey: 3553874943,
    lightpink: 4290167295,
    lightsalmon: 4288707327,
    lightseagreen: 548580095,
    lightskyblue: 2278488831,
    lightslategray: 2005441023,
    lightslategrey: 2005441023,
    lightsteelblue: 2965692159,
    lightyellow: 4294959359,
    lime: 16711935,
    limegreen: 852308735,
    linen: 4210091775,
    magenta: 4278255615,
    maroon: 2147483903,
    mediumaquamarine: 1724754687,
    mediumblue: 52735,
    mediumorchid: 3126187007,
    mediumpurple: 2473647103,
    mediumseagreen: 1018393087,
    mediumslateblue: 2070474495,
    mediumspringgreen: 16423679,
    mediumturquoise: 1221709055,
    mediumvioletred: 3340076543,
    midnightblue: 421097727,
    mintcream: 4127193855,
    mistyrose: 4293190143,
    moccasin: 4293178879,
    navajowhite: 4292783615,
    navy: 33023,
    oldlace: 4260751103,
    olive: 2155872511,
    olivedrab: 1804477439,
    orange: 4289003775,
    orangered: 4282712319,
    orchid: 3664828159,
    palegoldenrod: 4008225535,
    palegreen: 2566625535,
    paleturquoise: 2951671551,
    palevioletred: 3681588223,
    papayawhip: 4293907967,
    peachpuff: 4292524543,
    peru: 3448061951,
    pink: 4290825215,
    plum: 3718307327,
    powderblue: 2967529215,
    purple: 2147516671,
    rebeccapurple: 1714657791,
    red: 4278190335,
    rosybrown: 3163525119,
    royalblue: 1097458175,
    saddlebrown: 2336560127,
    salmon: 4202722047,
    sandybrown: 4104413439,
    seagreen: 780883967,
    seashell: 4294307583,
    sienna: 2689740287,
    silver: 3233857791,
    skyblue: 2278484991,
    slateblue: 1784335871,
    slategray: 1887473919,
    slategrey: 1887473919,
    snow: 4294638335,
    springgreen: 16744447,
    steelblue: 1182971135,
    tan: 3535047935,
    teal: 8421631,
    thistle: 3636451583,
    tomato: 4284696575,
    turquoise: 1088475391,
    violet: 4001558271,
    wheat: 4125012991,
    white: 4294967295,
    whitesmoke: 4126537215,
    yellow: 4294902015,
    yellowgreen: 2597139199
};
function normalizeColor(color) {
    const matchers = getMatchers();
    let match;
    if (matchers.hex6) {
        if (match = matchers.hex6.exec(color)) {
            return Number.parseInt(match[1] + "ff", 16) >>> 0;
        }
    }
    if (colorNames[color] !== undefined) {
        return colorNames[color];
    }
    if (matchers.rgb) {
        if (match = matchers.rgb.exec(color)) {
            return (parse255(match[1]) << 24 | parse255(match[2]) << 16 | parse255(match[3]) << 8 | 255) >>> 0;
        }
    }
    if (matchers.rgba) {
        if (match = matchers.rgba.exec(color)) {
            return (parse255(match[1]) << 24 | parse255(match[2]) << 16 | parse255(match[3]) << 8 | parse1(match[4])) >>> 0;
        }
    }
    if (matchers.hex3) {
        if (match = matchers.hex3.exec(color)) {
            return Number.parseInt(match[1] + match[1] + match[2] + match[2] + match[3] + match[3] + "ff", 16) >>> 0;
        }
    }
    if (matchers.hex8) {
        if (match = matchers.hex8.exec(color)) {
            return Number.parseInt(match[1], 16) >>> 0;
        }
    }
    if (matchers.hex4) {
        if (match = matchers.hex4.exec(color)) {
            return Number.parseInt(match[1] + match[1] + match[2] + match[2] + match[3] + match[3] + match[4] + match[4], 16) >>> 0;
        }
    }
    if (matchers.hsl) {
        if (match = matchers.hsl.exec(color)) {
            return (hslToRgb(parse360(match[1]), parsePercentage(match[2]), parsePercentage(match[3])) | 255) >>> 0;
        }
    }
    if (matchers.hsla) {
        if (match = matchers.hsla.exec(color)) {
            return (hslToRgb(parse360(match[1]), parsePercentage(match[2]), parsePercentage(match[3])) | parse1(match[4])) >>> 0;
        }
    }
    throw new Error(`invalid color string ${color} provided`);
}
function processColor(color) {
    const normalizedColor = normalizeColor(color);
    return (normalizedColor << 24 | normalizedColor >>> 8) >>> 0;
}
// src/v5-flag.ts
var ENABLE_V5_BREAKING_CHANGES = false;
// src/validate-frame.ts
var validateFrame = ({ allowFloats, durationInFrames, frame })=>{
    if (typeof frame === "undefined") {
        throw new TypeError(`Argument missing for parameter "frame"`);
    }
    if (typeof frame !== "number") {
        throw new TypeError(`Argument passed for "frame" is not a number: ${frame}`);
    }
    if (!Number.isFinite(frame)) {
        throw new RangeError(`Frame ${frame} is not finite`);
    }
    if (frame % 1 !== 0 && !allowFloats) {
        throw new RangeError(`Argument for frame must be an integer, but got ${frame}`);
    }
    if (frame < 0 && frame < -durationInFrames) {
        throw new RangeError(`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the lowest frame that can be rendered is ${-durationInFrames}`);
    }
    if (frame > durationInFrames - 1) {
        throw new RangeError(`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the highest frame that can be rendered is ${durationInFrames - 1}`);
    }
};
// src/codec.ts
var validCodecs = [
    "h264",
    "h265",
    "vp8",
    "vp9",
    "mp3",
    "aac",
    "wav",
    "prores",
    "h264-mkv",
    "h264-ts",
    "gif"
];
// src/validation/validate-default-codec.ts
function validateCodec(defaultCodec, location, name) {
    if (typeof defaultCodec === "undefined") {
        return;
    }
    if (typeof defaultCodec !== "string") {
        throw new TypeError(`The "${name}" prop ${location} must be a string, but you passed a value of type ${typeof defaultCodec}.`);
    }
    if (!validCodecs.includes(defaultCodec)) {
        throw new Error(`The "${name}" prop ${location} must be one of ${validCodecs.join(", ")}, but you passed ${defaultCodec}.`);
    }
}
// src/validation/validate-default-props.ts
var validateDefaultAndInputProps = (defaultProps, name, compositionId)=>{
    if (!defaultProps) {
        return;
    }
    if (typeof defaultProps !== "object") {
        throw new Error(`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`);
    }
    if (Array.isArray(defaultProps)) {
        throw new Error(`"${name}" must be an object, an array was passed ${compositionId ? `for composition "${compositionId}"` : ""}`);
    }
};
// src/validation/validate-dimensions.ts
function validateDimension(amount, nameOfProp, location) {
    if (typeof amount !== "number") {
        throw new Error(`The "${nameOfProp}" prop ${location} must be a number, but you passed a value of type ${typeof amount}`);
    }
    if (isNaN(amount)) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must not be NaN, but is NaN.`);
    }
    if (!Number.isFinite(amount)) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be finite, but is ${amount}.`);
    }
    if (amount % 1 !== 0) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be an integer, but is ${amount}.`);
    }
    if (amount <= 0) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be positive, but got ${amount}.`);
    }
}
// src/validation/validate-duration-in-frames.ts
function validateDurationInFrames(durationInFrames, options) {
    const { allowFloats, component } = options;
    if (typeof durationInFrames === "undefined") {
        throw new Error(`The "durationInFrames" prop ${component} is missing.`);
    }
    if (typeof durationInFrames !== "number") {
        throw new Error(`The "durationInFrames" prop ${component} must be a number, but you passed a value of type ${typeof durationInFrames}`);
    }
    if (durationInFrames <= 0) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be positive, but got ${durationInFrames}.`);
    }
    if (!allowFloats && durationInFrames % 1 !== 0) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be an integer, but got ${durationInFrames}.`);
    }
    if (!Number.isFinite(durationInFrames)) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be finite, but got ${durationInFrames}.`);
    }
}
// src/validation/validate-fps.ts
function validateFps(fps, location, isGif) {
    if (typeof fps !== "number") {
        throw new Error(`"fps" must be a number, but you passed a value of type ${typeof fps} ${location}`);
    }
    if (!Number.isFinite(fps)) {
        throw new Error(`"fps" must be a finite, but you passed ${fps} ${location}`);
    }
    if (isNaN(fps)) {
        throw new Error(`"fps" must not be NaN, but got ${fps} ${location}`);
    }
    if (fps <= 0) {
        throw new TypeError(`"fps" must be positive, but got ${fps} ${location}`);
    }
    if (isGif && fps > 50) {
        throw new TypeError(`The FPS for a GIF cannot be higher than 50. Use the --every-nth-frame option to lower the FPS: https://remotion.dev/docs/render-as-gif`);
    }
}
// src/video/get-current-time.ts
var getExpectedMediaFrameUncorrected = ({ frame, playbackRate, startFrom })=>{
    return interpolate(frame, [
        -1,
        startFrom,
        startFrom + 1
    ], [
        -1,
        startFrom,
        startFrom + playbackRate
    ]);
};
// src/absolute-src.ts
var getAbsoluteSrc = (relativeSrc)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (relativeSrc.startsWith("http://") || relativeSrc.startsWith("https://") || relativeSrc.startsWith("file://") || relativeSrc.startsWith("blob:") || relativeSrc.startsWith("data:")) {
        return relativeSrc;
    }
    return new URL(relativeSrc, window.origin).href;
};
// src/video/offthread-video-source.ts
var getOffthreadVideoSource = ({ src, transparent, currentTime, toneMapped })=>{
    return `http://localhost:${window.remotion_proxyPort}/proxy?src=${encodeURIComponent(getAbsoluteSrc(src))}&time=${encodeURIComponent(Math.max(0, currentTime))}&transparent=${String(transparent)}&toneMapped=${String(toneMapped)}`;
};
// src/no-react.ts
var NoReactInternals = {
    processColor,
    truthy,
    validateFps,
    validateDimension,
    validateDurationInFrames,
    validateDefaultAndInputProps,
    validateFrame,
    serializeJSONWithSpecialTypes,
    bundleName: "bundle.js",
    bundleMapName: "bundle.js.map",
    deserializeJSONWithSpecialTypes,
    DELAY_RENDER_CALLSTACK_TOKEN,
    DELAY_RENDER_RETRY_TOKEN,
    DELAY_RENDER_CLEAR_TOKEN,
    DELAY_RENDER_ATTEMPT_TOKEN: DELAY_RENDER_RETRIES_LEFT,
    getOffthreadVideoSource,
    getExpectedMediaFrameUncorrected,
    ENABLE_V5_BREAKING_CHANGES,
    MIN_NODE_VERSION: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 16,
    MIN_BUN_VERSION: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "1.0.3",
    colorNames,
    DATE_TOKEN,
    FILE_TOKEN,
    validateCodec
};
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=packages_core_dist_esm_e3be2315._.js.map