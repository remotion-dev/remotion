"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefetchProvider = exports.setPreloads = exports.PreloadContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.PreloadContext = (0, react_1.createContext)({});
let preloads = {};
let updaters = [];
const setPreloads = (updater) => {
    preloads = updater(preloads);
    updaters.forEach((u) => u());
};
exports.setPreloads = setPreloads;
const PrefetchProvider = ({ children }) => {
    const [_preloads, _setPreloads] = (0, react_1.useState)(() => preloads);
    (0, react_1.useEffect)(() => {
        const updaterFunction = () => {
            _setPreloads(preloads);
        };
        updaters.push(updaterFunction);
        return () => {
            updaters = updaters.filter((u) => u !== updaterFunction);
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)(exports.PreloadContext.Provider, { value: _preloads, children: children }));
};
exports.PrefetchProvider = PrefetchProvider;
