import type {JsxWrapper} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {isHtmlInCanvasSupported, useVideoConfig} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {CaretDown} from '../../icons/caret';
import {WrapIcon} from '../../icons/wrap';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {SegmentedButton, type SegmentedButtonSegment} from '../SegmentedButton';
import {wrapJsxNode} from '../wrap-jsx-node-api';

const wrapperNames: JsxWrapper[] = ['AbsoluteFill', 'Sequence', 'HtmlInCanvas'];

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

const iconStyle: React.CSSProperties = {height: 22, width: 22};

const iconContainerStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 22,
	marginLeft: -2,
	marginRight: -2,
	width: 22,
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
}> = ({nodePathInfo, sequence, sourceActionsDisabled}) => {
	const {width, height} = useVideoConfig();
	const nodePathKey = JSON.stringify(nodePathInfo.sequenceSubscriptionKey);
	const [eligibility, setEligibility] = useState<{
		canWrap: boolean;
		canWrapHtmlInCanvas: boolean;
	} | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		setEligibility(null);
		if (sourceActionsDisabled) {
			return;
		}

		let cancelled = false;
		const nodePath = JSON.parse(
			nodePathKey,
		) as SequenceNodePathInfo['sequenceSubscriptionKey'];
		wrapJsxNode({
			fileName: nodePath.absolutePath,
			nodePath: nodePath.nodePath,
			wrapper: null,
			width: null,
			height: null,
		})
			.then((result) => {
				if (!cancelled && result.success) {
					setEligibility({
						canWrap: result.canWrap,
						canWrapHtmlInCanvas: result.canWrapHtmlInCanvas,
					});
				}
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [nodePathKey, sequence, sourceActionsDisabled]);

	const onWrap = useCallback(
		(wrapper: JsxWrapper) => {
			if (busy || sourceActionsDisabled || !eligibility?.canWrap) {
				return;
			}

			setBusy(true);
			const nodePath = JSON.parse(
				nodePathKey,
			) as SequenceNodePathInfo['sequenceSubscriptionKey'];
			wrapJsxNode({
				fileName: nodePath.absolutePath,
				nodePath: nodePath.nodePath,
				wrapper,
				width,
				height,
			})
				.then((result) => {
					if (!result.success) {
						showNotification(result.reason, 4000);
					}
				})
				.catch((error) => {
					showNotification((error as Error).message, 4000);
				})
				.finally(() => setBusy(false));
		},
		[busy, eligibility, height, nodePathKey, sourceActionsDisabled, width],
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
					(wrapper === 'HtmlInCanvas' &&
						(!eligibility?.canWrapHtmlInCanvas || !isHtmlInCanvasSupported())),
			})),
		[busy, eligibility, onWrap],
	);

	const segments = useMemo<SegmentedButtonSegment[]>(
		() => [
			{
				ariaLabel: 'Wrap',
				buttonId: null,
				disabled: busy,
				idleColor: LIGHT_TEXT,
				leaveLeftSpace: false,
				onOpenChange: null,
				renderContent: (color) => (
					<>
						<span style={iconContainerStyle}>
							<WrapIcon color={color} style={iconStyle} />
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
				title:
					nodePathInfo.numberOfSequencesWithThisNodePath > 1
						? `Wrap all ${nodePathInfo.numberOfSequencesWithThisNodePath} instances of this JSX element`
						: 'Wrap this JSX element',
				tooltipLabel: null,
				type: 'menu',
				values,
			},
		],
		[busy, nodePathInfo.numberOfSequencesWithThisNodePath, values],
	);

	if (!eligibility?.canWrap || sourceActionsDisabled) {
		return null;
	}

	return (
		<SegmentedButton segments={segments} style={buttonStyle} title={null} />
	);
};
