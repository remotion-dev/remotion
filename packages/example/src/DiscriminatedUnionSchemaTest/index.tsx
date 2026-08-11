import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

export const discriminatedUnionRootSchema = z.discriminatedUnion('preset', [
	z.object({
		preset: z.literal('Simple'),
		track: z.string(),
		fontSize: z.number().default(48),
	}),
	z.object({
		preset: z.literal('Fancy'),
		track: z.string(),
		fontSize: z.number().default(48),
		outline: z.boolean().default(false),
	}),
]);

export const DiscriminatedUnionSchemaTest: React.FC<
	z.infer<typeof discriminatedUnionRootSchema>
> = (props) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: props.fontSize,
				background: '#222',
				color: '#fff',
			}}
		>
			<div>
				<div>Preset: {props.preset}</div>
				<div>Track: {props.track}</div>
				{props.preset === 'Fancy' && (
					<div>Outline: {String(props.outline)}</div>
				)}
			</div>
		</AbsoluteFill>
	);
};
