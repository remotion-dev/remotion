import React, {useCallback} from 'react';
import {CURRENT_COLOR, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {Button} from './Button';
import {Spacing} from './layout';
import {showNotification} from './Notifications/NotificationCenter';

const iconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	color: WHITE,
};

const buttonContainerStyle: React.CSSProperties = {
	display: 'flex',
	minWidth: '114px',
};

const labelStyle: React.CSSProperties = {
	fontSize: 14,
};

export const CopyButton: React.FC<{
	readonly textToCopy: string;
	readonly label: string;
	readonly labelWhenCopied: string;
}> = ({textToCopy, label, labelWhenCopied}) => {
	const {copied, markCopied} = useCopyFeedback();

	const onClick = useCallback(() => {
		copyText(textToCopy)
			.then(markCopied)
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [markCopied, textToCopy]);

	return (
		<Button onClick={onClick} buttonContainerStyle={buttonContainerStyle}>
			<CopyIcon copied={copied} color={CURRENT_COLOR} style={iconStyle} />
			<Spacing x={1.5} />{' '}
			<span style={labelStyle}>{copied ? labelWhenCopied : label}</span>
		</Button>
	);
};
