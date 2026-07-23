import React, {useEffect} from 'react';
import {
	NOTIFICATION_BACKGROUND,
	NOTIFICATION_BORDER,
	NOTIFICATION_SHADOW,
	WHITE_HEX,
} from '../../helpers/colors';

const notification: React.CSSProperties = {
	backgroundColor: NOTIFICATION_BACKGROUND,
	color: WHITE_HEX,
	fontFamily: 'Arial, Helvetica, sans-serif',
	display: 'inline-flex',
	padding: '6px 14px',
	borderRadius: 6,
	fontSize: 13,
	border: NOTIFICATION_BORDER,
	boxShadow: NOTIFICATION_SHADOW,
	marginTop: 3,
	marginBottom: 3,
	alignItems: 'center',
};

export const Notification: React.FC<{
	readonly children: React.ReactNode;
	readonly created: number;
	readonly duration: number | null;
	readonly id: string;
	readonly onRemove: (id: string) => void;
}> = ({children, id, duration, created, onRemove}) => {
	useEffect(() => {
		if (duration === null) {
			return;
		}

		const timeout = setTimeout(
			() => {
				onRemove(id);
			},
			duration - (Date.now() - created),
		);

		return () => {
			clearTimeout(timeout);
		};
	}, [created, duration, id, onRemove]);

	return (
		<div className="css-reset" style={notification}>
			{children}
		</div>
	);
};
