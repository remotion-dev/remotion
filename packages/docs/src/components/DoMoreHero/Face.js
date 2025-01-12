"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Face = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Face = ({ color, points, strokeColor, strokeWidth, strokeMiterlimit, strokeLinecap, crispEdges, }) => {
    const [id] = (0, react_1.useState)(() => Math.random().toString().replace('.', ''));
    const d = threeDIntoSvgPath(points);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("defs", { children: strokeWidth ? ((0, jsx_runtime_1.jsx)("mask", { id: id, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: strokeLinecap, shapeRendering: crispEdges ? 'crispEdges' : undefined, strokeMiterlimit: strokeMiterlimit, strokeWidth: strokeWidth, d: d, fill: "white" }) })) : null }), (0, jsx_runtime_1.jsx)("path", { d: d, fill: color, mask: strokeWidth ? `url(#${id})` : undefined, stroke: strokeColor, strokeMiterlimit: strokeMiterlimit, shapeRendering: crispEdges ? 'crispEdges' : undefined, strokeLinecap: strokeLinecap, strokeWidth: strokeWidth })] }));
};
exports.Face = Face;
