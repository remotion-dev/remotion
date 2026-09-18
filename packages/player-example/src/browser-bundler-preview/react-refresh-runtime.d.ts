declare module 'react-refresh/runtime' {
	const runtime: {
		injectIntoGlobalHook: (globalObject: typeof globalThis) => void;
	};
	export = runtime;
}
