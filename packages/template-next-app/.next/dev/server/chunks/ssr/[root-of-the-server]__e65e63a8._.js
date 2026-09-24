module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
// src/_check-rsc.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
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
if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"] !== "function") {
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
    const isPlayer = ("TURBOPACK compile-time value", "undefined") !== "undefined" && window.remotion_isPlayer;
    const isRendering = ("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof window.process !== "undefined" && typeof window.process.env !== "undefined" && (window.process[getEnvString()][getNodeEnvString()] === "test" || window.process[getEnvString()][getNodeEnvString()] === "production" && ("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof window.remotion_puppeteerTimeout !== "undefined");
    const isStudio = ("TURBOPACK compile-time value", "undefined") !== "undefined" && window.remotion_isStudio;
    const isReadOnlyStudio = ("TURBOPACK compile-time value", "undefined") !== "undefined" && window.remotion_isReadOnlyStudio;
    return {
        isStudio,
        isRendering,
        isPlayer,
        isReadOnlyStudio,
        isClientSideRendering: false
    };
};
// src/enable-sequence-stack-traces.ts
var originalCreateElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement;
var originalJsx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].jsx;
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
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement = enableProxy(originalCreateElement);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].jsx = enableProxy(originalJsx);
};
var addSequenceStackTraces = (component)=>{
    componentsToAddStacksTo.push(component);
    enableSequenceStackTraces();
};
;
;
var IsPlayerContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(false);
var IsPlayerContextProvider = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(IsPlayerContext.Provider, {
        value: true,
        children
    });
};
var useIsPlayer = ()=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(IsPlayerContext);
};
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    };
    const alreadyImported = globalThis.remotion_imported || ("TURBOPACK compile-time value", "undefined") !== "undefined" && window.remotion_imported;
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
    const { style, ...other } = props;
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
        other.className,
        style
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref,
        style: actualStyle,
        ...other
    });
};
var AbsoluteFill = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(AbsoluteFillRefForwarding);
;
var SequenceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
;
;
var SequenceManager = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext({
    registerSequence: ()=>{
        throw new Error("SequenceManagerContext not initialized");
    },
    unregisterSequence: ()=>{
        throw new Error("SequenceManagerContext not initialized");
    },
    sequences: []
});
var SequenceVisibilityToggleContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext({
    hidden: {},
    setHidden: ()=>{
        throw new Error("SequenceVisibilityToggle not initialized");
    }
});
var SequenceManagerProvider = ({ children })=>{
    const [sequences, setSequences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hidden, setHidden] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const registerSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((seq)=>{
        setSequences((seqs)=>{
            return [
                ...seqs,
                seq
            ];
        });
    }, []);
    const unregisterSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((seq)=>{
        setSequences((seqs)=>seqs.filter((s)=>s.id !== seq));
    }, []);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            registerSequence,
            sequences,
            unregisterSequence
        };
    }, [
        registerSequence,
        sequences,
        unregisterSequence
    ]);
    const hiddenContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            hidden,
            setHidden
        };
    }, [
        hidden
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceManager.Provider, {
        value: sequenceContext,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceVisibilityToggleContext.Provider, {
            value: hiddenContext,
            children
        })
    });
};
;
var NonceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    getNonce: ()=>0,
    fastRefreshes: 0,
    manualRefreshes: 0
});
var SetNonceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    increaseManualRefreshes: ()=>{}
});
var useNonce = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(NonceContext);
    const [nonce, setNonce] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>context.getNonce());
    const lastContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(context);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (lastContext.current === context) {
            return;
        }
        lastContext.current = context;
        setNonce(context.getNonce);
    }, [
        context
    ]);
    return nonce;
};
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
var RemotionEnvironmentContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
// src/use-remotion-environment.ts
var useRemotionEnvironment = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(RemotionEnvironmentContext);
    const [env] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getRemotionEnvironment());
    return context ?? env;
};
;
;
var CompositionManager = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    compositions: [],
    folders: [],
    currentCompositionMetadata: null,
    canvasContent: null
});
var CompositionSetters = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
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
var EditorPropsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    props: {},
    updateProps: ()=>{
        throw new Error("Not implemented");
    },
    resetUnsaved: ()=>{
        throw new Error("Not implemented");
    }
});
var editorPropsProviderRef = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createRef();
var timeValueRef = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createRef();
var EditorPropsProvider = ({ children })=>{
    const [props, setProps] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({});
    const updateProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(({ defaultProps, id, newProps })=>{
        setProps((prev)=>{
            return {
                ...prev,
                [id]: typeof newProps === "function" ? newProps(prev[id] ?? defaultProps) : newProps
            };
        });
    }, []);
    const resetUnsaved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((compositionId)=>{
        setProps((prev)=>{
            if (prev[compositionId]) {
                const newProps = {
                    ...prev
                };
                delete newProps[compositionId];
                return newProps;
            }
            return prev;
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(editorPropsProviderRef, ()=>{
        return {
            getProps: ()=>props,
            setProps
        };
    }, [
        props
    ]);
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            props,
            updateProps,
            resetUnsaved
        };
    }, [
        props,
        resetUnsaved,
        updateProps
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(EditorPropsContext.Provider, {
        value: ctx,
        children
    });
};
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
    if ("TURBOPACK compile-time truthy", 1) {
        warnOnceSSRImport();
        return {};
    }
    //TURBOPACK unreachable
    ;
    const override = undefined;
    const param = undefined;
    const parsed = undefined;
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
var ResolveCompositionContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
var resolveCompositionsRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRef"])();
var needsResolution = (composition)=>{
    return Boolean(composition.calculateMetadata);
};
var PROPS_UPDATED_EXTERNALLY = "remotion.propsUpdatedExternally";
var ResolveCompositionConfig = ({ children })=>{
    const [currentRenderModalComposition, setCurrentRenderModalComposition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompositionManager);
    const { fastRefreshes, manualRefreshes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(NonceContext);
    if (manualRefreshes) {}
    const selectedComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return compositions.find((c)=>canvasContent && canvasContent.type === "composition" && canvasContent.compositionId === c.id);
    }, [
        canvasContent,
        compositions
    ]);
    const renderModalComposition = compositions.find((c)=>c.id === currentRenderModalComposition);
    const { props: allEditorProps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(EditorPropsContext);
    const env = useRemotionEnvironment();
    const inputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return ("TURBOPACK compile-time truthy", 1) ? {} : "TURBOPACK unreachable";
    }, [
        env.isPlayer
    ]);
    const [resolvedConfigs, setResolvedConfigs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const selectedEditorProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return selectedComposition ? allEditorProps[selectedComposition.id] ?? {} : {};
    }, [
        allEditorProps,
        selectedComposition
    ]);
    const renderModalProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return renderModalComposition ? allEditorProps[renderModalComposition.id] ?? {} : {};
    }, [
        allEditorProps,
        renderModalComposition
    ]);
    const hasResolution = Boolean(currentCompositionMetadata);
    const doResolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(({ calculateMetadata, combinedProps, compositionDurationInFrames, compositionFps, compositionHeight, compositionId, compositionWidth, defaultProps })=>{
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
            setResolvedConfigs((r)=>({
                    ...r,
                    [compositionId]: {
                        type: "error",
                        error: result.error
                    }
                }));
            return controller;
        }
        const promOrNot = result.result;
        if (typeof promOrNot === "object" && "then" in promOrNot) {
            setResolvedConfigs((r)=>{
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
            });
            promOrNot.then((c)=>{
                if (controller.signal.aborted) {
                    return;
                }
                setResolvedConfigs((r)=>({
                        ...r,
                        [compositionId]: {
                            type: "success",
                            result: c
                        }
                    }));
            }).catch((err)=>{
                if (controller.signal.aborted) {
                    return;
                }
                setResolvedConfigs((r)=>({
                        ...r,
                        [compositionId]: {
                            type: "error",
                            error: err
                        }
                    }));
            });
        } else {
            setResolvedConfigs((r)=>({
                    ...r,
                    [compositionId]: {
                        type: "success",
                        result: promOrNot
                    }
                }));
        }
        return controller;
    }, [
        hasResolution
    ]);
    const currentComposition = canvasContent?.type === "composition" ? canvasContent.compositionId : null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(resolveCompositionsRef, ()=>{
        return {
            setCurrentRenderModalComposition: (id)=>{
                setCurrentRenderModalComposition(id);
            },
            reloadCurrentlySelectedComposition: ()=>{
                if (!currentComposition) {
                    return;
                }
                const composition = compositions.find((c)=>c.id === currentComposition);
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
        };
    }, [
        allEditorProps,
        compositions,
        currentComposition,
        doResolution,
        inputProps
    ]);
    const isTheSame = selectedComposition?.id === renderModalComposition?.id;
    const currentDefaultProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            ...selectedComposition?.defaultProps ?? {},
            ...selectedEditorProps ?? {}
        };
    }, [
        selectedComposition?.defaultProps,
        selectedEditorProps
    ]);
    const originalProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            ...currentDefaultProps,
            ...inputProps ?? {}
        };
    }, [
        currentDefaultProps,
        inputProps
    ]);
    const canResolve = selectedComposition && needsResolution(selectedComposition);
    const shouldIgnoreUpdate = ("TURBOPACK compile-time value", "undefined") !== "undefined" && window.remotion_ignoreFastRefreshUpdate && fastRefreshes <= window.remotion_ignoreFastRefreshUpdate;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
            return ()=>{
                controller.abort();
            };
        }
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
            return ()=>{
                controller.abort();
            };
        }
    }, [
        currentDefaultProps,
        doResolution,
        inputProps,
        isTheSame,
        renderModalComposition,
        renderModalProps
    ]);
    const resolvedConfigsIncludingStaticOnes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const staticComps = compositions.filter((c)=>{
            return c.calculateMetadata === null;
        });
        return {
            ...resolvedConfigs,
            ...staticComps.reduce((acc, curr)=>{
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
            }, {})
        };
    }, [
        compositions,
        resolvedConfigs
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ResolveCompositionContext.Provider, {
        value: resolvedConfigsIncludingStaticOnes,
        children
    });
};
var useResolvedVideoConfig = (preferredCompositionId)=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ResolveCompositionContext);
    const { props: allEditorProps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(EditorPropsContext);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompositionManager);
    const currentComposition = canvasContent?.type === "composition" ? canvasContent.compositionId : null;
    const compositionId = preferredCompositionId ?? currentComposition;
    const composition = compositions.find((c)=>c.id === compositionId);
    const selectedEditorProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return composition ? allEditorProps[composition.id] ?? {} : {};
    }, [
        allEditorProps,
        composition
    ]);
    const env = useRemotionEnvironment();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
                        ...("TURBOPACK compile-time truthy", 1) ? {} : "TURBOPACK unreachable"
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
    }, [
        composition,
        context,
        currentCompositionMetadata,
        selectedEditorProps,
        env.isPlayer
    ]);
};
// src/use-video.ts
var useVideo = ()=>{
    const { canvasContent, compositions, currentCompositionMetadata } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompositionManager);
    const selected = compositions.find((c)=>{
        return canvasContent?.type === "composition" && c.id === canvasContent.compositionId;
    });
    const resolved = useResolvedVideoConfig(selected?.id ?? null);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
        currentCompositionMetadata,
        resolved,
        selected
    ]);
};
// src/timeline-position-state.ts
var TimelineContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
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
var SetTimelineContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
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
    if ("TURBOPACK compile-time truthy", 1) {
        return 0;
    }
    //TURBOPACK unreachable
    ;
};
var useTimelinePosition = ()=>{
    const videoConfig = useVideo();
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const env = useRemotionEnvironment();
    if (!videoConfig) {
        return ("TURBOPACK compile-time truthy", 1) ? 0 : "TURBOPACK unreachable";
    }
    const unclamped = state.frame[videoConfig.id] ?? (env.isPlayer ? 0 : getFrameForComposition(videoConfig.id));
    return Math.min(videoConfig.durationInFrames - 1, unclamped);
};
var useTimelineSetFrame = ()=>{
    const { setFrame } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SetTimelineContext);
    return setFrame;
};
var usePlayingState = ()=>{
    const { playing, imperativePlaying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const { setPlaying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SetTimelineContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            playing,
            setPlaying,
            imperativePlaying
        ], [
        imperativePlaying,
        playing,
        setPlaying
    ]);
};
;
;
;
var CanUseRemotionHooks = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(false);
var CanUseRemotionHooksProvider = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooks.Provider, {
        value: true,
        children
    });
};
;
var useUnsafeVideoConfig = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const ctxWidth = context?.width ?? null;
    const ctxHeight = context?.height ?? null;
    const ctxDuration = context?.durationInFrames ?? null;
    const video = useVideo();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
        ctxDuration,
        ctxHeight,
        ctxWidth,
        video
    ]);
};
// src/use-video-config.ts
var useVideoConfig = ()=>{
    const videoConfig = useUnsafeVideoConfig();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CanUseRemotionHooks);
    const isPlayer = useIsPlayer();
    if (!videoConfig) {
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && window.remotion_isPlayer || isPlayer) {
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
;
;
var useCurrentFrame = ()=>{
    const canUseRemotionHooks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CanUseRemotionHooks);
    const env = useRemotionEnvironment();
    if (!canUseRemotionHooks) {
        if (env.isPlayer) {
            throw new Error(`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`);
        }
        throw new Error(`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`);
    }
    const frame = useTimelinePosition();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const contextOffset = context ? context.cumulatedFrom + context.relativeFrom : 0;
    return frame - contextOffset;
};
;
var Freeze = ({ frame: frameToFreeze, children, active = true })=>{
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
    const isActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (typeof active === "boolean") {
            return active;
        }
        if (typeof active === "function") {
            return active(frame);
        }
    }, [
        active,
        frame
    ]);
    const timelineContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const relativeFrom = sequenceContext?.relativeFrom ?? 0;
    const timelineValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
        isActive,
        timelineContext,
        videoConfig.id,
        frameToFreeze,
        relativeFrom
    ]);
    const newSequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
        sequenceContext,
        isActive
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(TimelineContext.Provider, {
        value: timelineValue,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceContext.Provider, {
            value: newSequenceContext,
            children
        })
    });
};
;
var RegularSequenceRefForwardingFunction = ({ from = 0, durationInFrames = Infinity, children, name, height, width, showInTimeline = true, _remotionInternalLoopDisplay: loopDisplay, _remotionInternalStack: stack, _remotionInternalPremountDisplay: premountDisplay, _remotionInternalPostmountDisplay: postmountDisplay, ...other }, ref)=>{
    const { layout = "absolute-fill" } = other;
    const [id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>String(Math.random()));
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const { rootId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
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
    const { registerSequence, unregisterSequence } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceManager);
    const { hidden } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceVisibilityToggleContext);
    const premounting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return parentSequence?.premounting || Boolean(other._remotionInternalIsPremounting);
    }, [
        other._remotionInternalIsPremounting,
        parentSequence?.premounting
    ]);
    const postmounting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return parentSequence?.postmounting || Boolean(other._remotionInternalIsPostmounting);
    }, [
        other._remotionInternalIsPostmounting,
        parentSequence?.postmounting
    ]);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
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
    const timelineClipName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return name ?? "";
    }, [
        name
    ]);
    const env = useRemotionEnvironment();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>{
            unregisterSequence(id);
        };
    }, [
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
    const defaultStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
    }, [
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
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceContext.Provider, {
        value: contextValue,
        children: content === null ? null : other.layout === "none" ? content : /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(AbsoluteFill, {
            ref,
            style: defaultStyle,
            className: other.className,
            children: content
        })
    });
};
var RegularSequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(RegularSequenceRefForwardingFunction);
var PremountedPostmountedSequenceRefForwardingFunction = (props, ref)=>{
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
    const style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            ...passedStyle,
            opacity: premountingActive || postmountingActive ? 0 : 1,
            pointerEvents: premountingActive || postmountingActive ? "none" : passedStyle?.pointerEvents ?? undefined,
            ...premountingActive ? styleWhilePremounted : {},
            ...postmountingActive ? styleWhilePostmounted : {}
        };
    }, [
        passedStyle,
        premountingActive,
        postmountingActive,
        styleWhilePremounted,
        styleWhilePostmounted
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Freeze, {
        frame: freezeFrame,
        active: isFreezingActive,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
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
var PremountedPostmountedSequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(PremountedPostmountedSequenceRefForwardingFunction);
var SequenceRefForwardingFunction = (props, ref)=>{
    const env = useRemotionEnvironment();
    if (props.layout !== "none" && !env.isRendering) {
        if (props.premountFor || props.postmountFor) {
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PremountedPostmountedSequence, {
                ...props,
                ref
            });
        }
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RegularSequence, {
        ...props,
        ref
    });
};
var Sequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(SequenceRefForwardingFunction);
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
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
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
        const timeoutToUse = (options?.timeoutInMilliseconds ?? (("TURBOPACK compile-time truthy", 1) ? defaultTimeout : "TURBOPACK unreachable")) - 2000;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
};
var continueRender = (handle)=>{
    continueRenderInternal(handle, getRemotionEnvironment());
};
// src/use-delay-render.ts
var useDelayRender = ()=>{
    const environment = useRemotionEnvironment();
    const delayRender2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((label, options)=>{
        return delayRenderInternal(environment, label, options);
    }, [
        environment
    ]);
    const continueRender2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((handle)=>{
        continueRenderInternal(handle, environment);
    }, [
        environment
    ]);
    return {
        delayRender: delayRender2,
        continueRender: continueRender2
    };
};
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
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const draw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((imageData)=>{
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
    }, [
        fit,
        height,
        width
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        return {
            draw,
            getCanvas: ()=>{
                if (!canvasRef.current) {
                    throw new Error("Canvas ref is not set");
                }
                return canvasRef.current;
            },
            clear: ()=>{
                const ctx = canvasRef.current?.getContext("2d");
                if (!ctx) {
                    throw new Error("Could not get 2d context");
                }
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        };
    }, [
        draw
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("canvas", {
        ref: canvasRef,
        className,
        style
    });
};
var Canvas = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].forwardRef(CanvasRefForwardingFunction);
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
    if ("TURBOPACK compile-time truthy", 1) {
        return src;
    }
    //TURBOPACK unreachable
    ;
};
;
var AnimatedImage = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ src, width, height, onError, loopBehavior = "loop", playbackRate = 1, fit = "fill", ...props }, canvasRef)=>{
    const mountState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        isMounted: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = mountState;
        current.isMounted = true;
        return ()=>{
            current.isMounted = false;
        };
    }, []);
    const resolvedSrc = resolveAnimatedImageSource(src);
    const [imageDecoder, setImageDecoder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const [decodeHandle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>delayRender2(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`));
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / playbackRate / fps;
    const currentTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(currentTime);
    currentTimeRef.current = currentTime;
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(canvasRef, ()=>{
        const c = ref.current?.getCanvas();
        if (!c) {
            throw new Error("Canvas ref is not set");
        }
        return c;
    }, []);
    const [initialLoopBehavior] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>loopBehavior);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController;
        decodeImage({
            resolvedSrc,
            signal: controller.signal,
            currentTime: currentTimeRef.current,
            initialLoopBehavior
        }).then((d)=>{
            setImageDecoder(d);
            continueRender2(decodeHandle);
        }).catch((err)=>{
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
        });
        return ()=>{
            controller.abort();
        };
    }, [
        resolvedSrc,
        decodeHandle,
        onError,
        initialLoopBehavior,
        continueRender2
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if (!imageDecoder) {
            return;
        }
        const delay = delayRender2(`Rendering frame at ${currentTime} of <AnimatedImage src="${src}"/>`);
        imageDecoder.getFrame(currentTime, loopBehavior).then((videoFrame)=>{
            if (mountState.current.isMounted) {
                if (videoFrame === null) {
                    ref.current?.clear();
                } else {
                    ref.current?.draw(videoFrame.frame);
                }
            }
            continueRender2(delay);
        }).catch((err)=>{
            if (onError) {
                onError(err);
                continueRender2(delay);
            } else {
                cancelRender(err);
            }
        });
    }, [
        currentTime,
        imageDecoder,
        loopBehavior,
        onError,
        src,
        continueRender2,
        delayRender2
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Canvas, {
        ref,
        width,
        height,
        fit,
        ...props
    });
});
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
var RenderAssetManager = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    registerRenderAsset: ()=>{
        return;
    },
    unregisterRenderAsset: ()=>{
        return;
    },
    renderAssets: []
});
var RenderAssetManagerProvider = ({ children })=>{
    const [renderAssets, setRenderAssets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const registerRenderAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((renderAsset)=>{
        validateRenderAsset(renderAsset);
        setRenderAssets((assets)=>{
            return [
                ...assets,
                renderAsset
            ];
        });
    }, []);
    const unregisterRenderAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setRenderAssets((assts)=>{
            return assts.filter((a)=>a.id !== id);
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, [
        renderAssets
    ]);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            registerRenderAsset,
            unregisterRenderAsset,
            renderAssets
        };
    }, [
        renderAssets,
        registerRenderAsset,
        unregisterRenderAsset
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderAssetManager.Provider, {
        value: contextValue,
        children
    });
};
// src/Artifact.tsx
var ArtifactThumbnail = Symbol("Thumbnail");
var Artifact = ({ filename, content, downloadBehavior })=>{
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    const env = useRemotionEnvironment();
    const frame = useCurrentFrame();
    const [id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        return String(Math.random());
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>{
            return unregisterRenderAsset(id);
        };
    }, [
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
Artifact.Thumbnail = ArtifactThumbnail;
;
// src/absolute-src.ts
var getAbsoluteSrc = (relativeSrc)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return relativeSrc;
    }
    //TURBOPACK unreachable
    ;
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
var LoopContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
var useLoop = ()=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(LoopContext);
};
var Loop = ({ durationInFrames, times = Infinity, children, name, ...props })=>{
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
    const loopDisplay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            numberOfTimes: actualTimes,
            startOffset: -from,
            durationInFrames
        };
    }, [
        actualTimes,
        durationInFrames,
        from
    ]);
    const loopContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            iteration: Math.floor(currentFrame / durationInFrames),
            durationInFrames
        };
    }, [
        currentFrame,
        durationInFrames
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(LoopContext.Provider, {
        value: loopContext,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
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
var PreloadContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({});
var preloads = {};
var updaters = [];
var setPreloads = (updater)=>{
    preloads = updater(preloads);
    updaters.forEach((u)=>u());
};
var PrefetchProvider = ({ children })=>{
    const [_preloads, _setPreloads] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>preloads);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const updaterFunction = ()=>{
            _setPreloads(preloads);
        };
        updaters.push(updaterFunction);
        return ()=>{
            updaters = updaters.filter((u)=>u !== updaterFunction);
        };
    }, []);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PreloadContext.Provider, {
        value: _preloads,
        children
    });
};
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
    const preloads2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PreloadContext);
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
var DurationsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    durations: {},
    setDurations: ()=>{
        throw new Error("context missing");
    }
});
var DurationsContextProvider = ({ children })=>{
    const [durations, setDurations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(durationReducer, {});
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            durations,
            setDurations
        };
    }, [
        durations
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(DurationsContext.Provider, {
        value,
        children
    });
};
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
var LogLevelContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    logLevel: "info",
    mountTime: 0
});
var useLogLevel = ()=>{
    const { logLevel } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](LogLevelContext);
    if (logLevel === null) {
        throw new Error("useLogLevel must be used within a LogLevelProvider");
    }
    return logLevel;
};
var useMountTime = ()=>{
    const { mountTime } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](LogLevelContext);
    if (mountTime === null) {
        throw new Error("useMountTime must be used within a LogLevelProvider");
    }
    return mountTime;
};
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
};
var useSingletonAudioContext = (logLevel, latencyHint)=>{
    const audioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (typeof AudioContext === "undefined") {
            warnOnce(logLevel);
            return null;
        }
        return new AudioContext({
            latencyHint
        });
    }, [
        logLevel,
        latencyHint
    ]);
    return audioContext;
};
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
var SharedAudioContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
var SharedAudioContextProvider = ({ children, numberOfAudioTags, component, audioLatencyHint })=>{
    const audios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const [initialNumberOfAudioTags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(numberOfAudioTags);
    if (numberOfAudioTags !== initialNumberOfAudioTags) {
        throw new Error("The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.");
    }
    const logLevel = useLogLevel();
    const audioContext = useSingletonAudioContext(logLevel, audioLatencyHint);
    const refs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return new Array(numberOfAudioTags).fill(true).map(()=>{
            const ref = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRef"])();
            return {
                id: Math.random(),
                ref,
                mediaElementSourceNode: audioContext ? makeSharedElementSourceNode({
                    audioContext,
                    ref
                }) : null
            };
        });
    }, [
        audioContext,
        numberOfAudioTags
    ]);
    const takenAudios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Array(numberOfAudioTags).fill(false));
    const rerenderAudios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        refs.forEach(({ ref, id })=>{
            const data = audios.current?.find((a)=>a.id === id);
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
            Object.keys(data.props).forEach((key)=>{
                if (didPropChange(key, data.props[key], current[key])) {
                    current[key] = data.props[key];
                }
            });
        });
    }, [
        refs
    ]);
    const registerAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((options)=>{
        const { aud, audioId, premounting } = options;
        const found = audios.current?.find((a)=>a.audioId === audioId);
        if (found) {
            return found;
        }
        const firstFreeAudio = takenAudios.current.findIndex((a)=>a === false);
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
    }, [
        numberOfAudioTags,
        refs,
        rerenderAudios
    ]);
    const unregisterAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        const cloned = [
            ...takenAudios.current
        ];
        const index = refs.findIndex((r)=>r.id === id);
        if (index === -1) {
            throw new TypeError("Error occured in ");
        }
        cloned[index] = false;
        takenAudios.current = cloned;
        audios.current = audios.current?.filter((a)=>a.id !== id);
        rerenderAudios();
    }, [
        refs,
        rerenderAudios
    ]);
    const updateAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(({ aud, audioId, id, premounting })=>{
        let changed = false;
        audios.current = audios.current?.map((prevA)=>{
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
        });
        if (changed) {
            rerenderAudios();
        }
    }, [
        rerenderAudios
    ]);
    const mountTime = useMountTime();
    const env = useRemotionEnvironment();
    const playAllAudios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        refs.forEach((ref)=>{
            const audio = audios.current.find((a)=>a.el === ref.ref);
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
        });
        audioContext?.resume();
    }, [
        audioContext,
        logLevel,
        mountTime,
        refs,
        env.isPlayer
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            registerAudio,
            unregisterAudio,
            updateAudio,
            playAllAudios,
            numberOfAudioTags,
            audioContext
        };
    }, [
        numberOfAudioTags,
        playAllAudios,
        registerAudio,
        unregisterAudio,
        updateAudio,
        audioContext
    ]);
    const resetAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        takenAudios.current = new Array(numberOfAudioTags).fill(false);
        audios.current = [];
        rerenderAudios();
    }, [
        numberOfAudioTags,
        rerenderAudios
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            resetAudio();
        };
    }, [
        component,
        resetAudio
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(SharedAudioContext.Provider, {
        value,
        children: [
            refs.map(({ id, ref })=>{
                return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("audio", {
                    ref,
                    preload: "metadata",
                    src: EMPTY_AUDIO
                }, id);
            }),
            children
        ]
    });
};
var useSharedAudio = ({ aud, audioId, premounting })=>{
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    const [elem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if (ctx && ctx.numberOfAudioTags > 0) {
            return ctx.registerAudio({
                aud,
                audioId,
                premounting
            });
        }
        const el = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createRef();
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
    });
    const effectToUse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useInsertionEffect ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useLayoutEffect;
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
    if ("TURBOPACK compile-time truthy", 1) {
        return false;
    }
    //TURBOPACK unreachable
    ;
    const isAppleWebKit = undefined;
    const isNotChrome = undefined;
};
var isIosSafari = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return false;
    }
    //TURBOPACK unreachable
    ;
    const isIpadIPodIPhone = undefined;
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
    const existingHash = Boolean(new URL(actualSrc, (("TURBOPACK compile-time truthy", 1) ? null : "TURBOPACK unreachable") ?? "http://localhost:3000").hash);
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
    const actualFromRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(initialActualFrom);
    const actualDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(initialDuration);
    const actualSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(initialActualSrc);
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
    const audioStuffRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentVolumeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(volume);
    currentVolumeRef.current = volume;
    const sharedAudioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    if (!sharedAudioContext) {
        throw new Error("useAmplification must be used within a SharedAudioContext");
    }
    const { audioContext } = sharedAudioContext;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
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
;
;
var useMediaStartsAt = ()=>{
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);
    return startsAt;
};
var useFrameForVolumeProp = (behavior)=>{
    const loop = Loop.useLoop();
    const frame = useCurrentFrame();
    const startsAt = useMediaStartsAt();
    if (behavior === "repeat" || loop === null) {
        return frame + startsAt;
    }
    return frame + startsAt + loop.durationInFrames * loop.iteration;
};
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
    if (!src) {
        throw new Error("No src passed");
    }
    const startsAt = useMediaStartsAt();
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const videoConfig = useVideoConfig();
    const [initialVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>volume);
    const mediaDuration = calculateMediaDuration({
        mediaDurationInFrames: videoConfig.durationInFrames,
        playbackRate,
        trimBefore,
        trimAfter
    });
    const duration = parentSequence ? Math.min(parentSequence.durationInFrames, mediaDuration) : mediaDuration;
    const volumes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (typeof volume === "number") {
            return volume;
        }
        return new Array(Math.floor(Math.max(0, duration + startsAt))).fill(true).map((_, i)=>{
            return evaluateVolume({
                frame: i + startsAt,
                volume,
                mediaVolume
            });
        }).join(",");
    }, [
        duration,
        startsAt,
        volume,
        mediaVolume
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (typeof volume === "number" && volume !== initialVolume) {
            warnOnce2(`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/audio/volume`);
        }
    }, [
        initialVolume,
        mediaType,
        src,
        volume
    ]);
    const doesVolumeChange = typeof volume === "function";
    const nonce = useNonce();
    const { rootId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
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
var useMediaInTimeline = ({ volume, mediaVolume, src, mediaType, playbackRate, displayName, id, stack, showInTimeline, premountDisplay, postmountDisplay, loopDisplay })=>{
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const startsAt = useMediaStartsAt();
    const { registerSequence, unregisterSequence } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceManager);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>{
            unregisterSequence(id);
        };
    }, [
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
;
;
;
;
;
var useBufferManager = (logLevel, mountTime)=>{
    const [blocks, setBlocks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [onBufferingCallbacks, setOnBufferingCallbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [onResumeCallbacks, setOnResumeCallbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const buffering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const addBlock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((block)=>{
        setBlocks((b)=>[
                ...b,
                block
            ]);
        return {
            unblock: ()=>{
                setBlocks((b)=>{
                    const newArr = b.filter((bx)=>bx !== block);
                    if (newArr.length === b.length) {
                        return b;
                    }
                    return newArr;
                });
            }
        };
    }, []);
    const listenForBuffering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((callback)=>{
        setOnBufferingCallbacks((c)=>[
                ...c,
                callback
            ]);
        return {
            remove: ()=>{
                setOnBufferingCallbacks((c)=>c.filter((cb)=>cb !== callback));
            }
        };
    }, []);
    const listenForResume = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((callback)=>{
        setOnResumeCallbacks((c)=>[
                ...c,
                callback
            ]);
        return {
            remove: ()=>{
                setOnResumeCallbacks((c)=>c.filter((cb)=>cb !== callback));
            }
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (blocks.length > 0) {
            onBufferingCallbacks.forEach((c)=>c());
            playbackLogging({
                logLevel,
                message: "Player is entering buffer state",
                mountTime,
                tag: "player"
            });
        }
    }, [
        blocks
    ]);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            addBlock,
            listenForBuffering,
            listenForResume,
            buffering
        };
    }, [
        addBlock,
        buffering,
        listenForBuffering,
        listenForResume
    ]);
};
var BufferingContextReact = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
var BufferingProvider = ({ children })=>{
    const { logLevel, mountTime } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LogLevelContext);
    const bufferManager = useBufferManager(logLevel ?? "info", mountTime);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(BufferingContextReact.Provider, {
        value: bufferManager,
        children
    });
};
var useIsPlayerBuffering = (bufferManager)=>{
    const [isBuffering, setIsBuffering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(bufferManager.buffering.current);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onBuffer = ()=>{
            setIsBuffering(true);
        };
        const onResume = ()=>{
            setIsBuffering(false);
        };
        bufferManager.listenForBuffering(onBuffer);
        bufferManager.listenForResume(onResume);
        return ()=>{
            bufferManager.listenForBuffering(()=>{
                return;
            });
            bufferManager.listenForResume(()=>{
                return;
            });
        };
    }, [
        bufferManager
    ]);
    return isBuffering;
};
// src/use-buffer-state.ts
var useBufferState = ()=>{
    const buffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(BufferingContextReact);
    const addBlock = buffer ? buffer.addBlock : null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            delayPlayback: ()=>{
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
        }), [
        addBlock
    ]);
};
// src/buffer-until-first-frame.ts
var isSafariWebkit = ()=>{
    const isSafari2 = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    return isSafari2;
};
var useBufferUntilFirstFrame = ({ mediaRef, mediaType, onVariableFpsVideoDetected, pauseWhenBuffering, logLevel, mountTime })=>{
    const bufferingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const { delayPlayback } = useBufferState();
    const bufferUntilFirstFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((requestedTime)=>{
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
        const unblock = ()=>{
            playback.unblock();
            current.removeEventListener("ended", unblock, {
                once: true
            });
            current.removeEventListener("pause", unblock, {
                once: true
            });
            bufferingRef.current = false;
        };
        const onEndedOrPauseOrCanPlay = ()=>{
            unblock();
        };
        current.requestVideoFrameCallback((_, info2)=>{
            const differenceFromRequested = Math.abs(info2.mediaTime - requestedTime);
            if (differenceFromRequested > 0.5) {
                onVariableFpsVideoDetected();
            }
            unblock();
        });
        current.addEventListener("ended", onEndedOrPauseOrCanPlay, {
            once: true
        });
        current.addEventListener("pause", onEndedOrPauseOrCanPlay, {
            once: true
        });
        current.addEventListener("canplay", onEndedOrPauseOrCanPlay, {
            once: true
        });
    }, [
        delayPlayback,
        logLevel,
        mediaRef,
        mediaType,
        mountTime,
        onVariableFpsVideoDetected,
        pauseWhenBuffering
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            isBuffering: ()=>bufferingRef.current,
            bufferUntilFirstFrame
        };
    }, [
        bufferUntilFirstFrame
    ]);
};
;
var useCurrentTimeOfMediaTagWithUpdateTimeStamp = (mediaRef)=>{
    const lastUpdate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef({
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
    const buffer = useBufferState();
    const [isBuffering, setIsBuffering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        const cleanup = (reason)=>{
            let didDoSomething = false;
            cleanupFns.forEach((fn)=>{
                fn(reason);
                didDoSomething = true;
            });
            cleanupFns = [];
            setIsBuffering((previous)=>{
                if (previous) {
                    didDoSomething = true;
                }
                return false;
            });
            if (didDoSomething) {
                playbackLogging({
                    logLevel,
                    message: `Unmarking as buffering: ${current.src}. Reason: ${reason}`,
                    tag: "buffer",
                    mountTime
                });
            }
        };
        const blockMedia = (reason)=>{
            setIsBuffering(true);
            playbackLogging({
                logLevel,
                message: `Marking as buffering: ${current.src}. Reason: ${reason}`,
                tag: "buffer",
                mountTime
            });
            const { unblock } = buffer.delayPlayback();
            const onCanPlay = ()=>{
                cleanup('"canplay" was fired');
                init();
            };
            const onError = ()=>{
                cleanup('"error" event was occurred');
                init();
            };
            current.addEventListener("canplay", onCanPlay, {
                once: true
            });
            cleanupFns.push(()=>{
                current.removeEventListener("canplay", onCanPlay);
            });
            current.addEventListener("error", onError, {
                once: true
            });
            cleanupFns.push(()=>{
                current.removeEventListener("error", onError);
            });
            cleanupFns.push((cleanupReason)=>{
                playbackLogging({
                    logLevel,
                    message: `Unblocking ${current.src} from buffer. Reason: ${cleanupReason}`,
                    tag: "buffer",
                    mountTime
                });
                unblock();
            });
        };
        const init = ()=>{
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
                const onWaiting = ()=>{
                    blockMedia('"waiting" event was fired');
                };
                current.addEventListener("waiting", onWaiting);
                cleanupFns.push(()=>{
                    current.removeEventListener("waiting", onWaiting);
                });
            }
        };
        init();
        return ()=>{
            cleanup("element was unmounted or prop changed");
        };
    }, [
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
;
var useRequestVideoCallbackTime = ({ mediaRef, mediaType, lastSeek, onVariableFpsVideoDetected })=>{
    const currentTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        let cancel = ()=>{
            return;
        };
        const request = ()=>{
            if (!videoTag) {
                return;
            }
            const cb = videoTag.requestVideoFrameCallback((_, info2)=>{
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
            });
            cancel = ()=>{
                videoTag.cancelVideoFrameCallback(cb);
                cancel = ()=>{
                    return;
                };
            };
        };
        request();
        return ()=>{
            cancel();
        };
    }, [
        lastSeek,
        mediaRef,
        mediaType,
        onVariableFpsVideoDetected
    ]);
    return currentTime;
};
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
    const { playbackRate: globalPlaybackRate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const frame = useCurrentFrame();
    const absoluteFrame = useTimelinePosition();
    const [playing] = usePlayingState();
    const buffering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(BufferingContextReact);
    const { fps } = useVideoConfig();
    const mediaStartsAt = useMediaStartsAt();
    const lastSeekDueToShift = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastSeek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    if (!buffering) {
        throw new Error("useMediaPlayback must be used inside a <BufferingContext>");
    }
    const isVariableFpsVideoMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    const onVariableFpsVideoDetected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        const playbackRateToSet = Math.max(0, playbackRate);
        if (mediaRef.current && mediaRef.current.playbackRate !== playbackRateToSet) {
            mediaRef.current.playbackRate = playbackRateToSet;
        }
    }, [
        mediaRef,
        playbackRate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
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
;
var useMediaTag = ({ mediaRef, id, mediaType, onAutoPlayError, isPremounting, isPostmounting })=>{
    const { audioAndVideoTags, imperativePlaying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TimelineContext);
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    const env = useRemotionEnvironment();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const tag = {
            id,
            play: (reason)=>{
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
        };
        audioAndVideoTags.current.push(tag);
        return ()=>{
            audioAndVideoTags.current = audioAndVideoTags.current.filter((a)=>a.id !== id);
        };
    }, [
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
;
var MediaVolumeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    mediaMuted: false,
    mediaVolume: 1
});
var SetMediaVolumeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    setMediaMuted: ()=>{
        throw new Error("default");
    },
    setMediaVolume: ()=>{
        throw new Error("default");
    }
});
var useMediaVolumeState = ()=>{
    const { mediaVolume } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(MediaVolumeContext);
    const { setMediaVolume } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SetMediaVolumeContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            mediaVolume,
            setMediaVolume
        ];
    }, [
        mediaVolume,
        setMediaVolume
    ]);
};
var useMediaMutedState = ()=>{
    const { mediaMuted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(MediaVolumeContext);
    const { setMediaMuted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SetMediaVolumeContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            mediaMuted,
            setMediaMuted
        ];
    }, [
        mediaMuted,
        setMediaMuted
    ]);
};
// src/volume-safeguard.ts
var warnAboutTooHighVolume = (volume)=>{
    if (volume >= 100) {
        throw new Error(`Volume was set to ${volume}, but regular volume is 1, not 100. Did you forget to divide by 100? Set a volume of less than 100 to dismiss this error.`);
    }
};
;
var AudioForDevelopmentForwardRefFunction = (props, ref)=>{
    const [initialShouldPreMountAudioElements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(props.shouldPreMountAudioTags);
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
    const { hidden } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceVisibilityToggleContext);
    if (!src) {
        throw new TypeError("No 'src' was passed to <Html5Audio>.");
    }
    const preloadedSrc = usePreload(src);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const [timelineId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>String(Math.random()));
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
    const propsToPass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            muted: muted || mediaMuted || isSequenceHidden || userPreferredVolume <= 0,
            src: preloadedSrc,
            loop: _remotionInternalNativeLoopPassed,
            crossOrigin: crossOriginValue,
            ...nativeProps
        };
    }, [
        _remotionInternalNativeLoopPassed,
        isSequenceHidden,
        mediaMuted,
        muted,
        nativeProps,
        preloadedSrc,
        userPreferredVolume,
        crossOriginValue
    ]);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>`audio-${random(src ?? "")}-${sequenceContext?.relativeFrom}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.durationInFrames}-muted:${props.muted}-loop:${props.loop}`, [
        src,
        sequenceContext?.relativeFrom,
        sequenceContext?.cumulatedFrom,
        sequenceContext?.durationInFrames,
        props.muted,
        props.loop
    ]);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        return audioRef.current;
    }, [
        audioRef
    ]);
    const currentOnDurationCallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onDuration);
    currentOnDurationCallback.current = onDuration;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = audioRef;
        if (!current) {
            return;
        }
        if (current.duration) {
            currentOnDurationCallback.current?.(current.src, current.duration);
            return;
        }
        const onLoadedMetadata = ()=>{
            currentOnDurationCallback.current?.(current.src, current.duration);
        };
        current.addEventListener("loadedmetadata", onLoadedMetadata);
        return ()=>{
            current.removeEventListener("loadedmetadata", onLoadedMetadata);
        };
    }, [
        audioRef,
        src
    ]);
    if (initialShouldPreMountAudioElements) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("audio", {
        ref: audioRef,
        preload: "metadata",
        crossOrigin: crossOriginValue,
        ...propsToPass
    });
};
var AudioForPreview = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(AudioForDevelopmentForwardRefFunction);
;
;
var AudioForRenderingRefForwardingFunction = (props, ref)=>{
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { volume: volumeProp, playbackRate, allowAmplificationDuringRender, onDuration, toneFrequency, _remotionInternalNeedsDurationCalculation, _remotionInternalNativeLoopPassed, acceptableTimeShiftInSeconds, name, onNativeError, delayRenderRetries, delayRenderTimeoutInMilliseconds, loopVolumeCurveBehavior, pauseWhenBuffering, audioStreamIndex, ...nativeProps } = props;
    const absoluteFrame = useTimelinePosition();
    const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const frame = useCurrentFrame();
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>`audio-${random(props.src ?? "")}-${sequenceContext?.relativeFrom}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.durationInFrames}`, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        return audioRef.current;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>unregisterRenderAsset(id);
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
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
        const didLoad = ()=>{
            if (current?.duration) {
                onDuration(current.src, current.duration);
            }
            continueRender2(newHandle);
        };
        if (current?.duration) {
            onDuration(current.src, current.duration);
            continueRender2(newHandle);
        } else {
            current?.addEventListener("loadedmetadata", didLoad, {
                once: true
            });
        }
        return ()=>{
            current?.removeEventListener("loadedmetadata", didLoad);
            continueRender2(newHandle);
        };
    }, [
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
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("audio", {
        ref: audioRef,
        ...nativeProps,
        onError: onNativeError
    });
};
var AudioForRendering = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(AudioForRenderingRefForwardingFunction);
;
var AudioRefForwardingFunction = (props, ref)=>{
    const audioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    const { startFrom, endAt, trimBefore, trimAfter, name, stack, pauseWhenBuffering, showInTimeline, onError: onRemotionError, ...otherProps } = props;
    const { loop, ...propsOtherThanLoop } = props;
    const { fps } = useVideoConfig();
    const environment = useRemotionEnvironment();
    const { durations, setDurations } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(DurationsContext);
    if (typeof props.src !== "string") {
        throw new TypeError(`The \`<Html5Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(props.src)} instead.`);
    }
    const preloadedSrc = usePreload(props.src);
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
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
    }, [
        loop,
        onRemotionError,
        preloadedSrc
    ]);
    const onDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((src, durationInSeconds)=>{
        setDurations({
            type: "got-duration",
            durationInSeconds,
            src
        });
    }, [
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
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Html5Audio, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            });
        }
        const duration = durationFetched * fps;
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Loop, {
            layout: "none",
            durationInFrames: calculateMediaDuration({
                trimAfter: trimAfterValue,
                mediaDurationInFrames: duration,
                playbackRate: props.playbackRate ?? 1,
                trimBefore: trimBeforeValue
            }),
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Html5Audio, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            })
        });
    }
    if (typeof trimBeforeValue !== "undefined" || typeof trimAfterValue !== "undefined") {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            layout: "none",
            from: 0 - (trimBeforeValue ?? 0),
            showInTimeline: false,
            durationInFrames: trimAfterValue,
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Html5Audio, {
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
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(AudioForRendering, {
            onDuration,
            ...props,
            ref,
            onNativeError: onError,
            _remotionInternalNeedsDurationCalculation: Boolean(loop)
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(AudioForPreview, {
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
var Html5Audio = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(AudioRefForwardingFunction);
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
var FolderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    folderName: null,
    parentName: null
});
var Folder = ({ name, children })=>{
    const parent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(FolderContext);
    const { registerFolder, unregisterFolder } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompositionSetters);
    validateFolderName(name);
    const parentNameArr = [
        parent.parentName,
        parent.folderName
    ].filter(truthy);
    const parentName = parentNameArr.length === 0 ? null : parentNameArr.join("/");
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            folderName: name,
            parentName
        };
    }, [
        name,
        parentName
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        registerFolder(name, parentName);
        return ()=>{
            unregisterFolder(name, parentName);
        };
    }, [
        name,
        parent.folderName,
        parentName,
        registerFolder,
        unregisterFolder
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(FolderContext.Provider, {
        value,
        children
    });
};
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
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(AbsoluteFill, {
        style: container,
        id: "remotion-comp-loading",
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("style", {
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
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("svg", {
                width: ICON_SIZE,
                height: ICON_SIZE,
                viewBox: "-100 -100 400 400",
                style: rotate,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                    fill: "#555",
                    stroke: "#555",
                    strokeWidth: "100",
                    strokeLinejoin: "round",
                    d: "M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
                })
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("p", {
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
    const lazy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if ("component" in compProps) {
            if (typeof document === "undefined" || noSuspense) {
                return compProps.component;
            }
            if (typeof compProps.component === "undefined") {
                throw new Error(`A value of \`undefined\` was passed to the \`component\` prop. Check the value you are passing to the <${componentName}/> component.`);
            }
            return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].lazy(()=>Promise.resolve({
                    default: compProps.component
                }));
        }
        if ("lazyComponent" in compProps && typeof compProps.lazyComponent !== "undefined") {
            if (typeof compProps.lazyComponent === "undefined") {
                throw new Error(`A value of \`undefined\` was passed to the \`lazyComponent\` prop. Check the value you are passing to the <${componentName}/> component.`);
            }
            return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].lazy(compProps.lazyComponent);
        }
        throw new Error("You must pass either 'component' or 'lazyComponent'");
    }, [
        compProps.component,
        compProps.lazyComponent
    ]);
    return lazy;
};
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
    const { continueRender: continueRender2, delayRender: delayRender2 } = useDelayRender();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fallback = delayRender2("Waiting for Root component to unsuspend");
        return ()=>continueRender2(fallback);
    }, [
        continueRender2,
        delayRender2
    ]);
    return null;
};
var InnerComposition = ({ width, height, fps, durationInFrames, id, defaultProps, schema, ...compProps })=>{
    const compManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompositionSetters);
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
    const canUseComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CanUseRemotionHooks);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (canUseComposition) {
        if (isPlayer) {
            throw new Error("<Composition> was mounted inside the `component` that was passed to the <Player>. See https://remotion.dev/docs/wrong-composition-mount for help.");
        }
        throw new Error("<Composition> mounted inside another composition. See https://remotion.dev/docs/wrong-composition-mount for help.");
    }
    const { folderName, parentName } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(FolderContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>{
            unregisterComposition(id);
        };
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        window.dispatchEvent(new CustomEvent(PROPS_UPDATED_EXTERNALLY, {
            detail: {
                resetUnsaved: id
            }
        }));
    }, [
        defaultProps,
        id
    ]);
    const resolved = useResolvedVideoConfig(id);
    if (environment.isStudio && video && video.component === lazy) {
        const Comp = lazy;
        if (resolved === null || resolved.type !== "success" && resolved.type !== "success-and-refreshing") {
            return null;
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooksProvider, {
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Loading, {}),
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Comp, {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooksProvider, {
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Fallback, {}),
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Comp, {
                    ...resolved.result.props ?? {}
                })
            })
        }), portalNode());
    }
    return null;
};
var Composition = (props2)=>{
    const { onlyRenderComposition } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompositionSetters);
    if (onlyRenderComposition && onlyRenderComposition !== props2.id) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(InnerComposition, {
        ...props2
    });
};
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
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const [handle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>delayRender2(`Loading <IFrame> with source ${props2.src}`, {
            retries: delayRenderRetries ?? undefined,
            timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
        }));
    const didLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        continueRender2(handle);
        onLoad?.(e);
    }, [
        handle,
        onLoad,
        continueRender2
    ]);
    const didGetError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        continueRender2(handle);
        if (onError) {
            onError(e);
        } else {
            console.error("Error loading iframe:", e, "Handle the event using the onError() prop to make this message disappear.");
        }
    }, [
        handle,
        onError,
        continueRender2
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("iframe", {
        ...props2,
        ref,
        onError: didGetError,
        onLoad: didLoad
    });
};
var IFrame = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(IFrameRefForwarding);
;
;
function exponentialBackoff(errorCount) {
    return 1000 * 2 ** (errorCount - 1);
}
var ImgRefForwarding = ({ onError, maxRetries = 2, src, pauseWhenLoading, delayRenderRetries, delayRenderTimeoutInMilliseconds, onImageFrame, crossOrigin, ...props2 }, ref)=>{
    const imageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const errors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    const { delayPlayback } = useBufferState();
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    if (!src) {
        throw new Error('No "src" prop was passed to <Img>.');
    }
    const _propsValid = true;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        return imageRef.current;
    }, []);
    const actualSrc = usePreload(src);
    const retryIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((timeout)=>{
        if (!imageRef.current) {
            return;
        }
        const currentSrc = imageRef.current.src;
        setTimeout(()=>{
            if (!imageRef.current) {
                return;
            }
            const newSrc = imageRef.current?.src;
            if (newSrc !== currentSrc) {
                return;
            }
            imageRef.current.removeAttribute("src");
            imageRef.current.setAttribute("src", newSrc);
        }, timeout);
    }, []);
    const didGetError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
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
    }, [
        maxRetries,
        onError,
        retryIn
    ]);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const crossOriginValue = getCrossOriginValue({
        crossOrigin,
        requestsVideoFrame: false
    });
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("img", {
        ...props2,
        ref: imageRef,
        crossOrigin: crossOriginValue,
        onError: didGetError,
        decoding: "sync"
    });
};
var Img = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(ImgRefForwarding);
;
;
;
var compositionsRef = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createRef();
var CompositionManagerProvider = ({ children, numberOfAudioTags, onlyRenderComposition, currentCompositionMetadata, audioLatencyHint })=>{
    const [compositions, setCompositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const currentcompositionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(compositions);
    const [folders, setFolders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [canvasContent, setCanvasContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const updateCompositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((updateComps)=>{
        setCompositions((comps)=>{
            const updated = updateComps(comps);
            currentcompositionsRef.current = updated;
            return updated;
        });
    }, []);
    const registerComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((comp)=>{
        updateCompositions((comps)=>{
            if (comps.find((c2)=>c2.id === comp.id)) {
                throw new Error(`Multiple composition with id ${comp.id} are registered.`);
            }
            const value = [
                ...comps,
                comp
            ].slice().sort((a2, b2)=>a2.nonce - b2.nonce);
            return value;
        });
    }, [
        updateCompositions
    ]);
    const unregisterComposition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setCompositions((comps)=>{
            return comps.filter((c2)=>c2.id !== id);
        });
    }, []);
    const registerFolder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((name, parent)=>{
        setFolders((prevFolders)=>{
            return [
                ...prevFolders,
                {
                    name,
                    parent
                }
            ];
        });
    }, []);
    const unregisterFolder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((name, parent)=>{
        setFolders((prevFolders)=>{
            return prevFolders.filter((p)=>!(p.name === name && p.parent === parent));
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(compositionsRef, ()=>{
        return {
            getCompositions: ()=>currentcompositionsRef.current
        };
    }, []);
    const composition = compositions.find((c2)=>canvasContent?.type === "composition" ? c2.id === canvasContent.compositionId : null);
    const updateCompositionDefaultProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, newDefaultProps)=>{
        setCompositions((comps)=>{
            const updated = comps.map((c2)=>{
                if (c2.id === id) {
                    return {
                        ...c2,
                        defaultProps: newDefaultProps
                    };
                }
                return c2;
            });
            return updated;
        });
    }, []);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            compositions,
            folders,
            currentCompositionMetadata,
            canvasContent
        };
    }, [
        compositions,
        folders,
        currentCompositionMetadata,
        canvasContent
    ]);
    const setters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            registerComposition,
            unregisterComposition,
            registerFolder,
            unregisterFolder,
            setCanvasContent,
            updateCompositionDefaultProps,
            onlyRenderComposition
        };
    }, [
        registerComposition,
        registerFolder,
        unregisterComposition,
        unregisterFolder,
        updateCompositionDefaultProps,
        onlyRenderComposition
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CompositionManager.Provider, {
        value: contextValue,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CompositionSetters.Provider, {
            value: setters,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceManagerProvider, {
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderAssetManagerProvider, {
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ResolveCompositionConfig, {
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SharedAudioContextProvider, {
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
var MediaEnabledContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
var useVideoEnabled = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(MediaEnabledContext);
    if (!context) {
        return window.remotion_videoEnabled;
    }
    if (context.videoEnabled === null) {
        return window.remotion_videoEnabled;
    }
    return context.videoEnabled;
};
var useAudioEnabled = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(MediaEnabledContext);
    if (!context) {
        return window.remotion_audioEnabled;
    }
    if (context.audioEnabled === null) {
        return window.remotion_audioEnabled;
    }
    return context.audioEnabled;
};
var MediaEnabledProvider = ({ children, videoEnabled, audioEnabled })=>{
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            videoEnabled,
            audioEnabled
        }), [
        videoEnabled,
        audioEnabled
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(MediaEnabledContext.Provider, {
        value,
        children
    });
};
;
var RemotionRoot = ({ children, numberOfAudioTags, logLevel, onlyRenderComposition, currentCompositionMetadata, audioLatencyHint, videoEnabled, audioEnabled })=>{
    const [remotionRootId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>String(random(null)));
    const [frame, setFrame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getInitialFrameState());
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const imperativePlaying = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [fastRefreshes, setFastRefreshes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [manualRefreshes, setManualRefreshes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [playbackRate, setPlaybackRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const audioAndVideoTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const timelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            frame,
            playing,
            imperativePlaying,
            rootId: remotionRootId,
            playbackRate,
            setPlaybackRate,
            audioAndVideoTags
        };
    }, [
        frame,
        playbackRate,
        playing,
        remotionRootId
    ]);
    const setTimelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            setFrame,
            setPlaying
        };
    }, []);
    const nonceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let counter = 0;
        return {
            getNonce: ()=>counter++,
            fastRefreshes,
            manualRefreshes
        };
    }, [
        fastRefreshes,
        manualRefreshes
    ]);
    const setNonceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            increaseManualRefreshes: ()=>{
                setManualRefreshes((i)=>i + 1);
            }
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (typeof __webpack_module__ !== "undefined") {
            if (__webpack_module__.hot) {
                __webpack_module__.hot.addStatusHandler((status)=>{
                    if (status === "idle") {
                        setFastRefreshes((i)=>i + 1);
                    }
                });
            }
        }
    }, []);
    const logging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            logLevel,
            mountTime: Date.now()
        };
    }, [
        logLevel
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(LogLevelContext.Provider, {
        value: logging,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(NonceContext.Provider, {
            value: nonceContext,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SetNonceContext.Provider, {
                value: setNonceContext,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(TimelineContext.Provider, {
                    value: timelineContextValue,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SetTimelineContext.Provider, {
                        value: setTimelineContextValue,
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(MediaEnabledProvider, {
                            videoEnabled,
                            audioEnabled,
                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(EditorPropsProvider, {
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PrefetchProvider, {
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CompositionManagerProvider, {
                                        numberOfAudioTags,
                                        onlyRenderComposition,
                                        currentCompositionMetadata,
                                        audioLatencyHint,
                                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(DurationsContextProvider, {
                                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(BufferingProvider, {
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
var CurrentScaleContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
var PreviewSizeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
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
    const hasContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(CurrentScaleContext);
    const zoomContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(PreviewSizeContext);
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
;
;
// src/video/offthread-video-source.ts
var getOffthreadVideoSource = ({ src, transparent, currentTime, toneMapped })=>{
    return `http://localhost:${window.remotion_proxyPort}/proxy?src=${encodeURIComponent(getAbsoluteSrc(src))}&time=${encodeURIComponent(Math.max(0, currentTime))}&transparent=${String(transparent)}&toneMapped=${String(toneMapped)}`;
};
;
var OffthreadVideoForRendering = ({ onError, volume: volumeProp, playbackRate, src, muted, allowAmplificationDuringRender, transparent, toneMapped, toneFrequency, name, loopVolumeCurveBehavior, delayRenderRetries, delayRenderTimeoutInMilliseconds, onVideoFrame, crossOrigin, audioStreamIndex, ...props2 })=>{
    const absoluteFrame = useTimelinePosition();
    const frame = useCurrentFrame();
    const volumePropsFrame = useFrameForVolumeProp(loopVolumeCurveBehavior);
    const videoConfig = useUnsafeVideoConfig();
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const mediaStartsAt = useMediaStartsAt();
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    if (!src) {
        throw new TypeError("No `src` was passed to <OffthreadVideo>.");
    }
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>`offthreadvideo-${random(src)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>unregisterRenderAsset(id);
    }, [
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
    const currentTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return getExpectedMediaFrameUncorrected({
            frame,
            playbackRate: playbackRate || 1,
            startFrom: -mediaStartsAt
        }) / videoConfig.fps;
    }, [
        frame,
        mediaStartsAt,
        playbackRate,
        videoConfig.fps
    ]);
    const actualSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return getOffthreadVideoSource({
            src,
            currentTime,
            transparent,
            toneMapped
        });
    }, [
        toneMapped,
        currentTime,
        src,
        transparent
    ]);
    const [imageSrc, setImageSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
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
        const execute = async ()=>{
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
                cleanup.push(()=>URL.revokeObjectURL(url));
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
        };
        execute();
        cleanup.push(()=>{
            if (controller.signal.aborted) {
                return;
            }
            controller.abort();
        });
        return ()=>{
            cleanup.forEach((c2)=>c2());
        };
    }, [
        actualSrc,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        onError,
        continueRender2,
        delayRender2
    ]);
    const onErr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (onError) {
            onError?.(new Error("Failed to load image with src " + imageSrc));
        } else {
            cancelRender("Failed to load image with src " + imageSrc);
        }
    }, [
        imageSrc,
        onError
    ]);
    const className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            OBJECTFIT_CONTAIN_CLASS_NAME,
            props2.className
        ].filter(truthy).join(" ");
    }, [
        props2.className
    ]);
    const onImageFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((img)=>{
        if (onVideoFrame) {
            onVideoFrame(img);
        }
    }, [
        onVideoFrame
    ]);
    if (!imageSrc || !window.remotion_videoEnabled) {
        return null;
    }
    continueRender2(imageSrc.handle);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Img, {
        src: imageSrc.src,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        onImageFrame,
        ...props2,
        onError: onErr,
        className
    });
};
;
;
var useEmitVideoFrame = ({ ref, onVideoFrame })=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = ref;
        if (!current) {
            return;
        }
        if (!onVideoFrame) {
            return;
        }
        let handle = 0;
        const callback = ()=>{
            if (!ref.current) {
                return;
            }
            onVideoFrame(ref.current);
            handle = ref.current.requestVideoFrameCallback(callback);
        };
        callback();
        return ()=>{
            current.cancelVideoFrameCallback(handle);
        };
    }, [
        onVideoFrame,
        ref
    ]);
};
;
var VideoForDevelopmentRefForwardingFunction = (props2, ref)=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SharedAudioContext);
    if (!context) {
        throw new Error("SharedAudioContext not found");
    }
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sharedSource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!context.audioContext) {
            return null;
        }
        return makeSharedElementSourceNode({
            audioContext: context.audioContext,
            ref: videoRef
        });
    }, [
        context.audioContext
    ]);
    const { volume, muted, playbackRate, onlyWarnForMediaSeekingError, src, onDuration, acceptableTimeShift, acceptableTimeShiftInSeconds, toneFrequency, name, _remotionInternalNativeLoopPassed, _remotionInternalStack, style, pauseWhenBuffering, showInTimeline, loopVolumeCurveBehavior, onError, onAutoPlayError, onVideoFrame, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, allowAmplificationDuringRender, useWebAudioApi, audioStreamIndex, ...nativeProps } = props2;
    const _propsValid = true;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const { fps, durationInFrames } = useVideoConfig();
    const parentSequence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const { hidden } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceVisibilityToggleContext);
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    const [timelineId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>String(Math.random()));
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        return videoRef.current;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>playbackLogging({
            logLevel,
            message: `Mounting video with source = ${actualSrc}, v=${VERSION}, user agent=${typeof navigator === "undefined" ? "server" : navigator.userAgent}`,
            tag: "video",
            mountTime
        }));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = videoRef;
        if (!current) {
            return;
        }
        const errorHandler = ()=>{
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
        };
        current.addEventListener("error", errorHandler, {
            once: true
        });
        return ()=>{
            current.removeEventListener("error", errorHandler);
        };
    }, [
        onError,
        src
    ]);
    const currentOnDurationCallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onDuration);
    currentOnDurationCallback.current = onDuration;
    useEmitVideoFrame({
        ref: videoRef,
        onVideoFrame
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = videoRef;
        if (!current) {
            return;
        }
        if (current.duration) {
            currentOnDurationCallback.current?.(src, current.duration);
            return;
        }
        const onLoadedMetadata = ()=>{
            currentOnDurationCallback.current?.(src, current.duration);
        };
        current.addEventListener("loadedmetadata", onLoadedMetadata);
        return ()=>{
            current.removeEventListener("loadedmetadata", onLoadedMetadata);
        };
    }, [
        src
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = videoRef;
        if (!current) {
            return;
        }
        if (isIosSafari()) {
            current.preload = "metadata";
        } else {
            current.preload = "auto";
        }
    }, []);
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            ...style,
            opacity: isSequenceHidden ? 0 : style?.opacity ?? 1
        };
    }, [
        isSequenceHidden,
        style
    ]);
    const crossOriginValue = getCrossOriginValue({
        crossOrigin,
        requestsVideoFrame: Boolean(onVideoFrame)
    });
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("video", {
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
var VideoForPreview = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(VideoForDevelopmentRefForwardingFunction);
;
var InnerOffthreadVideo = (props2)=>{
    const { startFrom, endAt, trimBefore, trimAfter, name, pauseWhenBuffering, stack, showInTimeline, ...otherProps } = props2;
    const environment = useRemotionEnvironment();
    const onDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return;
    }, []);
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
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            layout: "none",
            from: 0 - (trimBeforeValue ?? 0),
            showInTimeline: false,
            durationInFrames: trimAfterValue,
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(InnerOffthreadVideo, {
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
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(OffthreadVideoForRendering, {
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
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VideoForPreview, {
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
var OffthreadVideo = ({ src, acceptableTimeShiftInSeconds, allowAmplificationDuringRender, audioStreamIndex, className, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, id, loopVolumeCurveBehavior, muted, name, onAutoPlayError, onError, onVideoFrame, pauseWhenBuffering, playbackRate, showInTimeline, style, toneFrequency, toneMapped, transparent, trimAfter, trimBefore, useWebAudioApi, volume, _remotionInternalNativeLoopPassed, endAt, stack, startFrom, imageFormat })=>{
    if (imageFormat) {
        throw new TypeError(`The \`<OffthreadVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`);
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(InnerOffthreadVideo, {
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
    const compositionManagerCtx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(CompositionManager);
    const timelineContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(TimelineContext);
    const setTimelineContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(SetTimelineContext);
    const sequenceContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(SequenceContext);
    const nonceContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(NonceContext);
    const canUseRemotionHooksContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(CanUseRemotionHooks);
    const preloadContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(PreloadContext);
    const resolveCompositionContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(ResolveCompositionContext);
    const renderAssetManagerContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(RenderAssetManager);
    const sequenceManagerContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(SequenceManager);
    const bufferManagerContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(BufferingContextReact);
    const logLevelContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(LogLevelContext);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
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
        }), [
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
var RemotionContextProvider = (props2)=>{
    const { children, contexts } = props2;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(LogLevelContext.Provider, {
        value: contexts.logLevelContext,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CanUseRemotionHooks.Provider, {
            value: contexts.canUseRemotionHooksContext,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(NonceContext.Provider, {
                value: contexts.nonceContext,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PreloadContext.Provider, {
                    value: contexts.preloadContext,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CompositionManager.Provider, {
                        value: contexts.compositionManagerCtx,
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceManager.Provider, {
                            value: contexts.sequenceManagerContext,
                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderAssetManager.Provider, {
                                value: contexts.renderAssetManagerContext,
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ResolveCompositionContext.Provider, {
                                    value: contexts.resolveCompositionContext,
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(TimelineContext.Provider, {
                                        value: contexts.timelineContext,
                                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SetTimelineContext.Provider, {
                                            value: contexts.setTimelineContext,
                                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SequenceContext.Provider, {
                                                value: contexts.sequenceContext,
                                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(BufferingContextReact.Provider, {
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
// src/internals.ts
var compositionSelectorRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRef"])();
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
    const childrenArray = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Children.toArray(children);
    return childrenArray.reduce((flatChildren, child)=>{
        if (child.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment) {
            return flatChildren.concat(flattenChildren(child.props.children));
        }
        flatChildren.push(child);
        return flatChildren;
    }, []);
};
;
;
var IsInsideSeriesContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(false);
var IsInsideSeriesContainer = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(IsInsideSeriesContext.Provider, {
        value: true,
        children
    });
};
var IsNotInsideSeriesProvider = ({ children })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(IsInsideSeriesContext.Provider, {
        value: false,
        children
    });
};
var useRequireToBeInsideSeries = ()=>{
    const isInsideSeries = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(IsInsideSeriesContext);
    if (!isInsideSeries) {
        throw new Error("This component must be inside a <Series /> component.");
    }
};
;
var SeriesSequenceRefForwardingFunction = ({ children }, _ref)=>{
    useRequireToBeInsideSeries();
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(IsNotInsideSeriesProvider, {
        children
    });
};
var SeriesSequence = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(SeriesSequenceRefForwardingFunction);
var Series = (props2)=>{
    const childrenValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let startFrame = 0;
        const flattenedChildren = flattenChildren(props2.children);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].map(flattenedChildren, (child, i)=>{
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
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
                name: name || "<Series.Sequence>",
                from: currentStartFrame,
                durationInFrames: durationInFramesProp,
                ...passedProps,
                ref: castedChild.ref,
                children: child
            });
        });
    }, [
        props2.children
    ]);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(IsInsideSeriesContainer, {
        children: childrenValue
    });
};
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
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
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(Composition, newProps);
};
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
    const absoluteFrame = useTimelinePosition();
    const frame = useCurrentFrame();
    const volumePropsFrame = useFrameForVolumeProp(loopVolumeCurveBehavior ?? "repeat");
    const videoConfig = useUnsafeVideoConfig();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sequenceContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SequenceContext);
    const mediaStartsAt = useMediaStartsAt();
    const environment = useRemotionEnvironment();
    const logLevel = useLogLevel();
    const mountTime = useMountTime();
    const { delayRender: delayRender2, continueRender: continueRender2 } = useDelayRender();
    const { registerRenderAsset, unregisterRenderAsset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(RenderAssetManager);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>`video-${random(props2.src ?? "")}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
        return ()=>unregisterRenderAsset(id);
    }, [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        return videoRef.current;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
            const loadedDataHandler = ()=>{
                continueRender2(handle);
            };
            current.addEventListener("loadeddata", loadedDataHandler, {
                once: true
            });
            return ()=>{
                current.removeEventListener("loadeddata", loadedDataHandler);
            };
        }
        const endedHandler = ()=>{
            continueRender2(handle);
        };
        const seek2 = seekToTimeMultipleUntilRight({
            element: current,
            desiredTime: currentTime,
            fps: videoConfig.fps,
            logLevel,
            mountTime
        });
        seek2.prom.then(()=>{
            continueRender2(handle);
        });
        current.addEventListener("ended", endedHandler, {
            once: true
        });
        const errorHandler = ()=>{
            if (current?.error) {
                console.error("Error occurred in video", current?.error);
                if (onError) {
                    return;
                }
                throw new Error(`The browser threw an error while playing the video ${props2.src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`);
            } else {
                throw new Error("The browser threw an error");
            }
        };
        current.addEventListener("error", errorHandler, {
            once: true
        });
        return ()=>{
            seek2.cancel();
            current.removeEventListener("ended", endedHandler);
            current.removeEventListener("error", errorHandler);
            continueRender2(handle);
        };
    }, [
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
            if (window.process?.env?.NODE_ENV === "test") {
                return;
            }
            const newHandle = delayRender2("Loading <Html5Video> duration with src=" + src, {
                retries: delayRenderRetries ?? undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined
            });
            const { current } = videoRef;
            const didLoad = ()=>{
                if (current?.duration) {
                    onDuration(src, current.duration);
                }
                continueRender2(newHandle);
            };
            if (current?.duration) {
                onDuration(src, current.duration);
                continueRender2(newHandle);
            } else {
                current?.addEventListener("loadedmetadata", didLoad, {
                    once: true
                });
            }
            return ()=>{
                current?.removeEventListener("loadedmetadata", didLoad);
                continueRender2(newHandle);
            };
        }, [
            src,
            onDuration,
            delayRenderRetries,
            delayRenderTimeoutInMilliseconds,
            continueRender2,
            delayRender2
        ]);
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("video", {
        ref: videoRef,
        disableRemotePlayback: true,
        ...props2
    });
};
var VideoForRendering = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(VideoForRenderingForwardFunction);
;
var VideoForwardingFunction = (props2, ref)=>{
    const { startFrom, endAt, trimBefore, trimAfter, name, pauseWhenBuffering, stack, _remotionInternalNativeLoopPassed, showInTimeline, onAutoPlayError, ...otherProps } = props2;
    const { loop, ...propsOtherThanLoop } = props2;
    const { fps } = useVideoConfig();
    const environment = useRemotionEnvironment();
    const { durations, setDurations } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(DurationsContext);
    if (typeof ref === "string") {
        throw new Error("string refs are not supported");
    }
    if (typeof props2.src !== "string") {
        throw new TypeError(`The \`<Html5Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(props2.src)} instead.`);
    }
    const preloadedSrc = usePreload(props2.src);
    const onDuration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((src, durationInSeconds)=>{
        setDurations({
            type: "got-duration",
            durationInSeconds,
            src
        });
    }, [
        setDurations
    ]);
    const onVideoFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{}, []);
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
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Html5Video, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            });
        }
        const mediaDuration = durationFetched * fps;
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Loop, {
            durationInFrames: calculateMediaDuration({
                trimAfter: trimAfterValue,
                mediaDurationInFrames: mediaDuration,
                playbackRate: props2.playbackRate ?? 1,
                trimBefore: trimBeforeValue
            }),
            layout: "none",
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Html5Video, {
                ...propsOtherThanLoop,
                ref,
                _remotionInternalNativeLoopPassed: true
            })
        });
    }
    if (typeof trimBeforeValue !== "undefined" || typeof trimAfterValue !== "undefined") {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Sequence, {
            layout: "none",
            from: 0 - (trimBeforeValue ?? 0),
            showInTimeline: false,
            durationInFrames: trimAfterValue,
            name,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Html5Video, {
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
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VideoForRendering, {
            onDuration,
            onVideoFrame: onVideoFrame ?? null,
            ...otherProps,
            ref
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VideoForPreview, {
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
var Html5Video = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(VideoForwardingFunction);
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
            process.exit(1);
        };
    }
});
addSequenceStackTraces(Sequence);
;
}),
"[project]/packages/core/dist/esm/no-react.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
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
    if ("TURBOPACK compile-time truthy", 1) {
        return relativeSrc;
    }
    //TURBOPACK unreachable
    ;
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
}),
"[project]/packages/player/dist/esm/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Player",
    ()=>Player,
    "PlayerInternals",
    ()=>PlayerInternals,
    "Thumbnail",
    ()=>Thumbnail
]);
// src/icons.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
// src/calculate-scale.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)");
// src/emitter-context.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
// src/validate.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/no-react.mjs [app-ssr] (ecmascript)");
"use client";
;
var ICON_SIZE = 25;
var fullscreenIconSize = 16;
var PlayIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        width: ICON_SIZE,
        height: ICON_SIZE,
        viewBox: "0 0 25 25",
        fill: "none",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
            d: "M8 6.375C7.40904 8.17576 7.06921 10.2486 7.01438 12.3871C6.95955 14.5255 7.19163 16.6547 7.6875 18.5625C9.95364 18.2995 12.116 17.6164 14.009 16.5655C15.902 15.5147 17.4755 14.124 18.6088 12.5C17.5158 10.8949 15.9949 9.51103 14.1585 8.45082C12.3222 7.3906 10.2174 6.68116 8 6.375Z",
            fill: "white",
            stroke: "white",
            strokeWidth: "6.25",
            strokeLinejoin: "round"
        })
    });
};
var PauseIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("svg", {
        viewBox: "0 0 100 100",
        width: ICON_SIZE,
        height: ICON_SIZE,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("rect", {
                x: "25",
                y: "20",
                width: "20",
                height: "60",
                fill: "#fff",
                ry: "5",
                rx: "5"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("rect", {
                x: "55",
                y: "20",
                width: "20",
                height: "60",
                fill: "#fff",
                ry: "5",
                rx: "5"
            })
        ]
    });
};
var FullscreenIcon = ({ isFullscreen })=>{
    const strokeWidth = 6;
    const viewSize = 32;
    const out = isFullscreen ? 0 : strokeWidth / 2;
    const middleInset = isFullscreen ? strokeWidth * 1.6 : strokeWidth / 2;
    const inset = isFullscreen ? strokeWidth * 1.6 : strokeWidth * 2;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("svg", {
        viewBox: `0 0 ${viewSize} ${viewSize}`,
        height: fullscreenIconSize,
        width: fullscreenIconSize,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${out} ${inset}
				L ${middleInset} ${middleInset}
				L ${inset} ${out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${viewSize - out} ${inset}
				L ${viewSize - middleInset} ${middleInset}
				L ${viewSize - inset} ${out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${out} ${viewSize - inset}
				L ${middleInset} ${viewSize - middleInset}
				L ${inset} ${viewSize - out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${viewSize - out} ${viewSize - inset}
				L ${viewSize - middleInset} ${viewSize - middleInset}
				L ${viewSize - inset} ${viewSize - out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            })
        ]
    });
};
var VolumeOffIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        width: ICON_SIZE,
        height: ICON_SIZE,
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
            d: "M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z",
            fill: "#fff"
        })
    });
};
var VolumeOnIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        width: ICON_SIZE,
        height: ICON_SIZE,
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
            d: "M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z",
            fill: "#fff"
        })
    });
};
;
var className = "__remotion_buffering_indicator";
var remotionBufferingAnimation = "__remotion_buffering_animation";
var playerStyle = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    overflow: "hidden",
    lineHeight: "normal",
    fontSize: "inherit"
};
var studioStyle = {
    width: 14,
    height: 14,
    overflow: "hidden",
    lineHeight: "normal",
    fontSize: "inherit"
};
var BufferingIndicator = ({ type })=>{
    const style = type === "player" ? playerStyle : studioStyle;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("style", {
                type: "text/css",
                children: `
				@keyframes ${remotionBufferingAnimation} {
          0% {
            rotate: 0deg;
          }
          100% {
            rotate: 360deg;
          }
        }
        
        .${className} {
            animation: ${remotionBufferingAnimation} 1s linear infinite;
        }        
			`
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("svg", {
                    viewBox: type === "player" ? "0 0 22 22" : "0 0 18 18",
                    style,
                    className,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                        d: type === "player" ? "M 11 4 A 7 7 0 0 1 15.1145 16.66312" : "M 9 2 A 7 7 0 0 1 13.1145 14.66312",
                        stroke: "white",
                        strokeLinecap: "round",
                        fill: "none",
                        strokeWidth: 3
                    })
                })
            })
        ]
    });
};
;
// src/utils/calculate-player-size.ts
var calculatePlayerSize = ({ currentSize, width, height, compositionWidth, compositionHeight })=>{
    if (width !== undefined && height === undefined) {
        return {
            aspectRatio: [
                compositionWidth,
                compositionHeight
            ].join("/")
        };
    }
    if (height !== undefined && width === undefined) {
        return {
            aspectRatio: [
                compositionWidth,
                compositionHeight
            ].join("/")
        };
    }
    if (!currentSize) {
        return {
            width: compositionWidth,
            height: compositionHeight
        };
    }
    return {
        width: compositionWidth,
        height: compositionHeight
    };
};
// src/calculate-scale.ts
var calculateCanvasTransformation = ({ previewSize, compositionWidth, compositionHeight, canvasSize })=>{
    const scale = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].calculateScale({
        canvasSize,
        compositionHeight,
        compositionWidth,
        previewSize
    });
    const correction = 0 - (1 - scale) / 2;
    const xCorrection = correction * compositionWidth;
    const yCorrection = correction * compositionHeight;
    const width = compositionWidth * scale;
    const height = compositionHeight * scale;
    const centerX = canvasSize.width / 2 - width / 2;
    const centerY = canvasSize.height / 2 - height / 2;
    return {
        centerX,
        centerY,
        xCorrection,
        yCorrection,
        scale
    };
};
var calculateOuterStyle = ({ config, style, canvasSize, overflowVisible, layout })=>{
    if (!config) {
        return {};
    }
    return {
        position: "relative",
        overflow: overflowVisible ? "visible" : "hidden",
        ...calculatePlayerSize({
            compositionHeight: config.height,
            compositionWidth: config.width,
            currentSize: canvasSize,
            height: style?.height,
            width: style?.width
        }),
        opacity: layout ? 1 : 0,
        ...style
    };
};
var calculateContainerStyle = ({ config, layout, scale, overflowVisible })=>{
    if (!config) {
        return {};
    }
    if (!layout) {
        return {
            position: "absolute",
            width: config.width,
            height: config.height,
            display: "flex",
            transform: `scale(${scale})`,
            overflow: overflowVisible ? "visible" : "hidden"
        };
    }
    return {
        position: "absolute",
        width: config.width,
        height: config.height,
        display: "flex",
        transform: `scale(${scale})`,
        marginLeft: layout.xCorrection,
        marginTop: layout.yCorrection,
        overflow: overflowVisible ? "visible" : "hidden"
    };
};
var calculateOuter = ({ layout, scale, config, overflowVisible })=>{
    if (!config) {
        return {};
    }
    if (!layout) {
        return {
            width: config.width * scale,
            height: config.height * scale,
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            overflow: overflowVisible ? "visible" : "hidden"
        };
    }
    const { centerX, centerY } = layout;
    return {
        width: config.width * scale,
        height: config.height * scale,
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        left: centerX,
        top: centerY,
        overflow: overflowVisible ? "visible" : "hidden"
    };
};
;
var PlayerEventEmitterContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(undefined);
var ThumbnailEmitterContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(undefined);
;
;
// src/event-emitter.ts
class PlayerEmitter {
    listeners = {
        ended: [],
        error: [],
        pause: [],
        play: [],
        ratechange: [],
        scalechange: [],
        seeked: [],
        timeupdate: [],
        frameupdate: [],
        fullscreenchange: [],
        volumechange: [],
        mutechange: [],
        waiting: [],
        resume: []
    };
    addEventListener(name, callback) {
        this.listeners[name].push(callback);
    }
    removeEventListener(name, callback) {
        this.listeners[name] = this.listeners[name].filter((l)=>l !== callback);
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback)=>{
            callback({
                detail: context
            });
        });
    }
    dispatchSeek = (frame)=>{
        this.dispatchEvent("seeked", {
            frame
        });
    };
    dispatchVolumeChange = (volume)=>{
        this.dispatchEvent("volumechange", {
            volume
        });
    };
    dispatchPause = ()=>{
        this.dispatchEvent("pause", undefined);
    };
    dispatchPlay = ()=>{
        this.dispatchEvent("play", undefined);
    };
    dispatchEnded = ()=>{
        this.dispatchEvent("ended", undefined);
    };
    dispatchRateChange = (playbackRate)=>{
        this.dispatchEvent("ratechange", {
            playbackRate
        });
    };
    dispatchScaleChange = (scale)=>{
        this.dispatchEvent("scalechange", {
            scale
        });
    };
    dispatchError = (error)=>{
        this.dispatchEvent("error", {
            error
        });
    };
    dispatchTimeUpdate = (event)=>{
        this.dispatchEvent("timeupdate", event);
    };
    dispatchFrameUpdate = (event)=>{
        this.dispatchEvent("frameupdate", event);
    };
    dispatchFullscreenChange = (event)=>{
        this.dispatchEvent("fullscreenchange", event);
    };
    dispatchMuteChange = (event)=>{
        this.dispatchEvent("mutechange", event);
    };
    dispatchWaiting = (event)=>{
        this.dispatchEvent("waiting", event);
    };
    dispatchResume = (event)=>{
        this.dispatchEvent("resume", event);
    };
}
class ThumbnailEmitter {
    listeners = {
        error: [],
        waiting: [],
        resume: []
    };
    addEventListener(name, callback) {
        this.listeners[name].push(callback);
    }
    removeEventListener(name, callback) {
        this.listeners[name] = this.listeners[name].filter((l)=>l !== callback);
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback)=>{
            callback({
                detail: context
            });
        });
    }
    dispatchError = (error)=>{
        this.dispatchEvent("error", {
            error
        });
    };
    dispatchWaiting = (event)=>{
        this.dispatchEvent("waiting", event);
    };
    dispatchResume = (event)=>{
        this.dispatchEvent("resume", event);
    };
}
;
;
var useBufferStateEmitter = (emitter)=>{
    const bufferManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!bufferManager) {
        throw new Error("BufferingContextReact not found");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const clear1 = bufferManager.listenForBuffering(()=>{
            bufferManager.buffering.current = true;
            emitter.dispatchWaiting({});
        });
        const clear2 = bufferManager.listenForResume(()=>{
            bufferManager.buffering.current = false;
            emitter.dispatchResume({});
        });
        return ()=>{
            clear1.remove();
            clear2.remove();
        };
    }, [
        bufferManager,
        emitter
    ]);
};
;
var PlayerEmitterProvider = ({ children, currentPlaybackRate })=>{
    const [emitter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new PlayerEmitter);
    const bufferManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!bufferManager) {
        throw new Error("BufferingContextReact not found");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentPlaybackRate) {
            emitter.dispatchRateChange(currentPlaybackRate);
        }
    }, [
        emitter,
        currentPlaybackRate
    ]);
    useBufferStateEmitter(emitter);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlayerEventEmitterContext.Provider, {
        value: emitter,
        children
    });
};
;
;
var useFrameImperative = ()=>{
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const frameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(frame);
    frameRef.current = frame;
    const getCurrentFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return frameRef.current;
    }, []);
    return getCurrentFrame;
};
;
var useHoverState = (ref, hideControlsWhenPointerDoesntMove)=>{
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = ref;
        if (!current) {
            return;
        }
        let hoverTimeout;
        const addHoverTimeout = ()=>{
            if (hideControlsWhenPointerDoesntMove) {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(()=>{
                    setHovered(false);
                }, hideControlsWhenPointerDoesntMove === true ? 3000 : hideControlsWhenPointerDoesntMove);
            }
        };
        const onHover = ()=>{
            setHovered(true);
            addHoverTimeout();
        };
        const onLeave = ()=>{
            setHovered(false);
            clearTimeout(hoverTimeout);
        };
        const onMove = ()=>{
            setHovered(true);
            addHoverTimeout();
        };
        current.addEventListener("mouseenter", onHover);
        current.addEventListener("mouseleave", onLeave);
        current.addEventListener("mousemove", onMove);
        return ()=>{
            current.removeEventListener("mouseenter", onHover);
            current.removeEventListener("mouseleave", onLeave);
            current.removeEventListener("mousemove", onMove);
            clearTimeout(hoverTimeout);
        };
    }, [
        hideControlsWhenPointerDoesntMove,
        ref
    ]);
    return hovered;
};
;
;
;
;
;
var usePlayer = ()=>{
    const [playing, setPlaying, imperativePlaying] = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.usePlayingState();
    const [hasPlayed, setHasPlayed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const playStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(frame);
    const setFrame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelineSetFrame();
    const setTimelinePosition = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelineSetFrame();
    const audioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].SharedAudioContext);
    const { audioAndVideoTags } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext);
    const frameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(frame);
    frameRef.current = frame;
    const video = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useVideo();
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const emitter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PlayerEventEmitterContext);
    const lastFrame = (config?.durationInFrames ?? 1) - 1;
    const isLastFrame = frame === lastFrame;
    const isFirstFrame = frame === 0;
    if (!emitter) {
        throw new TypeError("Expected Player event emitter context");
    }
    const bufferingContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!bufferingContext) {
        throw new Error("Missing the buffering context. Most likely you have a Remotion version mismatch.");
    }
    const { buffering } = bufferingContext;
    const seek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((newFrame)=>{
        if (video?.id) {
            setTimelinePosition((c)=>({
                    ...c,
                    [video.id]: newFrame
                }));
        }
        frameRef.current = newFrame;
        emitter.dispatchSeek(newFrame);
    }, [
        emitter,
        setTimelinePosition,
        video?.id
    ]);
    const play = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (imperativePlaying.current) {
            return;
        }
        setHasPlayed(true);
        if (isLastFrame) {
            seek(0);
        }
        audioContext?.audioContext?.resume();
        if (audioContext && audioContext.numberOfAudioTags > 0 && e) {
            audioContext.playAllAudios();
        }
        audioAndVideoTags.current.forEach((a)=>a.play("player play() was called and playing audio from a click"));
        imperativePlaying.current = true;
        setPlaying(true);
        playStart.current = frameRef.current;
        emitter.dispatchPlay();
    }, [
        imperativePlaying,
        isLastFrame,
        audioContext,
        setPlaying,
        emitter,
        seek,
        audioAndVideoTags
    ]);
    const pause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (imperativePlaying.current) {
            imperativePlaying.current = false;
            setPlaying(false);
            emitter.dispatchPause();
            audioContext?.audioContext?.suspend();
        }
    }, [
        emitter,
        imperativePlaying,
        setPlaying,
        audioContext
    ]);
    const pauseAndReturnToPlayStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (imperativePlaying.current) {
            imperativePlaying.current = false;
            frameRef.current = playStart.current;
            if (config) {
                setTimelinePosition((c)=>({
                        ...c,
                        [config.id]: playStart.current
                    }));
                setPlaying(false);
                emitter.dispatchPause();
            }
        }
    }, [
        config,
        emitter,
        imperativePlaying,
        setPlaying,
        setTimelinePosition
    ]);
    const videoId = video?.id;
    const frameBack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((frames)=>{
        if (!videoId) {
            return null;
        }
        if (imperativePlaying.current) {
            return;
        }
        setFrame((c)=>{
            const prevFrame = c[videoId] ?? window.remotion_initialFrame ?? 0;
            const newFrame = Math.max(0, prevFrame - frames);
            if (prevFrame === newFrame) {
                return c;
            }
            return {
                ...c,
                [videoId]: newFrame
            };
        });
    }, [
        imperativePlaying,
        setFrame,
        videoId
    ]);
    const frameForward = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((frames)=>{
        if (!videoId) {
            return null;
        }
        if (imperativePlaying.current) {
            return;
        }
        setFrame((c)=>{
            const prevFrame = c[videoId] ?? window.remotion_initialFrame ?? 0;
            const newFrame = Math.min(lastFrame, prevFrame + frames);
            if (prevFrame === newFrame) {
                return c;
            }
            return {
                ...c,
                [videoId]: newFrame
            };
        });
    }, [
        videoId,
        imperativePlaying,
        lastFrame,
        setFrame
    ]);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (imperativePlaying.current) {
            pause();
        } else {
            play(e);
        }
    }, [
        imperativePlaying,
        pause,
        play
    ]);
    const returnValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            frameBack,
            frameForward,
            isLastFrame,
            emitter,
            playing,
            play,
            pause,
            seek,
            isFirstFrame,
            getCurrentFrame: ()=>frameRef.current,
            isPlaying: ()=>imperativePlaying.current,
            isBuffering: ()=>buffering.current,
            pauseAndReturnToPlayStart,
            hasPlayed,
            toggle
        };
    }, [
        buffering,
        emitter,
        frameBack,
        frameForward,
        hasPlayed,
        imperativePlaying,
        isFirstFrame,
        isLastFrame,
        pause,
        pauseAndReturnToPlayStart,
        play,
        playing,
        seek,
        toggle
    ]);
    return returnValue;
};
// src/browser-mediasession.ts
var useBrowserMediaSession = ({ browserMediaControlsBehavior, videoConfig, playbackRate })=>{
    const { playing, pause, play, emitter, getCurrentFrame, seek } = usePlayer();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!navigator.mediaSession) {
            return;
        }
        if (browserMediaControlsBehavior.mode === "do-nothing") {
            return;
        }
        if (playing) {
            navigator.mediaSession.playbackState = "playing";
        } else {
            navigator.mediaSession.playbackState = "paused";
        }
    }, [
        browserMediaControlsBehavior.mode,
        playing
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!navigator.mediaSession) {
            return;
        }
        if (browserMediaControlsBehavior.mode === "do-nothing") {
            return;
        }
        const onTimeUpdate = ()=>{
            if (!videoConfig) {
                return;
            }
            if (navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: videoConfig.durationInFrames / videoConfig.fps,
                    playbackRate,
                    position: getCurrentFrame() / videoConfig.fps
                });
            }
        };
        emitter.addEventListener("timeupdate", onTimeUpdate);
        return ()=>{
            emitter.removeEventListener("timeupdate", onTimeUpdate);
        };
    }, [
        browserMediaControlsBehavior.mode,
        emitter,
        getCurrentFrame,
        playbackRate,
        videoConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!navigator.mediaSession) {
            return;
        }
        if (browserMediaControlsBehavior.mode === "do-nothing") {
            return;
        }
        navigator.mediaSession.setActionHandler("play", ()=>{
            if (browserMediaControlsBehavior.mode === "register-media-session") {
                play();
            }
        });
        navigator.mediaSession.setActionHandler("pause", ()=>{
            if (browserMediaControlsBehavior.mode === "register-media-session") {
                pause();
            }
        });
        navigator.mediaSession.setActionHandler("seekto", (event)=>{
            if (browserMediaControlsBehavior.mode === "register-media-session" && event.seekTime !== undefined && videoConfig) {
                seek(Math.round(event.seekTime * videoConfig.fps));
            }
        });
        navigator.mediaSession.setActionHandler("seekbackward", ()=>{
            if (browserMediaControlsBehavior.mode === "register-media-session" && videoConfig) {
                seek(Math.max(0, Math.round((getCurrentFrame() - 10) * videoConfig.fps)));
            }
        });
        navigator.mediaSession.setActionHandler("seekforward", ()=>{
            if (browserMediaControlsBehavior.mode === "register-media-session" && videoConfig) {
                seek(Math.max(videoConfig.durationInFrames - 1, Math.round((getCurrentFrame() + 10) * videoConfig.fps)));
            }
        });
        navigator.mediaSession.setActionHandler("previoustrack", ()=>{
            if (browserMediaControlsBehavior.mode === "register-media-session") {
                seek(0);
            }
        });
        return ()=>{
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.setActionHandler("play", null);
            navigator.mediaSession.setActionHandler("pause", null);
            navigator.mediaSession.setActionHandler("seekto", null);
            navigator.mediaSession.setActionHandler("seekbackward", null);
            navigator.mediaSession.setActionHandler("seekforward", null);
            navigator.mediaSession.setActionHandler("previoustrack", null);
        };
    }, [
        browserMediaControlsBehavior.mode,
        getCurrentFrame,
        pause,
        play,
        seek,
        videoConfig
    ]);
};
// src/calculate-next-frame.ts
var calculateNextFrame = ({ time, currentFrame: startFrame, playbackSpeed, fps, actualLastFrame, actualFirstFrame, framesAdvanced, shouldLoop })=>{
    const op = playbackSpeed < 0 ? Math.ceil : Math.floor;
    const framesToAdvance = op(time * playbackSpeed / (1000 / fps)) - framesAdvanced;
    const nextFrame = framesToAdvance + startFrame;
    const isCurrentFrameOutside = startFrame > actualLastFrame || startFrame < actualFirstFrame;
    const isNextFrameOutside = nextFrame > actualLastFrame || nextFrame < actualFirstFrame;
    const hasEnded = !shouldLoop && isNextFrameOutside && !isCurrentFrameOutside;
    if (playbackSpeed > 0) {
        if (isNextFrameOutside) {
            return {
                nextFrame: actualFirstFrame,
                framesToAdvance,
                hasEnded
            };
        }
        return {
            nextFrame,
            framesToAdvance,
            hasEnded
        };
    }
    if (isNextFrameOutside) {
        return {
            nextFrame: actualLastFrame,
            framesToAdvance,
            hasEnded
        };
    }
    return {
        nextFrame,
        framesToAdvance,
        hasEnded
    };
};
;
var getIsBackgrounded = ()=>{
    if (typeof document === "undefined") {
        return false;
    }
    return document.visibilityState === "hidden";
};
var useIsBackgrounded = ()=>{
    const isBackgrounded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(getIsBackgrounded());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onVisibilityChange = ()=>{
            isBackgrounded.current = getIsBackgrounded();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return ()=>{
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);
    return isBackgrounded;
};
// src/use-playback.ts
var usePlayback = ({ loop, playbackRate, moveToBeginningWhenEnded, inFrame, outFrame, browserMediaControlsBehavior, getCurrentFrame })=>{
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const { playing, pause, emitter } = usePlayer();
    const setFrame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelineSetFrame();
    const isBackgroundedRef = useIsBackgrounded();
    const lastTimeUpdateEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!context) {
        throw new Error("Missing the buffering context. Most likely you have a Remotion version mismatch.");
    }
    useBrowserMediaSession({
        browserMediaControlsBehavior,
        playbackRate,
        videoConfig: config
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!config) {
            return;
        }
        if (!playing) {
            return;
        }
        let hasBeenStopped = false;
        let reqAnimFrameCall = null;
        let startedTime = performance.now();
        let framesAdvanced = 0;
        const cancelQueuedFrame = ()=>{
            if (reqAnimFrameCall !== null) {
                if (reqAnimFrameCall.type === "raf") {
                    cancelAnimationFrame(reqAnimFrameCall.id);
                } else {
                    clearTimeout(reqAnimFrameCall.id);
                }
            }
        };
        const stop = ()=>{
            hasBeenStopped = true;
            cancelQueuedFrame();
        };
        const callback = ()=>{
            if (hasBeenStopped) {
                return;
            }
            const time = performance.now() - startedTime;
            const actualLastFrame = outFrame ?? config.durationInFrames - 1;
            const actualFirstFrame = inFrame ?? 0;
            const currentFrame = getCurrentFrame();
            const { nextFrame, framesToAdvance, hasEnded } = calculateNextFrame({
                time,
                currentFrame,
                playbackSpeed: playbackRate,
                fps: config.fps,
                actualFirstFrame,
                actualLastFrame,
                framesAdvanced,
                shouldLoop: loop
            });
            framesAdvanced += framesToAdvance;
            if (nextFrame !== getCurrentFrame() && (!hasEnded || moveToBeginningWhenEnded)) {
                setFrame((c)=>({
                        ...c,
                        [config.id]: nextFrame
                    }));
            }
            if (hasEnded) {
                stop();
                pause();
                emitter.dispatchEnded();
                return;
            }
            queueNextFrame();
        };
        const queueNextFrame = ()=>{
            if (context.buffering.current) {
                const stopListening = context.listenForResume(()=>{
                    stopListening.remove();
                    startedTime = performance.now();
                    framesAdvanced = 0;
                    queueNextFrame();
                });
                return;
            }
            if (isBackgroundedRef.current) {
                reqAnimFrameCall = {
                    type: "timeout",
                    id: setTimeout(callback, 1000 / config.fps)
                };
                return;
            }
            reqAnimFrameCall = {
                type: "raf",
                id: requestAnimationFrame(callback)
            };
        };
        queueNextFrame();
        const onVisibilityChange = ()=>{
            if (document.visibilityState === "visible") {
                return;
            }
            cancelQueuedFrame();
            callback();
        };
        window.addEventListener("visibilitychange", onVisibilityChange);
        return ()=>{
            window.removeEventListener("visibilitychange", onVisibilityChange);
            stop();
        };
    }, [
        config,
        loop,
        pause,
        playing,
        setFrame,
        emitter,
        playbackRate,
        inFrame,
        outFrame,
        moveToBeginningWhenEnded,
        isBackgroundedRef,
        getCurrentFrame,
        context
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const interval = setInterval(()=>{
            if (lastTimeUpdateEvent.current === getCurrentFrame()) {
                return;
            }
            emitter.dispatchTimeUpdate({
                frame: getCurrentFrame()
            });
            lastTimeUpdateEvent.current = getCurrentFrame();
        }, 250);
        return ()=>clearInterval(interval);
    }, [
        emitter,
        getCurrentFrame
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        emitter.dispatchFrameUpdate({
            frame
        });
    }, [
        emitter,
        frame
    ]);
};
;
var elementSizeHooks = [];
var updateAllElementsSizes = ()=>{
    for (const listener of elementSizeHooks){
        listener();
    }
};
var useElementSize = (ref, options)=>{
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if (!ref.current) {
            return null;
        }
        const rect = ref.current.getClientRects();
        if (!rect[0]) {
            return null;
        }
        return {
            width: rect[0].width,
            height: rect[0].height,
            left: rect[0].x,
            top: rect[0].y,
            windowSize: {
                height: window.innerHeight,
                width: window.innerWidth
            }
        };
    });
    const observer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (typeof ResizeObserver === "undefined") {
            return null;
        }
        return new ResizeObserver((entries)=>{
            const { contentRect, target } = entries[0];
            const newSize = target.getClientRects();
            if (!newSize?.[0]) {
                setSize(null);
                return;
            }
            const probableCssParentScale = contentRect.width === 0 ? 1 : newSize[0].width / contentRect.width;
            const width = options.shouldApplyCssTransforms || probableCssParentScale === 0 ? newSize[0].width : newSize[0].width * (1 / probableCssParentScale);
            const height = options.shouldApplyCssTransforms || probableCssParentScale === 0 ? newSize[0].height : newSize[0].height * (1 / probableCssParentScale);
            setSize((prevState)=>{
                const isSame = prevState && prevState.width === width && prevState.height === height && prevState.left === newSize[0].x && prevState.top === newSize[0].y && prevState.windowSize.height === window.innerHeight && prevState.windowSize.width === window.innerWidth;
                if (isSame) {
                    return prevState;
                }
                return {
                    width,
                    height,
                    left: newSize[0].x,
                    top: newSize[0].y,
                    windowSize: {
                        height: window.innerHeight,
                        width: window.innerWidth
                    }
                };
            });
        });
    }, [
        options.shouldApplyCssTransforms
    ]);
    const updateSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!ref.current) {
            return;
        }
        const rect = ref.current.getClientRects();
        if (!rect[0]) {
            setSize(null);
            return;
        }
        setSize((prevState)=>{
            const isSame = prevState && prevState.width === rect[0].width && prevState.height === rect[0].height && prevState.left === rect[0].x && prevState.top === rect[0].y && prevState.windowSize.height === window.innerHeight && prevState.windowSize.width === window.innerWidth;
            if (isSame) {
                return prevState;
            }
            return {
                width: rect[0].width,
                height: rect[0].height,
                left: rect[0].x,
                top: rect[0].y,
                windowSize: {
                    height: window.innerHeight,
                    width: window.innerWidth
                }
            };
        });
    }, [
        ref
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!observer) {
            return;
        }
        const { current } = ref;
        if (current) {
            observer.observe(current);
        }
        return ()=>{
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [
        observer,
        ref,
        updateSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!options.triggerOnWindowResize) {
            return;
        }
        window.addEventListener("resize", updateSize);
        return ()=>{
            window.removeEventListener("resize", updateSize);
        };
    }, [
        options.triggerOnWindowResize,
        updateSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        elementSizeHooks.push(updateSize);
        return ()=>{
            elementSizeHooks = elementSizeHooks.filter((e)=>e !== updateSize);
        };
    }, [
        updateSize
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!size) {
            return null;
        }
        return {
            ...size,
            refresh: updateSize
        };
    }, [
        size,
        updateSize
    ]);
};
;
;
;
;
;
;
var DefaultPlayPauseButton = ({ playing, buffering })=>{
    if (playing && buffering) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(BufferingIndicator, {
            type: "player"
        });
    }
    if (playing) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PauseIcon, {});
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlayIcon, {});
};
;
;
;
;
;
var KNOB_SIZE = 12;
var BAR_HEIGHT = 5;
var DefaultVolumeSlider = ({ volume, isVertical, onBlur, inputRef, setVolume })=>{
    const sliderContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const paddingLeft = 5;
        const common = {
            paddingLeft,
            height: ICON_SIZE,
            width: VOLUME_SLIDER_WIDTH,
            display: "inline-flex",
            alignItems: "center"
        };
        if (isVertical) {
            return {
                ...common,
                position: "absolute",
                transform: `rotate(-90deg) translateX(${VOLUME_SLIDER_WIDTH / 2 + ICON_SIZE / 2}px)`
            };
        }
        return {
            ...common
        };
    }, [
        isVertical
    ]);
    const randomId = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useId === "undefined" ? "volume-slider" : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useId();
    const [randomClass] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>`__remotion-volume-slider-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["random"])(randomId)}`.replace(".", ""));
    const onVolumeChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        setVolume(parseFloat(e.target.value));
    }, [
        setVolume
    ]);
    const inputStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const commonStyle = {
            WebkitAppearance: "none",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: BAR_HEIGHT / 2,
            cursor: "pointer",
            height: BAR_HEIGHT,
            width: VOLUME_SLIDER_WIDTH,
            backgroundImage: `linear-gradient(
				to right,
				white ${volume * 100}%, rgba(255, 255, 255, 0) ${volume * 100}%
			)`
        };
        if (isVertical) {
            return {
                ...commonStyle,
                bottom: ICON_SIZE + VOLUME_SLIDER_WIDTH / 2
            };
        }
        return commonStyle;
    }, [
        isVertical,
        volume
    ]);
    const sliderStyle = `
	.${randomClass}::-webkit-slider-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}

	.${randomClass}::-moz-range-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}
`;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        style: sliderContainer,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("style", {
                dangerouslySetInnerHTML: {
                    __html: sliderStyle
                }
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("input", {
                ref: inputRef,
                "aria-label": "Change volume",
                className: randomClass,
                max: 1,
                min: 0,
                onBlur,
                onChange: onVolumeChange,
                step: 0.01,
                type: "range",
                value: volume,
                style: inputStyle
            })
        ]
    });
};
var renderDefaultVolumeSlider = (props)=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(DefaultVolumeSlider, {
        ...props
    });
};
;
var VOLUME_SLIDER_WIDTH = 100;
var MediaVolumeSlider = ({ displayVerticalVolumeSlider, renderMuteButton, renderVolumeSlider })=>{
    const [mediaMuted, setMediaMuted] = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useMediaMutedState();
    const [mediaVolume, setMediaVolume] = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useMediaVolumeState();
    const [focused, setFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const parentDivRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hover = useHoverState(parentDivRef, false);
    const onBlur = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setTimeout(()=>{
            if (inputRef.current && document.activeElement !== inputRef.current) {
                setFocused(false);
            }
        }, 10);
    }, []);
    const isVolume0 = mediaVolume === 0;
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (isVolume0) {
            setMediaVolume(1);
            setMediaMuted(false);
            return;
        }
        setMediaMuted((mute)=>!mute);
    }, [
        isVolume0,
        setMediaMuted,
        setMediaVolume
    ]);
    const parentDivStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            display: "inline-flex",
            background: "none",
            border: "none",
            justifyContent: "center",
            alignItems: "center",
            touchAction: "none",
            ...displayVerticalVolumeSlider && {
                position: "relative"
            }
        };
    }, [
        displayVerticalVolumeSlider
    ]);
    const volumeContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            display: "inline",
            width: ICON_SIZE,
            height: ICON_SIZE,
            cursor: "pointer",
            appearance: "none",
            background: "none",
            border: "none",
            padding: 0
        };
    }, []);
    const renderDefaultMuteButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(({ muted, volume })=>{
        const isMutedOrZero = muted || volume === 0;
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("button", {
            "aria-label": isMutedOrZero ? "Unmute sound" : "Mute sound",
            title: isMutedOrZero ? "Unmute sound" : "Mute sound",
            onClick,
            onBlur,
            onFocus: ()=>setFocused(true),
            style: volumeContainer,
            type: "button",
            children: isMutedOrZero ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VolumeOffIcon, {}) : /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VolumeOnIcon, {})
        });
    }, [
        onBlur,
        onClick,
        volumeContainer
    ]);
    const muteButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return renderMuteButton ? renderMuteButton({
            muted: mediaMuted,
            volume: mediaVolume
        }) : renderDefaultMuteButton({
            muted: mediaMuted,
            volume: mediaVolume
        });
    }, [
        mediaMuted,
        mediaVolume,
        renderDefaultMuteButton,
        renderMuteButton
    ]);
    const volumeSlider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return (focused || hover) && !mediaMuted && !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].isIosSafari() ? (renderVolumeSlider ?? renderDefaultVolumeSlider)({
            isVertical: displayVerticalVolumeSlider,
            volume: mediaVolume,
            onBlur: ()=>setFocused(false),
            inputRef,
            setVolume: setMediaVolume
        }) : null;
    }, [
        displayVerticalVolumeSlider,
        focused,
        hover,
        mediaMuted,
        mediaVolume,
        renderVolumeSlider,
        setMediaVolume
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        ref: parentDivRef,
        style: parentDivStyle,
        children: [
            muteButton,
            volumeSlider
        ]
    });
};
;
;
;
function useComponentVisible(initialIsVisible) {
    const [isComponentVisible, setIsComponentVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialIsVisible);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (ref.current && !ref.current.contains(event.target)) {
                setIsComponentVisible(false);
            }
        };
        document.addEventListener("pointerup", handleClickOutside, true);
        return ()=>{
            document.removeEventListener("pointerup", handleClickOutside, true);
        };
    }, []);
    return {
        ref,
        isComponentVisible,
        setIsComponentVisible
    };
}
;
var BOTTOM = 35;
var THRESHOLD = 70;
var rateDiv = {
    height: 30,
    paddingRight: 15,
    paddingLeft: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
};
var checkmarkContainer = {
    width: 22,
    display: "flex",
    alignItems: "center"
};
var checkmarkStyle = {
    width: 14,
    height: 14,
    color: "black"
};
var Checkmark = ()=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        viewBox: "0 0 512 512",
        style: checkmarkStyle,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
            fill: "currentColor",
            d: "M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"
        })
    });
var formatPlaybackRate = (rate)=>{
    const str = rate.toString();
    return str.includes(".") ? str : str + ".0";
};
var PlaybackrateOption = ({ rate, onSelect, selectedRate, keyboardSelectedRate })=>{
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.stopPropagation();
        e.preventDefault();
        onSelect(rate);
    }, [
        onSelect,
        rate
    ]);
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const onMouseEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setHovered(true);
    }, []);
    const onMouseLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setHovered(false);
    }, []);
    const isFocused = keyboardSelectedRate === rate;
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            ...rateDiv,
            backgroundColor: hovered || isFocused ? "#eee" : "transparent"
        };
    }, [
        hovered,
        isFocused
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        onMouseEnter,
        onMouseLeave,
        tabIndex: 0,
        style: actualStyle,
        onClick,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: checkmarkContainer,
                children: rate === selectedRate ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Checkmark, {}) : null
            }),
            formatPlaybackRate(rate),
            "x"
        ]
    }, rate);
};
var PlaybackPopup = ({ setIsComponentVisible, playbackRates, canvasSize })=>{
    const { setPlaybackRate, playbackRate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext);
    const [keyboardSelectedRate, setKeyboardSelectedRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(playbackRate);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const listener = (e)=>{
            e.preventDefault();
            if (e.key === "ArrowUp") {
                const currentIndex = playbackRates.findIndex((rate)=>rate === keyboardSelectedRate);
                if (currentIndex === 0) {
                    return;
                }
                if (currentIndex === -1) {
                    setKeyboardSelectedRate(playbackRates[0]);
                } else {
                    setKeyboardSelectedRate(playbackRates[currentIndex - 1]);
                }
            } else if (e.key === "ArrowDown") {
                const currentIndex = playbackRates.findIndex((rate)=>rate === keyboardSelectedRate);
                if (currentIndex === playbackRates.length - 1) {
                    return;
                }
                if (currentIndex === -1) {
                    setKeyboardSelectedRate(playbackRates[playbackRates.length - 1]);
                } else {
                    setKeyboardSelectedRate(playbackRates[currentIndex + 1]);
                }
            } else if (e.key === "Enter") {
                setPlaybackRate(keyboardSelectedRate);
                setIsComponentVisible(false);
            }
        };
        window.addEventListener("keydown", listener);
        return ()=>{
            window.removeEventListener("keydown", listener);
        };
    }, [
        playbackRates,
        keyboardSelectedRate,
        setPlaybackRate,
        setIsComponentVisible
    ]);
    const onSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((rate)=>{
        setPlaybackRate(rate);
        setIsComponentVisible(false);
    }, [
        setIsComponentVisible,
        setPlaybackRate
    ]);
    const playbackPopup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            position: "absolute",
            right: 0,
            width: 125,
            maxHeight: canvasSize.height - THRESHOLD - BOTTOM,
            bottom: 35,
            background: "#fff",
            borderRadius: 4,
            overflow: "auto",
            color: "black",
            textAlign: "left"
        };
    }, [
        canvasSize.height
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        style: playbackPopup,
        children: playbackRates.map((rate)=>{
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlaybackrateOption, {
                selectedRate: playbackRate,
                onSelect,
                rate,
                keyboardSelectedRate
            }, rate);
        })
    });
};
var label = {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
    border: "2px solid white",
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2,
    paddingBottom: 2
};
var playerButtonStyle = {
    appearance: "none",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 6,
    paddingBottom: 6,
    height: 37,
    display: "inline-flex",
    marginBottom: 0,
    marginTop: 0,
    alignItems: "center"
};
var button = {
    ...playerButtonStyle,
    position: "relative"
};
var PlaybackrateControl = ({ playbackRates, canvasSize })=>{
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
    const { playbackRate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext);
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.stopPropagation();
        e.preventDefault();
        setIsComponentVisible((prevIsComponentVisible)=>!prevIsComponentVisible);
    }, [
        setIsComponentVisible
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("button", {
            type: "button",
            "aria-label": "Change playback rate",
            style: button,
            onClick,
            children: [
                /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                    style: label,
                    children: [
                        playbackRate,
                        "x"
                    ]
                }),
                isComponentVisible && /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlaybackPopup, {
                    canvasSize,
                    playbackRates,
                    setIsComponentVisible
                })
            ]
        })
    });
};
;
;
;
var getFrameFromX = (clientX, durationInFrames, width)=>{
    const pos = clientX;
    const frame = Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(pos, [
        0,
        width
    ], [
        0,
        durationInFrames - 1
    ], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp"
    }));
    return frame;
};
var BAR_HEIGHT2 = 5;
var KNOB_SIZE2 = 12;
var VERTICAL_PADDING = 4;
var containerStyle = {
    userSelect: "none",
    WebkitUserSelect: "none",
    paddingTop: VERTICAL_PADDING,
    paddingBottom: VERTICAL_PADDING,
    boxSizing: "border-box",
    cursor: "pointer",
    position: "relative",
    touchAction: "none"
};
var barBackground = {
    height: BAR_HEIGHT2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    width: "100%",
    borderRadius: BAR_HEIGHT2 / 2
};
var findBodyInWhichDivIsLocated = (div)=>{
    let current = div;
    while(current.parentElement){
        current = current.parentElement;
    }
    return current;
};
var PlayerSeekBar = ({ durationInFrames, onSeekEnd, onSeekStart, inFrame, outFrame })=>{
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const barHovered = useHoverState(containerRef, false);
    const size = useElementSize(containerRef, {
        triggerOnWindowResize: true,
        shouldApplyCssTransforms: true
    });
    const { seek, play, pause, playing } = usePlayer();
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const [dragging, setDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        dragging: false
    });
    const width = size?.width ?? 0;
    const onPointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.button !== 0) {
            return;
        }
        const posLeft = containerRef.current?.getBoundingClientRect().left;
        const _frame = getFrameFromX(e.clientX - posLeft, durationInFrames, width);
        pause();
        seek(_frame);
        setDragging({
            dragging: true,
            wasPlaying: playing
        });
        onSeekStart();
    }, [
        durationInFrames,
        width,
        pause,
        seek,
        playing,
        onSeekStart
    ]);
    const onPointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (!size) {
            throw new Error("Player has no size");
        }
        if (!dragging.dragging) {
            return;
        }
        const posLeft = containerRef.current?.getBoundingClientRect().left;
        const _frame = getFrameFromX(e.clientX - posLeft, durationInFrames, size.width);
        seek(_frame);
    }, [
        dragging.dragging,
        durationInFrames,
        seek,
        size
    ]);
    const onPointerUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setDragging({
            dragging: false
        });
        if (!dragging.dragging) {
            return;
        }
        if (dragging.wasPlaying) {
            play();
        } else {
            pause();
        }
        onSeekEnd();
    }, [
        dragging,
        onSeekEnd,
        pause,
        play
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!dragging.dragging) {
            return;
        }
        const body = findBodyInWhichDivIsLocated(containerRef.current);
        body.addEventListener("pointermove", onPointerMove);
        body.addEventListener("pointerup", onPointerUp);
        return ()=>{
            body.removeEventListener("pointermove", onPointerMove);
            body.removeEventListener("pointerup", onPointerUp);
        };
    }, [
        dragging.dragging,
        onPointerMove,
        onPointerUp
    ]);
    const knobStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            height: KNOB_SIZE2,
            width: KNOB_SIZE2,
            borderRadius: KNOB_SIZE2 / 2,
            position: "absolute",
            top: VERTICAL_PADDING - KNOB_SIZE2 / 2 + 5 / 2,
            backgroundColor: "white",
            left: Math.max(0, frame / Math.max(1, durationInFrames - 1) * width - KNOB_SIZE2 / 2),
            boxShadow: "0 0 2px black",
            opacity: Number(barHovered || dragging.dragging)
        };
    }, [
        barHovered,
        dragging.dragging,
        durationInFrames,
        frame,
        width
    ]);
    const fillStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            height: BAR_HEIGHT2,
            backgroundColor: "rgba(255, 255, 255, 1)",
            width: (frame - (inFrame ?? 0)) / (durationInFrames - 1) * width,
            marginLeft: (inFrame ?? 0) / (durationInFrames - 1) * width,
            borderRadius: BAR_HEIGHT2 / 2
        };
    }, [
        durationInFrames,
        frame,
        inFrame,
        width
    ]);
    const active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            height: BAR_HEIGHT2,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            width: ((outFrame ?? durationInFrames - 1) - (inFrame ?? 0)) / (durationInFrames - 1) * 100 + "%",
            marginLeft: (inFrame ?? 0) / (durationInFrames - 1) * 100 + "%",
            borderRadius: BAR_HEIGHT2 / 2,
            position: "absolute"
        };
    }, [
        durationInFrames,
        inFrame,
        outFrame
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        ref: containerRef,
        onPointerDown,
        style: containerStyle,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                style: barBackground,
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: active
                    }),
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: fillStyle
                    })
                ]
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: knobStyle
            })
        ]
    });
};
;
;
// src/format-time.ts
var formatTime = (timeInSeconds)=>{
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds - minutes * 60);
    return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
};
;
var PlayerTimeLabel = ({ durationInFrames, maxTimeLabelWidth, fps })=>{
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const timeLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            color: "white",
            fontFamily: "sans-serif",
            fontSize: 14,
            maxWidth: maxTimeLabelWidth === null ? undefined : maxTimeLabelWidth,
            overflow: "hidden",
            textOverflow: "ellipsis"
        };
    }, [
        maxTimeLabelWidth
    ]);
    const isLastFrame = frame === durationInFrames - 1;
    const frameToDisplay = isLastFrame ? frame + 1 : frame;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        style: timeLabel,
        children: [
            formatTime(frameToDisplay / fps),
            " / ",
            formatTime(durationInFrames / fps)
        ]
    });
};
;
var X_SPACER = 10;
var X_PADDING = 12;
var useVideoControlsResize = ({ allowFullscreen: allowFullScreen, playerWidth })=>{
    const resizeInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const playPauseIconSize = ICON_SIZE;
        const volumeIconSize = ICON_SIZE;
        const _fullscreenIconSize = allowFullScreen ? fullscreenIconSize : 0;
        const elementsSize = volumeIconSize + playPauseIconSize + _fullscreenIconSize + X_PADDING * 2 + X_SPACER * 2;
        const maxTimeLabelWidth = playerWidth - elementsSize;
        const maxTimeLabelWidthWithoutNegativeValue = Math.max(maxTimeLabelWidth, 0);
        const availableTimeLabelWidthIfVolumeOpen = maxTimeLabelWidthWithoutNegativeValue - VOLUME_SLIDER_WIDTH;
        const computedLabelWidth = availableTimeLabelWidthIfVolumeOpen < VOLUME_SLIDER_WIDTH ? maxTimeLabelWidthWithoutNegativeValue : availableTimeLabelWidthIfVolumeOpen;
        const minWidthForHorizontalDisplay = computedLabelWidth + elementsSize + VOLUME_SLIDER_WIDTH;
        const displayVerticalVolumeSlider = playerWidth < minWidthForHorizontalDisplay;
        return {
            maxTimeLabelWidth: maxTimeLabelWidthWithoutNegativeValue === 0 ? null : maxTimeLabelWidthWithoutNegativeValue,
            displayVerticalVolumeSlider
        };
    }, [
        allowFullScreen,
        playerWidth
    ]);
    return resizeInfo;
};
;
var gradientSteps = [
    0,
    0.013,
    0.049,
    0.104,
    0.175,
    0.259,
    0.352,
    0.45,
    0.55,
    0.648,
    0.741,
    0.825,
    0.896,
    0.951,
    0.987
];
var gradientOpacities = [
    0,
    8.1,
    15.5,
    22.5,
    29,
    35.3,
    41.2,
    47.1,
    52.9,
    58.8,
    64.7,
    71,
    77.5,
    84.5,
    91.9
];
var globalGradientOpacity = 1 / 0.7;
var containerStyle2 = {
    boxSizing: "border-box",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingTop: 40,
    paddingBottom: 10,
    backgroundImage: `linear-gradient(to bottom,${gradientSteps.map((g, i)=>{
        return `hsla(0, 0%, 0%, ${g}) ${gradientOpacities[i] * globalGradientOpacity}%`;
    }).join(", ")}, hsl(0, 0%, 0%) 100%)`,
    backgroundSize: "auto 145px",
    display: "flex",
    paddingRight: X_PADDING,
    paddingLeft: X_PADDING,
    flexDirection: "column",
    transition: "opacity 0.3s"
};
var controlsRow = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none"
};
var leftPartStyle = {
    display: "flex",
    flexDirection: "row",
    userSelect: "none",
    WebkitUserSelect: "none",
    alignItems: "center"
};
var xSpacer = {
    width: 12
};
var ySpacer = {
    height: 8
};
var flex1 = {
    flex: 1
};
var fullscreen = {};
var Controls = ({ durationInFrames, isFullscreen, fps, showVolumeControls, onFullscreenButtonClick, allowFullscreen, onExitFullscreenButtonClick, spaceKeyToPlayOrPause, onSeekEnd, onSeekStart, inFrame, outFrame, initiallyShowControls, canvasSize, renderPlayPauseButton, renderFullscreenButton, alwaysShowControls, showPlaybackRateControl, containerRef, buffering, hideControlsWhenPointerDoesntMove, onPointerDown, onDoubleClick, renderMuteButton, renderVolumeSlider, playing, toggle })=>{
    const playButtonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [supportsFullscreen, setSupportsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const hovered = useHoverState(containerRef, hideControlsWhenPointerDoesntMove);
    const { maxTimeLabelWidth, displayVerticalVolumeSlider } = useVideoControlsResize({
        allowFullscreen,
        playerWidth: canvasSize?.width ?? 0
    });
    const [shouldShowInitially, setInitiallyShowControls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if (typeof initiallyShowControls === "boolean") {
            return initiallyShowControls;
        }
        if (typeof initiallyShowControls === "number") {
            if (initiallyShowControls % 1 !== 0) {
                throw new Error("initiallyShowControls must be an integer or a boolean");
            }
            if (Number.isNaN(initiallyShowControls)) {
                throw new Error("initiallyShowControls must not be NaN");
            }
            if (!Number.isFinite(initiallyShowControls)) {
                throw new Error("initiallyShowControls must be finite");
            }
            if (initiallyShowControls <= 0) {
                throw new Error("initiallyShowControls must be a positive integer");
            }
            return initiallyShowControls;
        }
        throw new TypeError("initiallyShowControls must be a number or a boolean");
    });
    const containerCss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const shouldShow = hovered || !playing || shouldShowInitially || alwaysShowControls;
        return {
            ...containerStyle2,
            opacity: Number(shouldShow)
        };
    }, [
        hovered,
        shouldShowInitially,
        playing,
        alwaysShowControls
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (playButtonRef.current && spaceKeyToPlayOrPause) {
            playButtonRef.current.focus({
                preventScroll: true
            });
        }
    }, [
        playing,
        spaceKeyToPlayOrPause
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setSupportsFullscreen((typeof document !== "undefined" && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) ?? false);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (shouldShowInitially === false) {
            return;
        }
        const time = shouldShowInitially === true ? 2000 : shouldShowInitially;
        const timeout = setTimeout(()=>{
            setInitiallyShowControls(false);
        }, time);
        return ()=>{
            clearInterval(timeout);
        };
    }, [
        shouldShowInitially
    ]);
    const playbackRates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (showPlaybackRateControl === true) {
            return [
                0.5,
                0.8,
                1,
                1.2,
                1.5,
                1.8,
                2,
                2.5,
                3
            ];
        }
        if (Array.isArray(showPlaybackRateControl)) {
            for (const rate of showPlaybackRateControl){
                if (typeof rate !== "number") {
                    throw new Error("Every item in showPlaybackRateControl must be a number");
                }
                if (rate <= 0) {
                    throw new Error("Every item in showPlaybackRateControl must be positive");
                }
            }
            return showPlaybackRateControl;
        }
        return null;
    }, [
        showPlaybackRateControl
    ]);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const flexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onPointerDownIfContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.target === ref.current || e.target === flexRef.current) {
            onPointerDown?.(e);
        }
    }, [
        onPointerDown
    ]);
    const onDoubleClickIfContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.target === ref.current || e.target === flexRef.current) {
            onDoubleClick?.(e);
        }
    }, [
        onDoubleClick
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        ref,
        style: containerCss,
        onPointerDown: onPointerDownIfContainer,
        onDoubleClick: onDoubleClickIfContainer,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                ref: flexRef,
                style: controlsRow,
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                        style: leftPartStyle,
                        children: [
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("button", {
                                ref: playButtonRef,
                                type: "button",
                                style: playerButtonStyle,
                                onClick: toggle,
                                "aria-label": playing ? "Pause video" : "Play video",
                                title: playing ? "Pause video" : "Play video",
                                children: renderPlayPauseButton === null ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(DefaultPlayPauseButton, {
                                    buffering,
                                    playing
                                }) : renderPlayPauseButton({
                                    playing,
                                    isBuffering: buffering
                                }) ?? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(DefaultPlayPauseButton, {
                                    buffering,
                                    playing
                                })
                            }),
                            showVolumeControls ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                        style: xSpacer
                                    }),
                                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(MediaVolumeSlider, {
                                        renderMuteButton,
                                        renderVolumeSlider,
                                        displayVerticalVolumeSlider
                                    })
                                ]
                            }) : null,
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                style: xSpacer
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlayerTimeLabel, {
                                durationInFrames,
                                fps,
                                maxTimeLabelWidth
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                style: xSpacer
                            })
                        ]
                    }),
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: flex1
                    }),
                    playbackRates && canvasSize && /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlaybackrateControl, {
                        canvasSize,
                        playbackRates
                    }),
                    playbackRates && supportsFullscreen && allowFullscreen ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: xSpacer
                    }) : null,
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: fullscreen,
                        children: supportsFullscreen && allowFullscreen ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("button", {
                            type: "button",
                            "aria-label": isFullscreen ? "Exit fullscreen" : "Enter Fullscreen",
                            title: isFullscreen ? "Exit fullscreen" : "Enter Fullscreen",
                            style: playerButtonStyle,
                            onClick: isFullscreen ? onExitFullscreenButtonClick : onFullscreenButtonClick,
                            children: renderFullscreenButton === null ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(FullscreenIcon, {
                                isFullscreen
                            }) : renderFullscreenButton({
                                isFullscreen
                            })
                        }) : null
                    })
                ]
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: ySpacer
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlayerSeekBar, {
                onSeekEnd,
                onSeekStart,
                durationInFrames,
                inFrame,
                outFrame
            })
        ]
    });
};
;
;
var errorStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    height: "100%",
    width: "100%"
};
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Component {
    state = {
        hasError: null
    };
    static getDerivedStateFromError(error) {
        return {
            hasError: error
        };
    }
    componentDidCatch(error) {
        this.props.onError(error);
    }
    render() {
        if (this.state.hasError) {
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: errorStyle,
                children: this.props.errorFallback({
                    error: this.state.hasError
                })
            });
        }
        return this.props.children;
    }
}
;
;
var getHashOfDomain = async ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return null;
    }
    //TURBOPACK unreachable
    ;
};
var style = {
    backgroundColor: "red",
    position: "absolute",
    padding: 12,
    fontFamily: "Arial"
};
var DOMAIN_BLACKLIST = [
    "28d262b44cc61fa750f1686b16ad0604dabfe193fbc263eec05c89b7ad4c2cd6",
    "4db1b0a94be33165dfefcb3ba03d04c7a2666dd27c496d3dc9fa41858e94925e",
    "fbc48530bbf245da790f63675e84e06bab38c3b114fab07eb350025119922bdc",
    "7baf10a8932757b1b3a22b3fce10a048747ac2f8eaf638603487e3705b07eb83",
    "8a6c21a598d8c667272b5207c051b85997bf5b45d5fb712378be3f27cd72c6a6",
    "a2f7aaac9c50a9255e7fc376110c4e0bfe153722dc66ed3c5d3bf2a135f65518"
];
var ran = false;
var RenderWarningIfBlacklist = ()=>{
    const [unlicensed, setUnlicensed] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (ran) {
            return;
        }
        ran = true;
        getHashOfDomain().then((hash)=>{
            if (hash && DOMAIN_BLACKLIST.includes(hash)) {
                setUnlicensed(true);
            }
        }).catch(()=>{});
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!unlicensed) {
            return;
        }
        const ensureBanner = ()=>{
            const banner = document.querySelector(".warning-banner");
            if (!banner) {
                const div = document.createElement("div");
                div.className = "warning-banner";
                Object.assign(div.style, style, {
                    zIndex: "9999",
                    cssText: `${style.cssText} !important;`
                });
                div.innerHTML = `
	        <a href="https://github.com/remotion-dev/remotion/pull/4589" style="color: white;">
	          Remotion Unlicensed – Contact hi@remotion.dev
	        </a>
	      `;
                document.body.appendChild(div);
            }
        };
        const observer = new MutationObserver(()=>ensureBanner());
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        return ()=>{
            observer.disconnect();
        };
    }, [
        unlicensed
    ]);
    if (!unlicensed) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        style,
        className: "warning-banner",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("a", {
            style: {
                color: "white"
            },
            href: "https://github.com/remotion-dev/remotion/pull/4589",
            children: "Remotion Unlicensed – Contact hi@remotion.dev"
        })
    });
};
// src/player-css-classname.ts
var playerCssClassname = (override)=>{
    return override ?? "__remotion-player";
};
// src/utils/is-node.ts
var IS_NODE = typeof document === "undefined";
;
// src/utils/cancellable-promise.ts
var cancellablePromise = (promise)=>{
    let isCanceled = false;
    const wrappedPromise = new Promise((resolve, reject)=>{
        promise.then((value)=>{
            if (isCanceled) {
                reject({
                    isCanceled,
                    value
                });
                return;
            }
            resolve(value);
        }).catch((error)=>{
            reject({
                isCanceled,
                error
            });
        });
    });
    return {
        promise: wrappedPromise,
        cancel: ()=>{
            isCanceled = true;
        }
    };
};
// src/utils/delay.ts
var delay = (n)=>new Promise((resolve)=>setTimeout(resolve, n));
;
var useCancellablePromises = ()=>{
    const pendingPromises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const appendPendingPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((promise)=>{
        pendingPromises.current = [
            ...pendingPromises.current,
            promise
        ];
    }, []);
    const removePendingPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((promise)=>{
        pendingPromises.current = pendingPromises.current.filter((p)=>p !== promise);
    }, []);
    const clearPendingPromises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>pendingPromises.current.map((p)=>p.cancel()), []);
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            appendPendingPromise,
            removePendingPromise,
            clearPendingPromises
        }), [
        appendPendingPromise,
        clearPendingPromises,
        removePendingPromise
    ]);
    return api;
};
// src/utils/use-click-prevention-on-double-click.ts
var useClickPreventionOnDoubleClick = (onClick, onDoubleClick, doubleClickToFullscreen)=>{
    const api = useCancellablePromises();
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (e)=>{
        if (e instanceof PointerEvent ? e.pointerType === "touch" : e.nativeEvent.pointerType === "touch") {
            onClick(e);
            return;
        }
        api.clearPendingPromises();
        const waitForClick = cancellablePromise(delay(200));
        api.appendPendingPromise(waitForClick);
        try {
            await waitForClick.promise;
            api.removePendingPromise(waitForClick);
            onClick(e);
        } catch (errorInfo) {
            const info = errorInfo;
            api.removePendingPromise(waitForClick);
            if (!info.isCanceled) {
                throw info.error;
            }
        }
    }, [
        api,
        onClick
    ]);
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        document.addEventListener("pointerup", (newEvt)=>{
            handleClick(newEvt);
        }, {
            once: true
        });
    }, [
        handleClick
    ]);
    const handleDoubleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        api.clearPendingPromises();
        onDoubleClick();
    }, [
        api,
        onDoubleClick
    ]);
    const returnValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!doubleClickToFullscreen) {
            return {
                handlePointerDown: onClick,
                handleDoubleClick: ()=>{
                    return;
                }
            };
        }
        return {
            handlePointerDown,
            handleDoubleClick
        };
    }, [
        doubleClickToFullscreen,
        handleDoubleClick,
        handlePointerDown,
        onClick
    ]);
    return returnValue;
};
;
var reactVersion = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].version.split(".")[0];
if (reactVersion === "0") {
    throw new Error(`Version ${reactVersion} of "react" is not supported by Remotion`);
}
var doesReactVersionSupportSuspense = parseInt(reactVersion, 10) >= 18;
var PlayerUI = ({ controls, style: style2, loop, autoPlay, allowFullscreen, inputProps, clickToPlay, showVolumeControls, doubleClickToFullscreen, spaceKeyToPlayOrPause, errorFallback, playbackRate, renderLoading, renderPoster, className: className2, moveToBeginningWhenEnded, showPosterWhenUnplayed, showPosterWhenEnded, showPosterWhenPaused, showPosterWhenBuffering, showPosterWhenBufferingAndPaused, inFrame, outFrame, initiallyShowControls, renderFullscreen: renderFullscreenButton, renderPlayPauseButton, renderMuteButton, renderVolumeSlider, alwaysShowControls, showPlaybackRateControl, posterFillMode, bufferStateDelayInMilliseconds, hideControlsWhenPointerDoesntMove, overflowVisible, browserMediaControlsBehavior, overrideInternalClassName, noSuspense }, ref)=>{
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const video = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useVideo();
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasSize = useElementSize(container, {
        triggerOnWindowResize: false,
        shouldApplyCssTransforms: false
    });
    const [hasPausedToResume, setHasPausedToResume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shouldAutoplay, setShouldAutoPlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(autoPlay);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>false);
    const [seeking, setSeeking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const supportsFullScreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (typeof document === "undefined") {
            return false;
        }
        return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
    }, []);
    const player = usePlayer();
    const playerToggle = player.toggle;
    usePlayback({
        loop,
        playbackRate,
        moveToBeginningWhenEnded,
        inFrame,
        outFrame,
        getCurrentFrame: player.getCurrentFrame,
        browserMediaControlsBehavior
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (hasPausedToResume && !player.playing) {
            setHasPausedToResume(false);
            player.play();
        }
    }, [
        hasPausedToResume,
        player
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = container;
        if (!current) {
            return;
        }
        const onFullscreenChange = ()=>{
            const newValue = document.fullscreenElement === current || document.webkitFullscreenElement === current;
            setIsFullscreen(newValue);
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);
        return ()=>{
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
        };
    }, []);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        playerToggle(e);
    }, [
        playerToggle
    ]);
    const requestFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!allowFullscreen) {
            throw new Error("allowFullscreen is false");
        }
        if (!supportsFullScreen) {
            throw new Error("Browser doesnt support fullscreen");
        }
        if (!container.current) {
            throw new Error("No player ref found");
        }
        if (container.current.webkitRequestFullScreen) {
            container.current.webkitRequestFullScreen();
        } else {
            container.current.requestFullscreen();
        }
    }, [
        allowFullscreen,
        supportsFullScreen
    ]);
    const exitFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { current } = container;
        if (!current) {
            return;
        }
        const fullscreenChange = ()=>{
            const element = document.webkitFullscreenElement ?? document.fullscreenElement;
            if (element && element === container.current) {
                player.emitter.dispatchFullscreenChange({
                    isFullscreen: true
                });
            } else {
                player.emitter.dispatchFullscreenChange({
                    isFullscreen: false
                });
            }
        };
        current.addEventListener("webkitfullscreenchange", fullscreenChange);
        current.addEventListener("fullscreenchange", fullscreenChange);
        return ()=>{
            current.removeEventListener("webkitfullscreenchange", fullscreenChange);
            current.removeEventListener("fullscreenchange", fullscreenChange);
        };
    }, [
        player.emitter
    ]);
    const durationInFrames = config?.durationInFrames ?? 1;
    const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!config || !canvasSize) {
            return null;
        }
        return calculateCanvasTransformation({
            canvasSize,
            compositionHeight: config.height,
            compositionWidth: config.width,
            previewSize: "auto"
        });
    }, [
        canvasSize,
        config
    ]);
    const scale = layout?.scale ?? 1;
    const initialScaleIgnored = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!initialScaleIgnored.current) {
            initialScaleIgnored.current = true;
            return;
        }
        player.emitter.dispatchScaleChange(scale);
    }, [
        player.emitter,
        scale
    ]);
    const { setMediaVolume, setMediaMuted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].SetMediaVolumeContext);
    const { mediaMuted, mediaVolume } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].MediaVolumeContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        player.emitter.dispatchVolumeChange(mediaVolume);
    }, [
        player.emitter,
        mediaVolume
    ]);
    const isMuted = mediaMuted || mediaVolume === 0;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        player.emitter.dispatchMuteChange({
            isMuted
        });
    }, [
        player.emitter,
        isMuted
    ]);
    const [showBufferIndicator, setShowBufferState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let timeout = null;
        let stopped = false;
        const onBuffer = ()=>{
            stopped = false;
            requestAnimationFrame(()=>{
                if (bufferStateDelayInMilliseconds === 0) {
                    setShowBufferState(true);
                } else {
                    timeout = setTimeout(()=>{
                        if (!stopped) {
                            setShowBufferState(true);
                        }
                    }, bufferStateDelayInMilliseconds);
                }
            });
        };
        const onResume = ()=>{
            requestAnimationFrame(()=>{
                stopped = true;
                setShowBufferState(false);
                if (timeout) {
                    clearTimeout(timeout);
                }
            });
        };
        player.emitter.addEventListener("waiting", onBuffer);
        player.emitter.addEventListener("resume", onResume);
        return ()=>{
            player.emitter.removeEventListener("waiting", onBuffer);
            player.emitter.removeEventListener("resume", onResume);
            setShowBufferState(false);
            if (timeout) {
                clearTimeout(timeout);
            }
            stopped = true;
        };
    }, [
        bufferStateDelayInMilliseconds,
        player.emitter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        const methods = {
            play: player.play,
            pause: ()=>{
                setHasPausedToResume(false);
                player.pause();
            },
            toggle,
            getContainerNode: ()=>container.current,
            getCurrentFrame: player.getCurrentFrame,
            isPlaying: player.isPlaying,
            seekTo: (f)=>{
                const lastFrame = durationInFrames - 1;
                const frameToSeekTo = Math.max(0, Math.min(lastFrame, f));
                if (player.isPlaying()) {
                    const pauseToResume = frameToSeekTo !== lastFrame || loop;
                    setHasPausedToResume(pauseToResume);
                    player.pause();
                }
                if (frameToSeekTo === lastFrame && !loop) {
                    player.emitter.dispatchEnded();
                }
                player.seek(frameToSeekTo);
            },
            isFullscreen: ()=>{
                const { current } = container;
                if (!current) {
                    return false;
                }
                return document.fullscreenElement === current || document.webkitFullscreenElement === current;
            },
            requestFullscreen,
            exitFullscreen,
            getVolume: ()=>{
                if (mediaMuted) {
                    return 0;
                }
                return mediaVolume;
            },
            setVolume: (vol)=>{
                if (typeof vol !== "number") {
                    throw new TypeError(`setVolume() takes a number, got value of type ${typeof vol}`);
                }
                if (isNaN(vol)) {
                    throw new TypeError(`setVolume() got a number that is NaN. Volume must be between 0 and 1.`);
                }
                if (vol < 0 || vol > 1) {
                    throw new TypeError(`setVolume() got a number that is out of range. Must be between 0 and 1, got ${typeof vol}`);
                }
                setMediaVolume(vol);
            },
            isMuted: ()=>isMuted,
            mute: ()=>{
                setMediaMuted(true);
            },
            unmute: ()=>{
                setMediaMuted(false);
            },
            getScale: ()=>scale,
            pauseAndReturnToPlayStart: ()=>{
                player.pauseAndReturnToPlayStart();
            }
        };
        return Object.assign(player.emitter, methods);
    }, [
        durationInFrames,
        exitFullscreen,
        loop,
        mediaMuted,
        isMuted,
        mediaVolume,
        player,
        requestFullscreen,
        setMediaMuted,
        setMediaVolume,
        toggle,
        scale
    ]);
    const VideoComponent = video ? video.component : null;
    const outerStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return calculateOuterStyle({
            canvasSize,
            config,
            style: style2,
            overflowVisible,
            layout
        });
    }, [
        canvasSize,
        config,
        layout,
        overflowVisible,
        style2
    ]);
    const outer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return calculateOuter({
            config,
            layout,
            scale,
            overflowVisible
        });
    }, [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const containerStyle3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return calculateContainerStyle({
            config,
            layout,
            scale,
            overflowVisible
        });
    }, [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const playerPause = player.pause;
    const playerDispatchError = player.emitter.dispatchError;
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((error)=>{
        playerPause();
        playerDispatchError(error);
    }, [
        playerDispatchError,
        playerPause
    ]);
    const onFullscreenButtonClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.stopPropagation();
        requestFullscreen();
    }, [
        requestFullscreen
    ]);
    const onExitFullscreenButtonClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.stopPropagation();
        exitFullscreen();
    }, [
        exitFullscreen
    ]);
    const onSingleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const rightClick = e instanceof MouseEvent ? e.button === 2 : e.nativeEvent.button;
        if (rightClick) {
            return;
        }
        toggle(e);
    }, [
        toggle
    ]);
    const onSeekStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSeeking(true);
    }, []);
    const onSeekEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setSeeking(false);
    }, []);
    const onDoubleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (isFullscreen) {
            exitFullscreen();
        } else {
            requestFullscreen();
        }
    }, [
        exitFullscreen,
        isFullscreen,
        requestFullscreen
    ]);
    const { handlePointerDown, handleDoubleClick } = useClickPreventionOnDoubleClick(onSingleClick, onDoubleClick, doubleClickToFullscreen && allowFullscreen && supportsFullScreen);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (shouldAutoplay) {
            player.play();
            setShouldAutoPlay(false);
        }
    }, [
        shouldAutoplay,
        player
    ]);
    const loadingMarkup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return renderLoading ? renderLoading({
            height: outerStyle.height,
            width: outerStyle.width,
            isBuffering: showBufferIndicator
        }) : null;
    }, [
        outerStyle.height,
        outerStyle.width,
        renderLoading,
        showBufferIndicator
    ]);
    const currentScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            type: "scale",
            scale
        };
    }, [
        scale
    ]);
    if (!config) {
        return null;
    }
    const poster = renderPoster ? renderPoster({
        height: posterFillMode === "player-size" ? outerStyle.height : config.height,
        width: posterFillMode === "player-size" ? outerStyle.width : config.width,
        isBuffering: showBufferIndicator
    }) : null;
    if (poster === undefined) {
        throw new TypeError("renderPoster() must return a React element, but undefined was returned");
    }
    const shouldShowPoster = poster && [
        showPosterWhenPaused && !player.isPlaying() && !seeking,
        showPosterWhenEnded && player.isLastFrame && !player.isPlaying(),
        showPosterWhenUnplayed && !player.hasPlayed && !player.isPlaying(),
        showPosterWhenBuffering && showBufferIndicator && player.isPlaying(),
        showPosterWhenBufferingAndPaused && showBufferIndicator && !player.isPlaying()
    ].some(Boolean);
    const { left, top, width, height, ...outerWithoutScale } = outer;
    const content = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                style: outer,
                onPointerDown: clickToPlay ? handlePointerDown : undefined,
                onDoubleClick: doubleClickToFullscreen ? handleDoubleClick : undefined,
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                        style: containerStyle3,
                        className: playerCssClassname(overrideInternalClassName),
                        children: [
                            VideoComponent ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ErrorBoundary, {
                                onError,
                                errorFallback,
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].CurrentScaleContext.Provider, {
                                    value: currentScale,
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VideoComponent, {
                                        ...video?.props ?? {},
                                        ...inputProps ?? {}
                                    })
                                })
                            }) : null,
                            shouldShowPoster && posterFillMode === "composition-size" ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                style: {
                                    ...outerWithoutScale,
                                    width: config.width,
                                    height: config.height
                                },
                                onPointerDown: clickToPlay ? handlePointerDown : undefined,
                                onDoubleClick: doubleClickToFullscreen ? handleDoubleClick : undefined,
                                children: poster
                            }) : null
                        ]
                    }),
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderWarningIfBlacklist, {})
                ]
            }),
            shouldShowPoster && posterFillMode === "player-size" ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: outer,
                onPointerDown: clickToPlay ? handlePointerDown : undefined,
                onDoubleClick: doubleClickToFullscreen ? handleDoubleClick : undefined,
                children: poster
            }) : null,
            controls ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Controls, {
                fps: config.fps,
                playing: player.playing,
                toggle: player.toggle,
                durationInFrames: config.durationInFrames,
                containerRef: container,
                onFullscreenButtonClick,
                isFullscreen,
                allowFullscreen,
                showVolumeControls,
                onExitFullscreenButtonClick,
                spaceKeyToPlayOrPause,
                onSeekEnd,
                onSeekStart,
                inFrame,
                outFrame,
                initiallyShowControls,
                canvasSize,
                renderFullscreenButton,
                renderPlayPauseButton,
                alwaysShowControls,
                showPlaybackRateControl,
                buffering: showBufferIndicator,
                hideControlsWhenPointerDoesntMove,
                onDoubleClick: doubleClickToFullscreen ? handleDoubleClick : undefined,
                onPointerDown: clickToPlay ? handlePointerDown : undefined,
                renderMuteButton,
                renderVolumeSlider
            }) : null
        ]
    });
    if (noSuspense || IS_NODE && !doesReactVersionSupportSuspense) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
            ref: container,
            style: outerStyle,
            className: className2,
            children: content
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref: container,
        style: outerStyle,
        className: className2,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
            fallback: loadingMarkup,
            children: content
        })
    });
};
var PlayerUI_default = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(PlayerUI);
;
;
;
var DEFAULT_VOLUME_PERSISTANCE_KEY = "remotion.volumePreference";
var persistVolume = (volume, logLevel, volumePersistenceKey)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
};
var getPreferredVolume = (volumePersistenceKey)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return 1;
    }
    //TURBOPACK unreachable
    ;
};
;
var PLAYER_COMP_ID = "player-comp";
var SharedPlayerContexts = ({ children, timelineContext, fps, compositionHeight, compositionWidth, durationInFrames, component, numberOfSharedAudioTags, initiallyMuted, logLevel, audioLatencyHint, volumePersistenceKey })=>{
    const compositionManagerContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const context = {
            compositions: [
                {
                    component,
                    durationInFrames,
                    height: compositionHeight,
                    width: compositionWidth,
                    fps,
                    id: PLAYER_COMP_ID,
                    nonce: 777,
                    folderName: null,
                    parentFolderName: null,
                    schema: null,
                    calculateMetadata: null
                }
            ],
            folders: [],
            currentCompositionMetadata: null,
            canvasContent: {
                type: "composition",
                compositionId: "player-comp"
            }
        };
        return context;
    }, [
        component,
        durationInFrames,
        compositionHeight,
        compositionWidth,
        fps
    ]);
    const [mediaMuted, setMediaMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>initiallyMuted);
    const [mediaVolume, setMediaVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getPreferredVolume(volumePersistenceKey ?? null));
    const mediaVolumeContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            mediaMuted,
            mediaVolume
        };
    }, [
        mediaMuted,
        mediaVolume
    ]);
    const setMediaVolumeAndPersist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((vol)=>{
        setMediaVolume(vol);
        persistVolume(vol, logLevel, volumePersistenceKey ?? null);
    }, [
        logLevel,
        volumePersistenceKey
    ]);
    const setMediaVolumeContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            setMediaMuted,
            setMediaVolume: setMediaVolumeAndPersist
        };
    }, [
        setMediaVolumeAndPersist
    ]);
    const logLevelContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            logLevel,
            mountTime: Date.now()
        };
    }, [
        logLevel
    ]);
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            isPlayer: true,
            isRendering: false,
            isStudio: false,
            isClientSideRendering: false,
            isReadOnlyStudio: false
        };
    }, []);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].RemotionEnvironmentContext.Provider, {
        value: env,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].LogLevelContext.Provider, {
            value: logLevelContext,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].CanUseRemotionHooksProvider, {
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext.Provider, {
                    value: timelineContext,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].CompositionManager.Provider, {
                        value: compositionManagerContext,
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].ResolveCompositionConfig, {
                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].PrefetchProvider, {
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].DurationsContextProvider, {
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].MediaVolumeContext.Provider, {
                                        value: mediaVolumeContextValue,
                                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].SetMediaVolumeContext.Provider, {
                                            value: setMediaVolumeContextValue,
                                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].SharedAudioContextProvider, {
                                                numberOfAudioTags: numberOfSharedAudioTags,
                                                component,
                                                audioLatencyHint,
                                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].BufferingProvider, {
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
;
var warningShown = false;
var acknowledgeRemotionLicenseMessage = (acknowledge, logLevel)=>{
    if (acknowledge) {
        return;
    }
    if (warningShown) {
        return;
    }
    warningShown = true;
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Log.warn({
        logLevel,
        tag: null
    }, "Note: Some companies are required to obtain a license to use Remotion. See: https://remotion.dev/license\nPass the `acknowledgeRemotionLicense` prop to `<Player />` function to make this message disappear.");
};
// src/utils/validate-in-out-frame.ts
var validateSingleFrame = (frame, variableName)=>{
    if (typeof frame === "undefined" || frame === null) {
        return frame ?? null;
    }
    if (typeof frame !== "number") {
        throw new TypeError(`"${variableName}" must be a number, but is ${JSON.stringify(frame)}`);
    }
    if (Number.isNaN(frame)) {
        throw new TypeError(`"${variableName}" must not be NaN, but is ${JSON.stringify(frame)}`);
    }
    if (!Number.isFinite(frame)) {
        throw new TypeError(`"${variableName}" must be finite, but is ${JSON.stringify(frame)}`);
    }
    if (frame % 1 !== 0) {
        throw new TypeError(`"${variableName}" must be an integer, but is ${JSON.stringify(frame)}`);
    }
    return frame;
};
var validateInOutFrames = ({ inFrame, durationInFrames, outFrame })=>{
    const validatedInFrame = validateSingleFrame(inFrame, "inFrame");
    const validatedOutFrame = validateSingleFrame(outFrame, "outFrame");
    if (validatedInFrame === null && validatedOutFrame === null) {
        return;
    }
    if (validatedInFrame !== null && validatedInFrame > durationInFrames - 1) {
        throw new Error("inFrame must be less than (durationInFrames - 1), but is " + validatedInFrame);
    }
    if (validatedOutFrame !== null && validatedOutFrame > durationInFrames - 1) {
        throw new Error("outFrame must be less than (durationInFrames - 1), but is " + validatedOutFrame);
    }
    if (validatedInFrame !== null && validatedInFrame < 0) {
        throw new Error("inFrame must be greater than 0, but is " + validatedInFrame);
    }
    if (validatedOutFrame !== null && validatedOutFrame <= 0) {
        throw new Error(`outFrame must be greater than 0, but is ${validatedOutFrame}. If you want to render a single frame, use <Thumbnail /> instead.`);
    }
    if (validatedOutFrame !== null && validatedInFrame !== null && validatedOutFrame <= validatedInFrame) {
        throw new Error("outFrame must be greater than inFrame, but is " + validatedOutFrame + " <= " + validatedInFrame);
    }
};
// src/utils/validate-initial-frame.ts
var validateInitialFrame = ({ initialFrame, durationInFrames })=>{
    if (typeof durationInFrames !== "number") {
        throw new Error(`\`durationInFrames\` must be a number, but is ${JSON.stringify(durationInFrames)}`);
    }
    if (typeof initialFrame === "undefined") {
        return;
    }
    if (typeof initialFrame !== "number") {
        throw new Error(`\`initialFrame\` must be a number, but is ${JSON.stringify(initialFrame)}`);
    }
    if (Number.isNaN(initialFrame)) {
        throw new Error(`\`initialFrame\` must be a number, but is NaN`);
    }
    if (!Number.isFinite(initialFrame)) {
        throw new Error(`\`initialFrame\` must be a number, but is Infinity`);
    }
    if (initialFrame % 1 !== 0) {
        throw new Error(`\`initialFrame\` must be an integer, but is ${JSON.stringify(initialFrame)}`);
    }
    if (initialFrame > durationInFrames - 1) {
        throw new Error(`\`initialFrame\` must be less or equal than \`durationInFrames - 1\`, but is ${JSON.stringify(initialFrame)}`);
    }
};
// src/utils/validate-playbackrate.ts
var validatePlaybackRate = (playbackRate)=>{
    if (playbackRate === undefined) {
        return;
    }
    if (playbackRate > 4) {
        throw new Error(`The highest possible playback rate is 4. You passed: ${playbackRate}`);
    }
    if (playbackRate < -4) {
        throw new Error(`The lowest possible playback rate is -4. You passed: ${playbackRate}`);
    }
    if (playbackRate === 0) {
        throw new Error(`A playback rate of 0 is not supported.`);
    }
};
;
var validateFps = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NoReactInternals"].validateFps;
var validateDimension = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NoReactInternals"].validateDimension;
var validateDurationInFrames = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NoReactInternals"].validateDurationInFrames;
var validateDefaultAndInputProps = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NoReactInternals"].validateDefaultAndInputProps;
;
var componentOrNullIfLazy = (props)=>{
    if ("component" in props) {
        return props.component;
    }
    return null;
};
var PlayerFn = ({ durationInFrames, compositionHeight, compositionWidth, fps, inputProps, style: style2, controls = false, loop = false, autoPlay = false, showVolumeControls = true, allowFullscreen = true, clickToPlay, doubleClickToFullscreen = false, spaceKeyToPlayOrPause = true, moveToBeginningWhenEnded = true, numberOfSharedAudioTags = 5, errorFallback = ()=>"⚠️", playbackRate = 1, renderLoading, className: className2, showPosterWhenUnplayed, showPosterWhenEnded, showPosterWhenPaused, showPosterWhenBuffering, showPosterWhenBufferingAndPaused, initialFrame, renderPoster, inFrame, outFrame, initiallyShowControls, renderFullscreenButton, renderPlayPauseButton, renderVolumeSlider, alwaysShowControls = false, initiallyMuted = false, showPlaybackRateControl = false, posterFillMode = "player-size", bufferStateDelayInMilliseconds, hideControlsWhenPointerDoesntMove = true, overflowVisible = false, renderMuteButton, browserMediaControlsBehavior: passedBrowserMediaControlsBehavior, overrideInternalClassName, logLevel = "info", noSuspense, acknowledgeRemotionLicense, audioLatencyHint = "interactive", volumePersistenceKey, ...componentProps }, ref)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (componentProps.defaultProps !== undefined) {
        throw new Error("The <Player /> component does not accept `defaultProps`, but some were passed. Use `inputProps` instead.");
    }
    const componentForValidation = componentOrNullIfLazy(componentProps);
    if (componentForValidation?.type === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Composition"]) {
        throw new TypeError(`'component' should not be an instance of <Composition/>. Pass the React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`);
    }
    if (componentForValidation === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Composition"]) {
        throw new TypeError(`'component' must not be the 'Composition' component. Pass your own React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>acknowledgeRemotionLicenseMessage(Boolean(acknowledgeRemotionLicense), logLevel));
    const component = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useLazyComponent({
        compProps: componentProps,
        componentName: "Player",
        noSuspense: Boolean(noSuspense)
    });
    validateInitialFrame({
        initialFrame,
        durationInFrames
    });
    const [frame, setFrame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>({
            [PLAYER_COMP_ID]: initialFrame ?? 0
        }));
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rootId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("player-comp");
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioAndVideoTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const imperativePlaying = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [currentPlaybackRate, setCurrentPlaybackRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(playbackRate);
    if (typeof compositionHeight !== "number") {
        throw new TypeError(`'compositionHeight' must be a number but got '${typeof compositionHeight}' instead`);
    }
    if (typeof compositionWidth !== "number") {
        throw new TypeError(`'compositionWidth' must be a number but got '${typeof compositionWidth}' instead`);
    }
    validateDimension(compositionHeight, "compositionHeight", "of the <Player /> component");
    validateDimension(compositionWidth, "compositionWidth", "of the <Player /> component");
    validateDurationInFrames(durationInFrames, {
        component: "of the <Player/> component",
        allowFloats: false
    });
    validateFps(fps, "as a prop of the <Player/> component", false);
    validateDefaultAndInputProps(inputProps, "inputProps", null);
    validateInOutFrames({
        durationInFrames,
        inFrame,
        outFrame
    });
    if (typeof controls !== "boolean" && typeof controls !== "undefined") {
        throw new TypeError(`'controls' must be a boolean or undefined but got '${typeof controls}' instead`);
    }
    if (typeof autoPlay !== "boolean" && typeof autoPlay !== "undefined") {
        throw new TypeError(`'autoPlay' must be a boolean or undefined but got '${typeof autoPlay}' instead`);
    }
    if (typeof loop !== "boolean" && typeof loop !== "undefined") {
        throw new TypeError(`'loop' must be a boolean or undefined but got '${typeof loop}' instead`);
    }
    if (typeof doubleClickToFullscreen !== "boolean" && typeof doubleClickToFullscreen !== "undefined") {
        throw new TypeError(`'doubleClickToFullscreen' must be a boolean or undefined but got '${typeof doubleClickToFullscreen}' instead`);
    }
    if (typeof showVolumeControls !== "boolean" && typeof showVolumeControls !== "undefined") {
        throw new TypeError(`'showVolumeControls' must be a boolean or undefined but got '${typeof showVolumeControls}' instead`);
    }
    if (typeof allowFullscreen !== "boolean" && typeof allowFullscreen !== "undefined") {
        throw new TypeError(`'allowFullscreen' must be a boolean or undefined but got '${typeof allowFullscreen}' instead`);
    }
    if (typeof clickToPlay !== "boolean" && typeof clickToPlay !== "undefined") {
        throw new TypeError(`'clickToPlay' must be a boolean or undefined but got '${typeof clickToPlay}' instead`);
    }
    if (typeof spaceKeyToPlayOrPause !== "boolean" && typeof spaceKeyToPlayOrPause !== "undefined") {
        throw new TypeError(`'spaceKeyToPlayOrPause' must be a boolean or undefined but got '${typeof spaceKeyToPlayOrPause}' instead`);
    }
    if (typeof numberOfSharedAudioTags !== "number" || numberOfSharedAudioTags % 1 !== 0 || !Number.isFinite(numberOfSharedAudioTags) || Number.isNaN(numberOfSharedAudioTags) || numberOfSharedAudioTags < 0) {
        throw new TypeError(`'numberOfSharedAudioTags' must be an integer but got '${numberOfSharedAudioTags}' instead`);
    }
    validatePlaybackRate(currentPlaybackRate);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setCurrentPlaybackRate(playbackRate);
    }, [
        playbackRate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>rootRef.current, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].playbackLogging({
            logLevel,
            message: `[player] Mounting <Player>. User agent = ${typeof navigator === "undefined" ? "server" : navigator.userAgent}`,
            tag: "player",
            mountTime: Date.now()
        });
    });
    const timelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            frame,
            playing,
            rootId,
            playbackRate: currentPlaybackRate,
            imperativePlaying,
            setPlaybackRate: (rate)=>{
                setCurrentPlaybackRate(rate);
            },
            audioAndVideoTags
        };
    }, [
        frame,
        currentPlaybackRate,
        playing,
        rootId
    ]);
    const setTimelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            setFrame,
            setPlaying
        };
    }, [
        setFrame
    ]);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const actualInputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>inputProps ?? {}, [
        inputProps
    ]);
    const browserMediaControlsBehavior = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return passedBrowserMediaControlsBehavior ?? {
            mode: "prevent-media-session"
        };
    }, [
        passedBrowserMediaControlsBehavior
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].IsPlayerContextProvider, {
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SharedPlayerContexts, {
            timelineContext: timelineContextValue,
            component,
            compositionHeight,
            compositionWidth,
            durationInFrames,
            fps,
            numberOfSharedAudioTags,
            initiallyMuted,
            logLevel,
            audioLatencyHint,
            volumePersistenceKey,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].Timeline.SetTimelineContext.Provider, {
                value: setTimelineContextValue,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlayerEmitterProvider, {
                    currentPlaybackRate,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(PlayerUI_default, {
                        ref: rootRef,
                        posterFillMode,
                        renderLoading,
                        autoPlay: Boolean(autoPlay),
                        loop: Boolean(loop),
                        controls: Boolean(controls),
                        errorFallback,
                        style: style2,
                        inputProps: actualInputProps,
                        allowFullscreen: Boolean(allowFullscreen),
                        moveToBeginningWhenEnded: Boolean(moveToBeginningWhenEnded),
                        clickToPlay: typeof clickToPlay === "boolean" ? clickToPlay : Boolean(controls),
                        showVolumeControls: Boolean(showVolumeControls),
                        doubleClickToFullscreen: Boolean(doubleClickToFullscreen),
                        spaceKeyToPlayOrPause: Boolean(spaceKeyToPlayOrPause),
                        playbackRate: currentPlaybackRate,
                        className: className2 ?? undefined,
                        showPosterWhenUnplayed: Boolean(showPosterWhenUnplayed),
                        showPosterWhenEnded: Boolean(showPosterWhenEnded),
                        showPosterWhenPaused: Boolean(showPosterWhenPaused),
                        showPosterWhenBuffering: Boolean(showPosterWhenBuffering),
                        showPosterWhenBufferingAndPaused: Boolean(showPosterWhenBufferingAndPaused),
                        renderPoster,
                        inFrame: inFrame ?? null,
                        outFrame: outFrame ?? null,
                        initiallyShowControls: initiallyShowControls ?? true,
                        renderFullscreen: renderFullscreenButton ?? null,
                        renderPlayPauseButton: renderPlayPauseButton ?? null,
                        renderMuteButton: renderMuteButton ?? null,
                        renderVolumeSlider: renderVolumeSlider ?? null,
                        alwaysShowControls,
                        showPlaybackRateControl,
                        bufferStateDelayInMilliseconds: bufferStateDelayInMilliseconds ?? 300,
                        hideControlsWhenPointerDoesntMove,
                        overflowVisible,
                        browserMediaControlsBehavior,
                        overrideInternalClassName: overrideInternalClassName ?? undefined,
                        noSuspense: Boolean(noSuspense)
                    })
                })
            })
        })
    });
};
var forward = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"];
var Player = forward(PlayerFn);
;
;
;
;
;
var useThumbnail = ()=>{
    const emitter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThumbnailEmitterContext);
    if (!emitter) {
        throw new TypeError("Expected Player event emitter context");
    }
    const returnValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            emitter
        };
    }, [
        emitter
    ]);
    return returnValue;
};
;
var reactVersion2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].version.split(".")[0];
if (reactVersion2 === "0") {
    throw new Error(`Version ${reactVersion2} of "react" is not supported by Remotion`);
}
var doesReactVersionSupportSuspense2 = parseInt(reactVersion2, 10) >= 18;
var ThumbnailUI = ({ style: style2, inputProps, errorFallback, renderLoading, className: className2, overflowVisible, noSuspense, overrideInternalClassName }, ref)=>{
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const video = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useVideo();
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasSize = useElementSize(container, {
        triggerOnWindowResize: false,
        shouldApplyCssTransforms: false
    });
    const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!config || !canvasSize) {
            return null;
        }
        return calculateCanvasTransformation({
            canvasSize,
            compositionHeight: config.height,
            compositionWidth: config.width,
            previewSize: "auto"
        });
    }, [
        canvasSize,
        config
    ]);
    const scale = layout?.scale ?? 1;
    const thumbnail = useThumbnail();
    useBufferStateEmitter(thumbnail.emitter);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>{
        const methods = {
            getContainerNode: ()=>container.current,
            getScale: ()=>scale
        };
        return Object.assign(thumbnail.emitter, methods);
    }, [
        scale,
        thumbnail.emitter
    ]);
    const VideoComponent = video ? video.component : null;
    const outerStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return calculateOuterStyle({
            config,
            style: style2,
            canvasSize,
            overflowVisible,
            layout
        });
    }, [
        canvasSize,
        config,
        layout,
        overflowVisible,
        style2
    ]);
    const outer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return calculateOuter({
            config,
            layout,
            scale,
            overflowVisible
        });
    }, [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const containerStyle3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return calculateContainerStyle({
            config,
            layout,
            scale,
            overflowVisible
        });
    }, [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((error)=>{
        thumbnail.emitter.dispatchError(error);
    }, [
        thumbnail.emitter
    ]);
    const loadingMarkup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return renderLoading ? renderLoading({
            height: outerStyle.height,
            width: outerStyle.width,
            isBuffering: false
        }) : null;
    }, [
        outerStyle.height,
        outerStyle.width,
        renderLoading
    ]);
    const currentScaleContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            type: "scale",
            scale
        };
    }, [
        scale
    ]);
    if (!config) {
        return null;
    }
    const content = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        style: outer,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
            style: containerStyle3,
            className: playerCssClassname(overrideInternalClassName),
            children: VideoComponent ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ErrorBoundary, {
                onError,
                errorFallback,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].CurrentScaleContext.Provider, {
                    value: currentScaleContext,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(VideoComponent, {
                        ...video?.props ?? {},
                        ...inputProps ?? {}
                    })
                })
            }) : null
        })
    });
    if (noSuspense || IS_NODE && !doesReactVersionSupportSuspense2) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
            ref: container,
            style: outerStyle,
            className: className2,
            children: content
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref: container,
        style: outerStyle,
        className: className2,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
            fallback: loadingMarkup,
            children: content
        })
    });
};
var ThumbnailUI_default = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(ThumbnailUI);
;
var ThumbnailFn = ({ frameToDisplay, style: style2, inputProps, compositionHeight, compositionWidth, durationInFrames, fps, className: className2, errorFallback = ()=>"⚠️", renderLoading, overflowVisible = false, overrideInternalClassName, logLevel = "info", noSuspense, ...componentProps }, ref)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const [thumbnailId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>String((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["random"])(null)));
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timelineState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const value = {
            playing: false,
            frame: {
                [PLAYER_COMP_ID]: frameToDisplay
            },
            rootId: thumbnailId,
            imperativePlaying: {
                current: false
            },
            playbackRate: 1,
            setPlaybackRate: ()=>{
                throw new Error("thumbnail");
            },
            audioAndVideoTags: {
                current: []
            }
        };
        return value;
    }, [
        frameToDisplay,
        thumbnailId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>rootRef.current, []);
    const Component = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].useLazyComponent({
        compProps: componentProps,
        componentName: "Thumbnail",
        noSuspense: Boolean(noSuspense)
    });
    const [emitter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new ThumbnailEmitter);
    const passedInputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return inputProps ?? {};
    }, [
        inputProps
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Internals"].IsPlayerContextProvider, {
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SharedPlayerContexts, {
            timelineContext: timelineState,
            component: Component,
            compositionHeight,
            compositionWidth,
            durationInFrames,
            fps,
            numberOfSharedAudioTags: 0,
            initiallyMuted: true,
            logLevel,
            audioLatencyHint: "playback",
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ThumbnailEmitterContext.Provider, {
                value: emitter,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(ThumbnailUI_default, {
                    ref: rootRef,
                    className: className2,
                    errorFallback,
                    inputProps: passedInputProps,
                    renderLoading,
                    style: style2,
                    overflowVisible,
                    overrideInternalClassName,
                    noSuspense: Boolean(noSuspense)
                })
            })
        })
    });
};
var forward2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"];
var Thumbnail = forward2(ThumbnailFn);
// src/index.ts
var PlayerInternals = {
    PlayerEventEmitterContext,
    PlayerEmitter,
    usePlayer,
    usePlayback,
    useElementSize,
    calculateCanvasTransformation,
    useHoverState,
    updateAllElementsSizes,
    PlayerEmitterProvider,
    BufferingIndicator,
    useFrameImperative
};
;
}),
"[project]/packages/paths/dist/esm/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/cut-instruction.ts
__turbopack_context__.s([
    "PathInternals",
    ()=>PathInternals,
    "cutPath",
    ()=>cutPath,
    "evolvePath",
    ()=>evolvePath,
    "extendViewBox",
    ()=>extendViewBox,
    "getBoundingBox",
    ()=>getBoundingBox,
    "getInstructionIndexAtLength",
    ()=>getInstructionIndexAtLength,
    "getLength",
    ()=>getLength,
    "getPointAtLength",
    ()=>getPointAtLength,
    "getSubpaths",
    ()=>getSubpaths,
    "getTangentAtLength",
    ()=>getTangentAtLength,
    "interpolatePath",
    ()=>interpolatePath,
    "normalizePath",
    ()=>normalizePath,
    "parsePath",
    ()=>parsePath,
    "reduceInstructions",
    ()=>reduceInstructions,
    "resetPath",
    ()=>resetPath,
    "reversePath",
    ()=>reversePath,
    "scalePath",
    ()=>scalePath,
    "serializeInstructions",
    ()=>serializeInstructions,
    "translatePath",
    ()=>translatePath,
    "warpPath",
    ()=>warpPath
]);
var cutLInstruction = ({ instruction, lastPoint, progress })=>{
    const x = lastPoint.x + (instruction.x - lastPoint.x) * progress;
    const y = lastPoint.y + (instruction.y - lastPoint.y) * progress;
    return {
        type: "L",
        x,
        y
    };
};
function interpolatePoint(pA, pB, factor) {
    return {
        x: pA.x + (pB.x - pA.x) * factor,
        y: pA.y + (pB.y - pA.y) * factor
    };
}
function cutCInstruction({ progress, lastPoint, instruction }) {
    const u = progress;
    const p0 = {
        x: lastPoint.x,
        y: lastPoint.y
    };
    const p1 = {
        x: instruction.cp1x,
        y: instruction.cp1y
    };
    const p2 = {
        x: instruction.cp2x,
        y: instruction.cp2y
    };
    const p3 = {
        x: instruction.x,
        y: instruction.y
    };
    const p01 = interpolatePoint(p0, p1, u);
    const p12 = interpolatePoint(p1, p2, u);
    const p23 = interpolatePoint(p2, p3, u);
    const p012 = interpolatePoint(p01, p12, u);
    const p123 = interpolatePoint(p12, p23, u);
    const p0123 = interpolatePoint(p012, p123, u);
    return {
        type: "C",
        cp1x: p01.x,
        cp1y: p01.y,
        cp2x: p012.x,
        cp2y: p012.y,
        x: p0123.x,
        y: p0123.y
    };
}
var cutInstruction = ({ instruction, lastPoint, progress })=>{
    if (instruction.type === "M") {
        return instruction;
    }
    if (instruction.type === "L") {
        return cutLInstruction({
            instruction,
            lastPoint,
            progress
        });
    }
    if (instruction.type === "C") {
        return cutCInstruction({
            instruction,
            lastPoint,
            progress
        });
    }
    if (instruction.type === "Z") {
        return instruction;
    }
    throw new TypeError(`${instruction.type} is not supported.`);
};
// src/helpers/bezier-values.ts
var tValues = [
    [],
    [],
    [
        -0.5773502691896257,
        0.5773502691896257
    ],
    [
        0,
        -0.7745966692414834,
        0.7745966692414834
    ],
    [
        -0.33998104358485626,
        0.33998104358485626,
        -0.8611363115940526,
        0.8611363115940526
    ],
    [
        0,
        -0.5384693101056831,
        0.5384693101056831,
        -0.906179845938664,
        0.906179845938664
    ],
    [
        0.6612093864662645,
        -0.6612093864662645,
        -0.2386191860831969,
        0.2386191860831969,
        -0.932469514203152,
        0.932469514203152
    ],
    [
        0,
        0.4058451513773972,
        -0.4058451513773972,
        -0.7415311855993945,
        0.7415311855993945,
        -0.9491079123427585,
        0.9491079123427585
    ],
    [
        -0.1834346424956498,
        0.1834346424956498,
        -0.525532409916329,
        0.525532409916329,
        -0.7966664774136267,
        0.7966664774136267,
        -0.9602898564975363,
        0.9602898564975363
    ],
    [
        0,
        -0.8360311073266358,
        0.8360311073266358,
        -0.9681602395076261,
        0.9681602395076261,
        -0.3242534234038089,
        0.3242534234038089,
        -0.6133714327005904,
        0.6133714327005904
    ],
    [
        -0.14887433898163122,
        0.14887433898163122,
        -0.4333953941292472,
        0.4333953941292472,
        -0.6794095682990244,
        0.6794095682990244,
        -0.8650633666889845,
        0.8650633666889845,
        -0.9739065285171717,
        0.9739065285171717
    ],
    [
        0,
        -0.26954315595234496,
        0.26954315595234496,
        -0.5190961292068118,
        0.5190961292068118,
        -0.7301520055740494,
        0.7301520055740494,
        -0.8870625997680953,
        0.8870625997680953,
        -0.978228658146057,
        0.978228658146057
    ],
    [
        -0.1252334085114689,
        0.1252334085114689,
        -0.3678314989981802,
        0.3678314989981802,
        -0.5873179542866175,
        0.5873179542866175,
        -0.7699026741943047,
        0.7699026741943047,
        -0.9041172563704749,
        0.9041172563704749,
        -0.9815606342467192,
        0.9815606342467192
    ],
    [
        0,
        -0.2304583159551348,
        0.2304583159551348,
        -0.44849275103644687,
        0.44849275103644687,
        -0.6423493394403402,
        0.6423493394403402,
        -0.8015780907333099,
        0.8015780907333099,
        -0.9175983992229779,
        0.9175983992229779,
        -0.9841830547185881,
        0.9841830547185881
    ],
    [
        -0.10805494870734367,
        0.10805494870734367,
        -0.31911236892788974,
        0.31911236892788974,
        -0.5152486363581541,
        0.5152486363581541,
        -0.6872929048116855,
        0.6872929048116855,
        -0.827201315069765,
        0.827201315069765,
        -0.9284348836635735,
        0.9284348836635735,
        -0.9862838086968123,
        0.9862838086968123
    ],
    [
        0,
        -0.20119409399743451,
        0.20119409399743451,
        -0.3941513470775634,
        0.3941513470775634,
        -0.5709721726085388,
        0.5709721726085388,
        -0.7244177313601701,
        0.7244177313601701,
        -0.8482065834104272,
        0.8482065834104272,
        -0.937273392400706,
        0.937273392400706,
        -0.9879925180204854,
        0.9879925180204854
    ],
    [
        -0.09501250983763744,
        0.09501250983763744,
        -0.2816035507792589,
        0.2816035507792589,
        -0.45801677765722737,
        0.45801677765722737,
        -0.6178762444026438,
        0.6178762444026438,
        -0.755404408355003,
        0.755404408355003,
        -0.8656312023878318,
        0.8656312023878318,
        -0.9445750230732326,
        0.9445750230732326,
        -0.9894009349916499,
        0.9894009349916499
    ],
    [
        0,
        -0.17848418149584785,
        0.17848418149584785,
        -0.3512317634538763,
        0.3512317634538763,
        -0.5126905370864769,
        0.5126905370864769,
        -0.6576711592166907,
        0.6576711592166907,
        -0.7815140038968014,
        0.7815140038968014,
        -0.8802391537269859,
        0.8802391537269859,
        -0.9506755217687678,
        0.9506755217687678,
        -0.9905754753144174,
        0.9905754753144174
    ],
    [
        -0.0847750130417353,
        0.0847750130417353,
        -0.2518862256915055,
        0.2518862256915055,
        -0.41175116146284263,
        0.41175116146284263,
        -0.5597708310739475,
        0.5597708310739475,
        -0.6916870430603532,
        0.6916870430603532,
        -0.8037049589725231,
        0.8037049589725231,
        -0.8926024664975557,
        0.8926024664975557,
        -0.9558239495713977,
        0.9558239495713977,
        -0.9915651684209309,
        0.9915651684209309
    ],
    [
        0,
        -0.16035864564022537,
        0.16035864564022537,
        -0.31656409996362983,
        0.31656409996362983,
        -0.46457074137596094,
        0.46457074137596094,
        -0.600545304661681,
        0.600545304661681,
        -0.7209661773352294,
        0.7209661773352294,
        -0.8227146565371428,
        0.8227146565371428,
        -0.9031559036148179,
        0.9031559036148179,
        -0.96020815213483,
        0.96020815213483,
        -0.9924068438435844,
        0.9924068438435844
    ],
    [
        -0.07652652113349734,
        0.07652652113349734,
        -0.22778585114164507,
        0.22778585114164507,
        -0.37370608871541955,
        0.37370608871541955,
        -0.5108670019508271,
        0.5108670019508271,
        -0.636053680726515,
        0.636053680726515,
        -0.7463319064601508,
        0.7463319064601508,
        -0.8391169718222188,
        0.8391169718222188,
        -0.912234428251326,
        0.912234428251326,
        -0.9639719272779138,
        0.9639719272779138,
        -0.9931285991850949,
        0.9931285991850949
    ],
    [
        0,
        -0.1455618541608951,
        0.1455618541608951,
        -0.2880213168024011,
        0.2880213168024011,
        -0.4243421202074388,
        0.4243421202074388,
        -0.5516188358872198,
        0.5516188358872198,
        -0.6671388041974123,
        0.6671388041974123,
        -0.7684399634756779,
        0.7684399634756779,
        -0.8533633645833173,
        0.8533633645833173,
        -0.9200993341504008,
        0.9200993341504008,
        -0.9672268385663063,
        0.9672268385663063,
        -0.9937521706203895,
        0.9937521706203895
    ],
    [
        -0.06973927331972223,
        0.06973927331972223,
        -0.20786042668822127,
        0.20786042668822127,
        -0.34193582089208424,
        0.34193582089208424,
        -0.469355837986757,
        0.469355837986757,
        -0.5876404035069116,
        0.5876404035069116,
        -0.6944872631866827,
        0.6944872631866827,
        -0.7878168059792081,
        0.7878168059792081,
        -0.8658125777203002,
        0.8658125777203002,
        -0.926956772187174,
        0.926956772187174,
        -0.9700604978354287,
        0.9700604978354287,
        -0.9942945854823992,
        0.9942945854823992
    ],
    [
        0,
        -0.1332568242984661,
        0.1332568242984661,
        -0.26413568097034495,
        0.26413568097034495,
        -0.3903010380302908,
        0.3903010380302908,
        -0.5095014778460075,
        0.5095014778460075,
        -0.6196098757636461,
        0.6196098757636461,
        -0.7186613631319502,
        0.7186613631319502,
        -0.8048884016188399,
        0.8048884016188399,
        -0.8767523582704416,
        0.8767523582704416,
        -0.9329710868260161,
        0.9329710868260161,
        -0.9725424712181152,
        0.9725424712181152,
        -0.9947693349975522,
        0.9947693349975522
    ],
    [
        -0.06405689286260563,
        0.06405689286260563,
        -0.1911188674736163,
        0.1911188674736163,
        -0.3150426796961634,
        0.3150426796961634,
        -0.4337935076260451,
        0.4337935076260451,
        -0.5454214713888396,
        0.5454214713888396,
        -0.6480936519369755,
        0.6480936519369755,
        -0.7401241915785544,
        0.7401241915785544,
        -0.820001985973903,
        0.820001985973903,
        -0.8864155270044011,
        0.8864155270044011,
        -0.9382745520027328,
        0.9382745520027328,
        -0.9747285559713095,
        0.9747285559713095,
        -0.9951872199970213,
        0.9951872199970213
    ]
];
var cValues = [
    [],
    [],
    [
        1,
        1
    ],
    [
        0.8888888888888888,
        0.5555555555555556,
        0.5555555555555556
    ],
    [
        0.6521451548625461,
        0.6521451548625461,
        0.34785484513745385,
        0.34785484513745385
    ],
    [
        0.5688888888888889,
        0.47862867049936647,
        0.47862867049936647,
        0.23692688505618908,
        0.23692688505618908
    ],
    [
        0.3607615730481386,
        0.3607615730481386,
        0.46791393457269104,
        0.46791393457269104,
        0.17132449237917036,
        0.17132449237917036
    ],
    [
        0.4179591836734694,
        0.3818300505051189,
        0.3818300505051189,
        0.27970539148927664,
        0.27970539148927664,
        0.1294849661688697,
        0.1294849661688697
    ],
    [
        0.362683783378362,
        0.362683783378362,
        0.31370664587788727,
        0.31370664587788727,
        0.22238103445337448,
        0.22238103445337448,
        0.10122853629037626,
        0.10122853629037626
    ],
    [
        0.3302393550012598,
        0.1806481606948574,
        0.1806481606948574,
        0.08127438836157441,
        0.08127438836157441,
        0.31234707704000286,
        0.31234707704000286,
        0.26061069640293544,
        0.26061069640293544
    ],
    [
        0.29552422471475287,
        0.29552422471475287,
        0.26926671930999635,
        0.26926671930999635,
        0.21908636251598204,
        0.21908636251598204,
        0.1494513491505806,
        0.1494513491505806,
        0.06667134430868814,
        0.06667134430868814
    ],
    [
        0.2729250867779006,
        0.26280454451024665,
        0.26280454451024665,
        0.23319376459199048,
        0.23319376459199048,
        0.18629021092773426,
        0.18629021092773426,
        0.1255803694649046,
        0.1255803694649046,
        0.05566856711617366,
        0.05566856711617366
    ],
    [
        0.24914704581340277,
        0.24914704581340277,
        0.2334925365383548,
        0.2334925365383548,
        0.20316742672306592,
        0.20316742672306592,
        0.16007832854334622,
        0.16007832854334622,
        0.10693932599531843,
        0.10693932599531843,
        0.04717533638651183,
        0.04717533638651183
    ],
    [
        0.2325515532308739,
        0.22628318026289723,
        0.22628318026289723,
        0.2078160475368885,
        0.2078160475368885,
        0.17814598076194574,
        0.17814598076194574,
        0.13887351021978725,
        0.13887351021978725,
        0.09212149983772845,
        0.09212149983772845,
        0.04048400476531588,
        0.04048400476531588
    ],
    [
        0.2152638534631578,
        0.2152638534631578,
        0.2051984637212956,
        0.2051984637212956,
        0.18553839747793782,
        0.18553839747793782,
        0.15720316715819355,
        0.15720316715819355,
        0.12151857068790319,
        0.12151857068790319,
        0.08015808715976021,
        0.08015808715976021,
        0.03511946033175186,
        0.03511946033175186
    ],
    [
        0.2025782419255613,
        0.19843148532711158,
        0.19843148532711158,
        0.1861610000155622,
        0.1861610000155622,
        0.16626920581699392,
        0.16626920581699392,
        0.13957067792615432,
        0.13957067792615432,
        0.10715922046717194,
        0.10715922046717194,
        0.07036604748810812,
        0.07036604748810812,
        0.03075324199611727,
        0.03075324199611727
    ],
    [
        0.1894506104550685,
        0.1894506104550685,
        0.18260341504492358,
        0.18260341504492358,
        0.16915651939500254,
        0.16915651939500254,
        0.14959598881657674,
        0.14959598881657674,
        0.12462897125553388,
        0.12462897125553388,
        0.09515851168249279,
        0.09515851168249279,
        0.062253523938647894,
        0.062253523938647894,
        0.027152459411754096,
        0.027152459411754096
    ],
    [
        0.17944647035620653,
        0.17656270536699264,
        0.17656270536699264,
        0.16800410215645004,
        0.16800410215645004,
        0.15404576107681028,
        0.15404576107681028,
        0.13513636846852548,
        0.13513636846852548,
        0.11188384719340397,
        0.11188384719340397,
        0.08503614831717918,
        0.08503614831717918,
        0.0554595293739872,
        0.0554595293739872,
        0.02414830286854793,
        0.02414830286854793
    ],
    [
        0.1691423829631436,
        0.1691423829631436,
        0.16427648374583273,
        0.16427648374583273,
        0.15468467512626524,
        0.15468467512626524,
        0.14064291467065065,
        0.14064291467065065,
        0.12255520671147846,
        0.12255520671147846,
        0.10094204410628717,
        0.10094204410628717,
        0.07642573025488905,
        0.07642573025488905,
        0.0497145488949698,
        0.0497145488949698,
        0.02161601352648331,
        0.02161601352648331
    ],
    [
        0.1610544498487837,
        0.15896884339395434,
        0.15896884339395434,
        0.15276604206585967,
        0.15276604206585967,
        0.1426067021736066,
        0.1426067021736066,
        0.12875396253933621,
        0.12875396253933621,
        0.11156664554733399,
        0.11156664554733399,
        0.09149002162245,
        0.09149002162245,
        0.06904454273764123,
        0.06904454273764123,
        0.0448142267656996,
        0.0448142267656996,
        0.019461788229726478,
        0.019461788229726478
    ],
    [
        0.15275338713072584,
        0.15275338713072584,
        0.14917298647260374,
        0.14917298647260374,
        0.14209610931838204,
        0.14209610931838204,
        0.13168863844917664,
        0.13168863844917664,
        0.11819453196151841,
        0.11819453196151841,
        0.10193011981724044,
        0.10193011981724044,
        0.08327674157670475,
        0.08327674157670475,
        0.06267204833410907,
        0.06267204833410907,
        0.04060142980038694,
        0.04060142980038694,
        0.017614007139152118,
        0.017614007139152118
    ],
    [
        0.14608113364969041,
        0.14452440398997005,
        0.14452440398997005,
        0.13988739479107315,
        0.13988739479107315,
        0.13226893863333747,
        0.13226893863333747,
        0.12183141605372853,
        0.12183141605372853,
        0.10879729916714838,
        0.10879729916714838,
        0.09344442345603386,
        0.09344442345603386,
        0.0761001136283793,
        0.0761001136283793,
        0.057134425426857205,
        0.057134425426857205,
        0.036953789770852494,
        0.036953789770852494,
        0.016017228257774335,
        0.016017228257774335
    ],
    [
        0.13925187285563198,
        0.13925187285563198,
        0.13654149834601517,
        0.13654149834601517,
        0.13117350478706238,
        0.13117350478706238,
        0.12325237681051242,
        0.12325237681051242,
        0.11293229608053922,
        0.11293229608053922,
        0.10041414444288096,
        0.10041414444288096,
        0.08594160621706773,
        0.08594160621706773,
        0.06979646842452049,
        0.06979646842452049,
        0.052293335152683286,
        0.052293335152683286,
        0.03377490158481415,
        0.03377490158481415,
        0.0146279952982722,
        0.0146279952982722
    ],
    [
        0.13365457218610619,
        0.1324620394046966,
        0.1324620394046966,
        0.12890572218808216,
        0.12890572218808216,
        0.12304908430672953,
        0.12304908430672953,
        0.11499664022241136,
        0.11499664022241136,
        0.10489209146454141,
        0.10489209146454141,
        0.09291576606003515,
        0.09291576606003515,
        0.07928141177671895,
        0.07928141177671895,
        0.06423242140852585,
        0.06423242140852585,
        0.04803767173108467,
        0.04803767173108467,
        0.030988005856979445,
        0.030988005856979445,
        0.013411859487141771,
        0.013411859487141771
    ],
    [
        0.12793819534675216,
        0.12793819534675216,
        0.1258374563468283,
        0.1258374563468283,
        0.12167047292780339,
        0.12167047292780339,
        0.1155056680537256,
        0.1155056680537256,
        0.10744427011596563,
        0.10744427011596563,
        0.09761865210411388,
        0.09761865210411388,
        0.08619016153195327,
        0.08619016153195327,
        0.0733464814110803,
        0.0733464814110803,
        0.05929858491543678,
        0.05929858491543678,
        0.04427743881741981,
        0.04427743881741981,
        0.028531388628933663,
        0.028531388628933663,
        0.0123412297999872,
        0.0123412297999872
    ]
];
var binomialCoefficients = [
    [
        1
    ],
    [
        1,
        1
    ],
    [
        1,
        2,
        1
    ],
    [
        1,
        3,
        3,
        1
    ]
];
// src/helpers/bezier-functions.ts
var cubicPoint = (xs, ys, t)=>{
    const x = (1 - t) * (1 - t) * (1 - t) * xs[0] + 3 * (1 - t) * (1 - t) * t * xs[1] + 3 * (1 - t) * t * t * xs[2] + t * t * t * xs[3];
    const y = (1 - t) * (1 - t) * (1 - t) * ys[0] + 3 * (1 - t) * (1 - t) * t * ys[1] + 3 * (1 - t) * t * t * ys[2] + t * t * t * ys[3];
    return {
        x,
        y
    };
};
var getDerivative = (derivative, t, vs)=>{
    const n = vs.length - 1;
    let value;
    if (n === 0) {
        return 0;
    }
    if (derivative === 0) {
        value = 0;
        for(let k = 0; k <= n; k++){
            value += binomialCoefficients[n][k] * (1 - t) ** (n - k) * t ** k * vs[k];
        }
        return value;
    }
    const _vs = new Array(n);
    for(let k = 0; k < n; k++){
        _vs[k] = n * (vs[k + 1] - vs[k]);
    }
    return getDerivative(derivative - 1, t, _vs);
};
function bFunc(xs, ys, t) {
    const xbase = getDerivative(1, t, xs);
    const ybase = getDerivative(1, t, ys);
    const combined = xbase * xbase + ybase * ybase;
    return Math.sqrt(combined);
}
var getCubicArcLength = ({ sx, sy, t })=>{
    let correctedT;
    const n = 20;
    const z = t / 2;
    let sum = 0;
    for(let i = 0; i < n; i++){
        correctedT = z * tValues[n][i] + z;
        sum += cValues[n][i] * bFunc(sx, sy, correctedT);
    }
    return z * sum;
};
var quadraticPoint = (xs, ys, t)=>{
    const x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
    const y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
    return {
        x,
        y
    };
};
var cubicDerivative = (xs, ys, t)=>{
    const derivative = quadraticPoint([
        3 * (xs[1] - xs[0]),
        3 * (xs[2] - xs[1]),
        3 * (xs[3] - xs[2])
    ], [
        3 * (ys[1] - ys[0]),
        3 * (ys[2] - ys[1]),
        3 * (ys[3] - ys[2])
    ], t);
    return derivative;
};
var getQuadraticArcLength = (xs, ys, t)=>{
    if (t === undefined) {
        t = 1;
    }
    const ax = xs[0] - 2 * xs[1] + xs[2];
    const ay = ys[0] - 2 * ys[1] + ys[2];
    const bx = 2 * xs[1] - 2 * xs[0];
    const by = 2 * ys[1] - 2 * ys[0];
    const A = 4 * (ax * ax + ay * ay);
    const B = 4 * (ax * bx + ay * by);
    const C = bx * bx + by * by;
    if (A === 0) {
        return t * Math.sqrt((xs[2] - xs[0]) ** 2 + (ys[2] - ys[0]) ** 2);
    }
    const b = B / (2 * A);
    const c = C / A;
    const u = t + b;
    const k = c - b * b;
    const uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
    const bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
    const term = b + Math.sqrt(b * b + k) === 0 ? 0 : k * Math.log(Math.abs((u + uuk) / (b + bbk)));
    return Math.sqrt(A) / 2 * (u * uuk - b * bbk + term);
};
var quadraticDerivative = (xs, ys, t)=>{
    return {
        x: (1 - t) * 2 * (xs[1] - xs[0]) + t * 2 * (xs[2] - xs[1]),
        y: (1 - t) * 2 * (ys[1] - ys[0]) + t * 2 * (ys[2] - ys[1])
    };
};
var t2length = ({ length, totalLength, func })=>{
    let error = 1;
    let t = length / totalLength;
    let step = (length - func(t)) / totalLength;
    let numIterations = 0;
    while(error > 0.001){
        const increasedTLength = func(t + step);
        const increasedTError = Math.abs(length - increasedTLength) / totalLength;
        if (increasedTError < error) {
            error = increasedTError;
            t += step;
        } else {
            const decreasedTLength = func(t - step);
            const decreasedTError = Math.abs(length - decreasedTLength) / totalLength;
            if (decreasedTError < error) {
                error = decreasedTError;
                t -= step;
            } else {
                step /= 2;
            }
        }
        numIterations++;
        if (numIterations > 500) {
            break;
        }
    }
    return t;
};
// src/helpers/bezier.ts
var makeQuadratic = ({ startX, startY, cpx, cpy, x, y })=>{
    const a = {
        x: startX,
        y: startY
    };
    const b = {
        x: cpx,
        y: cpy
    };
    const c = {
        x,
        y
    };
    const length = getQuadraticArcLength([
        a.x,
        b.x,
        c.x,
        0
    ], [
        a.y,
        b.y,
        c.y,
        0
    ], 1);
    const getTotalLength = ()=>{
        return length;
    };
    const getPointAtLength = (len)=>{
        const xs = [
            a.x,
            b.x,
            c.x,
            0
        ];
        const xy = [
            a.y,
            b.y,
            c.y,
            0
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>getQuadraticArcLength(xs, xy, i)
        });
        return quadraticPoint(xs, xy, t);
    };
    const getTangentAtLength = (len)=>{
        const xs = [
            a.x,
            b.x,
            c.x,
            0
        ];
        const xy = [
            a.y,
            b.y,
            c.y,
            0
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>getQuadraticArcLength(xs, xy, i)
        });
        const derivative = quadraticDerivative(xs, xy, t);
        const mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
        let tangent;
        if (mdl > 0) {
            tangent = {
                x: derivative.x / mdl,
                y: derivative.y / mdl
            };
        } else {
            tangent = {
                x: 0,
                y: 0
            };
        }
        return tangent;
    };
    const getC = ()=>{
        return c;
    };
    return {
        getPointAtLength,
        getTangentAtLength,
        getTotalLength,
        getC,
        type: "quadratic-bezier",
        getD: ()=>({
                x: 0,
                y: 0
            })
    };
};
var makeCubic = ({ startX, startY, cp1x, cp1y, cp2x, cp2y, x, y })=>{
    const a = {
        x: startX,
        y: startY
    };
    const b = {
        x: cp1x,
        y: cp1y
    };
    const c = {
        x: cp2x,
        y: cp2y
    };
    const d = {
        x,
        y
    };
    const length = getCubicArcLength({
        sx: [
            a.x,
            b.x,
            c.x,
            d.x
        ],
        sy: [
            a.y,
            b.y,
            c.y,
            d.y
        ],
        t: 1
    });
    const getTotalLength = ()=>{
        return length;
    };
    const getPointAtLength = (len)=>{
        const sx = [
            a.x,
            b.x,
            c.x,
            d.x
        ];
        const sy = [
            a.y,
            b.y,
            c.y,
            d.y
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>{
                return getCubicArcLength({
                    sx,
                    sy,
                    t: i
                });
            }
        });
        return cubicPoint(sx, sy, t);
    };
    const getTangentAtLength = (len)=>{
        const xs = [
            a.x,
            b.x,
            c.x,
            d.x
        ];
        const xy = [
            a.y,
            b.y,
            c.y,
            d.y
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>getCubicArcLength({
                    sx: xs,
                    sy: xy,
                    t: i
                })
        });
        const derivative = cubicDerivative(xs, xy, t);
        const mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
        let tangent;
        if (mdl > 0) {
            tangent = {
                x: derivative.x / mdl,
                y: derivative.y / mdl
            };
        } else {
            tangent = {
                x: 0,
                y: 0
            };
        }
        return tangent;
    };
    const getC = ()=>{
        return c;
    };
    const getD = ()=>{
        return d;
    };
    return {
        getPointAtLength,
        getTangentAtLength,
        getTotalLength,
        getC,
        getD,
        type: "cubic-bezier"
    };
};
// src/helpers/linear.ts
var makeLinearPosition = ({ x0, x1, y0, y1 })=>{
    return {
        getTotalLength: ()=>{
            return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
        },
        getPointAtLength: (pos)=>{
            let fraction = pos / Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
            fraction = Number.isNaN(fraction) ? 1 : fraction;
            const newDeltaX = (x1 - x0) * fraction;
            const newDeltaY = (y1 - y0) * fraction;
            return {
                x: x0 + newDeltaX,
                y: y0 + newDeltaY
            };
        },
        getTangentAtLength: ()=>{
            const module = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            return {
                x: (x1 - x0) / module,
                y: (y1 - y0) / module
            };
        },
        type: "linear"
    };
};
// src/helpers/reduced-analysis.ts
var conductAnalysis = (instructions)=>{
    let currentPoint = {
        x: 0,
        y: 0
    };
    let moveStart = {
        x: 0,
        y: 0
    };
    const segments = [];
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type === "M") {
            currentPoint = {
                x: instruction.x,
                y: instruction.y
            };
            moveStart = {
                x: currentPoint.x,
                y: currentPoint.y
            };
            segments.push({
                startPoint: {
                    x: instruction.x,
                    y: instruction.y
                },
                instructionsAndInfo: [
                    {
                        instruction,
                        function: null,
                        length: 0,
                        startPoint: currentPoint
                    }
                ]
            });
        }
        if (instruction.type === "L") {
            if (segments.length > 0) {
                const length = Math.sqrt((currentPoint.x - instruction.x) ** 2 + (currentPoint.y - instruction.y) ** 2);
                segments[segments.length - 1].instructionsAndInfo.push({
                    instruction,
                    length,
                    function: makeLinearPosition({
                        x0: currentPoint.x,
                        x1: instruction.x,
                        y0: currentPoint.y,
                        y1: instruction.y
                    }),
                    startPoint: currentPoint
                });
            }
            currentPoint = {
                x: instruction.x,
                y: instruction.y
            };
        }
        if (instruction.type === "Z") {
            if (segments.length > 0) {
                const length = Math.sqrt((segments[segments.length - 1].startPoint.x - currentPoint.x) ** 2 + (segments[segments.length - 1].startPoint.y - currentPoint.y) ** 2);
                segments[segments.length - 1].instructionsAndInfo.push({
                    instruction,
                    function: makeLinearPosition({
                        x0: currentPoint.x,
                        x1: moveStart.x,
                        y0: currentPoint.y,
                        y1: moveStart.y
                    }),
                    length,
                    startPoint: {
                        ...currentPoint
                    }
                });
            }
            currentPoint = {
                x: moveStart.x,
                y: moveStart.y
            };
        }
        if (instruction.type === "C") {
            const curve = makeCubic({
                startX: currentPoint.x,
                startY: currentPoint.y,
                cp1x: instruction.cp1x,
                cp1y: instruction.cp1y,
                cp2x: instruction.cp2x,
                cp2y: instruction.cp2y,
                x: instruction.x,
                y: instruction.y
            });
            const length = curve.getTotalLength();
            if (segments.length > 0) {
                segments[segments.length - 1].instructionsAndInfo.push({
                    instruction,
                    length,
                    function: curve,
                    startPoint: {
                        ...currentPoint
                    }
                });
            }
            currentPoint = {
                x: instruction.x,
                y: instruction.y
            };
        }
    }
    return segments;
};
// src/parse-path.ts
var length = {
    a: 7,
    A: 7,
    C: 6,
    c: 6,
    H: 1,
    h: 1,
    L: 2,
    l: 2,
    M: 2,
    m: 2,
    Q: 4,
    q: 4,
    S: 4,
    s: 4,
    T: 2,
    t: 2,
    V: 1,
    v: 1,
    Z: 0,
    z: 0
};
var chunkExact = (array, instruction)=>{
    const chunks = [];
    const expectedSize = length[instruction];
    if (array.length % expectedSize !== 0) {
        throw new Error(`Expected number of arguments of SVG instruction "${instruction} ${array.join(" ")}" to be a multiple of ${expectedSize}`);
    }
    for(let i = 0; i < array.length; i += expectedSize){
        chunks.push(array.slice(i, i + expectedSize));
    }
    return chunks;
};
var makeInstructions = (arr, instruction, cb)=>{
    return chunkExact(arr, instruction).map((args)=>{
        return cb(args);
    });
};
var segmentRegExp = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
var numberRegExp = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
var parseValues = (args, instructionType)=>{
    const numbers = args.match(numberRegExp);
    if (!numbers) {
        if (instructionType === "Z" || instructionType === "z") {
            return [];
        }
        throw new Error(`Malformed path data: ${instructionType} was expected to have numbers afterwards`);
    }
    const expectedArguments = length[instructionType];
    if (numbers.length % expectedArguments !== 0) {
        throw new Error(`Malformed path data: ${instructionType} was expected to have a multiple of ${expectedArguments} numbers, but got "${instructionType} ${numbers.join(" ")} instead"`);
    }
    return numbers.map(Number);
};
var parsePath = (path)=>{
    if (!path) {
        throw new Error("No path provided");
    }
    const segments = path.match(segmentRegExp);
    if (!segments) {
        throw new Error(`No path elements found in string ${path}`);
    }
    return segments.map((segmentString)=>{
        const command = segmentString.charAt(0);
        const args = parseValues(segmentString.substring(1), command);
        if (command === "M" && args.length > 2) {
            const segmentsArray = [];
            segmentsArray.push({
                type: command,
                x: args[0],
                y: args[1]
            });
            segmentsArray.push(...makeInstructions(args.slice(2), "L", (numbers)=>({
                    type: "L",
                    x: numbers[0],
                    y: numbers[1]
                })));
            return segmentsArray;
        }
        if (command === "m" && args.length > 2) {
            const segmentsArray = [];
            segmentsArray.push({
                type: command,
                dx: args[0],
                dy: args[1]
            });
            segmentsArray.push(...makeInstructions(args.slice(2), "l", (numbers)=>({
                    type: "l",
                    dx: numbers[0],
                    dy: numbers[1]
                })));
            return segmentsArray;
        }
        if (command === "Z" || command === "z") {
            return [
                {
                    type: "Z"
                }
            ];
        }
        if (command === "A") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    rx: numbers[0],
                    ry: numbers[1],
                    xAxisRotation: numbers[2],
                    largeArcFlag: numbers[3] === 1,
                    sweepFlag: numbers[4] === 1,
                    x: numbers[5],
                    y: numbers[6]
                }));
        }
        if (command === "a") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    rx: numbers[0],
                    ry: numbers[1],
                    xAxisRotation: numbers[2],
                    largeArcFlag: numbers[3] === 1,
                    sweepFlag: numbers[4] === 1,
                    dx: numbers[5],
                    dy: numbers[6]
                }));
        }
        if (command === "C") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cp1x: numbers[0],
                    cp1y: numbers[1],
                    cp2x: numbers[2],
                    cp2y: numbers[3],
                    x: numbers[4],
                    y: numbers[5]
                }));
        }
        if (command === "c") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cp1dx: numbers[0],
                    cp1dy: numbers[1],
                    cp2dx: numbers[2],
                    cp2dy: numbers[3],
                    dx: numbers[4],
                    dy: numbers[5]
                }));
        }
        if (command === "S") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpx: numbers[0],
                    cpy: numbers[1],
                    x: numbers[2],
                    y: numbers[3]
                }));
        }
        if (command === "s") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpdx: numbers[0],
                    cpdy: numbers[1],
                    dx: numbers[2],
                    dy: numbers[3]
                }));
        }
        if (command === "H") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0]
                }));
        }
        if (command === "h") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0]
                }));
        }
        if (command === "V") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    y: numbers[0]
                }));
        }
        if (command === "v") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dy: numbers[0]
                }));
        }
        if (command === "L") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0],
                    y: numbers[1]
                }));
        }
        if (command === "M") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0],
                    y: numbers[1]
                }));
        }
        if (command === "m") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0],
                    dy: numbers[1]
                }));
        }
        if (command === "l") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0],
                    dy: numbers[1]
                }));
        }
        if (command === "Q") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpx: numbers[0],
                    cpy: numbers[1],
                    x: numbers[2],
                    y: numbers[3]
                }));
        }
        if (command === "q") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpdx: numbers[0],
                    cpdy: numbers[1],
                    dx: numbers[2],
                    dy: numbers[3]
                }));
        }
        if (command === "T") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0],
                    y: numbers[1]
                }));
        }
        if (command === "t") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0],
                    dy: numbers[1]
                }));
        }
        throw new Error(`Invalid path element ${segmentString}`);
    }, []).flat(1);
};
// src/helpers/convert-q-to-c-instruction.ts
var convertQToCInstruction = (instruction, startPoint)=>{
    const cp1x = startPoint.x + 2 / 3 * (instruction.cpx - startPoint.x);
    const cp1y = startPoint.y + 2 / 3 * (instruction.cpy - startPoint.y);
    const cp2x = instruction.x + 2 / 3 * (instruction.cpx - instruction.x);
    const cp2y = instruction.y + 2 / 3 * (instruction.cpy - instruction.y);
    return {
        type: "C",
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        x: instruction.x,
        y: instruction.y
    };
};
// src/helpers/iterate.ts
var iterateOverSegments = ({ segments, iterate })=>{
    let x = 0;
    let y = 0;
    let initialX = 0;
    let initialY = 0;
    let cpX = null;
    let cpY = null;
    const newSegments = segments.map((s, i)=>{
        const newSeg = iterate({
            segment: s,
            x,
            y,
            prevSegment: segments[i - 1] ?? null,
            initialX,
            initialY,
            cpX,
            cpY
        });
        switch(s.type){
            case "M":
                initialX = s.x;
                initialY = s.y;
                x = s.x;
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "Q":
                x = s.x;
                y = s.y;
                cpX = s.cpx;
                cpY = s.cpy;
                break;
            case "A":
                x = s.x;
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "C":
                x = s.x;
                y = s.y;
                cpX = s.cp2x;
                cpY = s.cp2y;
                break;
            case "S":
                x = s.x;
                y = s.y;
                cpX = s.cpx;
                cpY = s.cpy;
                break;
            case "T":
                if (cpX !== null && cpY !== null) {
                    cpX = x - (cpX - x);
                    cpY = y - (cpY - y);
                }
                x = s.x;
                y = s.y;
                break;
            case "L":
                x = s.x;
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "V":
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "H":
                x = s.x;
                cpX = null;
                cpY = null;
                break;
            case "Z":
                x = initialX;
                y = initialY;
                cpX = null;
                cpY = null;
                break;
            default:
                throw new Error(`Unexpected instruction ${s.type}`);
        }
        return newSeg;
    });
    return newSegments.flat(1);
};
// src/helpers/remove-a-s-t-curves.ts
var TAU = Math.PI * 2;
function approximate_unit_arc(theta1, delta_theta) {
    const alpha = 4 / 3 * Math.tan(delta_theta / 4);
    const x1 = Math.cos(theta1);
    const y1 = Math.sin(theta1);
    const x2 = Math.cos(theta1 + delta_theta);
    const y2 = Math.sin(theta1 + delta_theta);
    return [
        x1,
        y1,
        x1 - y1 * alpha,
        y1 + x1 * alpha,
        x2 + y2 * alpha,
        y2 - x2 * alpha,
        x2,
        y2
    ];
}
function unit_vector_angle(ux, uy, vx, vy) {
    const sign = ux * vy - uy * vx < 0 ? -1 : 1;
    let dot = ux * vx + uy * vy;
    if (dot > 1) {
        dot = 1;
    }
    if (dot < -1) {
        dot = -1;
    }
    return sign * Math.acos(dot);
}
function get_arc_center({ x1, y1, x2, y2, largeArcFlag, sweepFlag, rx, ry, sin_phi, cos_phi }) {
    const x1p = cos_phi * (x1 - x2) / 2 + sin_phi * (y1 - y2) / 2;
    const y1p = -sin_phi * (x1 - x2) / 2 + cos_phi * (y1 - y2) / 2;
    const rx_sq = rx * rx;
    const ry_sq = ry * ry;
    const x1p_sq = x1p * x1p;
    const y1p_sq = y1p * y1p;
    let radicant = rx_sq * ry_sq - rx_sq * y1p_sq - ry_sq * x1p_sq;
    if (radicant < 0) {
        radicant = 0;
    }
    radicant /= rx_sq * y1p_sq + ry_sq * x1p_sq;
    radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);
    const cxp = radicant * rx / ry * y1p;
    const cyp = radicant * -ry / rx * x1p;
    const cx = cos_phi * cxp - sin_phi * cyp + (x1 + x2) / 2;
    const cy = sin_phi * cxp + cos_phi * cyp + (y1 + y2) / 2;
    const v1x = (x1p - cxp) / rx;
    const v1y = (y1p - cyp) / ry;
    const v2x = (-x1p - cxp) / rx;
    const v2y = (-y1p - cyp) / ry;
    const theta1 = unit_vector_angle(1, 0, v1x, v1y);
    let delta_theta = unit_vector_angle(v1x, v1y, v2x, v2y);
    if (sweepFlag === false && delta_theta > 0) {
        delta_theta -= TAU;
    }
    if (sweepFlag === true && delta_theta < 0) {
        delta_theta += TAU;
    }
    return [
        cx,
        cy,
        theta1,
        delta_theta
    ];
}
function arcToCircle({ x1, y1, x2, y2, largeArcFlag, sweepFlag, rx, ry, phi }) {
    const sin_phi = Math.sin(phi * TAU / 360);
    const cos_phi = Math.cos(phi * TAU / 360);
    const x1p = cos_phi * (x1 - x2) / 2 + sin_phi * (y1 - y2) / 2;
    const y1p = -sin_phi * (x1 - x2) / 2 + cos_phi * (y1 - y2) / 2;
    if (x1p === 0 && y1p === 0) {
        return [];
    }
    if (rx === 0 || ry === 0) {
        return [];
    }
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    const lambda = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }
    const cc = get_arc_center({
        x1,
        y1,
        x2,
        y2,
        largeArcFlag,
        sweepFlag,
        rx,
        ry,
        sin_phi,
        cos_phi
    });
    const result = [];
    let theta1 = cc[2];
    let delta_theta = cc[3];
    const segments = Math.max(Math.ceil(Math.abs(delta_theta) / (TAU / 4)), 1);
    delta_theta /= segments;
    for(let i = 0; i < segments; i++){
        result.push(approximate_unit_arc(theta1, delta_theta));
        theta1 += delta_theta;
    }
    return result.map((curve)=>{
        for(let i = 0; i < curve.length; i += 2){
            let x = curve[i + 0];
            let y = curve[i + 1];
            x *= rx;
            y *= ry;
            const xp = cos_phi * x - sin_phi * y;
            const yp = sin_phi * x + cos_phi * y;
            curve[i + 0] = xp + cc[0];
            curve[i + 1] = yp + cc[1];
        }
        return curve;
    });
}
var removeATSHVQInstructions = (segments)=>{
    return iterateOverSegments({
        segments,
        iterate: ({ segment, prevSegment, x, y, cpX, cpY })=>{
            if (segment.type === "H") {
                return [
                    {
                        type: "L",
                        x: segment.x,
                        y
                    }
                ];
            }
            if (segment.type === "V") {
                return [
                    {
                        type: "L",
                        x,
                        y: segment.y
                    }
                ];
            }
            if (segment.type === "A") {
                const nextX = segment.x;
                const nextY = segment.y;
                const new_segments = arcToCircle({
                    x1: x,
                    y1: y,
                    x2: nextX,
                    y2: nextY,
                    largeArcFlag: segment.largeArcFlag,
                    sweepFlag: segment.sweepFlag,
                    rx: segment.rx,
                    ry: segment.ry,
                    phi: segment.xAxisRotation
                });
                if (new_segments.length === 0) {
                    return [
                        {
                            type: "L",
                            x: segment.x,
                            y: segment.y
                        }
                    ];
                }
                const result = new_segments.map((_s)=>{
                    return {
                        type: "C",
                        cp1x: _s[2],
                        cp1y: _s[3],
                        cp2x: _s[4],
                        cp2y: _s[5],
                        x: _s[6],
                        y: _s[7]
                    };
                });
                return result;
            }
            if (segment.type === "T") {
                let prevControlX = 0;
                let prevControlY = 0;
                if (prevSegment && (prevSegment.type === "Q" || prevSegment.type === "T")) {
                    prevControlX = cpX;
                    prevControlY = cpY;
                } else {
                    prevControlX = x;
                    prevControlY = y;
                }
                const vectorX = prevControlX - x;
                const vectorY = prevControlY - y;
                const newControlX = x - vectorX;
                const newControlY = y - vectorY;
                return [
                    convertQToCInstruction({
                        type: "Q",
                        cpx: newControlX,
                        cpy: newControlY,
                        x: segment.x,
                        y: segment.y
                    }, {
                        x,
                        y
                    })
                ];
            }
            if (segment.type === "S") {
                let prevControlX = 0;
                let prevControlY = 0;
                if (prevSegment && prevSegment.type === "C") {
                    prevControlX = prevSegment.cp2x;
                    prevControlY = prevSegment.cp2y;
                } else if (prevSegment && prevSegment.type === "S") {
                    prevControlX = prevSegment.cpx;
                    prevControlY = prevSegment.cpy;
                } else {
                    prevControlX = x;
                    prevControlY = y;
                }
                const vectorX = prevControlX - x;
                const vectorY = prevControlY - y;
                const newControlX = x - vectorX;
                const newControlY = y - vectorY;
                return [
                    {
                        type: "C",
                        cp1x: newControlX,
                        cp1y: newControlY,
                        cp2x: segment.cpx,
                        cp2y: segment.cpy,
                        x: segment.x,
                        y: segment.y
                    }
                ];
            }
            if (segment.type === "Q") {
                return [
                    convertQToCInstruction(segment, {
                        x,
                        y
                    })
                ];
            }
            return [
                segment
            ];
        }
    });
};
// src/serialize-instructions.ts
var serializeInstruction = (instruction)=>{
    if (instruction.type === "A") {
        return `A ${instruction.rx} ${instruction.ry} ${instruction.xAxisRotation} ${Number(instruction.largeArcFlag)} ${Number(instruction.sweepFlag)} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "a") {
        return `a ${instruction.rx} ${instruction.ry} ${instruction.xAxisRotation} ${Number(instruction.largeArcFlag)} ${Number(instruction.sweepFlag)} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "C") {
        return `C ${instruction.cp1x} ${instruction.cp1y} ${instruction.cp2x} ${instruction.cp2y} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "c") {
        return `c ${instruction.cp1dx} ${instruction.cp1dy} ${instruction.cp2dx} ${instruction.cp2dy} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "S") {
        return `S ${instruction.cpx} ${instruction.cpy} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "s") {
        return `s ${instruction.cpdx} ${instruction.cpdy} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "Q") {
        return `Q ${instruction.cpx} ${instruction.cpy} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "q") {
        return `q ${instruction.cpdx} ${instruction.cpdy} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "Z") {
        return "Z";
    }
    if (instruction.type === "H") {
        return `H ${instruction.x}`;
    }
    if (instruction.type === "h") {
        return `h ${instruction.dx}`;
    }
    if (instruction.type === "V") {
        return `V ${instruction.y}`;
    }
    if (instruction.type === "v") {
        return `v ${instruction.dy}`;
    }
    if (instruction.type === "L") {
        return `L ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "l") {
        return `l ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "M") {
        return `M ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "m") {
        return `m ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "T") {
        return `T ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "t") {
        return `t ${instruction.dx} ${instruction.dy}`;
    }
    throw new Error(`Unknown instruction type: ${instruction.type}`);
};
var serializeInstructions = (path)=>{
    return path.map((p)=>{
        return serializeInstruction(p);
    }).join(" ");
};
// src/normalize-path.ts
var normalizeInstructions = (instructions)=>{
    const normalized = [];
    let x = 0;
    let y = 0;
    let moveX = 0;
    let moveY = 0;
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type === "M") {
            moveX = instruction.x;
            moveY = instruction.y;
        } else if (instruction.type === "m") {
            moveX += instruction.dx;
            moveY += instruction.dy;
        }
        if (instruction.type === "A" || instruction.type === "C" || instruction.type === "L" || instruction.type === "M" || instruction.type === "Q" || instruction.type === "S" || instruction.type === "T") {
            normalized.push(instruction);
            x = instruction.x;
            y = instruction.y;
            continue;
        }
        if (instruction.type === "a" || instruction.type === "c" || instruction.type === "l" || instruction.type === "m" || instruction.type === "q" || instruction.type === "s" || instruction.type === "t") {
            const currentX = x;
            const currentY = y;
            x += instruction.dx;
            y += instruction.dy;
            if (instruction.type === "a") {
                normalized.push({
                    type: "A",
                    largeArcFlag: instruction.largeArcFlag,
                    rx: instruction.rx,
                    ry: instruction.ry,
                    sweepFlag: instruction.sweepFlag,
                    xAxisRotation: instruction.xAxisRotation,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "c") {
                normalized.push({
                    type: "C",
                    cp1x: instruction.cp1dx + currentX,
                    cp1y: instruction.cp1dy + currentY,
                    cp2x: instruction.cp2dx + currentX,
                    cp2y: instruction.cp2dy + currentY,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "l") {
                normalized.push({
                    type: "L",
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "m") {
                normalized.push({
                    type: "M",
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "q") {
                normalized.push({
                    type: "Q",
                    cpx: instruction.cpdx + currentX,
                    cpy: instruction.cpdy + currentY,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "s") {
                normalized.push({
                    type: "S",
                    cpx: instruction.cpdx + currentX,
                    cpy: instruction.cpdy + currentY,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "t") {
                normalized.push({
                    type: "T",
                    x,
                    y
                });
                continue;
            }
        }
        if (instruction.type === "H") {
            normalized.push(instruction);
            x = instruction.x;
            continue;
        }
        if (instruction.type === "V") {
            normalized.push(instruction);
            y = instruction.y;
            continue;
        }
        if (instruction.type === "Z") {
            normalized.push(instruction);
            x = moveX;
            y = moveY;
            continue;
        }
        if (instruction.type === "h") {
            x += instruction.dx;
            normalized.push({
                type: "H",
                x
            });
            continue;
        }
        if (instruction.type === "v") {
            y += instruction.dy;
            normalized.push({
                type: "V",
                y
            });
            continue;
        }
        throw new Error("Unknown instruction type: " + instruction.type);
    }
    return normalized;
};
var normalizePath = (path)=>{
    const instructions = parsePath(path);
    const normalized = normalizeInstructions(instructions);
    return serializeInstructions(normalized);
};
// src/reduce-instructions.ts
var reduceInstructions = (instruction)=>{
    const simplified = normalizeInstructions(instruction);
    return removeATSHVQInstructions(simplified);
};
// src/cut-path.ts
var cutPath = (d, length2)=>{
    const parsed = parsePath(d);
    const reduced = reduceInstructions(parsed);
    const constructed = conductAnalysis(reduced);
    const newInstructions = [];
    let summedUpLength = 0;
    for (const segment of constructed){
        for (const instructionAndInfo of segment.instructionsAndInfo){
            if (summedUpLength + instructionAndInfo.length > length2) {
                const remainingLength = length2 - summedUpLength;
                const progress = remainingLength / instructionAndInfo.length;
                const cut = cutInstruction({
                    instruction: instructionAndInfo.instruction,
                    lastPoint: instructionAndInfo.startPoint,
                    progress
                });
                newInstructions.push(cut);
                return serializeInstructions(newInstructions);
            }
            summedUpLength += instructionAndInfo.length;
            newInstructions.push(instructionAndInfo.instruction);
            if (summedUpLength === length2) {
                return serializeInstructions(newInstructions);
            }
        }
    }
    return serializeInstructions(newInstructions);
};
// src/debug-path.ts
var debugPath = (d)=>{
    const instructions = normalizeInstructions(parsePath(d));
    return instructions.map((inst, i)=>{
        if (inst.type === "Z") {
            return null;
        }
        if (inst.type === "H" || inst.type === "V") {
            return null;
        }
        const topLeft = [
            inst.x - 5,
            inst.y - 5
        ];
        const topRight = [
            inst.x + 5,
            inst.y - 5
        ];
        const bottomLeft = [
            inst.x - 5,
            inst.y + 5
        ];
        const bottomRight = [
            inst.x + 5,
            inst.y + 5
        ];
        const triangle = [
            {
                type: "M",
                x: topLeft[0],
                y: topLeft[1]
            },
            {
                type: "L",
                x: topRight[0],
                y: topRight[1]
            },
            {
                type: "L",
                x: bottomRight[0],
                y: bottomRight[1]
            },
            {
                type: "L",
                x: bottomLeft[0],
                y: bottomLeft[1]
            },
            {
                type: "Z"
            }
        ];
        return {
            d: serializeInstructions(triangle),
            color: i === instructions.length - 1 ? "red" : inst.type === "M" ? "blue" : "green"
        };
    }).filter(Boolean);
};
// src/get-bounding-box.ts
var CBEZIER_MINMAX_EPSILON = 0.00000001;
function minmaxQ(A) {
    const min = Math.min(A[0], A[2]);
    const max = Math.max(A[0], A[2]);
    if (A[1] > A[0] ? A[2] >= A[1] : A[2] <= A[1]) {
        return [
            min,
            max
        ];
    }
    const E = (A[0] * A[2] - A[1] * A[1]) / (A[0] - 2 * A[1] + A[2]);
    return E < min ? [
        E,
        max
    ] : [
        min,
        E
    ];
}
function minmaxC(A) {
    const K = A[0] - 3 * A[1] + 3 * A[2] - A[3];
    if (Math.abs(K) < CBEZIER_MINMAX_EPSILON) {
        if (A[0] === A[3] && A[0] === A[1]) {
            return [
                A[0],
                A[3]
            ];
        }
        return minmaxQ([
            A[0],
            -0.5 * A[0] + 1.5 * A[1],
            A[0] - 3 * A[1] + 3 * A[2]
        ]);
    }
    const T = -A[0] * A[2] + A[0] * A[3] - A[1] * A[2] - A[1] * A[3] + A[1] * A[1] + A[2] * A[2];
    if (T <= 0) {
        return [
            Math.min(A[0], A[3]),
            Math.max(A[0], A[3])
        ];
    }
    const S = Math.sqrt(T);
    let min = Math.min(A[0], A[3]);
    let max = Math.max(A[0], A[3]);
    const L = A[0] - 2 * A[1] + A[2];
    for(let R = (L + S) / K, i = 1; i <= 2; R = (L - S) / K, i++){
        if (R > 0 && R < 1) {
            const Q = A[0] * (1 - R) * (1 - R) * (1 - R) + A[1] * 3 * (1 - R) * (1 - R) * R + A[2] * 3 * (1 - R) * R * R + A[3] * R * R * R;
            if (Q < min) {
                min = Q;
            }
            if (Q > max) {
                max = Q;
            }
        }
    }
    return [
        min,
        max
    ];
}
var getBoundingBoxFromInstructions = (instructions)=>{
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let x = 0;
    let y = 0;
    let lastMoveX = 0;
    let lastMoveY = 0;
    for (const seg of instructions){
        switch(seg.type){
            case "M":
                {
                    lastMoveX = seg.x;
                    lastMoveY = seg.y;
                    if (minX > seg.x) {
                        minX = seg.x;
                    }
                    if (minY > seg.y) {
                        minY = seg.y;
                    }
                    if (maxX < seg.x) {
                        maxX = seg.x;
                    }
                    if (maxY < seg.y) {
                        maxY = seg.y;
                    }
                    x = seg.x;
                    y = seg.y;
                    break;
                }
            case "L":
                {
                    if (minX > seg.x) {
                        minX = seg.x;
                    }
                    if (minY > seg.y) {
                        minY = seg.y;
                    }
                    if (maxX < seg.x) {
                        maxX = seg.x;
                    }
                    if (maxY < seg.y) {
                        maxY = seg.y;
                    }
                    x = seg.x;
                    y = seg.y;
                    break;
                }
            case "C":
                {
                    const cxMinMax = minmaxC([
                        x,
                        seg.cp1x,
                        seg.cp2x,
                        seg.x
                    ]);
                    if (minX > cxMinMax[0]) {
                        minX = cxMinMax[0];
                    }
                    if (maxX < cxMinMax[1]) {
                        maxX = cxMinMax[1];
                    }
                    const cyMinMax = minmaxC([
                        y,
                        seg.cp1y,
                        seg.cp2y,
                        seg.y
                    ]);
                    if (minY > cyMinMax[0]) {
                        minY = cyMinMax[0];
                    }
                    if (maxY < cyMinMax[1]) {
                        maxY = cyMinMax[1];
                    }
                    x = seg.x;
                    y = seg.y;
                    break;
                }
            case "Z":
                x = lastMoveX;
                y = lastMoveY;
                break;
            default:
                throw new Error(`Unknown instruction ${seg.type}`);
        }
    }
    return {
        x1: minX,
        y1: minY,
        x2: maxX,
        y2: maxY,
        viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
        width: maxX - minX,
        height: maxY - minY
    };
};
var getBoundingBox = (d)=>{
    const parsed = parsePath(d);
    const unarced = removeATSHVQInstructions(normalizeInstructions(parsed));
    return getBoundingBoxFromInstructions(unarced);
};
// src/helpers/arc.ts
var mod = (x, m)=>{
    return (x % m + m) % m;
};
var toRadians = (angle)=>{
    return angle * (Math.PI / 180);
};
var distance = (p0, p1)=>{
    return Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
};
var clamp = (val, min, max)=>{
    return Math.min(Math.max(val, min), max);
};
var angleBetween = (v0, v1)=>{
    const p = v0.x * v1.x + v0.y * v1.y;
    const n = Math.sqrt((v0.x ** 2 + v0.y ** 2) * (v1.x ** 2 + v1.y ** 2));
    const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
    const angle = sign * Math.acos(p / n);
    return angle;
};
var pointOnEllipticalArc = ({ p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t })=>{
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    xAxisRotation = mod(xAxisRotation, 360);
    const xAxisRotationRadians = toRadians(xAxisRotation);
    if (p0.x === p1.x && p0.y === p1.y) {
        return {
            x: p0.x,
            y: p0.y,
            ellipticalArcAngle: 0
        };
    }
    if (rx === 0 || ry === 0) {
        return {
            x: 0,
            y: 0,
            ellipticalArcAngle: 0
        };
    }
    const dx = (p0.x - p1.x) / 2;
    const dy = (p0.y - p1.y) / 2;
    const transformedPoint = {
        x: Math.cos(xAxisRotationRadians) * dx + Math.sin(xAxisRotationRadians) * dy,
        y: -Math.sin(xAxisRotationRadians) * dx + Math.cos(xAxisRotationRadians) * dy
    };
    const radiiCheck = transformedPoint.x ** 2 / rx ** 2 + transformedPoint.y ** 2 / ry ** 2;
    if (radiiCheck > 1) {
        rx *= Math.sqrt(radiiCheck);
        ry *= Math.sqrt(radiiCheck);
    }
    const cSquareNumerator = rx ** 2 * ry ** 2 - rx ** 2 * transformedPoint.y ** 2 - ry ** 2 * transformedPoint.x ** 2;
    const cSquareRootDenom = rx ** 2 * transformedPoint.y ** 2 + ry ** 2 * transformedPoint.x ** 2;
    let cRadicand = cSquareNumerator / cSquareRootDenom;
    cRadicand = cRadicand < 0 ? 0 : cRadicand;
    const cCoef = (largeArcFlag === sweepFlag ? -1 : 1) * Math.sqrt(cRadicand);
    const transformedCenter = {
        x: cCoef * (rx * transformedPoint.y / ry),
        y: cCoef * (-(ry * transformedPoint.x) / rx)
    };
    const center = {
        x: Math.cos(xAxisRotationRadians) * transformedCenter.x - Math.sin(xAxisRotationRadians) * transformedCenter.y + (p0.x + p1.x) / 2,
        y: Math.sin(xAxisRotationRadians) * transformedCenter.x + Math.cos(xAxisRotationRadians) * transformedCenter.y + (p0.y + p1.y) / 2
    };
    const startVector = {
        x: (transformedPoint.x - transformedCenter.x) / rx,
        y: (transformedPoint.y - transformedCenter.y) / ry
    };
    const startAngle = angleBetween({
        x: 1,
        y: 0
    }, startVector);
    const endVector = {
        x: (-transformedPoint.x - transformedCenter.x) / rx,
        y: (-transformedPoint.y - transformedCenter.y) / ry
    };
    let sweepAngle = angleBetween(startVector, endVector);
    if (!sweepFlag && sweepAngle > 0) {
        sweepAngle -= 2 * Math.PI;
    } else if (sweepFlag && sweepAngle < 0) {
        sweepAngle += 2 * Math.PI;
    }
    sweepAngle %= 2 * Math.PI;
    const angle = startAngle + sweepAngle * t;
    const ellipseComponentX = rx * Math.cos(angle);
    const ellipseComponentY = ry * Math.sin(angle);
    const point = {
        x: Math.cos(xAxisRotationRadians) * ellipseComponentX - Math.sin(xAxisRotationRadians) * ellipseComponentY + center.x,
        y: Math.sin(xAxisRotationRadians) * ellipseComponentX + Math.cos(xAxisRotationRadians) * ellipseComponentY + center.y,
        ellipticalArcStartAngle: startAngle,
        ellipticalArcEndAngle: startAngle + sweepAngle,
        ellipticalArcAngle: angle,
        ellipticalArcCenter: center,
        resultantRx: rx,
        resultantRy: ry
    };
    return point;
};
var approximateArcLengthOfCurve = (resolution, pointOnCurveFunc)=>{
    resolution = resolution ? resolution : 500;
    let resultantArcLength = 0;
    const arcLengthMap = [];
    const approximationLines = [];
    let prevPoint = pointOnCurveFunc(0);
    let nextPoint;
    for(let i = 0; i < resolution; i++){
        const t = clamp(i * (1 / resolution), 0, 1);
        nextPoint = pointOnCurveFunc(t);
        resultantArcLength += distance(prevPoint, nextPoint);
        approximationLines.push([
            prevPoint,
            nextPoint
        ]);
        arcLengthMap.push({
            t,
            arcLength: resultantArcLength
        });
        prevPoint = nextPoint;
    }
    nextPoint = pointOnCurveFunc(1);
    approximationLines.push([
        prevPoint,
        nextPoint
    ]);
    resultantArcLength += distance(prevPoint, nextPoint);
    arcLengthMap.push({
        t: 1,
        arcLength: resultantArcLength
    });
    return {
        arcLength: resultantArcLength,
        arcLengthMap,
        approximationLines
    };
};
var makeArc = ({ x0, y0, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x1, y1 })=>{
    const lengthProperties = approximateArcLengthOfCurve(300, (t)=>{
        return pointOnEllipticalArc({
            p0: {
                x: x0,
                y: y0
            },
            rx,
            ry,
            xAxisRotation: xAxisRotate,
            largeArcFlag: LargeArcFlag,
            sweepFlag: SweepFlag,
            p1: {
                x: x1,
                y: y1
            },
            t
        });
    });
    const length2 = lengthProperties.arcLength;
    const getPointAtLength = (fractionLength)=>{
        if (fractionLength < 0) {
            fractionLength = 0;
        } else if (fractionLength > length2) {
            fractionLength = length2;
        }
        const position = pointOnEllipticalArc({
            p0: {
                x: x0,
                y: y0
            },
            rx,
            ry,
            xAxisRotation: xAxisRotate,
            largeArcFlag: LargeArcFlag,
            sweepFlag: SweepFlag,
            p1: {
                x: x1,
                y: y1
            },
            t: fractionLength / length2
        });
        return {
            x: position.x,
            y: position.y
        };
    };
    return {
        getPointAtLength,
        getTangentAtLength: (fractionLength)=>{
            if (fractionLength < 0) {
                fractionLength = 0;
            } else if (fractionLength > length2) {
                fractionLength = length2;
            }
            const point_dist = 0.05;
            const p1 = getPointAtLength(fractionLength);
            let p2;
            if (fractionLength < 0) {
                fractionLength = 0;
            } else if (fractionLength > length2) {
                fractionLength = length2;
            }
            if (fractionLength < length2 - point_dist) {
                p2 = getPointAtLength(fractionLength + point_dist);
            } else {
                p2 = getPointAtLength(fractionLength - point_dist);
            }
            const xDist = p2.x - p1.x;
            const yDist = p2.y - p1.y;
            const dist = Math.sqrt(xDist * xDist + yDist * yDist);
            if (fractionLength < length2 - point_dist) {
                return {
                    x: -xDist / dist,
                    y: -yDist / dist
                };
            }
            return {
                x: xDist / dist,
                y: yDist / dist
            };
        },
        getTotalLength: ()=>{
            return length2;
        },
        type: "arc"
    };
};
// src/helpers/construct.ts
var constructFromInstructions = (instructions)=>{
    let totalLength = 0;
    const partialLengths = [];
    const functions = [];
    let initialPoint = null;
    let cur = [
        0,
        0
    ];
    let prev_point = [
        0,
        0
    ];
    let curve;
    let ringStart = [
        0,
        0
    ];
    const segments = [];
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type !== "m" && instruction.type !== "M" && segments.length > 0) {
            segments[segments.length - 1].push(instruction);
        }
        if (instruction.type === "M") {
            cur = [
                instruction.x,
                instruction.y
            ];
            ringStart = [
                cur[0],
                cur[1]
            ];
            segments.push([
                instruction
            ]);
            functions.push(null);
            if (i === 0) {
                initialPoint = {
                    x: instruction.x,
                    y: instruction.y
                };
            }
        }
        if (instruction.type === "m") {
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
            ringStart = [
                cur[0],
                cur[1]
            ];
            segments.push([
                {
                    type: "M",
                    x: cur[0],
                    y: cur[1]
                }
            ]);
            functions.push(null);
        }
        if (instruction.type === "L") {
            totalLength += Math.sqrt((cur[0] - instruction.x) ** 2 + (cur[1] - instruction.y) ** 2);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: instruction.x,
                y0: cur[1],
                y1: instruction.y
            }));
            cur = [
                instruction.x,
                instruction.y
            ];
        }
        if (instruction.type === "l") {
            totalLength += Math.sqrt(instruction.dx ** 2 + instruction.dy ** 2);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: instruction.dx + cur[0],
                y0: cur[1],
                y1: instruction.dy + cur[1]
            }));
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
        }
        if (instruction.type === "H") {
            totalLength += Math.abs(cur[0] - instruction.x);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: instruction.x,
                y0: cur[1],
                y1: cur[1]
            }));
            cur[0] = instruction.x;
        }
        if (instruction.type === "h") {
            totalLength += Math.abs(instruction.dx);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: cur[0] + instruction.dx,
                y0: cur[1],
                y1: cur[1]
            }));
            cur[0] = instruction.dx + cur[0];
        } else if (instruction.type === "V") {
            totalLength += Math.abs(cur[1] - instruction.y);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: cur[0],
                y0: cur[1],
                y1: instruction.y
            }));
            cur[1] = instruction.y;
        }
        if (instruction.type === "v") {
            totalLength += Math.abs(instruction.dy);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: cur[0],
                y0: cur[1],
                y1: cur[1] + instruction.dy
            }));
            cur[1] = instruction.dy + cur[1];
        } else if (instruction.type === "Z") {
            totalLength += Math.sqrt((ringStart[0] - cur[0]) ** 2 + (ringStart[1] - cur[1]) ** 2);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: ringStart[0],
                y0: cur[1],
                y1: ringStart[1]
            }));
            cur = [
                ringStart[0],
                ringStart[1]
            ];
        }
        if (instruction.type === "C") {
            curve = makeCubic({
                startX: cur[0],
                startY: cur[1],
                cp1x: instruction.cp1x,
                cp1y: instruction.cp1y,
                cp2x: instruction.cp2x,
                cp2y: instruction.cp2y,
                x: instruction.x,
                y: instruction.y
            });
            totalLength += curve.getTotalLength();
            cur = [
                instruction.x,
                instruction.y
            ];
            functions.push(curve);
        } else if (instruction.type === "c") {
            curve = makeCubic({
                startX: cur[0],
                startY: cur[1],
                cp1x: cur[0] + instruction.cp1dx,
                cp1y: cur[1] + instruction.cp1dy,
                cp2x: cur[0] + instruction.cp2dx,
                cp2y: cur[1] + instruction.cp2dy,
                x: cur[0] + instruction.dx,
                y: cur[1] + instruction.dy
            });
            if (curve.getTotalLength() > 0) {
                totalLength += curve.getTotalLength();
                functions.push(curve);
                cur = [
                    instruction.dx + cur[0],
                    instruction.dy + cur[1]
                ];
            } else {
                functions.push(makeLinearPosition({
                    x0: cur[0],
                    x1: cur[0],
                    y0: cur[1],
                    y1: cur[1]
                }));
            }
        }
        if (instruction.type === "S") {
            const prev = instructions[i - 1];
            const prevWasCurve = prev.type === "C" || prev.type === "c" || prev.type === "S" || prev.type === "s";
            if (i > 0 && prevWasCurve) {
                if (curve) {
                    const c = curve.getC();
                    curve = makeCubic({
                        startX: cur[0],
                        startY: cur[1],
                        cp1x: 2 * cur[0] - c.x,
                        cp1y: 2 * cur[1] - c.y,
                        cp2x: instruction.cpx,
                        cp2y: instruction.cpy,
                        x: instruction.x,
                        y: instruction.y
                    });
                }
            } else {
                curve = makeCubic({
                    startX: cur[0],
                    startY: cur[1],
                    cp1x: cur[0],
                    cp1y: cur[1],
                    cp2x: instruction.cpx,
                    cp2y: instruction.cpy,
                    x: instruction.x,
                    y: instruction.y
                });
            }
            if (curve) {
                totalLength += curve.getTotalLength();
                cur = [
                    instruction.x,
                    instruction.y
                ];
                functions.push(curve);
            }
        }
        if (instruction.type === "s") {
            const prev = instructions[i - 1];
            const prevWasCurve = prev.type === "C" || prev.type === "c" || prev.type === "S" || prev.type === "s";
            if (i > 0 && prevWasCurve) {
                if (curve) {
                    const c = curve.getC();
                    const d = curve.getD();
                    curve = makeCubic({
                        startX: cur[0],
                        startY: cur[1],
                        cp1x: cur[0] + d.x - c.x,
                        cp1y: cur[1] + d.y - c.y,
                        cp2x: cur[0] + instruction.cpdx,
                        cp2y: cur[1] + instruction.cpdy,
                        x: cur[0] + instruction.dx,
                        y: cur[1] + instruction.dy
                    });
                }
            } else {
                curve = makeCubic({
                    startX: cur[0],
                    startY: cur[1],
                    cp1x: cur[0],
                    cp1y: cur[1],
                    cp2x: cur[0] + instruction.cpdx,
                    cp2y: cur[1] + instruction.cpdy,
                    x: cur[0] + instruction.dx,
                    y: cur[1] + instruction.dy
                });
            }
            if (curve) {
                totalLength += curve.getTotalLength();
                cur = [
                    instruction.dx + cur[0],
                    instruction.dy + cur[1]
                ];
                functions.push(curve);
            }
        }
        if (instruction.type === "Q") {
            if (cur[0] === instruction.cpx && cur[1] === instruction.cpy) {
                const linearCurve = makeLinearPosition({
                    x0: instruction.cpx,
                    x1: instruction.x,
                    y0: instruction.cpy,
                    y1: instruction.y
                });
                totalLength += linearCurve.getTotalLength();
                functions.push(linearCurve);
            } else {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: instruction.cpx,
                    cpy: instruction.cpy,
                    x: instruction.x,
                    y: instruction.y
                });
                totalLength += curve.getTotalLength();
                functions.push(curve);
            }
            cur = [
                instruction.x,
                instruction.y
            ];
            prev_point = [
                instruction.cpx,
                instruction.cpy
            ];
        }
        if (instruction.type === "q") {
            if (instruction.cpdx === 0 && instruction.cpdy === 0) {
                const linearCurve = makeLinearPosition({
                    x0: cur[0] + instruction.cpdx,
                    x1: cur[0] + instruction.cpdy,
                    y0: cur[1] + instruction.dx,
                    y1: cur[1] + instruction.dy
                });
                totalLength += linearCurve.getTotalLength();
                functions.push(linearCurve);
            } else {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: cur[0] + instruction.cpdx,
                    cpy: cur[1] + instruction.cpdy,
                    x: cur[0] + instruction.dx,
                    y: cur[1] + instruction.dy
                });
                totalLength += curve.getTotalLength();
                functions.push(curve);
            }
            prev_point = [
                cur[0] + instruction.cpdx,
                cur[1] + instruction.cpdy
            ];
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
        }
        if (instruction.type === "T") {
            const prev = instructions[i - 1];
            const prevWasQ = prev.type === "Q" || prev.type === "q" || prev.type === "T" || prev.type === "t";
            if (i > 0 && prevWasQ) {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: 2 * cur[0] - prev_point[0],
                    cpy: 2 * cur[1] - prev_point[1],
                    x: instruction.x,
                    y: instruction.y
                });
                functions.push(curve);
                totalLength += curve.getTotalLength();
            } else {
                const linearCurve = makeLinearPosition({
                    x0: cur[0],
                    x1: instruction.x,
                    y0: cur[1],
                    y1: instruction.y
                });
                functions.push(linearCurve);
                totalLength += linearCurve.getTotalLength();
            }
            prev_point = [
                2 * cur[0] - prev_point[0],
                2 * cur[1] - prev_point[1]
            ];
            cur = [
                instruction.x,
                instruction.y
            ];
        }
        if (instruction.type === "t") {
            const prev = instructions[i - 1];
            const prevWasQ = prev.type === "Q" || prev.type === "q" || prev.type === "T" || prev.type === "t";
            if (i > 0 && prevWasQ) {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: 2 * cur[0] - prev_point[0],
                    cpy: 2 * cur[1] - prev_point[1],
                    x: cur[0] + instruction.dx,
                    y: cur[1] + instruction.dy
                });
                totalLength += curve.getTotalLength();
                functions.push(curve);
            } else {
                const linearCurve = makeLinearPosition({
                    x0: cur[0],
                    x1: cur[0] + instruction.dx,
                    y0: cur[1],
                    y1: cur[1] + instruction.dy
                });
                totalLength += linearCurve.getTotalLength();
                functions.push(linearCurve);
            }
            prev_point = [
                2 * cur[0] - prev_point[0],
                2 * cur[1] - prev_point[1]
            ];
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
        }
        if (instruction.type === "A") {
            const arcCurve = makeArc({
                x0: cur[0],
                y0: cur[1],
                rx: instruction.rx,
                ry: instruction.ry,
                xAxisRotate: instruction.xAxisRotation,
                LargeArcFlag: instruction.largeArcFlag,
                SweepFlag: instruction.sweepFlag,
                x1: instruction.x,
                y1: instruction.y
            });
            totalLength += arcCurve.getTotalLength();
            cur = [
                instruction.x,
                instruction.y
            ];
            functions.push(arcCurve);
        }
        if (instruction.type === "a") {
            const arcCurve = makeArc({
                x0: cur[0],
                y0: cur[1],
                rx: instruction.rx,
                ry: instruction.ry,
                xAxisRotate: instruction.xAxisRotation,
                LargeArcFlag: instruction.largeArcFlag,
                SweepFlag: instruction.sweepFlag,
                x1: cur[0] + instruction.dx,
                y1: cur[1] + instruction.dy
            });
            totalLength += arcCurve.getTotalLength();
            cur = [
                cur[0] + instruction.dx,
                cur[1] + instruction.dy
            ];
            functions.push(arcCurve);
        }
        partialLengths.push(totalLength);
    }
    return {
        segments,
        initialPoint,
        totalLength,
        partialLengths,
        functions
    };
};
var construct = (string)=>{
    const parsed = parsePath(string);
    return constructFromInstructions(parsed);
};
// src/get-length.ts
var getLength = (path)=>{
    const constructucted = construct(path);
    return constructucted.totalLength;
};
// src/evolve-path.ts
var evolvePath = (progress, path)=>{
    const length2 = getLength(path);
    if (progress === 0) {
        const extendedLength = length2 * 1.5;
        return {
            strokeDasharray: `${extendedLength} ${extendedLength}`,
            strokeDashoffset: extendedLength
        };
    }
    const strokeDasharray = `${length2} ${length2}`;
    const strokeDashoffset = length2 - progress * length2;
    return {
        strokeDasharray,
        strokeDashoffset
    };
};
// src/extend-viewbox.ts
var extendViewBox = (currentViewBox, scale)=>{
    const relativeScale = scale - 1;
    const splitted = currentViewBox.split(" ").map((a)=>a.trim()).filter((a)=>a !== "").map(Number);
    if (splitted.length !== 4) {
        throw new Error(`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`);
    }
    for (const part of splitted){
        if (Number.isNaN(part)) {
            throw new Error(`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`);
        }
        if (!Number.isFinite(part)) {
            throw new Error(`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`);
        }
    }
    const [x, y, width, height] = splitted;
    return [
        x - relativeScale * width / 2,
        y - relativeScale * height / 2,
        width + relativeScale * width,
        height + relativeScale * height
    ].join(" ");
};
// src/get-instruction-index-at-length.ts
var getInstructionIndexAtLengthFromConstructed = (constructed, fractionLength)=>{
    if (fractionLength < 0) {
        throw new Error("Length less than 0 was passed");
    }
    if (fractionLength > constructed.totalLength) {
        fractionLength = constructed.totalLength;
    }
    let index = constructed.partialLengths.length - 1;
    while(constructed.partialLengths[index] >= fractionLength && index > 0){
        index--;
    }
    return {
        lengthIntoInstruction: fractionLength - constructed.partialLengths[index],
        index
    };
};
var getInstructionIndexAtLength = (path, length2)=>{
    const constructed = construct(path);
    if (length2 > constructed.totalLength) {
        throw new Error(`A length of ${length2} was passed to getInstructionIndexAtLength() but the total length of the path is only ${constructed.totalLength}`);
    }
    return getInstructionIndexAtLengthFromConstructed(constructed, length2);
};
// src/get-point-at-length.ts
var getPointAtLength = (path, length2)=>{
    const constructed = construct(path);
    const fractionPart = getInstructionIndexAtLengthFromConstructed(constructed, length2);
    const functionAtPart = constructed.functions[fractionPart.index + 1];
    if (functionAtPart) {
        return functionAtPart.getPointAtLength(fractionPart.lengthIntoInstruction);
    }
    if (constructed.initialPoint) {
        return constructed.initialPoint;
    }
    throw new Error("Wrong function at this part.");
};
// src/get-subpaths.ts
var getSubpaths = (path)=>{
    const parsed = parsePath(path);
    const { segments } = constructFromInstructions(parsed);
    return segments.map((seg)=>{
        return serializeInstructions(seg);
    });
};
// src/get-tangent-at-length.ts
var getTangentAtLength = (path, length2)=>{
    const constructed = construct(path);
    const fractionPart = getInstructionIndexAtLengthFromConstructed(constructed, length2);
    const functionAtPart = constructed.functions[fractionPart.index + 1];
    if (functionAtPart) {
        return functionAtPart.getTangentAtLength(fractionPart.lengthIntoInstruction);
    }
    if (constructed.initialPoint) {
        return {
            x: 0,
            y: 0
        };
    }
    throw new Error("Wrong function at this part.");
};
// src/get-end-position.ts
var getEndPosition = (instructions)=>{
    let x = 0;
    let y = 0;
    let moveX = 0;
    let moveY = 0;
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type === "M") {
            moveX = instruction.x;
            moveY = instruction.y;
        } else if (instruction.type === "m") {
            moveX += instruction.dx;
            moveY += instruction.dy;
        }
        if (instruction.type === "A" || instruction.type === "C" || instruction.type === "L" || instruction.type === "M" || instruction.type === "Q" || instruction.type === "S" || instruction.type === "T") {
            x = instruction.x;
            y = instruction.y;
            continue;
        }
        if (instruction.type === "a" || instruction.type === "c" || instruction.type === "l" || instruction.type === "m" || instruction.type === "q" || instruction.type === "s" || instruction.type === "t") {
            x += instruction.dx;
            y += instruction.dy;
            continue;
        }
        if (instruction.type === "H") {
            x = instruction.x;
            continue;
        }
        if (instruction.type === "V") {
            y = instruction.y;
            continue;
        }
        if (instruction.type === "Z") {
            x = moveX;
            y = moveY;
            continue;
        }
        if (instruction.type === "h") {
            x += instruction.dx;
            continue;
        }
        if (instruction.type === "v") {
            y += instruction.dy;
            continue;
        }
        throw new Error("Unknown instruction type: " + instruction.type);
    }
    return {
        x,
        y
    };
};
// src/interpolate-path/convert-to-same-instruction-type.ts
var convertToLCommand = (command)=>{
    if (command.type === "M" || command.type === "L" || command.type === "Z") {
        throw new Error("unexpected");
    }
    return {
        type: "L",
        x: command.x,
        y: command.y
    };
};
var convertToCCommand = (command, currentPoint)=>{
    if (command.type === "M" || command.type === "C" || command.type === "Z") {
        throw new Error("unexpected");
    }
    if (command.type === "L") {
        return {
            type: "C",
            cp1x: currentPoint.x,
            cp1y: currentPoint.y,
            cp2x: command.x,
            cp2y: command.y,
            x: command.x,
            y: command.y
        };
    }
    throw new Error("all types should be handled");
};
function convertToSameInstructionType(aCommand, bCommand, currentPoint) {
    if (aCommand.type === "M" || bCommand.type === "M") {
        return {
            ...aCommand
        };
    }
    if (aCommand.type === bCommand.type) {
        return {
            ...aCommand
        };
    }
    if (bCommand.type === "C") {
        return convertToCCommand(aCommand, currentPoint);
    }
    if (bCommand.type === "L") {
        return convertToLCommand(aCommand);
    }
    if (bCommand.type === "Z") {
        return {
            type: "Z"
        };
    }
    throw new TypeError("unhandled");
}
// src/interpolate-path/points-to-command.ts
function pointsToInstruction(points) {
    const x = points[points.length - 1][0];
    const y = points[points.length - 1][1];
    if (points.length === 4) {
        const x1 = points[1][0];
        const y1 = points[1][1];
        const x2 = points[2][0];
        const y2 = points[2][1];
        return {
            type: "C",
            cp1x: x1,
            cp1y: y1,
            cp2x: x2,
            cp2y: y2,
            x,
            y
        };
    }
    if (points.length === 3) {
        const x1 = points[1][0];
        const y1 = points[1][1];
        return convertQToCInstruction({
            type: "Q",
            cpx: x1,
            cpy: y1,
            x,
            y
        }, {
            x: points[0][0],
            y: points[0][1]
        });
    }
    return {
        type: "L",
        x,
        y
    };
}
// src/interpolate-path/de-casteljau.ts
function decasteljau(points, t) {
    const left = [];
    const right = [];
    function decasteljauRecurse(_points, _t) {
        if (_points.length === 1) {
            left.push(_points[0]);
            right.push(_points[0]);
        } else {
            const newPoints = Array(_points.length - 1);
            for(let i = 0; i < newPoints.length; i++){
                if (i === 0) {
                    left.push(_points[0]);
                }
                if (i === newPoints.length - 1) {
                    right.push(_points[i + 1]);
                }
                newPoints[i] = [
                    (1 - _t) * _points[i][0] + _t * _points[i + 1][0],
                    (1 - _t) * _points[i][1] + _t * _points[i + 1][1]
                ];
            }
            decasteljauRecurse(newPoints, _t);
        }
    }
    if (points.length) {
        decasteljauRecurse(points, t);
    }
    return {
        left,
        right: right.reverse()
    };
}
// src/interpolate-path/split-curve-as-points.ts
function splitCurveAsPoints(points, segmentCount = 2) {
    const segments = [];
    let remainingCurve = points;
    const tIncrement = 1 / segmentCount;
    for(let i = 0; i < segmentCount - 1; i++){
        const tRelative = tIncrement / (1 - tIncrement * i);
        const split = decasteljau(remainingCurve, tRelative);
        segments.push(split.left);
        remainingCurve = split.right;
    }
    segments.push(remainingCurve);
    return segments;
}
// src/interpolate-path/split-curve.ts
var splitCurveInstructions = (instructionStartX, instructionStartY, instructionEnd, segmentCount)=>{
    const points = [
        [
            instructionStartX,
            instructionStartY
        ]
    ];
    if (instructionEnd.type === "Q") {
        points.push([
            instructionEnd.cpx,
            instructionEnd.cpy
        ]);
    }
    if (instructionEnd.type === "C") {
        points.push([
            instructionEnd.cp1x,
            instructionEnd.cp1y
        ]);
        points.push([
            instructionEnd.cp2x,
            instructionEnd.cp2y
        ]);
    }
    points.push([
        instructionEnd.x,
        instructionEnd.y
    ]);
    return splitCurveAsPoints(points, segmentCount).map((p)=>{
        return pointsToInstruction(p);
    });
};
// src/interpolate-path/split-segment.ts
function splitSegmentInstructions(commandStart, commandEnd, segmentCount) {
    let segments = [];
    if (commandEnd.type === "L" || commandEnd.type === "C") {
        if (commandStart.type !== "Z") {
            segments = segments.concat(splitCurveInstructions(commandStart.x, commandStart.y, commandEnd, segmentCount));
        }
    } else {
        const copyCommand = commandStart.type === "M" ? {
            type: "L",
            x: commandStart.x,
            y: commandStart.y
        } : commandStart;
        segments = segments.concat(new Array(segmentCount - 1).fill(true).map(()=>copyCommand));
        segments.push(commandEnd);
    }
    return segments;
}
// src/interpolate-path/extend-command.ts
function extendInstruction(commandsToExtend, referenceCommands) {
    const numSegmentsToExtend = commandsToExtend.length - 1;
    const numReferenceSegments = referenceCommands.length - 1;
    const segmentRatio = numSegmentsToExtend / numReferenceSegments;
    const countPointsPerSegment = new Array(numReferenceSegments).fill(undefined).reduce((accum, _d, i)=>{
        const insertIndex = Math.floor(segmentRatio * i);
        accum[insertIndex] = (accum[insertIndex] || 0) + 1;
        return accum;
    }, []);
    const extended = countPointsPerSegment.reduce((_extended, segmentCount, i)=>{
        if (i === commandsToExtend.length - 1) {
            const lastCommandCopies = new Array(segmentCount).fill({
                ...commandsToExtend[commandsToExtend.length - 1]
            });
            if (lastCommandCopies[0].type === "M") {
                lastCommandCopies.forEach((d)=>{
                    d.type = "L";
                });
            }
            return _extended.concat(lastCommandCopies);
        }
        return _extended.concat(splitSegmentInstructions(commandsToExtend[i], commandsToExtend[i + 1], segmentCount));
    }, []);
    extended.unshift(commandsToExtend[0]);
    return extended;
}
// src/interpolate-path/interpolate-instruction-of-same-kind.ts
var interpolateLInstruction = (t, first, second)=>{
    return {
        type: "L",
        x: (1 - t) * first.x + t * second.x,
        y: (1 - t) * first.y + t * second.y
    };
};
var interpolateCInstructions = (t, first, second)=>{
    return {
        type: "C",
        cp1x: (1 - t) * first.cp1x + t * second.cp1x,
        cp2x: (1 - t) * first.cp2x + t * second.cp2x,
        cp1y: (1 - t) * first.cp1y + t * second.cp1y,
        cp2y: (1 - t) * first.cp2y + t * second.cp2y,
        x: (1 - t) * first.x + t * second.x,
        y: (1 - t) * first.y + t * second.y
    };
};
var interpolateMInstructions = (t, first, second)=>{
    return {
        type: "M",
        x: (1 - t) * first.x + t * second.x,
        y: (1 - t) * first.y + t * second.y
    };
};
var interpolateInstructionOfSameKind = (t, first, second)=>{
    if (first.type === "L") {
        if (second.type !== "L") {
            throw new Error("mismatch");
        }
        return interpolateLInstruction(t, first, second);
    }
    if (first.type === "C") {
        if (second.type !== "C") {
            throw new Error("mismatch");
        }
        return interpolateCInstructions(t, first, second);
    }
    if (first.type === "M") {
        if (second.type !== "M") {
            throw new Error("mismatch");
        }
        return interpolateMInstructions(t, first, second);
    }
    if (first.type === "Z") {
        if (second.type !== "Z") {
            throw new Error("mismatch");
        }
        return {
            type: "Z"
        };
    }
    throw new Error("mismatch");
};
// src/interpolate-path/interpolate-instructions.ts
function interpolateInstructions(aCommandsInput, bCommandsInput) {
    let aCommands = aCommandsInput.slice();
    let bCommands = bCommandsInput.slice();
    if (!aCommands.length && !bCommands.length) {
        return function() {
            return [];
        };
    }
    const addZ = (aCommands.length === 0 || aCommands[aCommands.length - 1].type === "Z") && (bCommands.length === 0 || bCommands[bCommands.length - 1].type === "Z");
    if (aCommands.length > 0 && aCommands[aCommands.length - 1].type === "Z") {
        aCommands.pop();
    }
    if (bCommands.length > 0 && bCommands[bCommands.length - 1].type === "Z") {
        bCommands.pop();
    }
    if (!aCommands.length) {
        aCommands.push(bCommands[0]);
    } else if (!bCommands.length) {
        bCommands.push(aCommands[0]);
    }
    const numPointsToExtend = Math.abs(bCommands.length - aCommands.length);
    if (numPointsToExtend !== 0) {
        if (bCommands.length > aCommands.length) {
            aCommands = extendInstruction(aCommands, bCommands);
        } else if (bCommands.length < aCommands.length) {
            bCommands = extendInstruction(bCommands, aCommands);
        }
    }
    const aSameType = aCommands.map((aCommand, i)=>{
        const commandsUntilNow = aCommands.slice(0, i);
        const point = getEndPosition(commandsUntilNow);
        return convertToSameInstructionType(aCommand, bCommands[i], point);
    });
    const interpolatedCommands = [];
    if (addZ) {
        aSameType.push({
            type: "Z"
        });
        bCommands.push({
            type: "Z"
        });
    }
    return function(t) {
        if (t === 1) {
            return bCommandsInput;
        }
        if (t === 0) {
            return aSameType;
        }
        for(let i = 0; i < aSameType.length; ++i){
            interpolatedCommands.push(interpolateInstructionOfSameKind(t, aSameType[i], bCommands[i]));
        }
        return interpolatedCommands;
    };
}
// src/interpolate-path/interpolate-path.ts
var interpolatePath = (value, firstPath, secondPath)=>{
    if (value === 1) {
        return secondPath;
    }
    if (value === 0) {
        return firstPath;
    }
    const aCommands = reduceInstructions(parsePath(firstPath));
    if (aCommands.length === 0) {
        throw new TypeError(`SVG Path "${firstPath}" is not valid`);
    }
    const bCommands = reduceInstructions(parsePath(secondPath));
    if (bCommands.length === 0) {
        throw new TypeError(`SVG Path "${secondPath}" is not valid`);
    }
    const commandInterpolator = interpolateInstructions(aCommands, bCommands);
    return serializeInstructions(commandInterpolator(value));
};
// src/translate-path.ts
var translateSegments = (segments, x, y)=>{
    return segments.map((segment)=>{
        if (segment.type === "a" || segment.type === "c" || segment.type === "v" || segment.type === "s" || segment.type === "h" || segment.type === "l" || segment.type === "m" || segment.type === "q" || segment.type === "t") {
            return segment;
        }
        if (segment.type === "V") {
            return {
                type: "V",
                y: segment.y + y
            };
        }
        if (segment.type === "H") {
            return {
                type: "H",
                x: segment.x + x
            };
        }
        if (segment.type === "A") {
            return {
                type: "A",
                rx: segment.rx,
                ry: segment.ry,
                largeArcFlag: segment.largeArcFlag,
                sweepFlag: segment.sweepFlag,
                xAxisRotation: segment.xAxisRotation,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "Z") {
            return segment;
        }
        if (segment.type === "C") {
            return {
                type: "C",
                cp1x: segment.cp1x + x,
                cp1y: segment.cp1y + y,
                cp2x: segment.cp2x + x,
                cp2y: segment.cp2y + y,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "Q") {
            return {
                type: "Q",
                cpx: segment.cpx + x,
                cpy: segment.cpy + y,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "S") {
            return {
                type: "S",
                cpx: segment.cpx + x,
                cpy: segment.cpy + y,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "T") {
            return {
                type: "T",
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "L") {
            return {
                type: "L",
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "M") {
            return {
                type: "M",
                x: segment.x + x,
                y: segment.y + y
            };
        }
        throw new Error(`Unknown segment type: ${segment.type}`);
    });
};
var translatePath = (path, x, y)=>{
    return serializeInstructions(translateSegments(parsePath(path), x, y));
};
// src/reset-path.ts
var resetPath = (d)=>{
    const box = getBoundingBox(d);
    return translatePath(d, -box.x1, -box.y1);
};
// src/reverse-path.ts
function reverseNormalizedPath(instructions) {
    const reversed = [];
    let nextX = 0;
    let nextY = 0;
    for (const term of instructions){
        if (term.type === "A") {
            reversed.unshift({
                type: "A",
                largeArcFlag: term.largeArcFlag,
                rx: term.rx,
                ry: term.ry,
                xAxisRotation: term.xAxisRotation,
                sweepFlag: !term.sweepFlag,
                x: nextX,
                y: nextY
            });
        } else if (term.type === "C") {
            reversed.unshift({
                type: "C",
                cp1x: term.cp2x,
                cp1y: term.cp2y,
                cp2x: term.cp1x,
                cp2y: term.cp1y,
                x: nextX,
                y: nextY
            });
        } else if (term.type === "Q") {
            reversed.unshift({
                type: "Q",
                cpx: term.cpx,
                cpy: term.cpy,
                x: nextX,
                y: nextY
            });
        } else if (term.type === "L") {
            reversed.unshift({
                type: "L",
                x: nextX,
                y: nextY
            });
        } else if (term.type === "M") {} else if (term.type === "Z") {} else {
            throw new Error("unnormalized instruction " + term.type);
        }
        if (term.type !== "Z") {
            nextX = term.x;
            nextY = term.y;
        }
    }
    reversed.unshift({
        type: "M",
        x: nextX,
        y: nextY
    });
    let revstring = serializeInstructions(reversed);
    if (instructions[instructions.length - 1].type === "Z") revstring += "Z";
    revstring = revstring.replace(/M M/g, "Z M");
    return revstring;
}
var reversePath = (path)=>{
    const parsed = parsePath(path);
    const normalized = normalizeInstructions(parsed);
    const reduced = reduceInstructions(normalized);
    const { segments } = constructFromInstructions(reduced);
    return segments.map((spath)=>{
        return reverseNormalizedPath(spath);
    }).join(" ").replace(/ +/g, " ").trim();
};
// src/scale-path.ts
var scalePath = (d, scaleX, scaleY)=>{
    const reduced = reduceInstructions(parsePath(d));
    const bounded = getBoundingBoxFromInstructions(reduced);
    const zeroed = translateSegments(reduced, -bounded.x1, -bounded.y1);
    const mapped = zeroed.map((instruction)=>{
        if (instruction.type === "L") {
            return {
                type: "L",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "C") {
            return {
                type: "C",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y,
                cp1x: scaleX * instruction.cp1x,
                cp1y: scaleY * instruction.cp1y,
                cp2x: scaleX * instruction.cp2x,
                cp2y: scaleY * instruction.cp2y
            };
        }
        if (instruction.type === "M") {
            return {
                type: "M",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "Q") {
            return {
                type: "Q",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y,
                cpx: scaleX * instruction.cpx,
                cpy: scaleY * instruction.cpy
            };
        }
        if (instruction.type === "Z") {
            return {
                type: "Z"
            };
        }
        if (instruction.type === "A") {
            return {
                type: "A",
                largeArcFlag: instruction.largeArcFlag,
                rx: scaleX * instruction.rx,
                ry: scaleY * instruction.ry,
                sweepFlag: instruction.sweepFlag,
                xAxisRotation: instruction.xAxisRotation,
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "H") {
            return {
                type: "H",
                x: scaleX * instruction.x
            };
        }
        if (instruction.type === "S") {
            return {
                type: "S",
                cpx: scaleX * instruction.cpx,
                cpy: scaleY * instruction.cpy,
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "T") {
            return {
                type: "T",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "V") {
            return {
                type: "V",
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "a") {
            return {
                type: "a",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy,
                largeArcFlag: instruction.largeArcFlag,
                rx: scaleX * instruction.rx,
                ry: scaleY * instruction.ry,
                sweepFlag: instruction.sweepFlag,
                xAxisRotation: instruction.xAxisRotation
            };
        }
        if (instruction.type === "c") {
            return {
                type: "c",
                cp1dx: scaleX * instruction.cp1dx,
                cp1dy: scaleY * instruction.cp1dy,
                cp2dx: scaleX * instruction.cp2dx,
                cp2dy: scaleY * instruction.cp2dy,
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "h") {
            return {
                type: "h",
                dx: scaleX * instruction.dx
            };
        }
        if (instruction.type === "l") {
            return {
                type: "l",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "m") {
            return {
                type: "m",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "q") {
            return {
                type: "q",
                cpdx: scaleX * instruction.cpdx,
                cpdy: scaleY * instruction.cpdy,
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "s") {
            return {
                type: "s",
                cpdx: scaleX * instruction.cpdx,
                cpdy: scaleY * instruction.cpdy,
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "t") {
            return {
                type: "t",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "v") {
            return {
                type: "v",
                dy: scaleY * instruction.dy
            };
        }
        throw new Error("unexpected function");
    });
    return serializeInstructions(translateSegments(mapped, bounded.x1, bounded.y1));
};
// src/warp-path/warp-helpers.ts
var euclideanDistance = (points)=>{
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    let d2 = 0;
    for(let i = 0; i < startPoint.length; i++){
        const d = endPoint[i] - startPoint[i];
        d2 += d ** 2;
    }
    return Math.sqrt(d2);
};
function split(p, t = 0.5) {
    const seg0 = [];
    const seg1 = [];
    const orders = [
        p
    ];
    while(orders.length < p.length){
        const q = orders[orders.length - 1];
        const r = [];
        for(let i = 1; i < q.length; i++){
            const q0 = q[i - 1];
            const q1 = q[i];
            const s = [];
            const dim = Math.max(q0.length, q1.length);
            for(let j = 0; j < dim; j++){
                const s0 = q0[j] || 0;
                const s1 = q1[j] || 0;
                s.push(s0 + (s1 - s0) * t);
            }
            r.push(s);
        }
        orders.push(r);
    }
    for(let i = 0; i < orders.length; i++){
        seg0.push(orders[i][0]);
        seg1.push(orders[orders.length - 1 - i][i]);
    }
    return [
        seg0,
        seg1
    ];
}
function interpolateUntil(points, threshold, deltaFunction = euclideanDistance) {
    const stack = [
        points
    ];
    const segments = [];
    while(stack.length > 0){
        const currentPoints = stack.pop();
        if (deltaFunction(currentPoints) > threshold) {
            const newPoints = split(currentPoints);
            for(let i = newPoints.length - 1; i >= 0; i--){
                stack.push(newPoints[i]);
            }
        } else {
            segments.push(currentPoints);
        }
    }
    return segments;
}
function createLineSegment(points) {
    switch(points.length){
        case 2:
            return {
                type: "L",
                x: points[1][0],
                y: points[1][1]
            };
        case 3:
            return convertQToCInstruction({
                type: "Q",
                cpx: points[1][0],
                cpy: points[1][1],
                x: points[2][0],
                y: points[2][1]
            }, {
                x: points[0][0],
                y: points[0][1]
            });
        case 4:
            return {
                type: "C",
                cp1x: points[1][0],
                cp1y: points[1][1],
                cp2x: points[2][0],
                cp2y: points[2][1],
                x: points[3][0],
                y: points[3][1]
            };
        default:
            throw new Error("Expected 2, 3 or 4 points for a line segment, got " + points.length);
    }
}
function warpInterpolate(path, threshold, deltaFunction) {
    let prexX = 0;
    let prexY = 0;
    return path.map((segment)=>{
        const points = [
            [
                prexX,
                prexY
            ]
        ];
        if (segment.type !== "Z") {
            prexX = segment.x;
            prexY = segment.y;
        }
        if (segment.type === "C") {
            points.push([
                segment.cp1x,
                segment.cp1y
            ]);
            points.push([
                segment.cp2x,
                segment.cp2y
            ]);
            points.push([
                segment.x,
                segment.y
            ]);
        }
        if (segment.type === "L") {
            points.push([
                segment.x,
                segment.y
            ]);
        }
        if (segment.type === "C" || segment.type === "L") {
            return interpolateUntil(points, threshold, deltaFunction).map((rawSegment)=>createLineSegment(rawSegment));
        }
        return [
            segment
        ];
    }).flat(1);
}
function svgPathInterpolate(path, threshold) {
    let didWork = false;
    const deltaFunction = (points)=>{
        const linearPoints = [
            points[0].slice(0, 2),
            points[points.length - 1].slice(0, 2)
        ];
        const delta = euclideanDistance(linearPoints);
        didWork = didWork || delta > threshold;
        return delta;
    };
    return warpInterpolate(path, threshold, deltaFunction);
}
var warpTransform = (path, transformer)=>{
    return path.map((segment)=>{
        if (segment.type === "L") {
            const { x, y } = transformer({
                x: segment.x,
                y: segment.y
            });
            return [
                {
                    type: "L",
                    x,
                    y
                }
            ];
        }
        if (segment.type === "C") {
            const { x, y } = transformer({
                x: segment.x,
                y: segment.y
            });
            const { x: cp1x, y: cp1y } = transformer({
                x: segment.cp1x,
                y: segment.cp1y
            });
            const { x: cp2x, y: cp2y } = transformer({
                x: segment.cp2x,
                y: segment.cp2y
            });
            return [
                {
                    type: "C",
                    x,
                    y,
                    cp1x,
                    cp1y,
                    cp2x,
                    cp2y
                }
            ];
        }
        if (segment.type === "M") {
            const { x, y } = transformer({
                x: segment.x,
                y: segment.y
            });
            return [
                {
                    type: "M",
                    x,
                    y
                }
            ];
        }
        return [
            segment
        ];
    }).flat(1);
};
var fixZInstruction = (instructions)=>{
    let prevX = 0;
    let prevY = 0;
    return instructions.map((instruction)=>{
        if (instruction.type === "Z") {
            return [
                {
                    type: "L",
                    x: prevX,
                    y: prevY
                },
                {
                    type: "Z"
                }
            ];
        }
        if (instruction.type === "M") {
            prevX = instruction.x;
            prevY = instruction.y;
        }
        return [
            instruction
        ];
    }).flat(1);
};
// src/warp-path/index.ts
var getDefaultInterpolationThreshold = (instructions)=>{
    const boundingBox = getBoundingBoxFromInstructions(instructions);
    const longer = Math.max(boundingBox.y2 - boundingBox.y1, boundingBox.x2 - boundingBox.x1);
    return longer * 0.01;
};
var warpPath = (path, transformer, options)=>{
    const reduced = reduceInstructions(parsePath(path));
    const withZFix = fixZInstruction(reduced);
    const interpolated = svgPathInterpolate(withZFix, options?.interpolationThreshold ?? getDefaultInterpolationThreshold(withZFix));
    return serializeInstructions(warpTransform(interpolated, transformer));
};
// src/index.ts
var PathInternals = {
    getBoundingBoxFromInstructions,
    debugPath,
    cutPath
};
;
}),
"[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NextLogo",
    ()=>NextLogo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/paths/dist/esm/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
const mask = {
    maskType: "alpha"
};
const nStroke = "M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z";
const NextLogo = ({ outProgress })=>{
    const { fps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useVideoConfig"])();
    const frame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrentFrame"])();
    const evolve1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["spring"])({
        fps,
        frame,
        config: {
            damping: 200
        }
    });
    const evolve2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["spring"])({
        fps,
        frame: frame - 15,
        config: {
            damping: 200
        }
    });
    const evolve3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["spring"])({
        fps,
        frame: frame - 30,
        config: {
            damping: 200,
            mass: 3
        },
        durationInFrames: 30
    });
    const style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            height: 140,
            borderRadius: 70,
            scale: String(1 - outProgress)
        };
    }, [
        outProgress
    ]);
    const firstPath = `M 60.0568 54 v 71.97`;
    const secondPath = `M 63.47956 56.17496 L 144.7535 161.1825`;
    const thirdPath = `M 121 54 L 121 126`;
    const evolution1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evolvePath"])(evolve1, firstPath);
    const evolution2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evolvePath"])(evolve2, secondPath);
    const evolution3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evolvePath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(evolve3, [
        0,
        1
    ], [
        0,
        0.7
    ]), thirdPath);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        style: style,
        fill: "none",
        viewBox: "0 0 180 180",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mask", {
                height: "180",
                id: "mask",
                style: mask,
                width: "180",
                x: "0",
                y: "0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "90",
                    cy: "90",
                    fill: "black",
                    r: "90"
                }, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mask", {
                id: "n-mask",
                style: mask,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: nStroke,
                    fill: "black"
                }, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                mask: "url(#mask)",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "90",
                        cy: "90",
                        fill: "black",
                        r: "90"
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        stroke: "url(#gradient0)",
                        mask: "url(#n-mask)",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeWidth: "12.1136",
                                d: firstPath,
                                strokeDasharray: evolution1.strokeDasharray,
                                strokeDashoffset: evolution1.strokeDashoffset
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeWidth: 12.1136,
                                d: secondPath,
                                strokeDasharray: evolution2.strokeDasharray,
                                strokeDashoffset: evolution2.strokeDashoffset
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        stroke: "url(#gradient1)",
                        d: thirdPath,
                        strokeDasharray: evolution3.strokeDasharray,
                        strokeDashoffset: evolution3.strokeDashoffset,
                        strokeWidth: "12"
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                        gradientUnits: "userSpaceOnUse",
                        id: "gradient0",
                        x1: "109",
                        x2: "144.5",
                        y1: "116.5",
                        y2: "160.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                stopColor: "white"
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                offset: "1",
                                stopColor: "white",
                                stopOpacity: "0"
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                        gradientUnits: "userSpaceOnUse",
                        id: "gradient1",
                        x1: "121",
                        x2: "120.799",
                        y1: "54",
                        y2: "106.875",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                stopColor: "white"
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                offset: "1",
                                stopColor: "white",
                                stopOpacity: "0"
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/google-fonts/dist/esm/Inter.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/base.ts
__turbopack_context__.s([
    "fontFamily",
    ()=>fontFamily,
    "getInfo",
    ()=>getInfo,
    "loadFont",
    ()=>loadFont
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/no-react.mjs [app-ssr] (ecmascript)");
;
;
var loadedFonts = {};
var withResolvers = function() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve,
        reject
    };
};
var loadFontFaceOrTimeoutAfter20Seconds = (fontFace)=>{
    const timeout = withResolvers();
    const int = setTimeout(()=>{
        timeout.reject(new Error("Timed out loading Google Font"));
    }, 18000);
    return Promise.race([
        fontFace.load().then(()=>{
            clearTimeout(int);
        }),
        timeout.promise
    ]);
};
var loadFonts = (meta, style, options)=>{
    const weightsAndSubsetsAreSpecified = Array.isArray(options?.weights) && Array.isArray(options?.subsets) && options.weights.length > 0 && options.subsets.length > 0;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NoReactInternals"].ENABLE_V5_BREAKING_CHANGES && !weightsAndSubsetsAreSpecified) {
        throw new Error("Loading Google Fonts without specifying weights and subsets is not supported in Remotion v5. Please specify the weights and subsets you need.");
    }
    const promises = [];
    const styles = style ? [
        style
    ] : Object.keys(meta.fonts);
    let fontsLoaded = 0;
    for (const style2 of styles){
        if (typeof FontFace === "undefined") {
            continue;
        }
        if (!meta.fonts[style2]) {
            throw new Error(`The font ${meta.fontFamily} does not have a style ${style2}`);
        }
        const weights = options?.weights ?? Object.keys(meta.fonts[style2]);
        for (const weight of weights){
            if (!meta.fonts[style2][weight]) {
                throw new Error(`The font ${meta.fontFamily} does not  have a weight ${weight} in style ${style2}`);
            }
            const subsets = options?.subsets ?? Object.keys(meta.fonts[style2][weight]);
            for (const subset of subsets){
                let font = meta.fonts[style2]?.[weight]?.[subset];
                if (!font) {
                    throw new Error(`weight: ${weight} subset: ${subset} is not available for '${meta.fontFamily}'`);
                }
                let fontKey = `${meta.fontFamily}-${style2}-${weight}-${subset}`;
                const previousPromise = loadedFonts[fontKey];
                if (previousPromise) {
                    promises.push(previousPromise);
                    continue;
                }
                const baseLabel = `Fetching ${meta.fontFamily} font ${JSON.stringify({
                    style: style2,
                    weight,
                    subset
                })}`;
                const label = weightsAndSubsetsAreSpecified ? baseLabel : `${baseLabel}. This might be caused by loading too many font variations. Read more: https://www.remotion.dev/docs/troubleshooting/font-loading-errors#render-timeout-when-loading-google-fonts`;
                const handle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["delayRender"])(label, {
                    timeoutInMilliseconds: 60000
                });
                fontsLoaded++;
                const fontFace = new FontFace(meta.fontFamily, `url(${font}) format('woff2')`, {
                    weight,
                    style: style2,
                    unicodeRange: meta.unicodeRanges[subset]
                });
                let attempts = 2;
                const tryToLoad = ()=>{
                    if (fontFace.status === "loaded") {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["continueRender"])(handle);
                        return;
                    }
                    const promise = loadFontFaceOrTimeoutAfter20Seconds(fontFace).then(()=>{
                        (options?.document ?? document).fonts.add(fontFace);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["continueRender"])(handle);
                    }).catch((err)=>{
                        loadedFonts[fontKey] = undefined;
                        if (attempts === 0) {
                            throw err;
                        } else {
                            attempts--;
                            tryToLoad();
                        }
                    });
                    loadedFonts[fontKey] = promise;
                    promises.push(promise);
                };
                tryToLoad();
            }
        }
        if (fontsLoaded > 20) {
            console.warn(`Made ${fontsLoaded} network requests to load fonts for ${meta.fontFamily}. Consider loading fewer weights and subsets by passing options to loadFont(). Disable this warning by passing "ignoreTooManyRequestsWarning: true" to "options".`);
        }
    }
    return {
        fontFamily: meta.fontFamily,
        fonts: meta.fonts,
        unicodeRanges: meta.unicodeRanges,
        waitUntilDone: ()=>Promise.all(promises).then(()=>{
                return;
            })
    };
};
// src/Inter.ts
var getInfo = ()=>({
        fontFamily: "Inter",
        importName: "Inter",
        version: "v20",
        url: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900",
        unicodeRanges: {
            "cyrillic-ext": "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
            cyrillic: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
            "greek-ext": "U+1F00-1FFF",
            greek: "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF",
            vietnamese: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
            "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
            latin: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
        },
        fonts: {
            italic: {
                "100": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "200": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "300": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "400": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "500": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "600": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "700": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "800": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "900": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                }
            },
            normal: {
                "100": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "200": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "300": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "400": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "500": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "600": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "700": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "800": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "900": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                }
            }
        },
        subsets: [
            "cyrillic",
            "cyrillic-ext",
            "greek",
            "greek-ext",
            "latin",
            "latin-ext",
            "vietnamese"
        ]
    });
var fontFamily = "Inter";
var loadFont = (style, options)=>{
    return loadFonts(getInfo(), style, options);
};
;
}),
"[project]/packages/template-next-app/src/remotion/MyComp/Rings.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Rings",
    ()=>Rings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)");
;
;
const RadialGradient = ({ radius, color })=>{
    const height = radius * 2;
    const width = radius * 2;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbsoluteFill"], {
        style: {
            justifyContent: "center",
            alignItems: "center"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                height,
                width,
                borderRadius: "50%",
                backgroundColor: color,
                position: "absolute",
                // eslint-disable-next-line @remotion/slow-css-property
                boxShadow: "0 0 100px rgba(0, 0, 0, 0.05)"
            }
        }, void 0, false, {
            fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Rings.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Rings.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const Rings = ({ outProgress })=>{
    const scale = 1 / (1 - outProgress);
    const { height } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useVideoConfig"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbsoluteFill"], {
        style: {
            transform: `scale(${scale})`
        },
        children: new Array(5).fill(true).map((_, i)=>{
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RadialGradient, {
                radius: height * 0.3 * i,
                color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolateColors"])(i, [
                    0,
                    4
                ], [
                    "#fff",
                    "#fff"
                ])
            }, i, false, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Rings.tsx",
                lineNumber: 49,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
        }).reverse()
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Rings.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/remotion/MyComp/TextFade.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextFade",
    ()=>TextFade
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)");
;
;
;
const outer = {};
const TextFade = ({ children })=>{
    const { fps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useVideoConfig"])();
    const frame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrentFrame"])();
    const progress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["spring"])({
        fps,
        frame,
        config: {
            damping: 200
        },
        durationInFrames: 80
    });
    const rightStop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(progress, [
        0,
        1
    ], [
        200,
        0
    ]);
    const leftStop = Math.max(0, rightStop - 60);
    const maskImage = `linear-gradient(-45deg, transparent ${leftStop}%, black ${rightStop}%)`;
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            justifyContent: "center",
            alignItems: "center"
        };
    }, []);
    const content = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            maskImage,
            WebkitMaskImage: maskImage
        };
    }, [
        maskImage
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbsoluteFill"], {
        style: outer,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbsoluteFill"], {
            style: container,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: content,
                children: children
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/TextFade.tsx",
                lineNumber: 50,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/packages/template-next-app/src/remotion/MyComp/TextFade.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/TextFade.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Main",
    ()=>Main
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$NextLogo$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/remotion/MyComp/NextLogo.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$google$2d$fonts$2f$dist$2f$esm$2f$Inter$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/google-fonts/dist/esm/Inter.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$Rings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/remotion/MyComp/Rings.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$TextFade$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/remotion/MyComp/TextFade.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$google$2d$fonts$2f$dist$2f$esm$2f$Inter$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadFont"])("normal", {
    subsets: [
        "latin"
    ],
    weights: [
        "400",
        "700"
    ]
});
const container = {
    backgroundColor: "white"
};
const logo = {
    justifyContent: "center",
    alignItems: "center"
};
const Main = ({ title })=>{
    const frame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrentFrame"])();
    const { fps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useVideoConfig"])();
    const transitionStart = 2 * fps;
    const transitionDuration = 1 * fps;
    const logoOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["spring"])({
        fps,
        frame,
        config: {
            damping: 200
        },
        durationInFrames: transitionDuration,
        delay: transitionStart
    });
    const titleStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$google$2d$fonts$2f$dist$2f$esm$2f$Inter$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fontFamily"],
            fontSize: 70
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbsoluteFill"], {
        style: container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Sequence"], {
                durationInFrames: transitionStart + transitionDuration,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$Rings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Rings"], {
                        outProgress: logoOut
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbsoluteFill"], {
                        style: logo,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$NextLogo$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NextLogo"], {
                            outProgress: logoOut
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Sequence"], {
                from: transitionStart + transitionDuration / 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$TextFade$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextFade"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: titleStyle,
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/types/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMP_NAME",
    ()=>COMP_NAME,
    "CompositionProps",
    ()=>CompositionProps,
    "DURATION_IN_FRAMES",
    ()=>DURATION_IN_FRAMES,
    "VIDEO_FPS",
    ()=>VIDEO_FPS,
    "VIDEO_HEIGHT",
    ()=>VIDEO_HEIGHT,
    "VIDEO_WIDTH",
    ()=>VIDEO_WIDTH,
    "defaultMyCompProps",
    ()=>defaultMyCompProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$zod$40$3$2e$22$2e$3$2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/zod@3.22.3/node_modules/zod/lib/index.mjs [app-ssr] (ecmascript)");
;
const COMP_NAME = "MyComp";
const CompositionProps = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$zod$40$3$2e$22$2e$3$2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$zod$40$3$2e$22$2e$3$2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["z"].string()
});
const defaultMyCompProps = {
    title: "Next.js and Remotion"
};
const DURATION_IN_FRAMES = 200;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const VIDEO_FPS = 30;
}),
"[project]/packages/template-next-app/src/lambda/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getProgress",
    ()=>getProgress,
    "renderVideo",
    ()=>renderVideo
]);
const makeRequest = async (endpoint, body)=>{
    const result = await fetch(endpoint, {
        method: "post",
        body: JSON.stringify(body),
        headers: {
            "content-type": "application/json"
        }
    });
    const json = await result.json();
    if (json.type === "error") {
        throw new Error(json.message);
    }
    return json.data;
};
const renderVideo = async ({ id, inputProps })=>{
    const body = {
        id,
        inputProps
    };
    return makeRequest("/api/lambda/render", body);
};
const getProgress = async ({ id, bucketName })=>{
    const body = {
        id,
        bucketName
    };
    return makeRequest("/api/lambda/progress", body);
};
}),
"[project]/packages/template-next-app/src/helpers/use-rendering.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRendering",
    ()=>useRendering
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$lambda$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/lambda/api.ts [app-ssr] (ecmascript)");
;
;
const wait = async (milliSeconds)=>{
    await new Promise((resolve)=>{
        setTimeout(()=>{
            resolve();
        }, milliSeconds);
    });
};
const useRendering = (id, inputProps)=>{
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        status: "init"
    });
    const renderMedia = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setState({
            status: "invoking"
        });
        try {
            const { renderId, bucketName } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$lambda$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renderVideo"])({
                id,
                inputProps
            });
            setState({
                status: "rendering",
                progress: 0,
                renderId: renderId,
                bucketName: bucketName
            });
            let pending = true;
            while(pending){
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$lambda$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProgress"])({
                    id: renderId,
                    bucketName: bucketName
                });
                switch(result.type){
                    case "error":
                        {
                            setState({
                                status: "error",
                                renderId: renderId,
                                error: new Error(result.message)
                            });
                            pending = false;
                            break;
                        }
                    case "done":
                        {
                            setState({
                                size: result.size,
                                url: result.url,
                                status: "done"
                            });
                            pending = false;
                            break;
                        }
                    case "progress":
                        {
                            setState({
                                status: "rendering",
                                bucketName: bucketName,
                                progress: result.progress,
                                renderId: renderId
                            });
                            await wait(1000);
                        }
                }
            }
        } catch (err) {
            setState({
                status: "error",
                error: err,
                renderId: null
            });
        }
    }, [
        id,
        inputProps
    ]);
    const undo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setState({
            status: "init"
        });
    }, []);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            renderMedia,
            state,
            undo
        };
    }, [
        renderMedia,
        state,
        undo
    ]);
};
}),
"[project]/packages/template-next-app/src/components/AlignEnd.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlignEnd",
    ()=>AlignEnd
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const container = {
    alignSelf: "flex-end"
};
const AlignEnd = ({ children })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: container,
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/AlignEnd.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/Spacing.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Spacing",
    ()=>Spacing
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const Spacing = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: "var(--geist-quarter-pad)",
            width: "var(--geist-quarter-pad)"
        }
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/Spacing.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/shapes/dist/esm/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/utils/make-circle.ts
__turbopack_context__.s([
    "Circle",
    ()=>Circle,
    "Ellipse",
    ()=>Ellipse,
    "Heart",
    ()=>Heart,
    "Pie",
    ()=>Pie,
    "Polygon",
    ()=>Polygon,
    "Rect",
    ()=>Rect,
    "Star",
    ()=>Star,
    "Triangle",
    ()=>Triangle,
    "makeCircle",
    ()=>makeCircle,
    "makeEllipse",
    ()=>makeEllipse,
    "makeHeart",
    ()=>makeHeart,
    "makePie",
    ()=>makePie,
    "makePolygon",
    ()=>makePolygon,
    "makeRect",
    ()=>makeRect,
    "makeStar",
    ()=>makeStar,
    "makeTriangle",
    ()=>makeTriangle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/paths/dist/esm/index.mjs [app-ssr] (ecmascript)");
// src/components/render-svg.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
// src/components/render-svg.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
;
var makeCircle = ({ radius })=>{
    const instructions = [
        {
            type: "M",
            x: radius,
            y: 0
        },
        {
            type: "a",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: true,
            sweepFlag: true,
            dx: 0,
            dy: radius * 2
        },
        {
            type: "a",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: true,
            sweepFlag: true,
            dx: 0,
            dy: -radius * 2
        },
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        height: radius * 2,
        width: radius * 2,
        path,
        instructions,
        transformOrigin: `${radius} ${radius}`
    };
};
;
;
// src/utils/does-react-support-canary.ts
var doesReactSupportTransformOriginProperty = (version)=>{
    if (version.includes("canary") || version.includes("experimental")) {
        const last8Chars = parseInt(version.slice(-8), 10);
        return last8Chars > 20230209;
    }
    const [major] = version.split(".").map(Number);
    return major > 18;
};
;
var RenderSvg = ({ width, height, path, style, pathStyle, transformOrigin, debug, instructions, ...props })=>{
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            overflow: "visible",
            ...style ?? {}
        };
    }, [
        style
    ]);
    const actualPathStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            transformBox: "fill-box",
            ...pathStyle ?? {}
        };
    }, [
        pathStyle
    ]);
    const reactSupportsTransformOrigin = doesReactSupportTransformOriginProperty(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["version"]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])("svg", {
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        xmlns: "http://www.w3.org/2000/svg",
        style: actualStyle,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                ...reactSupportsTransformOrigin ? {
                    transformOrigin
                } : {
                    "transform-origin": transformOrigin
                },
                d: path,
                style: actualPathStyle,
                ...props
            }),
            debug ? instructions.map((i, index)=>{
                if (i.type === "C") {
                    const prevInstruction = index === 0 ? instructions[instructions.length - 1] : instructions[index - 1];
                    if (prevInstruction.type === "V" || prevInstruction.type === "H" || prevInstruction.type === "a" || prevInstruction.type === "Z" || prevInstruction.type === "t" || prevInstruction.type === "q" || prevInstruction.type === "l" || prevInstruction.type === "c" || prevInstruction.type === "m" || prevInstruction.type === "h" || prevInstruction.type === "s" || prevInstruction.type === "v") {
                        return null;
                    }
                    const prevX = prevInstruction.x;
                    const prevY = prevInstruction.y;
                    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                        children: [
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                                d: `M ${prevX} ${prevY} ${i.cp1x} ${i.cp1y}`,
                                strokeWidth: 2,
                                stroke: "rgba(0, 0, 0, 0.4)"
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("path", {
                                d: `M ${i.x} ${i.y} ${i.cp2x} ${i.cp2y}`,
                                strokeWidth: 2,
                                stroke: "rgba(0, 0, 0, 0.4)"
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("circle", {
                                cx: i.cp1x,
                                cy: i.cp1y,
                                r: 3,
                                fill: "white",
                                strokeWidth: 2,
                                stroke: "black"
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("circle", {
                                cx: i.cp2x,
                                cy: i.cp2y,
                                r: 3,
                                strokeWidth: 2,
                                fill: "white",
                                stroke: "black"
                            })
                        ]
                    }, index);
                }
                return null;
            }) : null
        ]
    });
};
;
var Circle = ({ radius, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeCircle({
            radius
        }),
        ...props
    });
};
;
var makeEllipse = ({ rx, ry })=>{
    const instructions = [
        {
            type: "M",
            x: rx,
            y: 0
        },
        {
            type: "a",
            rx,
            ry,
            xAxisRotation: 0,
            largeArcFlag: true,
            sweepFlag: false,
            dx: 1,
            dy: 0
        },
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        width: rx * 2,
        height: ry * 2,
        path,
        instructions,
        transformOrigin: `${rx} ${ry}`
    };
};
;
var Ellipse = ({ rx, ry, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeEllipse({
            rx,
            ry
        }),
        ...props
    });
};
;
var makeHeart = ({ height, aspectRatio = 1.1, bottomRoundnessAdjustment = 0, depthAdjustment = 0 })=>{
    const width = height * aspectRatio;
    const bottomControlPointX = 23 / 110 * width + bottomRoundnessAdjustment * width;
    const bottomControlPointY = 69 / 100 * height;
    const bottomLeftControlPointY = 60 / 100 * height;
    const topLeftControlPoint = 13 / 100 * height;
    const topBezierWidth = 29 / 110 * width;
    const topRightControlPointX = 15 / 110 * width;
    const innerControlPointX = 5 / 110 * width;
    const innerControlPointY = 7 / 100 * height;
    const depth = 17 / 100 * height + depthAdjustment * height;
    const instructions = [
        {
            type: "M",
            x: width / 2,
            y: height
        },
        {
            type: "C",
            cp1x: width / 2 - bottomControlPointX,
            cp1y: bottomControlPointY,
            cp2x: 0,
            cp2y: bottomLeftControlPointY,
            x: 0,
            y: height / 4
        },
        {
            type: "C",
            cp1x: 0,
            cp1y: topLeftControlPoint,
            cp2x: width / 4 - topBezierWidth / 2,
            cp2y: 0,
            x: width / 4,
            y: 0
        },
        {
            type: "C",
            cp1x: width / 4 + topBezierWidth / 2,
            cp1y: 0,
            cp2x: width / 2 - innerControlPointX,
            cp2y: innerControlPointY,
            x: width / 2,
            y: depth
        },
        {
            type: "C",
            cp1x: width / 2 + innerControlPointX,
            cp1y: innerControlPointY,
            cp2x: width / 2 + topRightControlPointX,
            cp2y: 0,
            x: width / 4 * 3,
            y: 0
        },
        {
            type: "C",
            cp1x: width / 4 * 3 + topBezierWidth / 2,
            cp1y: 0,
            cp2x: width,
            cp2y: topLeftControlPoint,
            x: width,
            y: height / 4
        },
        {
            type: "C",
            x: width / 2,
            y: height,
            cp1x: width,
            cp1y: bottomLeftControlPointY,
            cp2x: width / 2 + bottomControlPointX,
            cp2y: bottomControlPointY
        },
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        path,
        width,
        height,
        transformOrigin: `${width / 2} ${height / 2}`,
        instructions
    };
};
;
var Heart = ({ aspectRatio, height, bottomRoundnessAdjustment = 0, depthAdjustment = 0, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeHeart({
            aspectRatio,
            height,
            bottomRoundnessAdjustment,
            depthAdjustment
        }),
        ...props
    });
};
;
var getCoord = ({ counterClockwise, actualProgress, rotation, radius, coord })=>{
    const factor = counterClockwise ? -1 : 1;
    const val = Math[coord === "x" ? "cos" : "sin"](factor * actualProgress * Math.PI * 2 + Math.PI * 1.5 + rotation) * radius + radius;
    const rounded = Math.round(val * 1e5) / 1e5;
    return rounded;
};
var makePie = ({ progress, radius, closePath = true, counterClockwise = false, rotation = 0 })=>{
    const actualProgress = Math.min(Math.max(progress, 0), 1);
    const endAngleX = getCoord({
        actualProgress,
        coord: "x",
        counterClockwise,
        radius,
        rotation
    });
    const endAngleY = getCoord({
        actualProgress,
        coord: "y",
        counterClockwise,
        radius,
        rotation
    });
    const start = {
        x: getCoord({
            actualProgress: 0,
            coord: "x",
            counterClockwise,
            radius,
            rotation
        }),
        y: getCoord({
            actualProgress: 0,
            coord: "y",
            counterClockwise,
            radius,
            rotation
        })
    };
    const end = {
        x: endAngleX,
        y: endAngleY
    };
    const instructions = [
        {
            type: "M",
            ...start
        },
        {
            type: "A",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: false,
            sweepFlag: !counterClockwise,
            x: actualProgress <= 0.5 ? endAngleX : getCoord({
                actualProgress: 0.5,
                coord: "x",
                counterClockwise,
                radius,
                rotation
            }),
            y: actualProgress <= 0.5 ? endAngleY : getCoord({
                actualProgress: 0.5,
                coord: "y",
                counterClockwise,
                radius,
                rotation
            })
        },
        actualProgress > 0.5 ? {
            type: "A",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: false,
            sweepFlag: !counterClockwise,
            ...end
        } : null,
        actualProgress > 0 && actualProgress < 1 && closePath ? {
            type: "L",
            x: radius,
            y: radius
        } : null,
        closePath ? {
            type: "Z"
        } : null
    ].filter(Boolean);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        height: radius * 2,
        width: radius * 2,
        path,
        instructions,
        transformOrigin: `${radius} ${radius}`
    };
};
;
var Pie = ({ radius, progress, closePath, counterClockwise, rotation, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makePie({
            radius,
            progress,
            closePath,
            counterClockwise,
            rotation
        }),
        ...props
    });
};
;
// src/utils/join-points.ts
var shortenVector = (vector, radius)=>{
    const [x, y] = vector;
    const currentLength = Math.sqrt(x * x + y * y);
    const scalingFactor = (currentLength - radius) / currentLength;
    return [
        x * scalingFactor,
        y * scalingFactor
    ];
};
var scaleVectorToLength = (vector, length)=>{
    const [x, y] = vector;
    const currentLength = Math.sqrt(x * x + y * y);
    const scalingFactor = length / currentLength;
    return [
        x * scalingFactor,
        y * scalingFactor
    ];
};
var joinPoints = (points, { edgeRoundness, cornerRadius, roundCornerStrategy })=>{
    return points.map(([x, y], i)=>{
        const prevPointIndex = i === 0 ? points.length - 2 : i - 1;
        const prevPoint = points[prevPointIndex];
        const nextPointIndex = i === points.length - 1 ? 1 : i + 1;
        const nextPoint = points[nextPointIndex];
        const middleOfLine = [
            (x + nextPoint[0]) / 2,
            (y + nextPoint[1]) / 2
        ];
        const prevPointMiddleOfLine = [
            (x + prevPoint[0]) / 2,
            (y + prevPoint[1]) / 2
        ];
        const prevVector = [
            x - prevPoint[0],
            y - prevPoint[1]
        ];
        const nextVector = [
            nextPoint[0] - x,
            nextPoint[1] - y
        ];
        if (i === 0) {
            if (edgeRoundness !== null) {
                return [
                    {
                        type: "M",
                        x: middleOfLine[0],
                        y: middleOfLine[1]
                    }
                ];
            }
            if (cornerRadius !== 0) {
                const computeRadius = shortenVector(nextVector, cornerRadius);
                return [
                    {
                        type: "M",
                        x: computeRadius[0] + x,
                        y: computeRadius[1] + y
                    }
                ];
            }
            return [
                {
                    type: "M",
                    x,
                    y
                }
            ];
        }
        if (cornerRadius && edgeRoundness !== null) {
            throw new Error(`"cornerRadius" and "edgeRoundness" cannot be specified at the same time.`);
        }
        if (edgeRoundness === null) {
            if (cornerRadius === 0) {
                return [
                    {
                        type: "L",
                        x,
                        y
                    }
                ];
            }
            const prevVectorMinusRadius = shortenVector(prevVector, cornerRadius);
            const prevVectorLength = scaleVectorToLength(prevVector, cornerRadius);
            const nextVectorMinusRadius = scaleVectorToLength(nextVector, cornerRadius);
            const firstDraw = [
                prevPoint[0] + prevVectorMinusRadius[0],
                prevPoint[1] + prevVectorMinusRadius[1]
            ];
            return [
                {
                    type: "L",
                    x: firstDraw[0],
                    y: firstDraw[1]
                },
                roundCornerStrategy === "arc" ? {
                    type: "a",
                    rx: cornerRadius,
                    ry: cornerRadius,
                    xAxisRotation: 0,
                    dx: prevVectorLength[0] + nextVectorMinusRadius[0],
                    dy: prevVectorLength[1] + nextVectorMinusRadius[1],
                    largeArcFlag: false,
                    sweepFlag: true
                } : {
                    type: "C",
                    x: firstDraw[0] + prevVectorLength[0] + nextVectorMinusRadius[0],
                    y: firstDraw[1] + prevVectorLength[1] + nextVectorMinusRadius[1],
                    cp1x: x,
                    cp1y: y,
                    cp2x: x,
                    cp2y: y
                }
            ];
        }
        const controlPoint1 = [
            prevPointMiddleOfLine[0] + prevVector[0] * edgeRoundness * 0.5,
            prevPointMiddleOfLine[1] + prevVector[1] * edgeRoundness * 0.5
        ];
        const controlPoint2 = [
            middleOfLine[0] - nextVector[0] * edgeRoundness * 0.5,
            middleOfLine[1] - nextVector[1] * edgeRoundness * 0.5
        ];
        return [
            {
                type: "C",
                cp1x: controlPoint1[0],
                cp1y: controlPoint1[1],
                cp2x: controlPoint2[0],
                cp2y: controlPoint2[1],
                x: middleOfLine[0],
                y: middleOfLine[1]
            }
        ];
    }).flat(1);
};
// src/utils/make-polygon.ts
function polygon({ points, radius, centerX, centerY, cornerRadius, edgeRoundness }) {
    const degreeIncrement = Math.PI * 2 / points;
    const d = new Array(points).fill(0).map((_, i)=>{
        const angle = degreeIncrement * i - Math.PI / 2;
        const point = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
        return [
            point.x,
            point.y
        ];
    });
    return joinPoints([
        ...d,
        d[0]
    ], {
        edgeRoundness,
        cornerRadius,
        roundCornerStrategy: cornerRadius > 0 ? "bezier" : "arc"
    });
}
var makePolygon = ({ points, radius, cornerRadius = 0, edgeRoundness = null })=>{
    if (points < 3) {
        throw new Error(`"points" should be minimum 3, got ${points}`);
    }
    const width = 2 * radius;
    const height = 2 * radius;
    const centerX = width / 2;
    const centerY = height / 2;
    const polygonPathInstructions = polygon({
        points,
        radius,
        centerX,
        centerY,
        cornerRadius,
        edgeRoundness
    });
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reduceInstructions"])(polygonPathInstructions);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resetPath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(reduced));
    const boundingBox = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PathInternals"].getBoundingBoxFromInstructions(reduced);
    return {
        path,
        width: boundingBox.width,
        height: boundingBox.height,
        transformOrigin: `${centerX} ${centerY}`,
        instructions: polygonPathInstructions
    };
};
;
var Polygon = ({ points, radius, cornerRadius, edgeRoundness, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makePolygon({
            points,
            cornerRadius,
            edgeRoundness,
            radius
        }),
        ...props
    });
};
;
var makeRect = ({ width, height, edgeRoundness = null, cornerRadius = 0 })=>{
    const transformOrigin = [
        width / 2,
        height / 2
    ];
    const instructions = [
        ...joinPoints([
            [
                cornerRadius,
                0
            ],
            [
                width,
                0
            ],
            [
                width,
                height
            ],
            [
                0,
                height
            ],
            [
                0,
                0
            ]
        ], {
            edgeRoundness,
            cornerRadius,
            roundCornerStrategy: "arc"
        }),
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        width,
        height,
        instructions,
        path,
        transformOrigin: transformOrigin.join(" ")
    };
};
;
var Rect = ({ width, edgeRoundness, height, cornerRadius, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeRect({
            height,
            width,
            edgeRoundness,
            cornerRadius
        }),
        ...props
    });
};
;
var star = ({ centerX, centerY, points, innerRadius, outerRadius, cornerRadius, edgeRoundness })=>{
    const degreeIncrement = Math.PI * 2 / (points * 2);
    const d = new Array(points * 2).fill(true).map((_p, i)=>{
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = degreeIncrement * i - Math.PI / 2;
        const point = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
        return [
            point.x,
            point.y
        ];
    });
    return [
        ...joinPoints([
            ...d,
            d[0]
        ], {
            edgeRoundness,
            cornerRadius,
            roundCornerStrategy: cornerRadius > 0 ? "bezier" : "arc"
        }),
        {
            type: "Z"
        }
    ];
};
var makeStar = ({ points, innerRadius, outerRadius, cornerRadius = 0, edgeRoundness = null })=>{
    const width = outerRadius * 2;
    const height = outerRadius * 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const starPathInstructions = star({
        centerX,
        centerY,
        points,
        innerRadius,
        outerRadius,
        cornerRadius,
        edgeRoundness
    });
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reduceInstructions"])(starPathInstructions);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resetPath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(reduced));
    const boundingBox = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PathInternals"].getBoundingBoxFromInstructions(reduced);
    return {
        path,
        width: boundingBox.width,
        height: boundingBox.height,
        transformOrigin: `${centerX} ${centerY}`,
        instructions: starPathInstructions
    };
};
;
var Star = ({ innerRadius, outerRadius, points, cornerRadius, edgeRoundness, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeStar({
            innerRadius,
            outerRadius,
            points,
            cornerRadius,
            edgeRoundness
        }),
        ...props
    });
};
;
var makeTriangle = ({ length, direction = "right", edgeRoundness = null, cornerRadius = 0 })=>{
    if (typeof length !== "number") {
        throw new Error(`"length" of a triangle must be a number, got ${JSON.stringify(length)}`);
    }
    const longerDimension = length;
    const shorterSize = Math.sqrt(length ** 2 * 0.75);
    const points = {
        up: [
            [
                longerDimension / 2,
                0
            ],
            [
                0,
                shorterSize
            ],
            [
                longerDimension,
                shorterSize
            ],
            [
                longerDimension / 2,
                0
            ]
        ],
        right: [
            [
                0,
                0
            ],
            [
                0,
                longerDimension
            ],
            [
                shorterSize,
                longerDimension / 2
            ],
            [
                0,
                0
            ]
        ],
        down: [
            [
                0,
                0
            ],
            [
                longerDimension,
                0
            ],
            [
                longerDimension / 2,
                shorterSize
            ],
            [
                0,
                0
            ]
        ],
        left: [
            [
                shorterSize,
                0
            ],
            [
                shorterSize,
                longerDimension
            ],
            [
                0,
                longerDimension / 2
            ],
            [
                shorterSize,
                0
            ]
        ]
    };
    const transformOriginX = {
        left: shorterSize / 3 * 2,
        right: shorterSize / 3,
        up: longerDimension / 2,
        down: longerDimension / 2
    }[direction];
    const transformOriginY = {
        up: shorterSize / 3 * 2,
        down: shorterSize / 3,
        left: longerDimension / 2,
        right: longerDimension / 2
    }[direction];
    const instructions = [
        ...joinPoints(points[direction], {
            edgeRoundness,
            cornerRadius,
            roundCornerStrategy: "bezier"
        }),
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        path,
        instructions,
        width: direction === "up" || direction === "down" ? length : shorterSize,
        height: direction === "up" || direction === "down" ? shorterSize : length,
        transformOrigin: `${transformOriginX} ${transformOriginY}`
    };
};
;
var Triangle = ({ length, direction, edgeRoundness, cornerRadius, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeTriangle({
            length,
            direction,
            edgeRoundness,
            cornerRadius
        }),
        ...props
    });
};
;
}),
"[project]/packages/template-next-app/src/components/Spinner/styles.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "line": "styles-module__cAE03a__line",
  "spinner": "styles-module__cAE03a__spinner",
});
}),
"[project]/packages/template-next-app/src/components/Spinner/Spinner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Spinner",
    ()=>Spinner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shapes$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shapes/dist/esm/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/paths/dist/esm/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spinner$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Spinner/styles.module.css [app-ssr] (css module)");
;
;
;
;
;
const viewBox = 100;
const lines = 12;
const width = viewBox * 0.08;
const { path } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shapes$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["makeRect"])({
    height: viewBox * 0.24,
    width,
    cornerRadius: width / 2
});
const translated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translatePath"])(path, viewBox / 2 - width / 2, viewBox * 0.03);
const Spinner = ({ size })=>{
    const style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            width: size,
            height: size
        };
    }, [
        size
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        style: style,
        viewBox: `0 0 ${viewBox} ${viewBox}`,
        children: new Array(lines).fill(true).map((_, index)=>{
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spinner$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].line,
                style: {
                    rotate: `${index * Math.PI * 2 / lines}rad`,
                    transformOrigin: "center center",
                    animationDelay: `${index * 0.1 - lines * 0.1}s`
                },
                d: translated,
                fill: "var(--foreground)"
            }, index, false, {
                fileName: "[project]/packages/template-next-app/src/components/Spinner/Spinner.tsx",
                lineNumber: 32,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0));
        })
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/Spinner/Spinner.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/Button/styles.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "button": "styles-module__Vs2VwG__button",
  "secondarybutton": "styles-module__Vs2VwG__secondarybutton",
});
}),
"[project]/packages/template-next-app/src/components/Button/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Spacing.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spinner$2f$Spinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Spinner/Spinner.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Button/styles.module.css [app-ssr] (css module)");
;
;
;
;
;
const ButtonForward = ({ onClick, disabled, children, loading, secondary }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].button,
            secondary ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].secondarybutton : undefined
        ].join(" "),
        onClick: onClick,
        disabled: disabled,
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spinner$2f$Spinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spinner"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/Button/Button.tsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/Button/Button.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/components/Button/Button.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(ButtonForward);
}),
"[project]/packages/template-next-app/src/components/Container.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InputContainer",
    ()=>InputContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const inputContainer = {
    border: "1px solid var(--unfocused-border-color)",
    padding: "var(--geist-pad)",
    borderRadius: "var(--geist-border-radius)",
    backgroundColor: "var(--background)",
    display: "flex",
    flexDirection: "column"
};
const InputContainer = ({ children })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: inputContainer,
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/Container.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/DownloadButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DownloadButton",
    ()=>DownloadButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Button/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Spacing.tsx [app-ssr] (ecmascript)");
;
;
;
const light = {
    opacity: 0.6
};
const link = {
    textDecoration: "none"
};
const row = {
    display: "flex",
    flexDirection: "row"
};
const Megabytes = ({ sizeInBytes })=>{
    const megabytes = Intl.NumberFormat("en", {
        notation: "compact",
        style: "unit",
        unit: "byte",
        unitDisplay: "narrow"
    }).format(sizeInBytes);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: light,
        children: megabytes
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
const DownloadButton = ({ state, undo })=>{
    if (state.status === "rendering") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
            disabled: true,
            children: "Download video"
        }, void 0, false, {
            fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
            lineNumber: 36,
            columnNumber: 12
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (state.status !== "done") {
        throw new Error("Download button should not be rendered when not done");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: row,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                secondary: true,
                onClick: undo,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UndoIcon, {}, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                style: link,
                href: state.url,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    children: [
                        "Download video",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Megabytes, {
                            sizeInBytes: state.size
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const UndoIcon = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        height: "1em",
        viewBox: "0 0 512 512",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            fill: "var(--foreground)",
            d: "M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"
        }, void 0, false, {
            fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/DownloadButton.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/Error.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorComp",
    ()=>ErrorComp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const container = {
    color: "var(--geist-error)",
    fontFamily: "var(--geist-font)",
    paddingTop: "var(--geist-half-pad)",
    paddingBottom: "var(--geist-half-pad)"
};
const icon = {
    height: 20,
    verticalAlign: "text-bottom",
    marginRight: 6
};
const ErrorComp = ({ message })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                fill: "none",
                shapeRendering: "geometricPrecision",
                stroke: "currentColor",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                viewBox: "0 0 24 24",
                style: icon,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "12",
                        cy: "12",
                        r: "10",
                        fill: "var(--geist-fill)"
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/Error.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M12 8v4",
                        stroke: "currentColor"
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/Error.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M12 16h.01",
                        stroke: "currentColor"
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/Error.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/packages/template-next-app/src/components/Error.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: "Error:"
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/Error.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            " ",
            message
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/components/Error.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/Input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const textarea = {
    resize: "none",
    lineHeight: 1.7,
    display: "block",
    width: "100%",
    borderRadius: "var(--geist-border-radius)",
    backgroundColor: "var(--background)",
    padding: "var(--geist-half-pad)",
    color: "var(--foreground)",
    fontSize: 14
};
const Input = ({ text, setText, disabled })=>{
    const onChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        setText(e.currentTarget.value);
    }, [
        setText
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        disabled: disabled,
        name: "title",
        style: textarea,
        value: text,
        onChange: onChange
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/Input.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/ProgressBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressBar",
    ()=>ProgressBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const ProgressBar = ({ progress })=>{
    const style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            width: "100%",
            height: 10,
            borderRadius: 5,
            appearance: "none",
            backgroundColor: "var(--unfocused-border-color)",
            marginTop: 10,
            marginBottom: 25
        };
    }, []);
    const fill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            backgroundColor: "var(--foreground)",
            height: 10,
            borderRadius: 5,
            transition: "width 0.1s ease-in-out",
            width: `${progress * 100}%`
        };
    }, [
        progress
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: style,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: fill
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/ProgressBar.tsx",
                lineNumber: 31,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/packages/template-next-app/src/components/ProgressBar.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/ProgressBar.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/RenderControls.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RenderControls",
    ()=>RenderControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$helpers$2f$use$2d$rendering$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/helpers/use-rendering.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/types/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$AlignEnd$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/AlignEnd.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Button/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Container$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Container.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$DownloadButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/DownloadButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Error$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Error.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Spacing.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const RenderControls = ({ text, setText, inputProps })=>{
    const { renderMedia, state, undo } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$helpers$2f$use$2d$rendering$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRendering"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMP_NAME"], inputProps);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Container$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InputContainer"], {
        children: [
            state.status === "init" || state.status === "invoking" || state.status === "error" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                        disabled: state.status === "invoking",
                        setText: setText,
                        text: text
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 31,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$AlignEnd$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlignEnd"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Button$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            disabled: state.status === "invoking",
                            loading: state.status === "invoking",
                            onClick: renderMedia,
                            children: "Render video"
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                            lineNumber: 33,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 32,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    state.status === "error" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Error$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ErrorComp"], {
                        message: state.error.message
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 42,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)) : null
                ]
            }, void 0, true) : null,
            state.status === "rendering" || state.status === "done" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                        progress: state.status === "rendering" ? state.progress : 1
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$AlignEnd$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlignEnd"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$DownloadButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DownloadButton"], {
                            undo: undo,
                            state: state
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                            lineNumber: 53,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true) : null
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/components/RenderControls.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/components/Tips/styles.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "flex": "styles-module__ci6Qta__flex",
  "icon": "styles-module__ci6Qta__icon",
  "item": "styles-module__ci6Qta__item",
  "p": "styles-module__ci6Qta__p",
  "row": "styles-module__ci6Qta__row",
});
}),
"[project]/packages/template-next-app/src/components/Tips/Tips.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tips",
    ()=>Tips
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Tips/styles.module.css [app-ssr] (css module)");
;
;
const titlerow = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start"
};
const titlestyle = {
    marginBottom: "0.75em",
    marginTop: "0.75em",
    color: "var(--foreground)"
};
const a = {
    textDecoration: "none",
    color: "inherit",
    flex: 1
};
const Tip = ({ title, description, href })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
        href: href,
        target: "_blank",
        rel: "noreferrer",
        style: a,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].item,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: titlerow,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            style: titlestyle,
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].flex
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].icon,
                            height: "1em",
                            viewBox: "0 0 448 512",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                fill: "var(--foreground)",
                                d: "M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                            }, void 0, false, {
                                fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                                lineNumber: 35,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].p,
                    children: description
                }, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const Tips = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$styles$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].row,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tip, {
                href: "https://www.remotion.dev/docs/the-fundamentals",
                title: "Learn Remotion",
                description: "Learn how to customize this video written in React."
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tip, {
                href: "https://github.com/remotion-dev/template-next-app-dir",
                title: "See source",
                description: "Visit the GitHub repository for this app."
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tip, {
                href: "https://remotion.dev/discord",
                title: "Join the community",
                description: "Chat with others builders on Discord."
            }, void 0, false, {
                fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/packages/template-next-app/src/components/Tips/Tips.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/packages/template-next-app/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$player$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/player/dist/esm/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$Main$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/remotion/MyComp/Main.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/types/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$RenderControls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/RenderControls.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$Tips$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Tips/Tips.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/template-next-app/src/components/Spacing.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
const container = {
    maxWidth: 768,
    margin: "auto",
    marginBottom: 20
};
const outer = {
    borderRadius: "var(--geist-border-radius)",
    overflow: "hidden",
    boxShadow: "0 0 200px rgba(0, 0, 0, 0.15)",
    marginBottom: 40,
    marginTop: 60
};
const player = {
    width: "100%"
};
const Home = ()=>{
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultMyCompProps"].title);
    const inputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return {
            title: text
        };
    }, [
        text
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "cinematics",
                    style: outer,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$player$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Player"], {
                        component: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$remotion$2f$MyComp$2f$Main$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Main"],
                        inputProps: inputProps,
                        durationInFrames: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DURATION_IN_FRAMES"],
                        fps: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VIDEO_FPS"],
                        compositionHeight: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VIDEO_HEIGHT"],
                        compositionWidth: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$types$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VIDEO_WIDTH"],
                        style: player,
                        controls: true,
                        autoPlay: true,
                        loop: true
                    }, void 0, false, {
                        fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$RenderControls$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RenderControls"], {
                    text: text,
                    setText: setText,
                    inputProps: inputProps
                }, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Spacing$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Spacing"], {}, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$template$2d$next$2d$app$2f$src$2f$components$2f$Tips$2f$Tips$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tips"], {}, void 0, false, {
                    fileName: "[project]/packages/template-next-app/src/app/page.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/packages/template-next-app/src/app/page.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/packages/template-next-app/src/app/page.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Home;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e65e63a8._.js.map