import type {NodeWrapper} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {isHtmlInCanvasSupported, useVideoConfig} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../../helpers/install-required-package';
import {CaretDown} from '../../icons/caret';
import {WrapIcon} from '../../icons/wrap';
import {SetSelectedModalContext} from '../../state/modals';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {SegmentedButton, type SegmentedButtonSegment} from '../SegmentedButton';
import {wrapNode} from '../wrap-node-api';
import {
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';

const wrapperNames: NodeWrapper[] = [
	'AbsoluteFill',
	'Sequence',
	'HtmlInCanvas',
	'HtmlInCanvasMotionBlur',
];

const buttonStyle: React.CSSProperties = {
	borderRadius: 4,
	height: 28,
	margin: '0 4px',
	width: 'calc(100% - 8px)',
};

const segmentStyle: React.CSSProperties = {
	fontSize: 13,
	gap: 8,
	justifyContent: 'flex-start',
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING - 4}px`,
	width: '100%',
};

const labelStyle: React.CSSProperties = {
	flex: 1,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

const caretStyle: React.CSSProperties = {
	display: 'flex',
	flexShrink: 0,
	height: 12,
	width: 12,
};

export const SequenceWrapAction: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TimelineTrackData['sequence'];
	readonly sourceActionsDisabled: boolean;
	readonly sourceLocation: {
		readonly source: string;
		readonly line: number;
	};
}> = ({nodePathInfo, sequence, sourceActionsDisabled, sourceLocation}) => {
	const {width, height} = useVideoConfig();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const nodePathKey = JSON.stringify(nodePathInfo.sequenceSubscriptionKey);
	const [busy, setBusy] = useState(false);

	const onWrap = useCallback(
		async (wrapper: NodeWrapper) => {
			if (busy || sourceActionsDisabled) {
				return;
			}

			setBusy(true);
			const nodePath = JSON.parse(
				nodePathKey,
			) as SequenceNodePathInfo['sequenceSubscriptionKey'];
			try {
				const eligibility = await wrapNode({
					fileName: nodePath.absolutePath,
					nodePath: nodePath.nodePath,
					wrapper: null,
					width: null,
					height: null,
				});
				if (!eligibility.success) {
					showNotification(eligibility.reason, 4000);
					return;
				}

				if (
					!eligibility.canWrap ||
					((wrapper === 'HtmlInCanvas' ||
						wrapper === 'HtmlInCanvasMotionBlur') &&
						!eligibility.canWrapHtmlInCanvas)
				) {
					setSelectedModal({
						type: 'wrap-refactor',
						displayName:
							sequence.displayName || sequence.controls?.componentName || null,
						location: sourceLocation,
						wrapper,
					});
					return;
				}

				if (wrapper === 'HtmlInCanvasMotionBlur') {
					await installRequiredPackages([
						{name: '@remotion/motion-blur', version: null},
					]);
				}

				const result = await wrapNode({
					fileName: nodePath.absolutePath,
					nodePath: nodePath.nodePath,
					wrapper,
					width,
					height,
				});
				if (!result.success) {
					showNotification(result.reason, 4000);
				}
			} catch (error) {
				showNotification((error as Error).message, 4000);
			} finally {
				setBusy(false);
			}
		},
		[
			busy,
			height,
			nodePathKey,
			sequence.controls?.componentName,
			sequence.displayName,
			setSelectedModal,
			sourceActionsDisabled,
			sourceLocation,
			width,
		],
	);

	const values = useMemo<ComboboxValue[]>(
		() =>
			wrapperNames.map((wrapper) => ({
				type: 'item',
				id: wrapper,
				label: `<${wrapper}>`,
				value: wrapper,
				onClick: () => onWrap(wrapper),
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
				disabled:
					busy ||
					((wrapper === 'HtmlInCanvas' ||
						wrapper === 'HtmlInCanvasMotionBlur') &&
						!isHtmlInCanvasSupported()),
			})),
		[busy, onWrap],
	);

	const segments = useMemo<SegmentedButtonSegment[]>(
		() => [
			{
				ariaLabel:
					nodePathInfo.numberOfSequencesWithThisNodePath > 1
						? `Wrap all ${nodePathInfo.numberOfSequencesWithThisNodePath} instances of this JSX element`
						: 'Wrap this JSX element',
				buttonId: null,
				disabled: busy || sourceActionsDisabled,
				idleColor: LIGHT_TEXT,
				leaveLeftSpace: false,
				onOpenChange: null,
				renderContent: (color) => (
					<>
						<span style={largeInspectorActionIconContainerStyle}>
							<WrapIcon color={color} style={largeInspectorActionIconStyle} />
						</span>
						<span style={labelStyle}>Wrap</span>
						<span style={caretStyle}>
							<CaretDown color={color} />
						</span>
					</>
				),
				segmentId: 'wrap',
				selectedId: null,
				style: segmentStyle,
				tooltipLabel: null,
				type: 'menu',
				values,
			},
		],
		[
			busy,
			nodePathInfo.numberOfSequencesWithThisNodePath,
			sourceActionsDisabled,
			values,
		],
	);

	return <SegmentedButton segments={segments} style={buttonStyle} />;
};
