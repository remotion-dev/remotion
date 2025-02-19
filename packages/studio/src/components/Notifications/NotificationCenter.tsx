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
	backgroundColor: 'transparent',
};

type TNotification = {
	id: string;
	content: React.ReactNode;
	created: number;
	duration: number | null;
};

type CreatedNotification = {
	replaceContent: (
		newContent: React.ReactNode,
		durationInMs: number | null,
	) => void;
};

type TNotificationCenter = {
	addNotification: (notification: TNotification) => CreatedNotification;
};

const notificationCenter = createRef<TNotificationCenter>();

export const showNotification = (
	content: React.ReactNode,
	durationInMs: number | null,
) => {
	return (notificationCenter.current as TNotificationCenter).addNotification({
		content,
		duration: durationInMs,
		created: Date.now(),
		id: String(Math.random()).replace('0.', ''),
	});
};

export const NotificationCenter: React.FC = () => {
	const [notifications, setNotifications] = useState<TNotification[]>([]);

	const onRemove = useCallback((id: string) => {
		setNotifications((not) => {
			return not.filter((n) => n.id !== id);
		});
	}, []);

	const addNotification = useCallback(
		(notification: TNotification): CreatedNotification => {
			setNotifications((previousNotifications) => {
				return [...previousNotifications, notification];
			});

			return {
				replaceContent: (
					newContent: React.ReactNode,
					durationInMs: number | null,
				) => {
					setNotifications((oldNotifications) => {
						return oldNotifications.map((notificationToMap) => {
							if (notificationToMap.id === notification.id) {
								return {
									...notificationToMap,
									duration: durationInMs,
									content: newContent,
									created: Date.now(),
								};
							}

							return notificationToMap;
						});
					});
				},
			};
		},
		[],
	);

	useImperativeHandle(notificationCenter, () => {
		return {
			addNotification,
		};
	}, [addNotification]);

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
