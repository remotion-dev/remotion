import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import type {TCompMetadata} from 'remotion';
import {getDefaultOutLocation} from '../../get-default-out-name';
import {RenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {InlineAction} from './InlineAction';

export const RenderButton: React.FC<{
	composition: TCompMetadata;
	visible: boolean;
}> = ({composition, visible}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 12,
			},
		};
	}, []);

	const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			e.stopPropagation();
			setSelectedModal({
				type: 'render',
				compositionId: composition.id,
				initialFrame: 0,
				initialImageFormat: 'png',
				// TODO: Determine defaults from config file
				initialQuality: 80,
				initialScale: 1,
				initialVerbose: false,
				initialOutName: getDefaultOutLocation({
					compositionName: composition.id,
					defaultExtension: 'png',
				}),
			});
		},
		[composition, setSelectedModal]
	);

	if (!visible) {
		return null;
	}

	return (
		<InlineAction onClick={onClick}>
			<RenderIcon svgProps={iconStyle} />
		</InlineAction>
	);
};
