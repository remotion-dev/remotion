import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'zod';
import {BACKGROUND, LIGHT_TEXT} from '../../../helpers/colors';
import {Plus} from '../../../icons/plus';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {createZodValues} from './create-zod-values';

const line: React.CSSProperties = {
	borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

export const SchemaSeparationLine: React.FC = () => {
	return <div style={line} />;
};

const arraySeparationLine: React.CSSProperties = {
	borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
	marginTop: -12,
	pointerEvents: 'none',
	width: '100%',
};

export const SchemaArrayItemSeparationLine: React.FC<{
	onChange: (
		updater: (oldV: unknown[]) => unknown[],
		forceApply: boolean,
		increment: boolean,
	) => void;
	index: number;
	schema: z.ZodTypeAny;
}> = ({onChange, index, schema}) => {
	const [outerHovered, setOuterHovered] = useState(false);
	const [innerHovered, setInnerHovered] = useState(false);

	const zodTypes = useZodTypesIfPossible();
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const def = schema._def as z.ZodArrayDef;

	const onAdd = useCallback(() => {
		onChange(
			(oldV) => {
				return [
					...oldV.slice(0, index + 1),
					createZodValues(def.type, z, zodTypes),
					...oldV.slice(index + 1),
				];
			},
			false,
			true,
		);
	}, [def.type, index, onChange, z, zodTypes]);

	const dynamicAddButtonStyle: React.CSSProperties = useMemo(() => {
		return {
			display: 'flex',
			justifyContent: 'center',
			height: 24,
			opacity: outerHovered ? 1 : 0,
			position: 'relative',
			marginTop: -4,
		};
	}, [outerHovered]);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			background: BACKGROUND,
			paddingLeft: 10,
			paddingRight: 10,
		};
	}, []);

	const onOuterMouseEnter = useCallback(() => {
		setOuterHovered(true);
	}, []);

	const onOuterMouseLeave = useCallback(() => {
		setOuterHovered(false);
	}, []);

	const onInnerMouseEnter = useCallback(() => {
		setInnerHovered(true);
	}, []);

	const onInnerMouseLeave = useCallback(() => {
		setInnerHovered(false);
	}, []);

	return (
		<>
			<div
				style={dynamicAddButtonStyle}
				onMouseEnter={onOuterMouseEnter}
				onMouseLeave={onOuterMouseLeave}
			>
				<div
					onClick={onAdd}
					style={inner}
					onMouseEnter={onInnerMouseEnter}
					onMouseLeave={onInnerMouseLeave}
				>
					<Plus
						color={innerHovered ? 'white' : LIGHT_TEXT}
						style={{height: 12}}
					/>
				</div>
			</div>
			<div style={arraySeparationLine} />
		</>
	);
};
