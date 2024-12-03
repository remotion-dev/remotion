import React from 'react';

export const getHashOfDomain = async (): Promise<string | null> => {
	if (typeof window === 'undefined') {
		return null;
	}

	if (typeof window.crypto === 'undefined') {
		return null;
	}

	if (typeof window.crypto.subtle === 'undefined') {
		return null;
	}

	try {
		const hashBuffer = await crypto.subtle.digest(
			'SHA-256',
			new TextEncoder().encode(window.location.hostname),
		);

		return Array.from(new Uint8Array(hashBuffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	} catch {
		return null;
	}
};

const style: React.CSSProperties = {
	backgroundColor: 'red',
	position: 'absolute',
	padding: 12,
	fontFamily: 'Arial',
};

export const RenderWarningIfBlacklist: React.FC = () => {
	return <div style={style}>Remotion Unlicensed – Contact hi@remotion.dev</div>;
};
