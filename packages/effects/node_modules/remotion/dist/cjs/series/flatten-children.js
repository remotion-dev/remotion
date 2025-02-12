"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenChildren = void 0;
const react_1 = __importDefault(require("react"));
const flattenChildren = (children) => {
    const childrenArray = react_1.default.Children.toArray(children);
    return childrenArray.reduce((flatChildren, child) => {
        if (child.type === react_1.default.Fragment) {
            return flatChildren.concat((0, exports.flattenChildren)(child.props
                .children));
        }
        flatChildren.push(child);
        return flatChildren;
    }, []);
};
exports.flattenChildren = flattenChildren;
