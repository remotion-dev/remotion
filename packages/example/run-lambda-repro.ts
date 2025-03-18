import {$} from 'bun';

const progress = (await Bun.file(
	'./progress.json',
).json()) as _InternalOverallRenderProgress<_InternalAwsProvider>;

if (!progress.renderMetadata) {
	throw new Error('No render metadata');
}

const memorySize = progress.renderMetadata.memorySizeInMb;
const timeoutInSeconds = 240;

if (progress.renderMetadata.inputProps.type !== 'payload') {
	throw new Error('Expected payload');
}

await $`bunx remotion lambda functions rmall -f`;
await $`bunx remotion lambda functions deploy --memory=${memorySize} --disk=10000 --timeout=${timeoutInSeconds}`;
await $`bunx remotion lambda render ${progress.renderMetadata.siteId} ${progress.renderMetadata.compositionId} --log=verbose --delete-after="1-day" --props=${progress.renderMetadata.inputProps.payload}`;
