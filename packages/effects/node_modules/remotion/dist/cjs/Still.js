"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Still = void 0;
const react_1 = __importDefault(require("react"));
const Composition_js_1 = require("./Composition.js");
/*
 * @description A `<Still />` is a `<Composition />` that is only 1 frame long.
 * @see [Documentation](https://www.remotion.dev/docs/still)
 */
const Still = (props) => {
    const newProps = {
        ...props,
        durationInFrames: 1,
        fps: 1,
    };
    // @ts-expect-error TypeScript does not understand it, but should still fail on type mismatch
    return react_1.default.createElement((Composition_js_1.Composition), newProps);
};
exports.Still = Still;
