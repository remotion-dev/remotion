"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Series = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Sequence_js_1 = require("../Sequence.js");
const enable_sequence_stack_traces_js_1 = require("../enable-sequence-stack-traces.js");
const v5_flag_js_1 = require("../v5-flag.js");
const validate_duration_in_frames_js_1 = require("../validation/validate-duration-in-frames.js");
const flatten_children_js_1 = require("./flatten-children.js");
const is_inside_series_js_1 = require("./is-inside-series.js");
const SeriesSequenceRefForwardingFunction = ({ children }, _ref) => {
    (0, is_inside_series_js_1.useRequireToBeInsideSeries)();
    // Discard ref
    return (0, jsx_runtime_1.jsx)(is_inside_series_js_1.IsNotInsideSeriesProvider, { children: children });
};
const SeriesSequence = (0, react_1.forwardRef)(SeriesSequenceRefForwardingFunction);
/**
 * @description with this component, you can easily stitch together scenes that should play sequentially after another.
 * @see [Documentation](https://www.remotion.dev/docs/series)
 */
const Series = (props) => {
    const childrenValue = (0, react_1.useMemo)(() => {
        let startFrame = 0;
        const flattenedChildren = (0, flatten_children_js_1.flattenChildren)(props.children);
        return react_1.Children.map(flattenedChildren, (child, i) => {
            var _a;
            const castedChild = child;
            if (typeof castedChild === 'string') {
                // Don't throw if it's just some accidential whitespace
                if (castedChild.trim() === '') {
                    return null;
                }
                throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but you passed a string "${castedChild}"`);
            }
            if (castedChild.type !== SeriesSequence) {
                throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but got ${castedChild} instead`);
            }
            const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;
            if (!(castedChild === null || castedChild === void 0 ? void 0 : castedChild.props.children)) {
                throw new TypeError(`A <Series.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`);
            }
            const durationInFramesProp = castedChild.props.durationInFrames;
            const { durationInFrames, children: _children, from, name, ...passedProps } = castedChild.props; // `from` is not accepted and must be filtered out if used in JS
            if (i !== flattenedChildren.length - 1 ||
                durationInFramesProp !== Infinity) {
                (0, validate_duration_in_frames_js_1.validateDurationInFrames)(durationInFramesProp, {
                    component: `of a <Series.Sequence /> component`,
                    allowFloats: true,
                });
            }
            const offset = (_a = castedChild.props.offset) !== null && _a !== void 0 ? _a : 0;
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
            return ((0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { name: name || '<Series.Sequence>', from: currentStartFrame, durationInFrames: durationInFramesProp, ...passedProps, ref: castedChild.ref, children: child }));
        });
    }, [props.children]);
    if (v5_flag_js_1.ENABLE_V5_BREAKING_CHANGES) {
        return ((0, jsx_runtime_1.jsx)(is_inside_series_js_1.IsInsideSeriesContainer, { children: (0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { ...props, children: childrenValue }) }));
    }
    return (0, jsx_runtime_1.jsx)(is_inside_series_js_1.IsInsideSeriesContainer, { children: childrenValue });
};
exports.Series = Series;
Series.Sequence = SeriesSequence;
(0, enable_sequence_stack_traces_js_1.addSequenceStackTraces)(SeriesSequence);
