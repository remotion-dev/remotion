const toSeconds = (time: number, fps: number) => {
	return Math.round((time / fps) * 100) / 100;
};

export const appendVideoFragment = ({
	actualSrc,
	actualFrom,
	duration,
	fps,
}: {
	actualSrc: string;
	actualFrom: number;
	duration: number;
	fps: number;
}): string => {
	if (actualSrc.startsWith('data:')) {
		return actualSrc;
	}

	const existingHash = Boolean(
		new URL(actualSrc, window.location.href ?? 'http://localhost:3000').hash
	);

	if (existingHash) {
		return actualSrc;
	}

	if (!Number.isFinite(actualFrom)) {
		return actualSrc;
	}

	actualSrc += `#t=${toSeconds(-actualFrom, fps)}`;

	if (!Number.isFinite(duration)) {
		return actualSrc;
	}

	actualSrc += `,${toSeconds(duration, fps)}`;

	return actualSrc;
};
