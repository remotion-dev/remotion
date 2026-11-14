export type PendingFontWake = {
	check: (() => void) | null;
	failure: {error: unknown} | null;
};

const wakePendingFont = (token: PendingFontWake) => token.check?.();

const rejectPendingFont = (token: PendingFontWake, error: unknown) => {
	if (token.check === null) return;
	token.failure = {error};
	token.check();
};

export const observePendingFont = (
	completion: Promise<void>,
	token: PendingFontWake,
) => {
	// Promise reactions cannot be unsubscribed. Bind only the detachable token,
	// so clearing check releases the capture even if the SDK load never settles.
	completion.then(
		wakePendingFont.bind(null, token),
		rejectPendingFont.bind(null, token),
	);
};
