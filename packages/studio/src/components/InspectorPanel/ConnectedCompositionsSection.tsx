import React, {useContext, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {getConnectedCompositions} from '../../helpers/get-connected-compositions';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {noop} from '../../helpers/noop';
import {ModalsContext} from '../../state/modals';
import {getCompositionContextMenuItems} from '../composition-menu-items';
import {CompositionOrStillIcon} from '../CompositionOrStillIcon';
import {ContextMenu} from '../ContextMenu';
import {useSelectComposition} from '../InitialCompositionLoader';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {InspectorInlineAction} from './common';

const compositionIconStyle: React.CSSProperties = {
	height: 18,
	width: 18,
};

const compositionListStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	padding: '6px 0',
};

const compositionContextMenuStyle: React.CSSProperties = {
	width: '100%',
};

export const useConnectedCompositions = ({
	track,
}: {
	readonly track: TrackWithHash;
}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	return useMemo(
		() =>
			getConnectedCompositions({
				compositions,
				singleChildComponent: track.sequence.singleChildComponent,
			}),
		[compositions, track.sequence.singleChildComponent],
	);
};

export const ConnectedCompositionsSection: React.FC<{
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
}> = ({connectedCompositions}) => {
	return (
		<div style={compositionListStyle}>
			{connectedCompositions.map((composition) => (
				<ConnectedCompositionRow
					key={composition.id}
					composition={composition}
				/>
			))}
		</div>
	);
};

const ConnectedCompositionRow: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'];
}> = ({composition}) => {
	const selectComposition = useSelectComposition();
	const {setSelectedModal} = useContext(ModalsContext);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const resolvedLocation = useResolvedStack(composition.stack);
	const contextMenuItems = useMemo(
		() =>
			getCompositionContextMenuItems({
				closeMenu: noop,
				composition,
				connectionStatus,
				includeCompositionManagementItems: false,
				readOnlyStudio: window.remotion_isReadOnlyStudio,
				resolvedLocation,
				setSelectedModal,
			}),
		[composition, connectionStatus, resolvedLocation, setSelectedModal],
	);

	return (
		<ContextMenu
			values={contextMenuItems}
			onOpen={null}
			style={compositionContextMenuStyle}
		>
			<InspectorInlineAction
				disabled={false}
				onClick={() => selectComposition(composition, true)}
				renderIcon={(color) => (
					<CompositionOrStillIcon
						color={color}
						composition={composition}
						style={compositionIconStyle}
					/>
				)}
			>
				{composition.id}
			</InspectorInlineAction>
		</ContextMenu>
	);
};
