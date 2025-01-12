"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faces = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const Face_1 = require("./Face");
const sortFacesZIndex = (face) => {
    return face.slice().sort((a, b) => {
        return b.centerPoint[2] - a.centerPoint[2];
    });
};
const Faces = ({ elements, noSort, ...svgProps }) => {
    const sortedElement = noSort
        ? elements
        : elements.sort((a, b) => {
            return b.centerPoint[2] - a.centerPoint[2];
        });
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: sortedElement.map((element, i) => {
            const sortedFaces = sortFacesZIndex(element.faces);
            return (
            // eslint-disable-next-line react/no-array-index-key
            (0, jsx_runtime_1.jsx)(react_1.default.Fragment, { children: sortedFaces.map(({ points, color, strokeWidth, strokeColor, crispEdges }, idx) => {
                    return ((0, jsx_runtime_1.jsx)(Face_1.Face
                    // eslint-disable-next-line react/no-array-index-key
                    , { strokeColor: strokeColor, color: color, points: points, strokeWidth: strokeWidth, crispEdges: crispEdges, ...svgProps }, JSON.stringify(points) + idx));
                }) }, i));
        }) }));
};
exports.Faces = Faces;
