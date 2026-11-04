import React, {useCallback} from 'react';
import {SAMPLE_FILE_CONVERT, SAMPLE_FILE_TRANSCRIBE} from '~/lib/config';
import type {Source} from '~/lib/convert-state';
import type {RouteAction} from '~/seo';
import {AlternativePickFileOptions} from './AlternativePickFileOptions';
import {DropFileBox} from './DropFileBox';
import {WhyRemotionConvert} from './WhyRemotionConvert';

export const PickFile: React.FC<{
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly title: string;
	readonly action: RouteAction;
}> = ({setSrc, title, action}) => {
	const onSampleFile = useCallback(() => {
		setSrc({
			type: 'url',
			url:
				action.type === 'transcribe'
					? SAMPLE_FILE_TRANSCRIBE
					: SAMPLE_FILE_CONVERT,
		});
	}, [setSrc, action]);

	return (
		<div className="flex h-full w-full flex-col bg-page text-left">
			<div className="mx-auto flex w-full max-w-[500px] flex-col gap-8 px-5 pt-16 pb-10 min-[900px]:max-w-[1000px] min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-12">
				<div className="min-w-0 flex-1">
					<h1 className="mb-4 text-3xl font-brand font-black text-balance">
						{title}
					</h1>
					<p className="font-brand text-base text-muted-foreground text-pretty">
						Load MP4, WebM, MOV/ProRes, MKV, MP3, WAV, AAC, FLAC, or HLS
						streams, then convert, trim, crop, resize, rotate, mirror, probe, or
						transcribe locally in your browser.
					</p>
				</div>
				<div className="flex shrink-0 flex-col items-start gap-4 self-start min-[900px]:items-end min-[900px]:self-center">
					<DropFileBox setSrc={setSrc} />
					<AlternativePickFileOptions onSampleFile={onSampleFile} />
				</div>
			</div>
			<WhyRemotionConvert routeAction={action} />
		</div>
	);
};
