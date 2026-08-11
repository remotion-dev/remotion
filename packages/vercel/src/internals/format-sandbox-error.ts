import {APIError} from '@vercel/sandbox';

export const formatSandboxError = (error: unknown): string => {
	if (error instanceof APIError) {
		const parts = [error.message];
		if (error.json !== undefined) {
			parts.push(`Response JSON: ${JSON.stringify(error.json)}`);
		} else if (error.text) {
			parts.push(`Response body: ${error.text}`);
		}

		return parts.join('\n');
	}

	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
};

export const rethrowSandboxError = ({
	error,
	operation,
	sandboxPath,
}: {
	error: unknown;
	operation: string;
	sandboxPath?: string;
}): never => {
	const pathSuffix = sandboxPath ? ` at "${sandboxPath}"` : '';
	throw new Error(
		`Failed to ${operation} in Vercel sandbox${pathSuffix}: ${formatSandboxError(error)}`,
		{cause: error instanceof Error ? error : undefined},
	);
};
