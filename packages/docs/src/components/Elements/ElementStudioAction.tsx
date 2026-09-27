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
	readonly showDragCallout: boolean;
	readonly showDragHandle: boolean;
	readonly title: string;
}> = ({
	buttonLabel,
	loading,
	onClick,
	payload,
	posterRef,
	showDragCallout,
	showDragHandle,
	title,
}) => {
	const hasDragCallout = showDragHandle && showDragCallout;
	const onDragStart = (event: React.DragEvent<HTMLElement>) => {
		setStudioDragData({
			dataTransfer: event.dataTransfer,
			payload,
		});
		setElementDragImage(event.dataTransfer, posterRef.current);
	};

	return (
		<div
			className={`${styles.studioAction} ${hasDragCallout ? styles.studioActionWithCallout : ''}`}
		>
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
			{hasDragCallout ? (
				<div aria-hidden="true" className={styles.dragCallout}>
					<svg
						className={styles.dragCalloutLine}
						fill="none"
						viewBox="0 0 77 160"
					>
						<path
							d="M5 154.5C51 121 79 81 69 5"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="8"
						/>
					</svg>
					<span className={styles.dragCalloutLabel}>Drag into Studio</span>
				</div>
			) : null}
		</div>
	);
};
