const endpointEnvName = 'REMOTION_REACT_SCAN_ENDPOINT';
const entryPointEnvName = 'REMOTION_REACT_SCAN_ENTRY_POINT';
const sessionIdEnvName = 'REMOTION_REACT_SCAN_SESSION_ID';

export const getReactScanEntryPoint = (
	environment: 'development' | 'production',
) => {
	if (environment === 'production') {
		return null;
	}

	const endpoint = process.env[endpointEnvName];
	const entryPoint = process.env[entryPointEnvName];
	const sessionId = process.env[sessionIdEnvName];

	if (!endpoint && !entryPoint && !sessionId) {
		return null;
	}

	if (!endpoint || !entryPoint || !sessionId) {
		throw new Error(
			`${endpointEnvName}, ${entryPointEnvName}, and ${sessionIdEnvName} must be set together`,
		);
	}

	return entryPoint;
};
