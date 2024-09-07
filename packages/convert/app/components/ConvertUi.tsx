import {Button} from '@/components/ui/button';
import {CardContent, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {convertMedia} from '@remotion/webcodecs';
import {useCallback, useState} from 'react';
import {Badge} from './ui/badge';

export default function ConvertUI({src}: {readonly src: string}) {
	const [abortController] = useState<AbortController>(
		() => new AbortController(),
	);

	const [container, setContainer] = useState('webm');
	const [videoCodec, setVideoCodec] = useState('vp8');
	const [audioCodec, setAudioCodec] = useState('opus');

	const onClick = useCallback(async () => {
		await convertMedia({
			src,
			onVideoFrame: () => {
				//	console.log('frame', frame);
				return Promise.resolve();
			},
			onMediaStateUpdate: () => {
				// 	console.log('update', s);
			},
			videoCodec: videoCodec as 'vp8',
			audioCodec: audioCodec as 'opus',
			to: container as 'webm',
			signal: abortController.signal,
		});
	}, [abortController.signal, src, container, videoCodec, audioCodec]);

	return (
		<div className="w-[380px]">
			<CardContent className="gap-4">
				<div className="grid w-full items-center gap-4">
					<div className="flex flex-row">
						<CardTitle>Convert video</CardTitle>
						<div className="w-2" />
						<Badge variant={'default'}>Alpha</Badge>
					</div>
					<div>
						<Label htmlFor="container">Container</Label>
						<Select value={container} onValueChange={setContainer}>
							<SelectTrigger id="container">
								<SelectValue placeholder="Select a container" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="webm">WebM</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="videoCodec">Video codec</Label>
						<Select value={videoCodec} onValueChange={setVideoCodec}>
							<SelectTrigger id="videoCodec">
								<SelectValue placeholder="Select a video codec" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="vp8">VP8</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="audioCodec">Audio codec</Label>
						<Select value={audioCodec} onValueChange={setAudioCodec}>
							<SelectTrigger id="audioCodec">
								<SelectValue placeholder="Select a audio codec" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="opus">Opus</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="h-4" />
				<Button className="block w-full" type="button" onClick={onClick}>
					Convert
				</Button>
			</CardContent>
		</div>
	);
}
