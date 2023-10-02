const MAX_PRESIGN_EXPIRATION = 604800;
const MIN_PRESIGN_EXPIRATION = 1;

export const validatePresignExpiration = (presignExpiration: unknown) => {
	if (typeof presignExpiration === 'undefined' || presignExpiration === null) {
		return;
	}

	if (typeof presignExpiration !== 'number') {
		throw new TypeError(
			`'expiresIn' should be a number, but is ${JSON.stringify(
				presignExpiration,
			)}`,
		);
	}

	if (Number.isNaN(presignExpiration)) {
		throw new TypeError(`'expiresIn' should not be NaN, but is NaN`);
	}

	if (!Number.isFinite(presignExpiration)) {
		throw new TypeError(
			`'expiresIn' should be finite but is ${presignExpiration}`,
		);
	}

	if (presignExpiration % 1 !== 0) {
		throw new TypeError(
			`'expiresIn' should be an integer but is ${JSON.stringify(
				presignExpiration,
			)}`,
		);
	}

	if (presignExpiration > MAX_PRESIGN_EXPIRATION) {
		throw new TypeError(
			`The 'expiresIn' parameter must be less or equal than ${MAX_PRESIGN_EXPIRATION} (7 days) as enforced by AWS`,
		);
	}

	if (presignExpiration < MIN_PRESIGN_EXPIRATION) {
		throw new TypeError(
			`The 'expiresIn' parameter must be greater or equal than ${MIN_PRESIGN_EXPIRATION}`,
		);
	}
};
