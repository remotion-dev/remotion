/**
 * Test composition using zod v4 schema.
 * Verifies that the studio schema editor works with zod v4.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod/v4';

export const zodV4Schema = z.object({
	greeting: z.string().default('Hello from Zod v4!'),
	count: z.number().min(0).max(100),
	enabled: z.boolean(),
	items: z.array(z.object({label: z.string(), value: z.number()})),
	mode: z.enum(['light', 'dark']),
	optional: z.string().optional(),
	nested: z.object({
		a: z.string(),
		b: z.number(),
	}),
});

export const ZodV4SchemaTest: React.FC<z.infer<typeof zodV4Schema>> = ({
	greeting,
	count,
	enabled,
	items,
	mode,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 40,
				backgroundColor: mode === 'dark' ? '#222' : '#fff',
				color: mode === 'dark' ? '#fff' : '#222',
				flexDirection: 'column',
			}}
		>
			<div>{greeting}</div>
			<div style={{fontSize: 24, marginTop: 10}}>
				Count: {count} | Enabled: {String(enabled)}
			</div>
			<ul style={{fontSize: 20, listStyle: 'none', padding: 0}}>
				{items.map((item) => (
					<li key={item.label}>
						{item.label}: {item.value}
					</li>
				))}
			</ul>
		</AbsoluteFill>
	);
};
