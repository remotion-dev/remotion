"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurationsContextProvider = exports.DurationsContext = exports.durationReducer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const absolute_src_js_1 = require("../absolute-src.js");
const durationReducer = (state, action) => {
    switch (action.type) {
        case 'got-duration': {
            const absoluteSrc = (0, absolute_src_js_1.getAbsoluteSrc)(action.src);
            if (state[absoluteSrc] === action.durationInSeconds) {
                return state;
            }
            return {
                ...state,
                [absoluteSrc]: action.durationInSeconds,
            };
        }
        default:
            return state;
    }
};
exports.durationReducer = durationReducer;
exports.DurationsContext = (0, react_1.createContext)({
    durations: {},
    setDurations: () => {
        throw new Error('context missing');
    },
});
const DurationsContextProvider = ({ children }) => {
    const [durations, setDurations] = (0, react_1.useReducer)(exports.durationReducer, {});
    const value = (0, react_1.useMemo)(() => {
        return {
            durations,
            setDurations,
        };
    }, [durations]);
    return ((0, jsx_runtime_1.jsx)(exports.DurationsContext.Provider, { value: value, children: children }));
};
exports.DurationsContextProvider = DurationsContextProvider;
