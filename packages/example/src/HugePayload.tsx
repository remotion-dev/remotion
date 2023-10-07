import {Img, useVideoConfig} from 'remotion';
import {z} from 'zod';

export const hugePayloadSchema = z.object({
	str: z.string(),
	date: z.date(),
	file: z.string(),
});

export const HugePayload: React.FC<
	z.infer<typeof hugePayloadSchema> & {
		dontCareAboutSize?: boolean;
	}
> = ({str, date, file, dontCareAboutSize}) => {
	const {defaultProps} = useVideoConfig();

	if (str.length !== 6000000 && !dontCareAboutSize) {
		throw new Error('str is not 6,000,000 characters long');
	}

	if (date instanceof Date === false) {
		throw new Error('date is not a Date');
	}

	if (!file.startsWith(window.remotion_staticBase)) {
		throw new Error('file does not start with staticBase');
	}

	if ((defaultProps.str as string).length !== 6) {
		throw new Error('str (defaultProps) is not 6,000,000 characters long');
	}

	if (defaultProps.date instanceof Date === false) {
		throw new Error('date (defaultProps) is not a Date');
	}

	if (!(defaultProps.file as string).startsWith(window.remotion_staticBase)) {
		throw new Error('file (defaultProps) does not start with staticBase');
	}

	return (
		<div
			style={{
				color: 'red',
				fontSize: 80,
			}}
		>
			Wow this payload is huge! {str.length} {file} {date.getTime()}
			<Img src={file} />
		</div>
	);
};
