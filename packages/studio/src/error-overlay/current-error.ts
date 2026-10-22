import type {ErrorRecord} from './react-overlay/listen-to-runtime-errors';

type CurrentError = {
	readonly error: Error;
	readonly symbolication: Promise<ErrorRecord | null>;
};

declare global {
	interface Window {
		remotion_currentErrors: CurrentError[] | undefined;
	}
}

export const registerCurrentError = (error: CurrentError) => {
	window.remotion_currentErrors = [
		...(window.remotion_currentErrors ?? []),
		error,
	];

	return () => {
		window.remotion_currentErrors = window.remotion_currentErrors?.filter(
			(candidate) => candidate !== error,
		);
	};
};

export const getCurrentError = (): CurrentError | null => {
	return window.remotion_currentErrors?.[0] ?? null;
};
