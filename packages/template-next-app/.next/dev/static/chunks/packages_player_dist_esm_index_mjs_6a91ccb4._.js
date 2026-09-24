(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/player/dist/esm/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
// src/calculate-scale.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-client] (ecmascript)");
// src/emitter-context.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
// src/validate.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/no-react.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature(), _s17 = __turbopack_context__.k.signature(), _s18 = __turbopack_context__.k.signature(), _s19 = __turbopack_context__.k.signature(), _s20 = __turbopack_context__.k.signature(), _s21 = __turbopack_context__.k.signature(), _s22 = __turbopack_context__.k.signature(), _s23 = __turbopack_context__.k.signature(), _s24 = __turbopack_context__.k.signature(), _s25 = __turbopack_context__.k.signature(), _s26 = __turbopack_context__.k.signature(), _s27 = __turbopack_context__.k.signature();
"use client";
;
var ICON_SIZE = 25;
var fullscreenIconSize = 16;
var PlayIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        width: ICON_SIZE,
        height: ICON_SIZE,
        viewBox: "0 0 25 25",
        fill: "none",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
            d: "M8 6.375C7.40904 8.17576 7.06921 10.2486 7.01438 12.3871C6.95955 14.5255 7.19163 16.6547 7.6875 18.5625C9.95364 18.2995 12.116 17.6164 14.009 16.5655C15.902 15.5147 17.4755 14.124 18.6088 12.5C17.5158 10.8949 15.9949 9.51103 14.1585 8.45082C12.3222 7.3906 10.2174 6.68116 8 6.375Z",
            fill: "white",
            stroke: "white",
            strokeWidth: "6.25",
            strokeLinejoin: "round"
        })
    });
};
_c = PlayIcon;
var PauseIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("svg", {
        viewBox: "0 0 100 100",
        width: ICON_SIZE,
        height: ICON_SIZE,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("rect", {
                x: "25",
                y: "20",
                width: "20",
                height: "60",
                fill: "#fff",
                ry: "5",
                rx: "5"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("rect", {
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
_c1 = PauseIcon;
var FullscreenIcon = ({ isFullscreen })=>{
    const strokeWidth = 6;
    const viewSize = 32;
    const out = isFullscreen ? 0 : strokeWidth / 2;
    const middleInset = isFullscreen ? strokeWidth * 1.6 : strokeWidth / 2;
    const inset = isFullscreen ? strokeWidth * 1.6 : strokeWidth * 2;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("svg", {
        viewBox: `0 0 ${viewSize} ${viewSize}`,
        height: fullscreenIconSize,
        width: fullscreenIconSize,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${out} ${inset}
				L ${middleInset} ${middleInset}
				L ${inset} ${out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${viewSize - out} ${inset}
				L ${viewSize - middleInset} ${middleInset}
				L ${viewSize - inset} ${out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                d: `
				M ${out} ${viewSize - inset}
				L ${middleInset} ${viewSize - middleInset}
				L ${inset} ${viewSize - out}
				`,
                stroke: "#fff",
                strokeWidth,
                fill: "none"
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
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
_c2 = FullscreenIcon;
var VolumeOffIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        width: ICON_SIZE,
        height: ICON_SIZE,
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
            d: "M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z",
            fill: "#fff"
        })
    });
};
_c3 = VolumeOffIcon;
var VolumeOnIcon = ()=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        width: ICON_SIZE,
        height: ICON_SIZE,
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
            d: "M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z",
            fill: "#fff"
        })
    });
};
_c4 = VolumeOnIcon;
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
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("style", {
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
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("svg", {
                    viewBox: type === "player" ? "0 0 22 22" : "0 0 18 18",
                    style,
                    className,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
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
_c5 = BufferingIndicator;
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
    const scale = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].calculateScale({
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
var PlayerEventEmitterContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(undefined);
var ThumbnailEmitterContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(undefined);
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
    _s();
    const bufferManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!bufferManager) {
        throw new Error("BufferingContextReact not found");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBufferStateEmitter.useEffect": ()=>{
            const clear1 = bufferManager.listenForBuffering({
                "useBufferStateEmitter.useEffect.clear1": ()=>{
                    bufferManager.buffering.current = true;
                    emitter.dispatchWaiting({});
                }
            }["useBufferStateEmitter.useEffect.clear1"]);
            const clear2 = bufferManager.listenForResume({
                "useBufferStateEmitter.useEffect.clear2": ()=>{
                    bufferManager.buffering.current = false;
                    emitter.dispatchResume({});
                }
            }["useBufferStateEmitter.useEffect.clear2"]);
            return ({
                "useBufferStateEmitter.useEffect": ()=>{
                    clear1.remove();
                    clear2.remove();
                }
            })["useBufferStateEmitter.useEffect"];
        }
    }["useBufferStateEmitter.useEffect"], [
        bufferManager,
        emitter
    ]);
};
_s(useBufferStateEmitter, "8emOf7oh9BxAsSojJ28TtTiOTRc=");
;
var PlayerEmitterProvider = ({ children, currentPlaybackRate })=>{
    _s1();
    const [emitter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PlayerEmitterProvider.useState": ()=>new PlayerEmitter
    }["PlayerEmitterProvider.useState"]);
    const bufferManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!bufferManager) {
        throw new Error("BufferingContextReact not found");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerEmitterProvider.useEffect2": ()=>{
            if (currentPlaybackRate) {
                emitter.dispatchRateChange(currentPlaybackRate);
            }
        }
    }["PlayerEmitterProvider.useEffect2"], [
        emitter,
        currentPlaybackRate
    ]);
    useBufferStateEmitter(emitter);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlayerEventEmitterContext.Provider, {
        value: emitter,
        children
    });
};
_s1(PlayerEmitterProvider, "EZyCdxC6nAOSEntrtIk57DLBnGQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        useBufferStateEmitter
    ];
});
_c6 = PlayerEmitterProvider;
;
;
var useFrameImperative = ()=>{
    _s2();
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const frameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(frame);
    frameRef.current = frame;
    const getCurrentFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useFrameImperative.useCallback[getCurrentFrame]": ()=>{
            return frameRef.current;
        }
    }["useFrameImperative.useCallback[getCurrentFrame]"], []);
    return getCurrentFrame;
};
_s2(useFrameImperative, "aWA1fVF0b7GbJBzowoumCw5A1iQ=");
;
var useHoverState = (ref, hideControlsWhenPointerDoesntMove)=>{
    _s3();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useHoverState.useEffect3": ()=>{
            const { current } = ref;
            if (!current) {
                return;
            }
            let hoverTimeout;
            const addHoverTimeout = {
                "useHoverState.useEffect3.addHoverTimeout": ()=>{
                    if (hideControlsWhenPointerDoesntMove) {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = setTimeout({
                            "useHoverState.useEffect3.addHoverTimeout": ()=>{
                                setHovered(false);
                            }
                        }["useHoverState.useEffect3.addHoverTimeout"], hideControlsWhenPointerDoesntMove === true ? 3000 : hideControlsWhenPointerDoesntMove);
                    }
                }
            }["useHoverState.useEffect3.addHoverTimeout"];
            const onHover = {
                "useHoverState.useEffect3.onHover": ()=>{
                    setHovered(true);
                    addHoverTimeout();
                }
            }["useHoverState.useEffect3.onHover"];
            const onLeave = {
                "useHoverState.useEffect3.onLeave": ()=>{
                    setHovered(false);
                    clearTimeout(hoverTimeout);
                }
            }["useHoverState.useEffect3.onLeave"];
            const onMove = {
                "useHoverState.useEffect3.onMove": ()=>{
                    setHovered(true);
                    addHoverTimeout();
                }
            }["useHoverState.useEffect3.onMove"];
            current.addEventListener("mouseenter", onHover);
            current.addEventListener("mouseleave", onLeave);
            current.addEventListener("mousemove", onMove);
            return ({
                "useHoverState.useEffect3": ()=>{
                    current.removeEventListener("mouseenter", onHover);
                    current.removeEventListener("mouseleave", onLeave);
                    current.removeEventListener("mousemove", onMove);
                    clearTimeout(hoverTimeout);
                }
            })["useHoverState.useEffect3"];
        }
    }["useHoverState.useEffect3"], [
        hideControlsWhenPointerDoesntMove,
        ref
    ]);
    return hovered;
};
_s3(useHoverState, "Oc8LEVvXWIrZwAGASXe9s9nUROk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
;
;
;
;
var usePlayer = ()=>{
    _s4();
    const [playing, setPlaying, imperativePlaying] = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.usePlayingState();
    const [hasPlayed, setHasPlayed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const playStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(frame);
    const setFrame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelineSetFrame();
    const setTimelinePosition = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelineSetFrame();
    const audioContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].SharedAudioContext);
    const { audioAndVideoTags } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext);
    const frameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(frame);
    frameRef.current = frame;
    const video = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useVideo();
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const emitter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PlayerEventEmitterContext);
    const lastFrame = (config?.durationInFrames ?? 1) - 1;
    const isLastFrame = frame === lastFrame;
    const isFirstFrame = frame === 0;
    if (!emitter) {
        throw new TypeError("Expected Player event emitter context");
    }
    const bufferingContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!bufferingContext) {
        throw new Error("Missing the buffering context. Most likely you have a Remotion version mismatch.");
    }
    const { buffering } = bufferingContext;
    const seek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[seek]": (newFrame)=>{
            if (video?.id) {
                setTimelinePosition({
                    "usePlayer.useCallback2[seek]": (c)=>({
                            ...c,
                            [video.id]: newFrame
                        })
                }["usePlayer.useCallback2[seek]"]);
            }
            frameRef.current = newFrame;
            emitter.dispatchSeek(newFrame);
        }
    }["usePlayer.useCallback2[seek]"], [
        emitter,
        setTimelinePosition,
        video?.id
    ]);
    const play = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[play]": (e)=>{
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
            audioAndVideoTags.current.forEach({
                "usePlayer.useCallback2[play]": (a)=>a.play("player play() was called and playing audio from a click")
            }["usePlayer.useCallback2[play]"]);
            imperativePlaying.current = true;
            setPlaying(true);
            playStart.current = frameRef.current;
            emitter.dispatchPlay();
        }
    }["usePlayer.useCallback2[play]"], [
        imperativePlaying,
        isLastFrame,
        audioContext,
        setPlaying,
        emitter,
        seek,
        audioAndVideoTags
    ]);
    const pause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[pause]": ()=>{
            if (imperativePlaying.current) {
                imperativePlaying.current = false;
                setPlaying(false);
                emitter.dispatchPause();
                audioContext?.audioContext?.suspend();
            }
        }
    }["usePlayer.useCallback2[pause]"], [
        emitter,
        imperativePlaying,
        setPlaying,
        audioContext
    ]);
    const pauseAndReturnToPlayStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[pauseAndReturnToPlayStart]": ()=>{
            if (imperativePlaying.current) {
                imperativePlaying.current = false;
                frameRef.current = playStart.current;
                if (config) {
                    setTimelinePosition({
                        "usePlayer.useCallback2[pauseAndReturnToPlayStart]": (c)=>({
                                ...c,
                                [config.id]: playStart.current
                            })
                    }["usePlayer.useCallback2[pauseAndReturnToPlayStart]"]);
                    setPlaying(false);
                    emitter.dispatchPause();
                }
            }
        }
    }["usePlayer.useCallback2[pauseAndReturnToPlayStart]"], [
        config,
        emitter,
        imperativePlaying,
        setPlaying,
        setTimelinePosition
    ]);
    const videoId = video?.id;
    const frameBack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[frameBack]": (frames)=>{
            if (!videoId) {
                return null;
            }
            if (imperativePlaying.current) {
                return;
            }
            setFrame({
                "usePlayer.useCallback2[frameBack]": (c)=>{
                    const prevFrame = c[videoId] ?? window.remotion_initialFrame ?? 0;
                    const newFrame = Math.max(0, prevFrame - frames);
                    if (prevFrame === newFrame) {
                        return c;
                    }
                    return {
                        ...c,
                        [videoId]: newFrame
                    };
                }
            }["usePlayer.useCallback2[frameBack]"]);
        }
    }["usePlayer.useCallback2[frameBack]"], [
        imperativePlaying,
        setFrame,
        videoId
    ]);
    const frameForward = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[frameForward]": (frames)=>{
            if (!videoId) {
                return null;
            }
            if (imperativePlaying.current) {
                return;
            }
            setFrame({
                "usePlayer.useCallback2[frameForward]": (c)=>{
                    const prevFrame = c[videoId] ?? window.remotion_initialFrame ?? 0;
                    const newFrame = Math.min(lastFrame, prevFrame + frames);
                    if (prevFrame === newFrame) {
                        return c;
                    }
                    return {
                        ...c,
                        [videoId]: newFrame
                    };
                }
            }["usePlayer.useCallback2[frameForward]"]);
        }
    }["usePlayer.useCallback2[frameForward]"], [
        videoId,
        imperativePlaying,
        lastFrame,
        setFrame
    ]);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePlayer.useCallback2[toggle]": (e)=>{
            if (imperativePlaying.current) {
                pause();
            } else {
                play(e);
            }
        }
    }["usePlayer.useCallback2[toggle]"], [
        imperativePlaying,
        pause,
        play
    ]);
    const returnValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "usePlayer.useMemo[returnValue]": ()=>{
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
                getCurrentFrame: ({
                    "usePlayer.useMemo[returnValue]": ()=>frameRef.current
                })["usePlayer.useMemo[returnValue]"],
                isPlaying: ({
                    "usePlayer.useMemo[returnValue]": ()=>imperativePlaying.current
                })["usePlayer.useMemo[returnValue]"],
                isBuffering: ({
                    "usePlayer.useMemo[returnValue]": ()=>buffering.current
                })["usePlayer.useMemo[returnValue]"],
                pauseAndReturnToPlayStart,
                hasPlayed,
                toggle
            };
        }
    }["usePlayer.useMemo[returnValue]"], [
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
_s4(usePlayer, "KAIob1zQ/9Cjnv82zZXpJoQA3/M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useVideo,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
// src/browser-mediasession.ts
var useBrowserMediaSession = ({ browserMediaControlsBehavior, videoConfig, playbackRate })=>{
    _s5();
    const { playing, pause, play, emitter, getCurrentFrame, seek } = usePlayer();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBrowserMediaSession.useEffect4": ()=>{
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
        }
    }["useBrowserMediaSession.useEffect4"], [
        browserMediaControlsBehavior.mode,
        playing
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBrowserMediaSession.useEffect4": ()=>{
            if (!navigator.mediaSession) {
                return;
            }
            if (browserMediaControlsBehavior.mode === "do-nothing") {
                return;
            }
            const onTimeUpdate = {
                "useBrowserMediaSession.useEffect4.onTimeUpdate": ()=>{
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
                }
            }["useBrowserMediaSession.useEffect4.onTimeUpdate"];
            emitter.addEventListener("timeupdate", onTimeUpdate);
            return ({
                "useBrowserMediaSession.useEffect4": ()=>{
                    emitter.removeEventListener("timeupdate", onTimeUpdate);
                }
            })["useBrowserMediaSession.useEffect4"];
        }
    }["useBrowserMediaSession.useEffect4"], [
        browserMediaControlsBehavior.mode,
        emitter,
        getCurrentFrame,
        playbackRate,
        videoConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBrowserMediaSession.useEffect4": ()=>{
            if (!navigator.mediaSession) {
                return;
            }
            if (browserMediaControlsBehavior.mode === "do-nothing") {
                return;
            }
            navigator.mediaSession.setActionHandler("play", {
                "useBrowserMediaSession.useEffect4": ()=>{
                    if (browserMediaControlsBehavior.mode === "register-media-session") {
                        play();
                    }
                }
            }["useBrowserMediaSession.useEffect4"]);
            navigator.mediaSession.setActionHandler("pause", {
                "useBrowserMediaSession.useEffect4": ()=>{
                    if (browserMediaControlsBehavior.mode === "register-media-session") {
                        pause();
                    }
                }
            }["useBrowserMediaSession.useEffect4"]);
            navigator.mediaSession.setActionHandler("seekto", {
                "useBrowserMediaSession.useEffect4": (event)=>{
                    if (browserMediaControlsBehavior.mode === "register-media-session" && event.seekTime !== undefined && videoConfig) {
                        seek(Math.round(event.seekTime * videoConfig.fps));
                    }
                }
            }["useBrowserMediaSession.useEffect4"]);
            navigator.mediaSession.setActionHandler("seekbackward", {
                "useBrowserMediaSession.useEffect4": ()=>{
                    if (browserMediaControlsBehavior.mode === "register-media-session" && videoConfig) {
                        seek(Math.max(0, Math.round((getCurrentFrame() - 10) * videoConfig.fps)));
                    }
                }
            }["useBrowserMediaSession.useEffect4"]);
            navigator.mediaSession.setActionHandler("seekforward", {
                "useBrowserMediaSession.useEffect4": ()=>{
                    if (browserMediaControlsBehavior.mode === "register-media-session" && videoConfig) {
                        seek(Math.max(videoConfig.durationInFrames - 1, Math.round((getCurrentFrame() + 10) * videoConfig.fps)));
                    }
                }
            }["useBrowserMediaSession.useEffect4"]);
            navigator.mediaSession.setActionHandler("previoustrack", {
                "useBrowserMediaSession.useEffect4": ()=>{
                    if (browserMediaControlsBehavior.mode === "register-media-session") {
                        seek(0);
                    }
                }
            }["useBrowserMediaSession.useEffect4"]);
            return ({
                "useBrowserMediaSession.useEffect4": ()=>{
                    navigator.mediaSession.metadata = null;
                    navigator.mediaSession.setActionHandler("play", null);
                    navigator.mediaSession.setActionHandler("pause", null);
                    navigator.mediaSession.setActionHandler("seekto", null);
                    navigator.mediaSession.setActionHandler("seekbackward", null);
                    navigator.mediaSession.setActionHandler("seekforward", null);
                    navigator.mediaSession.setActionHandler("previoustrack", null);
                }
            })["useBrowserMediaSession.useEffect4"];
        }
    }["useBrowserMediaSession.useEffect4"], [
        browserMediaControlsBehavior.mode,
        getCurrentFrame,
        pause,
        play,
        seek,
        videoConfig
    ]);
};
_s5(useBrowserMediaSession, "utYZzAafjY7pQjvwBPI2GYB38to=", false, function() {
    return [
        usePlayer,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
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
    _s6();
    const isBackgrounded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(getIsBackgrounded());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIsBackgrounded.useEffect5": ()=>{
            const onVisibilityChange = {
                "useIsBackgrounded.useEffect5.onVisibilityChange": ()=>{
                    isBackgrounded.current = getIsBackgrounded();
                }
            }["useIsBackgrounded.useEffect5.onVisibilityChange"];
            document.addEventListener("visibilitychange", onVisibilityChange);
            return ({
                "useIsBackgrounded.useEffect5": ()=>{
                    document.removeEventListener("visibilitychange", onVisibilityChange);
                }
            })["useIsBackgrounded.useEffect5"];
        }
    }["useIsBackgrounded.useEffect5"], []);
    return isBackgrounded;
};
_s6(useIsBackgrounded, "91kOALBfyAEGjb8lbGX7ykAYa0E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
// src/use-playback.ts
var usePlayback = ({ loop, playbackRate, moveToBeginningWhenEnded, inFrame, outFrame, browserMediaControlsBehavior, getCurrentFrame })=>{
    _s7();
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const { playing, pause, emitter } = usePlayer();
    const setFrame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelineSetFrame();
    const isBackgroundedRef = useIsBackgrounded();
    const lastTimeUpdateEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].BufferingContextReact);
    if (!context) {
        throw new Error("Missing the buffering context. Most likely you have a Remotion version mismatch.");
    }
    useBrowserMediaSession({
        browserMediaControlsBehavior,
        playbackRate,
        videoConfig: config
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePlayback.useEffect6": ()=>{
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
            const cancelQueuedFrame = {
                "usePlayback.useEffect6.cancelQueuedFrame": ()=>{
                    if (reqAnimFrameCall !== null) {
                        if (reqAnimFrameCall.type === "raf") {
                            cancelAnimationFrame(reqAnimFrameCall.id);
                        } else {
                            clearTimeout(reqAnimFrameCall.id);
                        }
                    }
                }
            }["usePlayback.useEffect6.cancelQueuedFrame"];
            const stop = {
                "usePlayback.useEffect6.stop": ()=>{
                    hasBeenStopped = true;
                    cancelQueuedFrame();
                }
            }["usePlayback.useEffect6.stop"];
            const callback = {
                "usePlayback.useEffect6.callback": ()=>{
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
                        setFrame({
                            "usePlayback.useEffect6.callback": (c)=>({
                                    ...c,
                                    [config.id]: nextFrame
                                })
                        }["usePlayback.useEffect6.callback"]);
                    }
                    if (hasEnded) {
                        stop();
                        pause();
                        emitter.dispatchEnded();
                        return;
                    }
                    queueNextFrame();
                }
            }["usePlayback.useEffect6.callback"];
            const queueNextFrame = {
                "usePlayback.useEffect6.queueNextFrame": ()=>{
                    if (context.buffering.current) {
                        const stopListening = context.listenForResume({
                            "usePlayback.useEffect6.queueNextFrame.stopListening": ()=>{
                                stopListening.remove();
                                startedTime = performance.now();
                                framesAdvanced = 0;
                                queueNextFrame();
                            }
                        }["usePlayback.useEffect6.queueNextFrame.stopListening"]);
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
                }
            }["usePlayback.useEffect6.queueNextFrame"];
            queueNextFrame();
            const onVisibilityChange = {
                "usePlayback.useEffect6.onVisibilityChange": ()=>{
                    if (document.visibilityState === "visible") {
                        return;
                    }
                    cancelQueuedFrame();
                    callback();
                }
            }["usePlayback.useEffect6.onVisibilityChange"];
            window.addEventListener("visibilitychange", onVisibilityChange);
            return ({
                "usePlayback.useEffect6": ()=>{
                    window.removeEventListener("visibilitychange", onVisibilityChange);
                    stop();
                }
            })["usePlayback.useEffect6"];
        }
    }["usePlayback.useEffect6"], [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePlayback.useEffect6": ()=>{
            const interval = setInterval({
                "usePlayback.useEffect6.interval": ()=>{
                    if (lastTimeUpdateEvent.current === getCurrentFrame()) {
                        return;
                    }
                    emitter.dispatchTimeUpdate({
                        frame: getCurrentFrame()
                    });
                    lastTimeUpdateEvent.current = getCurrentFrame();
                }
            }["usePlayback.useEffect6.interval"], 250);
            return ({
                "usePlayback.useEffect6": ()=>clearInterval(interval)
            })["usePlayback.useEffect6"];
        }
    }["usePlayback.useEffect6"], [
        emitter,
        getCurrentFrame
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePlayback.useEffect6": ()=>{
            emitter.dispatchFrameUpdate({
                frame
            });
        }
    }["usePlayback.useEffect6"], [
        emitter,
        frame
    ]);
};
_s7(usePlayback, "564XIGtKVJsnYIDyNGBfCagC4Hg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig,
        usePlayer,
        useIsBackgrounded,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        useBrowserMediaSession,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
;
var elementSizeHooks = [];
var updateAllElementsSizes = ()=>{
    for (const listener of elementSizeHooks){
        listener();
    }
};
var useElementSize = (ref, options)=>{
    _s8();
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useElementSize.useState4": ()=>{
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
        }
    }["useElementSize.useState4"]);
    const observer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useElementSize.useMemo2[observer]": ()=>{
            if (typeof ResizeObserver === "undefined") {
                return null;
            }
            return new ResizeObserver({
                "useElementSize.useMemo2[observer]": (entries)=>{
                    const { contentRect, target } = entries[0];
                    const newSize = target.getClientRects();
                    if (!newSize?.[0]) {
                        setSize(null);
                        return;
                    }
                    const probableCssParentScale = contentRect.width === 0 ? 1 : newSize[0].width / contentRect.width;
                    const width = options.shouldApplyCssTransforms || probableCssParentScale === 0 ? newSize[0].width : newSize[0].width * (1 / probableCssParentScale);
                    const height = options.shouldApplyCssTransforms || probableCssParentScale === 0 ? newSize[0].height : newSize[0].height * (1 / probableCssParentScale);
                    setSize({
                        "useElementSize.useMemo2[observer]": (prevState)=>{
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
                        }
                    }["useElementSize.useMemo2[observer]"]);
                }
            }["useElementSize.useMemo2[observer]"]);
        }
    }["useElementSize.useMemo2[observer]"], [
        options.shouldApplyCssTransforms
    ]);
    const updateSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useElementSize.useCallback3[updateSize]": ()=>{
            if (!ref.current) {
                return;
            }
            const rect = ref.current.getClientRects();
            if (!rect[0]) {
                setSize(null);
                return;
            }
            setSize({
                "useElementSize.useCallback3[updateSize]": (prevState)=>{
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
                }
            }["useElementSize.useCallback3[updateSize]"]);
        }
    }["useElementSize.useCallback3[updateSize]"], [
        ref
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useElementSize.useEffect7": ()=>{
            if (!observer) {
                return;
            }
            const { current } = ref;
            if (current) {
                observer.observe(current);
            }
            return ({
                "useElementSize.useEffect7": ()=>{
                    if (current) {
                        observer.unobserve(current);
                    }
                }
            })["useElementSize.useEffect7"];
        }
    }["useElementSize.useEffect7"], [
        observer,
        ref,
        updateSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useElementSize.useEffect7": ()=>{
            if (!options.triggerOnWindowResize) {
                return;
            }
            window.addEventListener("resize", updateSize);
            return ({
                "useElementSize.useEffect7": ()=>{
                    window.removeEventListener("resize", updateSize);
                }
            })["useElementSize.useEffect7"];
        }
    }["useElementSize.useEffect7"], [
        options.triggerOnWindowResize,
        updateSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useElementSize.useEffect7": ()=>{
            elementSizeHooks.push(updateSize);
            return ({
                "useElementSize.useEffect7": ()=>{
                    elementSizeHooks = elementSizeHooks.filter({
                        "useElementSize.useEffect7": (e)=>e !== updateSize
                    }["useElementSize.useEffect7"]);
                }
            })["useElementSize.useEffect7"];
        }
    }["useElementSize.useEffect7"], [
        updateSize
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useElementSize.useMemo2": ()=>{
            if (!size) {
                return null;
            }
            return {
                ...size,
                refresh: updateSize
            };
        }
    }["useElementSize.useMemo2"], [
        size,
        updateSize
    ]);
};
_s8(useElementSize, "K2XVzQ82NZ18pNrHlWIDMyFnlQc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
;
;
;
;
;
;
var DefaultPlayPauseButton = ({ playing, buffering })=>{
    if (playing && buffering) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(BufferingIndicator, {
            type: "player"
        });
    }
    if (playing) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PauseIcon, {});
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlayIcon, {});
};
_c7 = DefaultPlayPauseButton;
;
;
;
;
;
var KNOB_SIZE = 12;
var BAR_HEIGHT = 5;
var DefaultVolumeSlider = ({ volume, isVertical, onBlur, inputRef, setVolume })=>{
    _s9();
    const sliderContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DefaultVolumeSlider.useMemo3[sliderContainer]": ()=>{
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
        }
    }["DefaultVolumeSlider.useMemo3[sliderContainer]"], [
        isVertical
    ]);
    const randomId = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useId === "undefined" ? "volume-slider" : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useId();
    const [randomClass] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "DefaultVolumeSlider.useState5": ()=>`__remotion-volume-slider-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["random"])(randomId)}`.replace(".", "")
    }["DefaultVolumeSlider.useState5"]);
    const onVolumeChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DefaultVolumeSlider.useCallback4[onVolumeChange]": (e)=>{
            setVolume(parseFloat(e.target.value));
        }
    }["DefaultVolumeSlider.useCallback4[onVolumeChange]"], [
        setVolume
    ]);
    const inputStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DefaultVolumeSlider.useMemo3[inputStyle]": ()=>{
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
        }
    }["DefaultVolumeSlider.useMemo3[inputStyle]"], [
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
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        style: sliderContainer,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("style", {
                dangerouslySetInnerHTML: {
                    __html: sliderStyle
                }
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("input", {
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
_s9(DefaultVolumeSlider, "tA1b2Aq5XaF2jmQgATPQapOyx9I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useId,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c8 = DefaultVolumeSlider;
var renderDefaultVolumeSlider = (props)=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(DefaultVolumeSlider, {
        ...props
    });
};
;
var VOLUME_SLIDER_WIDTH = 100;
var MediaVolumeSlider = ({ displayVerticalVolumeSlider, renderMuteButton, renderVolumeSlider })=>{
    _s10();
    const [mediaMuted, setMediaMuted] = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useMediaMutedState();
    const [mediaVolume, setMediaVolume] = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useMediaVolumeState();
    const [focused, setFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const parentDivRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hover = useHoverState(parentDivRef, false);
    const onBlur = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MediaVolumeSlider.useCallback5[onBlur]": ()=>{
            setTimeout({
                "MediaVolumeSlider.useCallback5[onBlur]": ()=>{
                    if (inputRef.current && document.activeElement !== inputRef.current) {
                        setFocused(false);
                    }
                }
            }["MediaVolumeSlider.useCallback5[onBlur]"], 10);
        }
    }["MediaVolumeSlider.useCallback5[onBlur]"], []);
    const isVolume0 = mediaVolume === 0;
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MediaVolumeSlider.useCallback5[onClick]": ()=>{
            if (isVolume0) {
                setMediaVolume(1);
                setMediaMuted(false);
                return;
            }
            setMediaMuted({
                "MediaVolumeSlider.useCallback5[onClick]": (mute)=>!mute
            }["MediaVolumeSlider.useCallback5[onClick]"]);
        }
    }["MediaVolumeSlider.useCallback5[onClick]"], [
        isVolume0,
        setMediaMuted,
        setMediaVolume
    ]);
    const parentDivStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MediaVolumeSlider.useMemo4[parentDivStyle]": ()=>{
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
        }
    }["MediaVolumeSlider.useMemo4[parentDivStyle]"], [
        displayVerticalVolumeSlider
    ]);
    const volumeContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MediaVolumeSlider.useMemo4[volumeContainer]": ()=>{
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
        }
    }["MediaVolumeSlider.useMemo4[volumeContainer]"], []);
    const renderDefaultMuteButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MediaVolumeSlider.useCallback5[renderDefaultMuteButton]": ({ muted, volume })=>{
            const isMutedOrZero = muted || volume === 0;
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("button", {
                "aria-label": isMutedOrZero ? "Unmute sound" : "Mute sound",
                title: isMutedOrZero ? "Unmute sound" : "Mute sound",
                onClick,
                onBlur,
                onFocus: {
                    "MediaVolumeSlider.useCallback5[renderDefaultMuteButton]": ()=>setFocused(true)
                }["MediaVolumeSlider.useCallback5[renderDefaultMuteButton]"],
                style: volumeContainer,
                type: "button",
                children: isMutedOrZero ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VolumeOffIcon, {}) : /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VolumeOnIcon, {})
            });
        }
    }["MediaVolumeSlider.useCallback5[renderDefaultMuteButton]"], [
        onBlur,
        onClick,
        volumeContainer
    ]);
    const muteButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MediaVolumeSlider.useMemo4[muteButton]": ()=>{
            return renderMuteButton ? renderMuteButton({
                muted: mediaMuted,
                volume: mediaVolume
            }) : renderDefaultMuteButton({
                muted: mediaMuted,
                volume: mediaVolume
            });
        }
    }["MediaVolumeSlider.useMemo4[muteButton]"], [
        mediaMuted,
        mediaVolume,
        renderDefaultMuteButton,
        renderMuteButton
    ]);
    const volumeSlider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MediaVolumeSlider.useMemo4[volumeSlider]": ()=>{
            return (focused || hover) && !mediaMuted && !__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].isIosSafari() ? (renderVolumeSlider ?? renderDefaultVolumeSlider)({
                isVertical: displayVerticalVolumeSlider,
                volume: mediaVolume,
                onBlur: {
                    "MediaVolumeSlider.useMemo4[volumeSlider]": ()=>setFocused(false)
                }["MediaVolumeSlider.useMemo4[volumeSlider]"],
                inputRef,
                setVolume: setMediaVolume
            }) : null;
        }
    }["MediaVolumeSlider.useMemo4[volumeSlider]"], [
        displayVerticalVolumeSlider,
        focused,
        hover,
        mediaMuted,
        mediaVolume,
        renderVolumeSlider,
        setMediaVolume
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        ref: parentDivRef,
        style: parentDivStyle,
        children: [
            muteButton,
            volumeSlider
        ]
    });
};
_s10(MediaVolumeSlider, "aGmzgJm/KznDM3T5Bl1nWgHcQiI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useMediaMutedState,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useMediaVolumeState,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useHoverState,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c9 = MediaVolumeSlider;
;
;
;
function useComponentVisible(initialIsVisible) {
    _s11();
    const [isComponentVisible, setIsComponentVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialIsVisible);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useComponentVisible.useEffect8": ()=>{
            const handleClickOutside = {
                "useComponentVisible.useEffect8.handleClickOutside": (event)=>{
                    if (ref.current && !ref.current.contains(event.target)) {
                        setIsComponentVisible(false);
                    }
                }
            }["useComponentVisible.useEffect8.handleClickOutside"];
            document.addEventListener("pointerup", handleClickOutside, true);
            return ({
                "useComponentVisible.useEffect8": ()=>{
                    document.removeEventListener("pointerup", handleClickOutside, true);
                }
            })["useComponentVisible.useEffect8"];
        }
    }["useComponentVisible.useEffect8"], []);
    return {
        ref,
        isComponentVisible,
        setIsComponentVisible
    };
}
_s11(useComponentVisible, "5XyJXhSJi+R2S5A/tUJTggACPeA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
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
var Checkmark = ()=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("svg", {
        viewBox: "0 0 512 512",
        style: checkmarkStyle,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
            fill: "currentColor",
            d: "M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"
        })
    });
_c10 = Checkmark;
var formatPlaybackRate = (rate)=>{
    const str = rate.toString();
    return str.includes(".") ? str : str + ".0";
};
var PlaybackrateOption = ({ rate, onSelect, selectedRate, keyboardSelectedRate })=>{
    _s12();
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlaybackrateOption.useCallback6[onClick]": (e)=>{
            e.stopPropagation();
            e.preventDefault();
            onSelect(rate);
        }
    }["PlaybackrateOption.useCallback6[onClick]"], [
        onSelect,
        rate
    ]);
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const onMouseEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlaybackrateOption.useCallback6[onMouseEnter]": ()=>{
            setHovered(true);
        }
    }["PlaybackrateOption.useCallback6[onMouseEnter]"], []);
    const onMouseLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlaybackrateOption.useCallback6[onMouseLeave]": ()=>{
            setHovered(false);
        }
    }["PlaybackrateOption.useCallback6[onMouseLeave]"], []);
    const isFocused = keyboardSelectedRate === rate;
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlaybackrateOption.useMemo5[actualStyle]": ()=>{
            return {
                ...rateDiv,
                backgroundColor: hovered || isFocused ? "#eee" : "transparent"
            };
        }
    }["PlaybackrateOption.useMemo5[actualStyle]"], [
        hovered,
        isFocused
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        onMouseEnter,
        onMouseLeave,
        tabIndex: 0,
        style: actualStyle,
        onClick,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: checkmarkContainer,
                children: rate === selectedRate ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Checkmark, {}) : null
            }),
            formatPlaybackRate(rate),
            "x"
        ]
    }, rate);
};
_s12(PlaybackrateOption, "zpHe19REdHbJ8DsqxjlOTpHwBwQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c11 = PlaybackrateOption;
var PlaybackPopup = ({ setIsComponentVisible, playbackRates, canvasSize })=>{
    _s13();
    const { setPlaybackRate, playbackRate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext);
    const [keyboardSelectedRate, setKeyboardSelectedRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(playbackRate);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlaybackPopup.useEffect9": ()=>{
            const listener = {
                "PlaybackPopup.useEffect9.listener": (e)=>{
                    e.preventDefault();
                    if (e.key === "ArrowUp") {
                        const currentIndex = playbackRates.findIndex({
                            "PlaybackPopup.useEffect9.listener.currentIndex": (rate)=>rate === keyboardSelectedRate
                        }["PlaybackPopup.useEffect9.listener.currentIndex"]);
                        if (currentIndex === 0) {
                            return;
                        }
                        if (currentIndex === -1) {
                            setKeyboardSelectedRate(playbackRates[0]);
                        } else {
                            setKeyboardSelectedRate(playbackRates[currentIndex - 1]);
                        }
                    } else if (e.key === "ArrowDown") {
                        const currentIndex = playbackRates.findIndex({
                            "PlaybackPopup.useEffect9.listener.currentIndex": (rate)=>rate === keyboardSelectedRate
                        }["PlaybackPopup.useEffect9.listener.currentIndex"]);
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
                }
            }["PlaybackPopup.useEffect9.listener"];
            window.addEventListener("keydown", listener);
            return ({
                "PlaybackPopup.useEffect9": ()=>{
                    window.removeEventListener("keydown", listener);
                }
            })["PlaybackPopup.useEffect9"];
        }
    }["PlaybackPopup.useEffect9"], [
        playbackRates,
        keyboardSelectedRate,
        setPlaybackRate,
        setIsComponentVisible
    ]);
    const onSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlaybackPopup.useCallback6[onSelect]": (rate)=>{
            setPlaybackRate(rate);
            setIsComponentVisible(false);
        }
    }["PlaybackPopup.useCallback6[onSelect]"], [
        setIsComponentVisible,
        setPlaybackRate
    ]);
    const playbackPopup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlaybackPopup.useMemo5[playbackPopup]": ()=>{
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
        }
    }["PlaybackPopup.useMemo5[playbackPopup]"], [
        canvasSize.height
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        style: playbackPopup,
        children: playbackRates.map((rate)=>{
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlaybackrateOption, {
                selectedRate: playbackRate,
                onSelect,
                rate,
                keyboardSelectedRate
            }, rate);
        })
    });
};
_s13(PlaybackPopup, "kWzy/lvG/ynN+31VCSTe/BaNvYI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c12 = PlaybackPopup;
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
    _s14();
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
    const { playbackRate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext);
    const onClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlaybackrateControl.useCallback6[onClick]": (e)=>{
            e.stopPropagation();
            e.preventDefault();
            setIsComponentVisible({
                "PlaybackrateControl.useCallback6[onClick]": (prevIsComponentVisible)=>!prevIsComponentVisible
            }["PlaybackrateControl.useCallback6[onClick]"]);
        }
    }["PlaybackrateControl.useCallback6[onClick]"], [
        setIsComponentVisible
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("button", {
            type: "button",
            "aria-label": "Change playback rate",
            style: button,
            onClick,
            children: [
                /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                    style: label,
                    children: [
                        playbackRate,
                        "x"
                    ]
                }),
                isComponentVisible && /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlaybackPopup, {
                    canvasSize,
                    playbackRates,
                    setIsComponentVisible
                })
            ]
        })
    });
};
_s14(PlaybackrateControl, "mIY0fQrbe1jyo2ha+ok0HDtNeHs=", false, function() {
    return [
        useComponentVisible,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c13 = PlaybackrateControl;
;
;
;
var getFrameFromX = (clientX, durationInFrames, width)=>{
    const pos = clientX;
    const frame = Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpolate"])(pos, [
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
    _s15();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const barHovered = useHoverState(containerRef, false);
    const size = useElementSize(containerRef, {
        triggerOnWindowResize: true,
        shouldApplyCssTransforms: true
    });
    const { seek, play, pause, playing } = usePlayer();
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const [dragging, setDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        dragging: false
    });
    const width = size?.width ?? 0;
    const onPointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerSeekBar.useCallback7[onPointerDown]": (e)=>{
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
        }
    }["PlayerSeekBar.useCallback7[onPointerDown]"], [
        durationInFrames,
        width,
        pause,
        seek,
        playing,
        onSeekStart
    ]);
    const onPointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerSeekBar.useCallback7[onPointerMove]": (e)=>{
            if (!size) {
                throw new Error("Player has no size");
            }
            if (!dragging.dragging) {
                return;
            }
            const posLeft = containerRef.current?.getBoundingClientRect().left;
            const _frame = getFrameFromX(e.clientX - posLeft, durationInFrames, size.width);
            seek(_frame);
        }
    }["PlayerSeekBar.useCallback7[onPointerMove]"], [
        dragging.dragging,
        durationInFrames,
        seek,
        size
    ]);
    const onPointerUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerSeekBar.useCallback7[onPointerUp]": ()=>{
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
        }
    }["PlayerSeekBar.useCallback7[onPointerUp]"], [
        dragging,
        onSeekEnd,
        pause,
        play
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerSeekBar.useEffect10": ()=>{
            if (!dragging.dragging) {
                return;
            }
            const body = findBodyInWhichDivIsLocated(containerRef.current);
            body.addEventListener("pointermove", onPointerMove);
            body.addEventListener("pointerup", onPointerUp);
            return ({
                "PlayerSeekBar.useEffect10": ()=>{
                    body.removeEventListener("pointermove", onPointerMove);
                    body.removeEventListener("pointerup", onPointerUp);
                }
            })["PlayerSeekBar.useEffect10"];
        }
    }["PlayerSeekBar.useEffect10"], [
        dragging.dragging,
        onPointerMove,
        onPointerUp
    ]);
    const knobStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerSeekBar.useMemo6[knobStyle]": ()=>{
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
        }
    }["PlayerSeekBar.useMemo6[knobStyle]"], [
        barHovered,
        dragging.dragging,
        durationInFrames,
        frame,
        width
    ]);
    const fillStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerSeekBar.useMemo6[fillStyle]": ()=>{
            return {
                height: BAR_HEIGHT2,
                backgroundColor: "rgba(255, 255, 255, 1)",
                width: (frame - (inFrame ?? 0)) / (durationInFrames - 1) * width,
                marginLeft: (inFrame ?? 0) / (durationInFrames - 1) * width,
                borderRadius: BAR_HEIGHT2 / 2
            };
        }
    }["PlayerSeekBar.useMemo6[fillStyle]"], [
        durationInFrames,
        frame,
        inFrame,
        width
    ]);
    const active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerSeekBar.useMemo6[active]": ()=>{
            return {
                height: BAR_HEIGHT2,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                width: ((outFrame ?? durationInFrames - 1) - (inFrame ?? 0)) / (durationInFrames - 1) * 100 + "%",
                marginLeft: (inFrame ?? 0) / (durationInFrames - 1) * 100 + "%",
                borderRadius: BAR_HEIGHT2 / 2,
                position: "absolute"
            };
        }
    }["PlayerSeekBar.useMemo6[active]"], [
        durationInFrames,
        inFrame,
        outFrame
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        ref: containerRef,
        onPointerDown,
        style: containerStyle,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                style: barBackground,
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: active
                    }),
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: fillStyle
                    })
                ]
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: knobStyle
            })
        ]
    });
};
_s15(PlayerSeekBar, "DneePNrXuxFVfYmr5cr/oOdHgSg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useHoverState,
        useElementSize,
        usePlayer,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c14 = PlayerSeekBar;
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
    _s16();
    const frame = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.useTimelinePosition();
    const timeLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerTimeLabel.useMemo7[timeLabel]": ()=>{
            return {
                color: "white",
                fontFamily: "sans-serif",
                fontSize: 14,
                maxWidth: maxTimeLabelWidth === null ? undefined : maxTimeLabelWidth,
                overflow: "hidden",
                textOverflow: "ellipsis"
            };
        }
    }["PlayerTimeLabel.useMemo7[timeLabel]"], [
        maxTimeLabelWidth
    ]);
    const isLastFrame = frame === durationInFrames - 1;
    const frameToDisplay = isLastFrame ? frame + 1 : frame;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        style: timeLabel,
        children: [
            formatTime(frameToDisplay / fps),
            " / ",
            formatTime(durationInFrames / fps)
        ]
    });
};
_s16(PlayerTimeLabel, "UMyRMhhl+5xLjqCn3ewmD//k4NE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c15 = PlayerTimeLabel;
;
var X_SPACER = 10;
var X_PADDING = 12;
var useVideoControlsResize = ({ allowFullscreen: allowFullScreen, playerWidth })=>{
    _s17();
    const resizeInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useVideoControlsResize.useMemo8[resizeInfo]": ()=>{
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
        }
    }["useVideoControlsResize.useMemo8[resizeInfo]"], [
        allowFullScreen,
        playerWidth
    ]);
    return resizeInfo;
};
_s17(useVideoControlsResize, "KXW2Rss6ozQ28im2efZeWFykg5s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
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
    _s18();
    const playButtonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [supportsFullscreen, setSupportsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const hovered = useHoverState(containerRef, hideControlsWhenPointerDoesntMove);
    const { maxTimeLabelWidth, displayVerticalVolumeSlider } = useVideoControlsResize({
        allowFullscreen,
        playerWidth: canvasSize?.width ?? 0
    });
    const [shouldShowInitially, setInitiallyShowControls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Controls.useState10": ()=>{
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
        }
    }["Controls.useState10"]);
    const containerCss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Controls.useMemo9[containerCss]": ()=>{
            const shouldShow = hovered || !playing || shouldShowInitially || alwaysShowControls;
            return {
                ...containerStyle2,
                opacity: Number(shouldShow)
            };
        }
    }["Controls.useMemo9[containerCss]"], [
        hovered,
        shouldShowInitially,
        playing,
        alwaysShowControls
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Controls.useEffect11": ()=>{
            if (playButtonRef.current && spaceKeyToPlayOrPause) {
                playButtonRef.current.focus({
                    preventScroll: true
                });
            }
        }
    }["Controls.useEffect11"], [
        playing,
        spaceKeyToPlayOrPause
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Controls.useEffect11": ()=>{
            setSupportsFullscreen((typeof document !== "undefined" && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) ?? false);
        }
    }["Controls.useEffect11"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Controls.useEffect11": ()=>{
            if (shouldShowInitially === false) {
                return;
            }
            const time = shouldShowInitially === true ? 2000 : shouldShowInitially;
            const timeout = setTimeout({
                "Controls.useEffect11.timeout": ()=>{
                    setInitiallyShowControls(false);
                }
            }["Controls.useEffect11.timeout"], time);
            return ({
                "Controls.useEffect11": ()=>{
                    clearInterval(timeout);
                }
            })["Controls.useEffect11"];
        }
    }["Controls.useEffect11"], [
        shouldShowInitially
    ]);
    const playbackRates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Controls.useMemo9[playbackRates]": ()=>{
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
        }
    }["Controls.useMemo9[playbackRates]"], [
        showPlaybackRateControl
    ]);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const flexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onPointerDownIfContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Controls.useCallback8[onPointerDownIfContainer]": (e)=>{
            if (e.target === ref.current || e.target === flexRef.current) {
                onPointerDown?.(e);
            }
        }
    }["Controls.useCallback8[onPointerDownIfContainer]"], [
        onPointerDown
    ]);
    const onDoubleClickIfContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Controls.useCallback8[onDoubleClickIfContainer]": (e)=>{
            if (e.target === ref.current || e.target === flexRef.current) {
                onDoubleClick?.(e);
            }
        }
    }["Controls.useCallback8[onDoubleClickIfContainer]"], [
        onDoubleClick
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
        ref,
        style: containerCss,
        onPointerDown: onPointerDownIfContainer,
        onDoubleClick: onDoubleClickIfContainer,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                ref: flexRef,
                style: controlsRow,
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                        style: leftPartStyle,
                        children: [
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("button", {
                                ref: playButtonRef,
                                type: "button",
                                style: playerButtonStyle,
                                onClick: toggle,
                                "aria-label": playing ? "Pause video" : "Play video",
                                title: playing ? "Pause video" : "Play video",
                                children: renderPlayPauseButton === null ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(DefaultPlayPauseButton, {
                                    buffering,
                                    playing
                                }) : renderPlayPauseButton({
                                    playing,
                                    isBuffering: buffering
                                }) ?? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(DefaultPlayPauseButton, {
                                    buffering,
                                    playing
                                })
                            }),
                            showVolumeControls ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                        style: xSpacer
                                    }),
                                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(MediaVolumeSlider, {
                                        renderMuteButton,
                                        renderVolumeSlider,
                                        displayVerticalVolumeSlider
                                    })
                                ]
                            }) : null,
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                style: xSpacer
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlayerTimeLabel, {
                                durationInFrames,
                                fps,
                                maxTimeLabelWidth
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                                style: xSpacer
                            })
                        ]
                    }),
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: flex1
                    }),
                    playbackRates && canvasSize && /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlaybackrateControl, {
                        canvasSize,
                        playbackRates
                    }),
                    playbackRates && supportsFullscreen && allowFullscreen ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: xSpacer
                    }) : null,
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                        style: fullscreen,
                        children: supportsFullscreen && allowFullscreen ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("button", {
                            type: "button",
                            "aria-label": isFullscreen ? "Exit fullscreen" : "Enter Fullscreen",
                            title: isFullscreen ? "Exit fullscreen" : "Enter Fullscreen",
                            style: playerButtonStyle,
                            onClick: isFullscreen ? onExitFullscreenButtonClick : onFullscreenButtonClick,
                            children: renderFullscreenButton === null ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(FullscreenIcon, {
                                isFullscreen
                            }) : renderFullscreenButton({
                                isFullscreen
                            })
                        }) : null
                    })
                ]
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: ySpacer
            }),
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlayerSeekBar, {
                onSeekEnd,
                onSeekStart,
                durationInFrames,
                inFrame,
                outFrame
            })
        ]
    });
};
_s18(Controls, "muD/IxPzNa5X4aX5Lyy2pDOEIcI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        useHoverState,
        useVideoControlsResize,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]
    ];
});
_c16 = Controls;
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
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Component {
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
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (typeof window.crypto === "undefined") {
        return null;
    }
    if (typeof window.crypto.subtle === "undefined") {
        return null;
    }
    try {
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(window.location.hostname));
        return Array.from(new Uint8Array(hashBuffer)).map((b)=>b.toString(16).padStart(2, "0")).join("");
    } catch  {
        return null;
    }
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
    _s19();
    const [unlicensed, setUnlicensed] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RenderWarningIfBlacklist.useEffect12": ()=>{
            if (ran) {
                return;
            }
            ran = true;
            getHashOfDomain().then({
                "RenderWarningIfBlacklist.useEffect12": (hash)=>{
                    if (hash && DOMAIN_BLACKLIST.includes(hash)) {
                        setUnlicensed(true);
                    }
                }
            }["RenderWarningIfBlacklist.useEffect12"]).catch({
                "RenderWarningIfBlacklist.useEffect12": ()=>{}
            }["RenderWarningIfBlacklist.useEffect12"]);
        }
    }["RenderWarningIfBlacklist.useEffect12"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RenderWarningIfBlacklist.useEffect12": ()=>{
            if (!unlicensed) {
                return;
            }
            const ensureBanner = {
                "RenderWarningIfBlacklist.useEffect12.ensureBanner": ()=>{
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
                }
            }["RenderWarningIfBlacklist.useEffect12.ensureBanner"];
            const observer = new MutationObserver({
                "RenderWarningIfBlacklist.useEffect12": ()=>ensureBanner()
            }["RenderWarningIfBlacklist.useEffect12"]);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            return ({
                "RenderWarningIfBlacklist.useEffect12": ()=>{
                    observer.disconnect();
                }
            })["RenderWarningIfBlacklist.useEffect12"];
        }
    }["RenderWarningIfBlacklist.useEffect12"], [
        unlicensed
    ]);
    if (!unlicensed) {
        return null;
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        style,
        className: "warning-banner",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("a", {
            style: {
                color: "white"
            },
            href: "https://github.com/remotion-dev/remotion/pull/4589",
            children: "Remotion Unlicensed – Contact hi@remotion.dev"
        })
    });
};
_s19(RenderWarningIfBlacklist, "wbN5vO7RsMh9M9uUkIczkQAH04A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]
    ];
});
_c17 = RenderWarningIfBlacklist;
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
    _s20();
    const pendingPromises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const appendPendingPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCancellablePromises.useCallback9[appendPendingPromise]": (promise)=>{
            pendingPromises.current = [
                ...pendingPromises.current,
                promise
            ];
        }
    }["useCancellablePromises.useCallback9[appendPendingPromise]"], []);
    const removePendingPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCancellablePromises.useCallback9[removePendingPromise]": (promise)=>{
            pendingPromises.current = pendingPromises.current.filter({
                "useCancellablePromises.useCallback9[removePendingPromise]": (p)=>p !== promise
            }["useCancellablePromises.useCallback9[removePendingPromise]"]);
        }
    }["useCancellablePromises.useCallback9[removePendingPromise]"], []);
    const clearPendingPromises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCancellablePromises.useCallback9[clearPendingPromises]": ()=>pendingPromises.current.map({
                "useCancellablePromises.useCallback9[clearPendingPromises]": (p)=>p.cancel()
            }["useCancellablePromises.useCallback9[clearPendingPromises]"])
    }["useCancellablePromises.useCallback9[clearPendingPromises]"], []);
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCancellablePromises.useMemo10[api]": ()=>({
                appendPendingPromise,
                removePendingPromise,
                clearPendingPromises
            })
    }["useCancellablePromises.useMemo10[api]"], [
        appendPendingPromise,
        clearPendingPromises,
        removePendingPromise
    ]);
    return api;
};
_s20(useCancellablePromises, "BDeT2FtIjNuRa/6bh7VIdTua4gI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
// src/utils/use-click-prevention-on-double-click.ts
var useClickPreventionOnDoubleClick = (onClick, onDoubleClick, doubleClickToFullscreen)=>{
    _s21();
    const api = useCancellablePromises();
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useClickPreventionOnDoubleClick.useCallback10[handleClick]": async (e)=>{
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
        }
    }["useClickPreventionOnDoubleClick.useCallback10[handleClick]"], [
        api,
        onClick
    ]);
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useClickPreventionOnDoubleClick.useCallback10[handlePointerDown]": ()=>{
            document.addEventListener("pointerup", {
                "useClickPreventionOnDoubleClick.useCallback10[handlePointerDown]": (newEvt)=>{
                    handleClick(newEvt);
                }
            }["useClickPreventionOnDoubleClick.useCallback10[handlePointerDown]"], {
                once: true
            });
        }
    }["useClickPreventionOnDoubleClick.useCallback10[handlePointerDown]"], [
        handleClick
    ]);
    const handleDoubleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useClickPreventionOnDoubleClick.useCallback10[handleDoubleClick]": ()=>{
            api.clearPendingPromises();
            onDoubleClick();
        }
    }["useClickPreventionOnDoubleClick.useCallback10[handleDoubleClick]"], [
        api,
        onDoubleClick
    ]);
    const returnValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useClickPreventionOnDoubleClick.useMemo11[returnValue]": ()=>{
            if (!doubleClickToFullscreen) {
                return {
                    handlePointerDown: onClick,
                    handleDoubleClick: ({
                        "useClickPreventionOnDoubleClick.useMemo11[returnValue]": ()=>{
                            return;
                        }
                    })["useClickPreventionOnDoubleClick.useMemo11[returnValue]"]
                };
            }
            return {
                handlePointerDown,
                handleDoubleClick
            };
        }
    }["useClickPreventionOnDoubleClick.useMemo11[returnValue]"], [
        doubleClickToFullscreen,
        handleDoubleClick,
        handlePointerDown,
        onClick
    ]);
    return returnValue;
};
_s21(useClickPreventionOnDoubleClick, "aErpZ3ntFVM/XQoOqrL9GgkA6Fc=", false, function() {
    return [
        useCancellablePromises,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
;
var reactVersion = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].version.split(".")[0];
if (reactVersion === "0") {
    throw new Error(`Version ${reactVersion} of "react" is not supported by Remotion`);
}
var doesReactVersionSupportSuspense = parseInt(reactVersion, 10) >= 18;
var PlayerUI = ({ controls, style: style2, loop, autoPlay, allowFullscreen, inputProps, clickToPlay, showVolumeControls, doubleClickToFullscreen, spaceKeyToPlayOrPause, errorFallback, playbackRate, renderLoading, renderPoster, className: className2, moveToBeginningWhenEnded, showPosterWhenUnplayed, showPosterWhenEnded, showPosterWhenPaused, showPosterWhenBuffering, showPosterWhenBufferingAndPaused, inFrame, outFrame, initiallyShowControls, renderFullscreen: renderFullscreenButton, renderPlayPauseButton, renderMuteButton, renderVolumeSlider, alwaysShowControls, showPlaybackRateControl, posterFillMode, bufferStateDelayInMilliseconds, hideControlsWhenPointerDoesntMove, overflowVisible, browserMediaControlsBehavior, overrideInternalClassName, noSuspense }, ref)=>{
    _s22();
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const video = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useVideo();
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasSize = useElementSize(container, {
        triggerOnWindowResize: false,
        shouldApplyCssTransforms: false
    });
    const [hasPausedToResume, setHasPausedToResume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shouldAutoplay, setShouldAutoPlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(autoPlay);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PlayerUI.useState11": ()=>false
    }["PlayerUI.useState11"]);
    const [seeking, setSeeking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const supportsFullScreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[supportsFullScreen]": ()=>{
            if (typeof document === "undefined") {
                return false;
            }
            return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
        }
    }["PlayerUI.useMemo12[supportsFullScreen]"], []);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            if (hasPausedToResume && !player.playing) {
                setHasPausedToResume(false);
                player.play();
            }
        }
    }["PlayerUI.useEffect13"], [
        hasPausedToResume,
        player
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            const { current } = container;
            if (!current) {
                return;
            }
            const onFullscreenChange = {
                "PlayerUI.useEffect13.onFullscreenChange": ()=>{
                    const newValue = document.fullscreenElement === current || document.webkitFullscreenElement === current;
                    setIsFullscreen(newValue);
                }
            }["PlayerUI.useEffect13.onFullscreenChange"];
            document.addEventListener("fullscreenchange", onFullscreenChange);
            document.addEventListener("webkitfullscreenchange", onFullscreenChange);
            return ({
                "PlayerUI.useEffect13": ()=>{
                    document.removeEventListener("fullscreenchange", onFullscreenChange);
                    document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
                }
            })["PlayerUI.useEffect13"];
        }
    }["PlayerUI.useEffect13"], []);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[toggle]": (e)=>{
            playerToggle(e);
        }
    }["PlayerUI.useCallback11[toggle]"], [
        playerToggle
    ]);
    const requestFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[requestFullscreen]": ()=>{
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
        }
    }["PlayerUI.useCallback11[requestFullscreen]"], [
        allowFullscreen,
        supportsFullScreen
    ]);
    const exitFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[exitFullscreen]": ()=>{
            if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }["PlayerUI.useCallback11[exitFullscreen]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            const { current } = container;
            if (!current) {
                return;
            }
            const fullscreenChange = {
                "PlayerUI.useEffect13.fullscreenChange": ()=>{
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
                }
            }["PlayerUI.useEffect13.fullscreenChange"];
            current.addEventListener("webkitfullscreenchange", fullscreenChange);
            current.addEventListener("fullscreenchange", fullscreenChange);
            return ({
                "PlayerUI.useEffect13": ()=>{
                    current.removeEventListener("webkitfullscreenchange", fullscreenChange);
                    current.removeEventListener("fullscreenchange", fullscreenChange);
                }
            })["PlayerUI.useEffect13"];
        }
    }["PlayerUI.useEffect13"], [
        player.emitter
    ]);
    const durationInFrames = config?.durationInFrames ?? 1;
    const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[layout]": ()=>{
            if (!config || !canvasSize) {
                return null;
            }
            return calculateCanvasTransformation({
                canvasSize,
                compositionHeight: config.height,
                compositionWidth: config.width,
                previewSize: "auto"
            });
        }
    }["PlayerUI.useMemo12[layout]"], [
        canvasSize,
        config
    ]);
    const scale = layout?.scale ?? 1;
    const initialScaleIgnored = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            if (!initialScaleIgnored.current) {
                initialScaleIgnored.current = true;
                return;
            }
            player.emitter.dispatchScaleChange(scale);
        }
    }["PlayerUI.useEffect13"], [
        player.emitter,
        scale
    ]);
    const { setMediaVolume, setMediaMuted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].SetMediaVolumeContext);
    const { mediaMuted, mediaVolume } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].MediaVolumeContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            player.emitter.dispatchVolumeChange(mediaVolume);
        }
    }["PlayerUI.useEffect13"], [
        player.emitter,
        mediaVolume
    ]);
    const isMuted = mediaMuted || mediaVolume === 0;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            player.emitter.dispatchMuteChange({
                isMuted
            });
        }
    }["PlayerUI.useEffect13"], [
        player.emitter,
        isMuted
    ]);
    const [showBufferIndicator, setShowBufferState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            let timeout = null;
            let stopped = false;
            const onBuffer = {
                "PlayerUI.useEffect13.onBuffer": ()=>{
                    stopped = false;
                    requestAnimationFrame({
                        "PlayerUI.useEffect13.onBuffer": ()=>{
                            if (bufferStateDelayInMilliseconds === 0) {
                                setShowBufferState(true);
                            } else {
                                timeout = setTimeout({
                                    "PlayerUI.useEffect13.onBuffer": ()=>{
                                        if (!stopped) {
                                            setShowBufferState(true);
                                        }
                                    }
                                }["PlayerUI.useEffect13.onBuffer"], bufferStateDelayInMilliseconds);
                            }
                        }
                    }["PlayerUI.useEffect13.onBuffer"]);
                }
            }["PlayerUI.useEffect13.onBuffer"];
            const onResume = {
                "PlayerUI.useEffect13.onResume": ()=>{
                    requestAnimationFrame({
                        "PlayerUI.useEffect13.onResume": ()=>{
                            stopped = true;
                            setShowBufferState(false);
                            if (timeout) {
                                clearTimeout(timeout);
                            }
                        }
                    }["PlayerUI.useEffect13.onResume"]);
                }
            }["PlayerUI.useEffect13.onResume"];
            player.emitter.addEventListener("waiting", onBuffer);
            player.emitter.addEventListener("resume", onResume);
            return ({
                "PlayerUI.useEffect13": ()=>{
                    player.emitter.removeEventListener("waiting", onBuffer);
                    player.emitter.removeEventListener("resume", onResume);
                    setShowBufferState(false);
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    stopped = true;
                }
            })["PlayerUI.useEffect13"];
        }
    }["PlayerUI.useEffect13"], [
        bufferStateDelayInMilliseconds,
        player.emitter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "PlayerUI.useImperativeHandle": ()=>{
            const methods = {
                play: player.play,
                pause: {
                    "PlayerUI.useImperativeHandle": ()=>{
                        setHasPausedToResume(false);
                        player.pause();
                    }
                }["PlayerUI.useImperativeHandle"],
                toggle,
                getContainerNode: {
                    "PlayerUI.useImperativeHandle": ()=>container.current
                }["PlayerUI.useImperativeHandle"],
                getCurrentFrame: player.getCurrentFrame,
                isPlaying: player.isPlaying,
                seekTo: {
                    "PlayerUI.useImperativeHandle": (f)=>{
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
                    }
                }["PlayerUI.useImperativeHandle"],
                isFullscreen: {
                    "PlayerUI.useImperativeHandle": ()=>{
                        const { current } = container;
                        if (!current) {
                            return false;
                        }
                        return document.fullscreenElement === current || document.webkitFullscreenElement === current;
                    }
                }["PlayerUI.useImperativeHandle"],
                requestFullscreen,
                exitFullscreen,
                getVolume: {
                    "PlayerUI.useImperativeHandle": ()=>{
                        if (mediaMuted) {
                            return 0;
                        }
                        return mediaVolume;
                    }
                }["PlayerUI.useImperativeHandle"],
                setVolume: {
                    "PlayerUI.useImperativeHandle": (vol)=>{
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
                    }
                }["PlayerUI.useImperativeHandle"],
                isMuted: {
                    "PlayerUI.useImperativeHandle": ()=>isMuted
                }["PlayerUI.useImperativeHandle"],
                mute: {
                    "PlayerUI.useImperativeHandle": ()=>{
                        setMediaMuted(true);
                    }
                }["PlayerUI.useImperativeHandle"],
                unmute: {
                    "PlayerUI.useImperativeHandle": ()=>{
                        setMediaMuted(false);
                    }
                }["PlayerUI.useImperativeHandle"],
                getScale: {
                    "PlayerUI.useImperativeHandle": ()=>scale
                }["PlayerUI.useImperativeHandle"],
                pauseAndReturnToPlayStart: {
                    "PlayerUI.useImperativeHandle": ()=>{
                        player.pauseAndReturnToPlayStart();
                    }
                }["PlayerUI.useImperativeHandle"]
            };
            return Object.assign(player.emitter, methods);
        }
    }["PlayerUI.useImperativeHandle"], [
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
    const outerStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[outerStyle]": ()=>{
            return calculateOuterStyle({
                canvasSize,
                config,
                style: style2,
                overflowVisible,
                layout
            });
        }
    }["PlayerUI.useMemo12[outerStyle]"], [
        canvasSize,
        config,
        layout,
        overflowVisible,
        style2
    ]);
    const outer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[outer]": ()=>{
            return calculateOuter({
                config,
                layout,
                scale,
                overflowVisible
            });
        }
    }["PlayerUI.useMemo12[outer]"], [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const containerStyle3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[containerStyle3]": ()=>{
            return calculateContainerStyle({
                config,
                layout,
                scale,
                overflowVisible
            });
        }
    }["PlayerUI.useMemo12[containerStyle3]"], [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const playerPause = player.pause;
    const playerDispatchError = player.emitter.dispatchError;
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onError]": (error)=>{
            playerPause();
            playerDispatchError(error);
        }
    }["PlayerUI.useCallback11[onError]"], [
        playerDispatchError,
        playerPause
    ]);
    const onFullscreenButtonClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onFullscreenButtonClick]": (e)=>{
            e.stopPropagation();
            requestFullscreen();
        }
    }["PlayerUI.useCallback11[onFullscreenButtonClick]"], [
        requestFullscreen
    ]);
    const onExitFullscreenButtonClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onExitFullscreenButtonClick]": (e)=>{
            e.stopPropagation();
            exitFullscreen();
        }
    }["PlayerUI.useCallback11[onExitFullscreenButtonClick]"], [
        exitFullscreen
    ]);
    const onSingleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onSingleClick]": (e)=>{
            const rightClick = e instanceof MouseEvent ? e.button === 2 : e.nativeEvent.button;
            if (rightClick) {
                return;
            }
            toggle(e);
        }
    }["PlayerUI.useCallback11[onSingleClick]"], [
        toggle
    ]);
    const onSeekStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onSeekStart]": ()=>{
            setSeeking(true);
        }
    }["PlayerUI.useCallback11[onSeekStart]"], []);
    const onSeekEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onSeekEnd]": ()=>{
            setSeeking(false);
        }
    }["PlayerUI.useCallback11[onSeekEnd]"], []);
    const onDoubleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PlayerUI.useCallback11[onDoubleClick]": ()=>{
            if (isFullscreen) {
                exitFullscreen();
            } else {
                requestFullscreen();
            }
        }
    }["PlayerUI.useCallback11[onDoubleClick]"], [
        exitFullscreen,
        isFullscreen,
        requestFullscreen
    ]);
    const { handlePointerDown, handleDoubleClick } = useClickPreventionOnDoubleClick(onSingleClick, onDoubleClick, doubleClickToFullscreen && allowFullscreen && supportsFullScreen);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerUI.useEffect13": ()=>{
            if (shouldAutoplay) {
                player.play();
                setShouldAutoPlay(false);
            }
        }
    }["PlayerUI.useEffect13"], [
        shouldAutoplay,
        player
    ]);
    const loadingMarkup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[loadingMarkup]": ()=>{
            return renderLoading ? renderLoading({
                height: outerStyle.height,
                width: outerStyle.width,
                isBuffering: showBufferIndicator
            }) : null;
        }
    }["PlayerUI.useMemo12[loadingMarkup]"], [
        outerStyle.height,
        outerStyle.width,
        renderLoading,
        showBufferIndicator
    ]);
    const currentScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerUI.useMemo12[currentScale]": ()=>{
            return {
                type: "scale",
                scale
            };
        }
    }["PlayerUI.useMemo12[currentScale]"], [
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
    const content = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                style: outer,
                onPointerDown: clickToPlay ? handlePointerDown : undefined,
                onDoubleClick: doubleClickToFullscreen ? handleDoubleClick : undefined,
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("div", {
                        style: containerStyle3,
                        className: playerCssClassname(overrideInternalClassName),
                        children: [
                            VideoComponent ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ErrorBoundary, {
                                onError,
                                errorFallback,
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].CurrentScaleContext.Provider, {
                                    value: currentScale,
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VideoComponent, {
                                        ...video?.props ?? {},
                                        ...inputProps ?? {}
                                    })
                                })
                            }) : null,
                            shouldShowPoster && posterFillMode === "composition-size" ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
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
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderWarningIfBlacklist, {})
                ]
            }),
            shouldShowPoster && posterFillMode === "player-size" ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
                style: outer,
                onPointerDown: clickToPlay ? handlePointerDown : undefined,
                onDoubleClick: doubleClickToFullscreen ? handleDoubleClick : undefined,
                children: poster
            }) : null,
            controls ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(Controls, {
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
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
            ref: container,
            style: outerStyle,
            className: className2,
            children: content
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref: container,
        style: outerStyle,
        className: className2,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
            fallback: loadingMarkup,
            children: content
        })
    });
};
_s22(PlayerUI, "4miTEeLv/mwQUkW0uxfP+UU0Yjc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useVideo,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useElementSize,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        usePlayer,
        usePlayback,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        useClickPreventionOnDoubleClick,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c18 = PlayerUI;
var PlayerUI_default = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(PlayerUI);
_c19 = PlayerUI_default;
;
;
;
var DEFAULT_VOLUME_PERSISTANCE_KEY = "remotion.volumePreference";
var persistVolume = (volume, logLevel, volumePersistenceKey)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        window.localStorage.setItem(volumePersistenceKey ?? DEFAULT_VOLUME_PERSISTANCE_KEY, String(volume));
    } catch (e) {
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Log.error({
            logLevel,
            tag: null
        }, "Could not persist volume", e);
    }
};
var getPreferredVolume = (volumePersistenceKey)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const val = window.localStorage.getItem(volumePersistenceKey ?? DEFAULT_VOLUME_PERSISTANCE_KEY);
        return val ? Number(val) : 1;
    } catch  {
        return 1;
    }
};
;
var PLAYER_COMP_ID = "player-comp";
var SharedPlayerContexts = ({ children, timelineContext, fps, compositionHeight, compositionWidth, durationInFrames, component, numberOfSharedAudioTags, initiallyMuted, logLevel, audioLatencyHint, volumePersistenceKey })=>{
    _s23();
    const compositionManagerContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedPlayerContexts.useMemo13[compositionManagerContext]": ()=>{
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
        }
    }["SharedPlayerContexts.useMemo13[compositionManagerContext]"], [
        component,
        durationInFrames,
        compositionHeight,
        compositionWidth,
        fps
    ]);
    const [mediaMuted, setMediaMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "SharedPlayerContexts.useState12": ()=>initiallyMuted
    }["SharedPlayerContexts.useState12"]);
    const [mediaVolume, setMediaVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "SharedPlayerContexts.useState12": ()=>getPreferredVolume(volumePersistenceKey ?? null)
    }["SharedPlayerContexts.useState12"]);
    const mediaVolumeContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedPlayerContexts.useMemo13[mediaVolumeContextValue]": ()=>{
            return {
                mediaMuted,
                mediaVolume
            };
        }
    }["SharedPlayerContexts.useMemo13[mediaVolumeContextValue]"], [
        mediaMuted,
        mediaVolume
    ]);
    const setMediaVolumeAndPersist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SharedPlayerContexts.useCallback12[setMediaVolumeAndPersist]": (vol)=>{
            setMediaVolume(vol);
            persistVolume(vol, logLevel, volumePersistenceKey ?? null);
        }
    }["SharedPlayerContexts.useCallback12[setMediaVolumeAndPersist]"], [
        logLevel,
        volumePersistenceKey
    ]);
    const setMediaVolumeContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedPlayerContexts.useMemo13[setMediaVolumeContextValue]": ()=>{
            return {
                setMediaMuted,
                setMediaVolume: setMediaVolumeAndPersist
            };
        }
    }["SharedPlayerContexts.useMemo13[setMediaVolumeContextValue]"], [
        setMediaVolumeAndPersist
    ]);
    const logLevelContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedPlayerContexts.useMemo13[logLevelContext]": ()=>{
            return {
                logLevel,
                mountTime: Date.now()
            };
        }
    }["SharedPlayerContexts.useMemo13[logLevelContext]"], [
        logLevel
    ]);
    const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SharedPlayerContexts.useMemo13[env]": ()=>{
            return {
                isPlayer: true,
                isRendering: false,
                isStudio: false,
                isClientSideRendering: false,
                isReadOnlyStudio: false
            };
        }
    }["SharedPlayerContexts.useMemo13[env]"], []);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].RemotionEnvironmentContext.Provider, {
        value: env,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].LogLevelContext.Provider, {
            value: logLevelContext,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].CanUseRemotionHooksProvider, {
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.TimelineContext.Provider, {
                    value: timelineContext,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].CompositionManager.Provider, {
                        value: compositionManagerContext,
                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].ResolveCompositionConfig, {
                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].PrefetchProvider, {
                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].DurationsContextProvider, {
                                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].MediaVolumeContext.Provider, {
                                        value: mediaVolumeContextValue,
                                        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].SetMediaVolumeContext.Provider, {
                                            value: setMediaVolumeContextValue,
                                            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].SharedAudioContextProvider, {
                                                numberOfAudioTags: numberOfSharedAudioTags,
                                                component,
                                                audioLatencyHint,
                                                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].BufferingProvider, {
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
_s23(SharedPlayerContexts, "hw/39qKdvSMEUFtsZi1C4z7KhWM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c20 = SharedPlayerContexts;
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
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Log.warn({
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
var validateFps = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NoReactInternals"].validateFps;
var validateDimension = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NoReactInternals"].validateDimension;
var validateDurationInFrames = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NoReactInternals"].validateDurationInFrames;
var validateDefaultAndInputProps = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NoReactInternals"].validateDefaultAndInputProps;
;
var componentOrNullIfLazy = (props)=>{
    if ("component" in props) {
        return props.component;
    }
    return null;
};
var PlayerFn = ({ durationInFrames, compositionHeight, compositionWidth, fps, inputProps, style: style2, controls = false, loop = false, autoPlay = false, showVolumeControls = true, allowFullscreen = true, clickToPlay, doubleClickToFullscreen = false, spaceKeyToPlayOrPause = true, moveToBeginningWhenEnded = true, numberOfSharedAudioTags = 5, errorFallback = ()=>"⚠️", playbackRate = 1, renderLoading, className: className2, showPosterWhenUnplayed, showPosterWhenEnded, showPosterWhenPaused, showPosterWhenBuffering, showPosterWhenBufferingAndPaused, initialFrame, renderPoster, inFrame, outFrame, initiallyShowControls, renderFullscreenButton, renderPlayPauseButton, renderVolumeSlider, alwaysShowControls = false, initiallyMuted = false, showPlaybackRateControl = false, posterFillMode = "player-size", bufferStateDelayInMilliseconds, hideControlsWhenPointerDoesntMove = true, overflowVisible = false, renderMuteButton, browserMediaControlsBehavior: passedBrowserMediaControlsBehavior, overrideInternalClassName, logLevel = "info", noSuspense, acknowledgeRemotionLicense, audioLatencyHint = "interactive", volumePersistenceKey, ...componentProps }, ref)=>{
    _s24();
    if ("TURBOPACK compile-time truthy", 1) {
        window.remotion_isPlayer = true;
    }
    if (componentProps.defaultProps !== undefined) {
        throw new Error("The <Player /> component does not accept `defaultProps`, but some were passed. Use `inputProps` instead.");
    }
    const componentForValidation = componentOrNullIfLazy(componentProps);
    if (componentForValidation?.type === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Composition"]) {
        throw new TypeError(`'component' should not be an instance of <Composition/>. Pass the React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`);
    }
    if (componentForValidation === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Composition"]) {
        throw new TypeError(`'component' must not be the 'Composition' component. Pass your own React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.`);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PlayerFn.useState13": ()=>acknowledgeRemotionLicenseMessage(Boolean(acknowledgeRemotionLicense), logLevel)
    }["PlayerFn.useState13"]);
    const component = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useLazyComponent({
        compProps: componentProps,
        componentName: "Player",
        noSuspense: Boolean(noSuspense)
    });
    validateInitialFrame({
        initialFrame,
        durationInFrames
    });
    const [frame, setFrame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PlayerFn.useState13": ()=>({
                [PLAYER_COMP_ID]: initialFrame ?? 0
            })
    }["PlayerFn.useState13"]);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rootId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("player-comp");
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioAndVideoTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const imperativePlaying = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [currentPlaybackRate, setCurrentPlaybackRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(playbackRate);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerFn.useEffect14": ()=>{
            setCurrentPlaybackRate(playbackRate);
        }
    }["PlayerFn.useEffect14"], [
        playbackRate
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "PlayerFn.useImperativeHandle2": ()=>rootRef.current
    }["PlayerFn.useImperativeHandle2"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PlayerFn.useState13": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].playbackLogging({
                logLevel,
                message: `[player] Mounting <Player>. User agent = ${typeof navigator === "undefined" ? "server" : navigator.userAgent}`,
                tag: "player",
                mountTime: Date.now()
            });
        }
    }["PlayerFn.useState13"]);
    const timelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerFn.useMemo14[timelineContextValue]": ()=>{
            return {
                frame,
                playing,
                rootId,
                playbackRate: currentPlaybackRate,
                imperativePlaying,
                setPlaybackRate: ({
                    "PlayerFn.useMemo14[timelineContextValue]": (rate)=>{
                        setCurrentPlaybackRate(rate);
                    }
                })["PlayerFn.useMemo14[timelineContextValue]"],
                audioAndVideoTags
            };
        }
    }["PlayerFn.useMemo14[timelineContextValue]"], [
        frame,
        currentPlaybackRate,
        playing,
        rootId
    ]);
    const setTimelineContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerFn.useMemo14[setTimelineContextValue]": ()=>{
            return {
                setFrame,
                setPlaying
            };
        }
    }["PlayerFn.useMemo14[setTimelineContextValue]"], [
        setFrame
    ]);
    if ("TURBOPACK compile-time truthy", 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "PlayerFn.useLayoutEffect": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].CSSUtils.injectCSS(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].CSSUtils.makeDefaultPreviewCSS(`.${playerCssClassname(overrideInternalClassName)}`, "#fff"));
            }
        }["PlayerFn.useLayoutEffect"], [
            overrideInternalClassName
        ]);
    }
    const actualInputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerFn.useMemo14[actualInputProps]": ()=>inputProps ?? {}
    }["PlayerFn.useMemo14[actualInputProps]"], [
        inputProps
    ]);
    const browserMediaControlsBehavior = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlayerFn.useMemo14[browserMediaControlsBehavior]": ()=>{
            return passedBrowserMediaControlsBehavior ?? {
                mode: "prevent-media-session"
            };
        }
    }["PlayerFn.useMemo14[browserMediaControlsBehavior]"], [
        passedBrowserMediaControlsBehavior
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].IsPlayerContextProvider, {
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SharedPlayerContexts, {
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
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].Timeline.SetTimelineContext.Provider, {
                value: setTimelineContextValue,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlayerEmitterProvider, {
                    currentPlaybackRate,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(PlayerUI_default, {
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
_s24(PlayerFn, "pSs47kzLdvjF3vqOnMuasVw9Z4U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useLazyComponent,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c21 = PlayerFn;
var forward = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"];
var Player = forward(PlayerFn);
_c22 = Player;
;
;
;
;
;
var useThumbnail = ()=>{
    _s25();
    const emitter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThumbnailEmitterContext);
    if (!emitter) {
        throw new TypeError("Expected Player event emitter context");
    }
    const returnValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useThumbnail.useMemo15[returnValue]": ()=>{
            return {
                emitter
            };
        }
    }["useThumbnail.useMemo15[returnValue]"], [
        emitter
    ]);
    return returnValue;
};
_s25(useThumbnail, "P2qYuzdaXLz2sW0HmdX/EYjhK4k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
;
var reactVersion2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].version.split(".")[0];
if (reactVersion2 === "0") {
    throw new Error(`Version ${reactVersion2} of "react" is not supported by Remotion`);
}
var doesReactVersionSupportSuspense2 = parseInt(reactVersion2, 10) >= 18;
var ThumbnailUI = ({ style: style2, inputProps, errorFallback, renderLoading, className: className2, overflowVisible, noSuspense, overrideInternalClassName }, ref)=>{
    _s26();
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig();
    const video = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useVideo();
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasSize = useElementSize(container, {
        triggerOnWindowResize: false,
        shouldApplyCssTransforms: false
    });
    const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailUI.useMemo16[layout]": ()=>{
            if (!config || !canvasSize) {
                return null;
            }
            return calculateCanvasTransformation({
                canvasSize,
                compositionHeight: config.height,
                compositionWidth: config.width,
                previewSize: "auto"
            });
        }
    }["ThumbnailUI.useMemo16[layout]"], [
        canvasSize,
        config
    ]);
    const scale = layout?.scale ?? 1;
    const thumbnail = useThumbnail();
    useBufferStateEmitter(thumbnail.emitter);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "ThumbnailUI.useImperativeHandle3": ()=>{
            const methods = {
                getContainerNode: {
                    "ThumbnailUI.useImperativeHandle3": ()=>container.current
                }["ThumbnailUI.useImperativeHandle3"],
                getScale: {
                    "ThumbnailUI.useImperativeHandle3": ()=>scale
                }["ThumbnailUI.useImperativeHandle3"]
            };
            return Object.assign(thumbnail.emitter, methods);
        }
    }["ThumbnailUI.useImperativeHandle3"], [
        scale,
        thumbnail.emitter
    ]);
    const VideoComponent = video ? video.component : null;
    const outerStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailUI.useMemo16[outerStyle]": ()=>{
            return calculateOuterStyle({
                config,
                style: style2,
                canvasSize,
                overflowVisible,
                layout
            });
        }
    }["ThumbnailUI.useMemo16[outerStyle]"], [
        canvasSize,
        config,
        layout,
        overflowVisible,
        style2
    ]);
    const outer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailUI.useMemo16[outer]": ()=>{
            return calculateOuter({
                config,
                layout,
                scale,
                overflowVisible
            });
        }
    }["ThumbnailUI.useMemo16[outer]"], [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const containerStyle3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailUI.useMemo16[containerStyle3]": ()=>{
            return calculateContainerStyle({
                config,
                layout,
                scale,
                overflowVisible
            });
        }
    }["ThumbnailUI.useMemo16[containerStyle3]"], [
        config,
        layout,
        overflowVisible,
        scale
    ]);
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThumbnailUI.useCallback13[onError]": (error)=>{
            thumbnail.emitter.dispatchError(error);
        }
    }["ThumbnailUI.useCallback13[onError]"], [
        thumbnail.emitter
    ]);
    const loadingMarkup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailUI.useMemo16[loadingMarkup]": ()=>{
            return renderLoading ? renderLoading({
                height: outerStyle.height,
                width: outerStyle.width,
                isBuffering: false
            }) : null;
        }
    }["ThumbnailUI.useMemo16[loadingMarkup]"], [
        outerStyle.height,
        outerStyle.width,
        renderLoading
    ]);
    const currentScaleContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailUI.useMemo16[currentScaleContext]": ()=>{
            return {
                type: "scale",
                scale
            };
        }
    }["ThumbnailUI.useMemo16[currentScaleContext]"], [
        scale
    ]);
    if (!config) {
        return null;
    }
    const content = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        style: outer,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
            style: containerStyle3,
            className: playerCssClassname(overrideInternalClassName),
            children: VideoComponent ? /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ErrorBoundary, {
                onError,
                errorFallback,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].CurrentScaleContext.Provider, {
                    value: currentScaleContext,
                    children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(VideoComponent, {
                        ...video?.props ?? {},
                        ...inputProps ?? {}
                    })
                })
            }) : null
        })
    });
    if (noSuspense || IS_NODE && !doesReactVersionSupportSuspense2) {
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
            ref: container,
            style: outerStyle,
            className: className2,
            children: content
        });
    }
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("div", {
        ref: container,
        style: outerStyle,
        className: className2,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
            fallback: loadingMarkup,
            children: content
        })
    });
};
_s26(ThumbnailUI, "A6nAsGEQ49RocnM4BtVs8ToLjME=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useUnsafeVideoConfig,
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useVideo,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        useElementSize,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        useThumbnail,
        useBufferStateEmitter,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c23 = ThumbnailUI;
var ThumbnailUI_default = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(ThumbnailUI);
_c24 = ThumbnailUI_default;
;
var ThumbnailFn = ({ frameToDisplay, style: style2, inputProps, compositionHeight, compositionWidth, durationInFrames, fps, className: className2, errorFallback = ()=>"⚠️", renderLoading, overflowVisible = false, overrideInternalClassName, logLevel = "info", noSuspense, ...componentProps }, ref)=>{
    _s27();
    if ("TURBOPACK compile-time truthy", 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
            "ThumbnailFn.useLayoutEffect2": ()=>{
                window.remotion_isPlayer = true;
            }
        }["ThumbnailFn.useLayoutEffect2"], []);
    }
    const [thumbnailId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ThumbnailFn.useState14": ()=>String((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["random"])(null))
    }["ThumbnailFn.useState14"]);
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timelineState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailFn.useMemo17[timelineState]": ()=>{
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
                setPlaybackRate: {
                    "ThumbnailFn.useMemo17[timelineState]": ()=>{
                        throw new Error("thumbnail");
                    }
                }["ThumbnailFn.useMemo17[timelineState]"],
                audioAndVideoTags: {
                    current: []
                }
            };
            return value;
        }
    }["ThumbnailFn.useMemo17[timelineState]"], [
        frameToDisplay,
        thumbnailId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "ThumbnailFn.useImperativeHandle4": ()=>rootRef.current
    }["ThumbnailFn.useImperativeHandle4"], []);
    const Component = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useLazyComponent({
        compProps: componentProps,
        componentName: "Thumbnail",
        noSuspense: Boolean(noSuspense)
    });
    const [emitter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ThumbnailFn.useState14": ()=>new ThumbnailEmitter
    }["ThumbnailFn.useState14"]);
    const passedInputProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ThumbnailFn.useMemo17[passedInputProps]": ()=>{
            return inputProps ?? {};
        }
    }["ThumbnailFn.useMemo17[passedInputProps]"], [
        inputProps
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].IsPlayerContextProvider, {
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(SharedPlayerContexts, {
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
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ThumbnailEmitterContext.Provider, {
                value: emitter,
                children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(ThumbnailUI_default, {
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
_s27(ThumbnailFn, "4xifsSUbanPnEePDsqyZXGf1kj0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Internals"].useLazyComponent,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]
    ];
});
_c25 = ThumbnailFn;
var forward2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"];
var Thumbnail = forward2(ThumbnailFn);
_c26 = Thumbnail;
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
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16, _c17, _c18, _c19, _c20, _c21, _c22, _c23, _c24, _c25, _c26;
__turbopack_context__.k.register(_c, "PlayIcon");
__turbopack_context__.k.register(_c1, "PauseIcon");
__turbopack_context__.k.register(_c2, "FullscreenIcon");
__turbopack_context__.k.register(_c3, "VolumeOffIcon");
__turbopack_context__.k.register(_c4, "VolumeOnIcon");
__turbopack_context__.k.register(_c5, "BufferingIndicator");
__turbopack_context__.k.register(_c6, "PlayerEmitterProvider");
__turbopack_context__.k.register(_c7, "DefaultPlayPauseButton");
__turbopack_context__.k.register(_c8, "DefaultVolumeSlider");
__turbopack_context__.k.register(_c9, "MediaVolumeSlider");
__turbopack_context__.k.register(_c10, "Checkmark");
__turbopack_context__.k.register(_c11, "PlaybackrateOption");
__turbopack_context__.k.register(_c12, "PlaybackPopup");
__turbopack_context__.k.register(_c13, "PlaybackrateControl");
__turbopack_context__.k.register(_c14, "PlayerSeekBar");
__turbopack_context__.k.register(_c15, "PlayerTimeLabel");
__turbopack_context__.k.register(_c16, "Controls");
__turbopack_context__.k.register(_c17, "RenderWarningIfBlacklist");
__turbopack_context__.k.register(_c18, "PlayerUI");
__turbopack_context__.k.register(_c19, "PlayerUI_default");
__turbopack_context__.k.register(_c20, "SharedPlayerContexts");
__turbopack_context__.k.register(_c21, "PlayerFn");
__turbopack_context__.k.register(_c22, "Player");
__turbopack_context__.k.register(_c23, "ThumbnailUI");
__turbopack_context__.k.register(_c24, "ThumbnailUI_default");
__turbopack_context__.k.register(_c25, "ThumbnailFn");
__turbopack_context__.k.register(_c26, "Thumbnail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=packages_player_dist_esm_index_mjs_6a91ccb4._.js.map