import React, {useEffect, useState} from 'react';
import {AbsoluteFill} from 'remotion';

const label: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
};

const container: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
	textAlign: 'center',
	lineHeight: 1.5,
};

const link: React.CSSProperties = {
	color: 'white',
	textDecoration: 'none',
	borderBottom: '1px solid',
};

export const NoRegisterRoot: React.FC = () => {
	const [show, setShow] = useState(() => false);

	useEffect(() => {
		// Only show after 2 seconds so there is no flicker when the load is really fast
		const timeout = setTimeout(() => {
			setShow(true);
		}, 2000);

		return () => {
			clearTimeout(timeout);
		};
	}, []);

	if (!show) {
		return null;
	}

	return (
		<AbsoluteFill style={container}>
			<div style={label}>Waiting for registerRoot() to get called.</div>
			<div style={label}>
				Learn more:{' '}
				<a
					target={'_blank'}
					style={link}
					href="https://www.remotion.dev/docs/register-root"
				>
					remotion.dev/docs/register-root
				</a>
			</div>
		</AbsoluteFill>
	);
};
