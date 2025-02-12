"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEnvVariables = void 0;
const get_remotion_environment_js_1 = require("./get-remotion-environment.js");
// https://github.com/remotion-dev/remotion/issues/3412#issuecomment-1910120552
function getEnvVar() {
    const parts = ['proc', 'ess', '.', 'en', 'v', '.', 'NOD', 'E_EN', 'V'];
    return parts.join('');
}
const getEnvVariables = () => {
    if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isRendering) {
        const param = window.remotion_envVariables;
        if (!param) {
            return {};
        }
        return { ...JSON.parse(param), NODE_ENV: process.env.NODE_ENV };
    }
    // For the Studio, we already set the environment variables in index-html.ts.
    // We just add NODE_ENV here.
    if (!process.env.NODE_ENV) {
        throw new Error(`${getEnvVar()} is not set`);
    }
    return {
        NODE_ENV: process.env.NODE_ENV,
    };
};
const setupEnvVariables = () => {
    const env = getEnvVariables();
    if (!window.process) {
        window.process = {};
    }
    if (!window.process.env) {
        window.process.env = {};
    }
    Object.keys(env).forEach((key) => {
        window.process.env[key] = env[key];
    });
};
exports.setupEnvVariables = setupEnvVariables;
