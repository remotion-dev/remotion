"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsPlayer = exports.IsPlayerContextProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const IsPlayerContext = (0, react_1.createContext)(false);
const IsPlayerContextProvider = ({ children, }) => {
    return (0, jsx_runtime_1.jsx)(IsPlayerContext.Provider, { value: true, children: children });
};
exports.IsPlayerContextProvider = IsPlayerContextProvider;
const useIsPlayer = () => {
    return (0, react_1.useContext)(IsPlayerContext);
};
exports.useIsPlayer = useIsPlayer;
