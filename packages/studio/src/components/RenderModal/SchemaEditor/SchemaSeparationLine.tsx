import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'zod';
import {BACKGROUND, LIGHT_TEXT, LINE_COLOR} from '../../../helpers/colors';
import {Plus} from '../../../icons/plus';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {fieldSetText} from '../layout';
import {createZodValues} from './create-zod-values';

export const VERTICAL_GUIDE_HEIGHT = 24;

const line: React.CSSProperties = {
	borderBottom: '1px solid ' + LINE_COLOR,
};

export const SchemaSeparationLine: React.FC = () => {
	return <div style={line} />;
};

const arraySeparationLine: React.CSSProperties = {
	borderBottom: '1px solid ' + LINE_COLOR,
	marginTop: -VERTICAL_GUIDE_HEIGHT / 2,
	pointerEvents: 'none',
	width: '100%',
	flexBasis: '100%',
};

export const SchemaArrayItemSeparationLine: React.FC<{
	readonly onChange: (
		updater: (oldV: unknown[]) => unknown[],
		forceApply: boolean,
		increment: boolean,
	) => void;
	readonly index: number;
	readonly schema: z.ZodTypeAny;
	readonly showAddButton: boolean;
	readonly isLast: boolean;
}> = ({onChange, index, schema, isLast, showAddButton}) => {
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
			height: VERTICAL_GUIDE_HEIGHT,
			opacity: outerHovered || isLast ? 1 : 0,
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
		};
	}, [isLast, outerHovered]);

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
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				height: VERTICAL_GUIDE_HEIGHT,
			}}
		>
			<div
				style={{
					flex: 1,
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
				}}
			>
				{showAddButton && (
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
								style={{height: VERTICAL_GUIDE_HEIGHT / 2}}
							/>
						</div>
					</div>
				)}
				<div style={arraySeparationLine} />
			</div>
			{isLast ? (
				<>
					<Spacing x={1} />
					<div
						style={{
							...fieldSetText,
							alignItems: 'center',
							display: 'flex',
						}}
					>
						{']'}
					</div>
				</>
			) : null}
		</div>
	);
};
