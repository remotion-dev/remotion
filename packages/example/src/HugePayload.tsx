import {z} from 'zod';

export const hugePayloadSchema = z.object({
	str: z.string(),
});

export const HugePayload: React.FC<z.infer<typeof hugePayloadSchema>> = ({
	str,
}) => {
	return (
		<div
			style={{
				color: 'red',
				fontSize: 80,
			}}
		>
			Wow this payload is huge! {str.length}
		</div>
	);
};
