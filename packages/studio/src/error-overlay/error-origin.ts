const errorsLoggedByServer = new WeakSet<object>();
const errorMessagesLoggedByServer = new Set<string>();
const maxLoggedErrorMessages = 100;

const rememberServerLoggedMessage = (message: string) => {
	if (errorMessagesLoggedByServer.size >= maxLoggedErrorMessages) {
		errorMessagesLoggedByServer.clear();
	}

	errorMessagesLoggedByServer.add(message);
};

export const markErrorAsLoggedByServer = (error: object) => {
	errorsLoggedByServer.add(error);
};

export const markErrorMessageAsLoggedByServer = (message: string) => {
	if (message.trim() === '') {
		return;
	}

	rememberServerLoggedMessage(message);
};

export const wasErrorLoggedByServer = (error: Error) => {
	if (errorsLoggedByServer.has(error)) {
		return true;
	}

	const message = typeof error.message === 'string' ? error.message : null;
	const stack = typeof error.stack === 'string' ? error.stack : null;

	if (message && errorMessagesLoggedByServer.has(message)) {
		return true;
	}

	if (stack) {
		for (const serverLoggedMessage of errorMessagesLoggedByServer) {
			if (stack.includes(serverLoggedMessage)) {
				return true;
			}
		}
	}

	return false;
};
