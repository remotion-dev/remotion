import {expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {AudioCodecSelection} from '../app/components/AudioCodecSelection';
import {getAudioOperationId} from '../app/lib/operation-key';

test('renders unknown-codec audio tracks without crashing', () => {
	const operation = {type: 'drop'} as const;

	expect(() => {
		renderToString(
			<AudioCodecSelection
				audioTrackOptions={[operation]}
				currentAudioCodec={null}
				index={getAudioOperationId(operation)}
				setIndex={() => undefined}
			/>,
		);
	}).not.toThrow();
});
