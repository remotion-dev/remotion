import React, {
	createRef,
	useCallback,
	useImperativeHandle,
	useState,
} from 'react';
import {Notification} from './Notification';

const container: React.CSSProperties = {
	position: 'absolute',
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
	width: '100%',
	flexDirection: 'column',
	paddingTop: 20,
	pointerEvents: 'none',
};

type TNotification = {
	id: string;
	content: React.ReactNode;
	created: number;
	duration: number;
};

type TNotificationCenter = {
	addNotification: (notification: TNotification) => void;
};

export const notificationCenter = createRef<TNotificationCenter>();

export const NotificationCenter: React.FC = () => {
	const [notifications, setNotifications] = useState<TNotification[]>([]);

	const onRemove = useCallback((id: string) => {
		setNotifications((not) => {
			return not.filter((n) => n.id !== id);
		});
	}, []);

	const addNotification = useCallback((notification: TNotification) => {
		setNotifications((previousNotifications) => {
			return [...previousNotifications, notification];
		});
	}, []);

	useImperativeHandle(notificationCenter, () => {
		return {
			addNotification,
		};
	});

	return (
		<div style={container}>
			{notifications.map((n) => {
				return (
					<Notification
						key={n.id}
						created={n.created}
						duration={n.duration}
						id={n.id}
						onRemove={onRemove}
					>
						{n.content}
					</Notification>
				);
			})}
		</div>
	);
};
