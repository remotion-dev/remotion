import {useCallback, useMemo, useState} from 'react';
import {LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {copyText} from '../../helpers/copy-text';
import {useCopyFeedback} from '../../helpers/use-copy-feedback';
import {CopyIcon} from '../../icons/copy';
import {showNotification} from '../Notifications/NotificationCenter';
const svgStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	verticalAlign: 'sub',
};

const buttonStyle: React.CSSProperties = {
	width: '30px',
	height: '30px',
	border: 'none',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

export const CliCopyButton: React.FC<{valueToCopy: string}> = ({
	valueToCopy,
}) => {
	const {copied, markCopied} = useCopyFeedback();
	const [hovered, setHovered] = useState<boolean>(false);

	const fillColor = useMemo(() => {
		return hovered ? WHITE : LIGHT_TEXT;
	}, [hovered]);

	const copyIcon = (
		<CopyIcon copied={copied} color={fillColor} style={svgStyle} />
	);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	return (
		<button
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={buttonStyle}
			onClick={() => {
				copyText(valueToCopy)
					.then(markCopied)
					.catch((err) => {
						showNotification(`Could not copy: ${err.message}`, 2000);
					});
			}}
		>
			{copyIcon}
		</button>
	);
};
