"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApproximatelyTheSame = void 0;
const FLOATING_POINT_ERROR_THRESHOLD = 0.00001;
const isApproximatelyTheSame = (num1, num2) => {
    return Math.abs(num1 - num2) < FLOATING_POINT_ERROR_THRESHOLD;
};
exports.isApproximatelyTheSame = isApproximatelyTheSame;
