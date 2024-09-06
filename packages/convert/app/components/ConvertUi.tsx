import {Button} from '@/components/ui/button';
import {CardContent, CardFooter, CardTitle} from '@/components/ui/card';
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
import React, {useCallback, useState} from 'react';

export const ConvertUI: React.FC<{
	src: string;
}> = ({src}) => {
	const [abortController] = useState<AbortController>(
		() => new AbortController(),
	);

	const onClick = useCallback(async () => {
		await convertMedia({
			src,
			onVideoFrame: (frame) => {
				console.log('frame', frame);
				return Promise.resolve();
			},
			onMediaStateUpdate: (s) => {
				console.log('update', s);
			},
			videoCodec: 'vp8',
			audioCodec: 'opus',
			to: 'webm',
			signal: abortController.signal,
		});
	}, [abortController.signal, src]);

	const onAbort = useCallback(() => {
		abortController.abort();
	}, [abortController]);

	return (
		<div className="w-[350px]">
			<CardContent className="gap-4">
				<div className="grid w-full items-center gap-4">
					<CardTitle>Convert video</CardTitle>
					<div>
						<Label htmlFor="container">Container</Label>
						<Select>
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
						<Select>
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
						<Select>
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
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant={'outline'} type="button" onClick={onAbort}>
					Abort
				</Button>
				<Button type="button" onClick={onClick}>
					Convert
				</Button>{' '}
			</CardFooter>
		</div>
	);
};
