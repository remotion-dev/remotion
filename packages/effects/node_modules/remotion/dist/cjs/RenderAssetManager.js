"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderAssetManagerProvider = exports.RenderAssetManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const validate_artifact_js_1 = require("./validation/validate-artifact.js");
exports.RenderAssetManager = (0, react_1.createContext)({
    // Must be undefined, otherwise error in Player
    registerRenderAsset: () => undefined,
    unregisterRenderAsset: () => undefined,
    renderAssets: [],
});
const RenderAssetManagerProvider = ({ children }) => {
    const [renderAssets, setRenderAssets] = (0, react_1.useState)([]);
    const registerRenderAsset = (0, react_1.useCallback)((renderAsset) => {
        (0, validate_artifact_js_1.validateRenderAsset)(renderAsset);
        setRenderAssets((assets) => {
            return [...assets, renderAsset];
        });
    }, []);
    const unregisterRenderAsset = (0, react_1.useCallback)((id) => {
        setRenderAssets((assts) => {
            return assts.filter((a) => a.id !== id);
        });
    }, []);
    (0, react_1.useLayoutEffect)(() => {
        if (typeof window !== 'undefined') {
            window.remotion_collectAssets = () => {
                setRenderAssets([]); // clear assets at next render
                return renderAssets;
            };
        }
    }, [renderAssets]);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            registerRenderAsset,
            unregisterRenderAsset,
            renderAssets,
        };
    }, [renderAssets, registerRenderAsset, unregisterRenderAsset]);
    return ((0, jsx_runtime_1.jsx)(exports.RenderAssetManager.Provider, { value: contextValue, children: children }));
};
exports.RenderAssetManagerProvider = RenderAssetManagerProvider;
