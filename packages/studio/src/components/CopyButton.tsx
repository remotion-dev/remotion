import React, {useCallback, useEffect, useState} from 'react';
import {copyText} from '../helpers/copy-text';
import {Button} from './Button';
import {showNotification} from './Notifications/NotificationCenter';
import {Spacing} from './layout';

const iconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	color: 'white',
};

const buttonContainerStyle: React.CSSProperties = {
	display: 'flex',
	minWidth: '114px',
};

const copyIcon = (
	<svg
		aria-hidden="true"
		focusable="false"
		data-prefix="far"
		data-icon="clipboard"
		className="svg-inline--fa fa-clipboard fa-w-12"
		role="img"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 384 512"
		style={iconStyle}
	>
		<path
			fill="currentColor"
			d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm144 418c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V118c0-3.3 2.7-6 6-6h42v36c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12v-36h42c3.3 0 6 2.7 6 6z"
		/>
	</svg>
);

const labelStyle: React.CSSProperties = {
	fontSize: 14,
};

export const CopyButton: React.FC<{
	readonly textToCopy: string;
	readonly label: string;
	readonly labelWhenCopied: string;
}> = ({textToCopy, label, labelWhenCopied}) => {
	const [copied, setCopied] = useState<false | number>(false);

	const onClick = useCallback(() => {
		copyText(textToCopy)
			.then(() => {
				setCopied(Date.now());
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [textToCopy]);

	useEffect(() => {
		if (!copied) {
			return;
		}

		const to = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(to);
	}, [copied]);

	return (
		<Button onClick={onClick} buttonContainerStyle={buttonContainerStyle}>
			{copyIcon}
			<Spacing x={1.5} />{' '}
			<span style={labelStyle}>{copied ? labelWhenCopied : label}</span>
		</Button>
	);
};
