"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanUseRemotionHooksProvider = exports.CanUseRemotionHooks = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.CanUseRemotionHooks = (0, react_1.createContext)(false);
const CanUseRemotionHooksProvider = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(exports.CanUseRemotionHooks.Provider, { value: true, children: children }));
};
exports.CanUseRemotionHooksProvider = CanUseRemotionHooksProvider;
