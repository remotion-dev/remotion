import {toCaptions, type TranscriptionJson} from '@remotion/whisper-web';
import {useMemo} from 'react';
import {Card} from '../ui/card';

export default function Display({
	result,
}: {
	readonly result: TranscriptionJson;
}) {
	const remotionCaptions = useMemo(() => {
		return toCaptions({whisperWebOutput: result!});
	}, [result]);

	return (
		<Card>
			{remotionCaptions.captions.map((c, i) => {
				return (
					<div key={c.text} className="border-b border-b-black py-2">
						<div className="px-3">
							<div className="text-xs font-brand font-medium">
								{(c.startMs / 1000).toFixed(3)} - {(c.endMs / 1000).toFixed(3)}
							</div>
							<p>{c.text}</p>
							<p>{c.timestampMs}</p>
						</div>
					</div>
				);
			})}
		</Card>
	);
}
