import React from 'react';

export const BackButton: React.FC<{
	readonly color: string;
	readonly text: string;
	readonly link: string;
}> = ({color, text, link}) => {
	const backLink: React.CSSProperties = {
		color,
		fontFamily: 'GTPlanar',
		fontWeight: 500,
		display: 'inline-flex',
		justifyContent: 'center',
		alignItems: 'center',
	};

	const backIcon: React.CSSProperties = {
		height: 20,
		color,
		marginRight: 15,
		display: 'inline-block',
	};
	return (
		<a style={backLink} href={link}>
			<svg
				style={backIcon}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 448 512"
			>
				<path
					fill="currentcolor"
					d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
				/>
			</svg>{' '}
			{text}
		</a>
	);
};
