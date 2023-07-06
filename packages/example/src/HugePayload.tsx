import {z} from 'zod';

export const hugePayloadSchema = z.object({
	str: z.string(),
	date: z.date(),
	file: z.string(),
});

export const HugePayload: React.FC<z.infer<typeof hugePayloadSchema>> = ({
	str,
	date,
	file,
}) => {
	if (str.length !== 60000000) {
		throw new Error('str is not 60,000,000 characters long');
	}

	if (date instanceof Date === false) {
		throw new Error('date is not a Date');
	}

	if (!file.startsWith(window.remotion_staticBase)) {
		throw new Error('file does not start with staticBase');
	}

	return (
		<div
			style={{
				color: 'red',
				fontSize: 80,
			}}
		>
			Wow this payload is huge! {str.length} {file} {date.getTime()}
		</div>
	);
};
