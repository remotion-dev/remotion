import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import type {TCompMetadata} from 'remotion';
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
				composition,
				initialFrame: 0,
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
