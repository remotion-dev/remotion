"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
/* eslint-disable no-promise-executor-return */
const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));
exports.delay = delay;
