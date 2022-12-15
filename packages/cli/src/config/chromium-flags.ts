import type {OpenGlRenderer} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

let chromiumDisableWebSecurity = false;
let ignoreCertificateErrors = false;
let openGlRenderer: OpenGlRenderer | null =
	RenderInternals.DEFAULT_OPENGL_RENDERER;
let headlessMode = true;
let enableExtensions = false;

export const getChromiumDisableWebSecurity = () => chromiumDisableWebSecurity;
export const setChromiumDisableWebSecurity = (should: boolean) => {
	chromiumDisableWebSecurity = should;
};

export const getIgnoreCertificateErrors = () => ignoreCertificateErrors;
export const setChromiumIgnoreCertificateErrors = (should: boolean) => {
	ignoreCertificateErrors = should;
};

export const getChromiumOpenGlRenderer = () => openGlRenderer;
export const setChromiumOpenGlRenderer = (renderer: OpenGlRenderer) => {
	RenderInternals.validateOpenGlRenderer(renderer);
	openGlRenderer = renderer;
};

export const getChromiumHeadlessMode = () => headlessMode;
export const setChromiumHeadlessMode = (should: boolean) => {
	headlessMode = should;
};

export const getChromiumEnableExtensions = () => enableExtensions;
export const setChromiumEnableExtensions = (should: boolean) => {
	enableExtensions = should;
};
