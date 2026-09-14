declare module 'react-refresh/runtime' {
	type ReactRefreshRuntime = {
		createSignatureFunctionForTransform: (...args: unknown[]) => unknown;
		getFamilyByType: (type: unknown) => unknown;
		injectIntoGlobalHook: (globalObject: typeof globalThis) => void;
		register: (type: unknown, id: string) => void;
	};

	const runtime: ReactRefreshRuntime;
	export = runtime;
}
