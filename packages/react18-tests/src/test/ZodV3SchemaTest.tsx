/**
 * Test composition using zod v3 schema (via zod/v3 import).
 * Verifies that the studio schema editor works with zod v3 schemas.
 */
import {zMatrix} from '@remotion/zod-types-v3';
import React from 'react';
import {z} from 'zod';

export const zodV3Schema = z.object({
	title: z.string(),
	count: z.number().min(0).max(100),
	enabled: zMatrix(),
	tags: z.array(z.string()),
	level: z.enum(['beginner', 'intermediate', 'advanced']),
});

export const ZodV3SchemaTest: React.FC<z.infer<typeof zodV3Schema>> = ({
	title,
	count,
	enabled,
	tags,
	level,
}) => {
	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 40,
				backgroundColor: '#1a1a2e',
				color: '#eee',
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
			}}
		>
			<div>{title}</div>
			<div style={{fontSize: 24, marginTop: 10}}>
				Count: {count} | Enabled: {String(enabled)} | Level: {level}
			</div>
			<div style={{fontSize: 20, marginTop: 10}}>Tags: {tags.join(', ')}</div>
		</div>
	);
};
