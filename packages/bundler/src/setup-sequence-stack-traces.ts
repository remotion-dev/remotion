import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

type ReactRefreshRuntime = {
	getFamilyByType: (component: unknown) => unknown;
};

const originalCreateElement = React.createElement;
const originalJsx = JsxRuntime.jsx;
const originalJsxs = JsxRuntime.jsxs;
const originalJsxDev = JsxRuntimeDev.jsxDEV;

const getSourceFileName = (fileName: string) => {
	if (typeof window === 'undefined' || !window.remotion_cwd) {
		return fileName;
	}

	const normalizedFileName = fileName.replaceAll('\\', '/');
	const normalizedRoot = window.remotion_cwd
		.replaceAll('\\', '/')
		.replace(/\/+$/, '');
	const shouldCompareCaseInsensitive =
		/^[a-z]:\//i.test(normalizedFileName) || /^[a-z]:\//i.test(normalizedRoot);
	const comparableFileName = shouldCompareCaseInsensitive
		? normalizedFileName.toLowerCase()
		: normalizedFileName;
	const comparableRoot = shouldCompareCaseInsensitive
		? normalizedRoot.toLowerCase()
		: normalizedRoot;

	if (!comparableFileName.startsWith(`${comparableRoot}/`)) {
		return normalizedFileName;
	}

	return `./${normalizedFileName.slice(normalizedRoot.length + 1)}`;
};

let stackTracesEnabled = false;

const enableSequenceStackTraces = () => {
	if (stackTracesEnabled) {
		return;
	}

	stackTracesEnabled = true;
	React.createElement = Internals.createElementSourceProxy(
		originalCreateElement,
		null,
		getSourceFileName,
	);
	JsxRuntime.jsx = Internals.createElementSourceProxy(
		originalJsx,
		null,
		getSourceFileName,
	);
	JsxRuntime.jsxs = Internals.createElementSourceProxy(
		originalJsxs,
		null,
		getSourceFileName,
	);
	if (originalJsxDev) {
		JsxRuntimeDev.jsxDEV = Internals.createElementSourceProxy(
			originalJsxDev,
			4,
			getSourceFileName,
		);
	}
};

if (typeof window !== 'undefined') {
	window.remotion_enableSequenceStackTraces = enableSequenceStackTraces;
}

if (process.env.NODE_ENV !== 'production') {
	const RefreshRuntime =
		require('react-refresh/runtime') as ReactRefreshRuntime;
	Internals.setComponentIdentityResolver((component) => {
		return RefreshRuntime.getFamilyByType(component) ?? component;
	});
	enableSequenceStackTraces();
}
