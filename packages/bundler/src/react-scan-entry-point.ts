const entryPointEnvName = 'REMOTION_REACT_SCAN_ENTRY_POINT';

export const getReactScanEntryPoint = (
	environment: 'development' | 'production',
) => {
	if (environment === 'production') {
		return null;
	}

	const entryPoint = process.env[entryPointEnvName];
	return entryPoint ?? null;
};
