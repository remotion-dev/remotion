import {
	setStudioDragData,
	type StudioElementPayload,
} from '@remotion/studio-protocol';
import React, {type RefObject} from 'react';
import {BlueButton} from '../../../components/layout/Button';
import {setElementDragImage} from './element-drag-data';
import styles from './ElementStudioAction.module.css';

export const ElementStudioAction: React.FC<{
	readonly buttonLabel: string;
	readonly loading: boolean;
	readonly onClick: () => void;
	readonly payload: StudioElementPayload;
	readonly posterRef: RefObject<HTMLImageElement | null>;
	readonly showDragHandle: boolean;
	readonly title: string;
}> = ({
	buttonLabel,
	loading,
	onClick,
	payload,
	posterRef,
	showDragHandle,
	title,
}) => {
	const onDragStart = (event: React.DragEvent<HTMLElement>) => {
		setStudioDragData({
			dataTransfer: event.dataTransfer,
			payload,
		});
		setElementDragImage(event.dataTransfer, posterRef.current);
	};

	return (
		<div className={styles.studioAction}>
			<BlueButton
				className={showDragHandle ? styles.buttonWithDragHandle : undefined}
				draggable={showDragHandle}
				fullWidth
				loading={loading}
				onClick={onClick}
				onDragStart={showDragHandle ? onDragStart : undefined}
				size="sm"
				style={{padding: '7px 12px'}}
				title={title}
			>
				{buttonLabel}
			</BlueButton>
			{showDragHandle ? (
				<div
					aria-label="Drag into Studio"
					className={styles.dragHandle}
					data-tooltip="Drag into Studio"
					draggable
					onDragStart={onDragStart}
				>
					<span aria-hidden="true" className={styles.dragHandleIcon}>
						⠿
					</span>
				</div>
			) : null}
		</div>
	);
};
