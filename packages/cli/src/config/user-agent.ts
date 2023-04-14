type UserAgent = string | null;

let userAgent: UserAgent = null;

export const setChromiumUserAgent = (newAgent: UserAgent) => {
	userAgent = newAgent;
};

export const getChromiumUserAgent = (): UserAgent => {
	return userAgent;
};
