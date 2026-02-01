import React, {useCallback, useEffect, useRef, useState} from 'react';
import {REMOTION_PRO_ORIGIN} from '~/lib/config';
import {Page} from '~/components/Page';
import {Button} from '~/components/ui/button';
import {Card} from '~/components/ui/card';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio';
import {Textarea} from '~/components/ui/textarea';

type UsernameType = 'github' | 'x';

type UploadState =
	| {type: 'idle'}
	| {type: 'uploading'; progress: number}
	| {type: 'processing'}
	| {type: 'ready'; muxAssetId: string; muxPlaybackId: string}
	| {type: 'error'; message: string};

type SubmitStatus =
	| {type: 'idle'}
	| {type: 'submitting'}
	| {type: 'done'; slug: string}
	| {type: 'error'; err: Error};

const PromptSubmit: React.FC = () => {
	const [title, setTitle] = useState('');
	const [prompt, setPrompt] = useState('');
	const [usernameType, setUsernameType] = useState<UsernameType | null>(null);
	const [username, setUsername] = useState('');
	const [uploadState, setUploadState] = useState<UploadState>({type: 'idle'});
	const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
		type: 'idle',
	});
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, []);

	const onFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setUploadState({type: 'uploading', progress: 0});

			try {
				const res = await fetch(
					`${REMOTION_PRO_ORIGIN}/api/prompts/upload`,
					{
						method: 'POST',
						headers: {'content-type': 'application/json'},
					},
				);
				const {id, url} = await res.json();

				const {createUpload} = await import('@mux/upchunk');
				const upload = createUpload({endpoint: url, file});

				upload.on('progress', (p: {detail: number}) => {
					setUploadState({type: 'uploading', progress: p.detail});
				});

				upload.on('success', () => {
					setUploadState({type: 'processing'});

					pollRef.current = setInterval(async () => {
						try {
							const statusRes = await fetch(
								`${REMOTION_PRO_ORIGIN}/api/prompts/upload/${id}`,
							);
							const data = await statusRes.json();

							if (
								data.status === 'asset_created' &&
								data.playback_id &&
								data.asset_status === 'ready'
							) {
								if (pollRef.current) clearInterval(pollRef.current);
								setUploadState({
									type: 'ready',
									muxAssetId: data.asset_id,
									muxPlaybackId: data.playback_id,
								});
							}
						} catch {
							// keep polling
						}
					}, 2000);
				});

				upload.on('error', (err: {detail: {message: string}}) => {
					setUploadState({
						type: 'error',
						message: err.detail.message,
					});
				});
			} catch (err) {
				setUploadState({
					type: 'error',
					message: err instanceof Error ? err.message : 'Upload failed',
				});
			}
		},
		[],
	);

	const submitPossible =
		title.length > 0 &&
		title.length <= 80 &&
		prompt.length > 0 &&
		usernameType &&
		username.length > 0 &&
		uploadState.type === 'ready' &&
		(submitStatus.type === 'idle' || submitStatus.type === 'error');

	const submit = useCallback(async () => {
		if (!submitPossible || uploadState.type !== 'ready') return;

		setSubmitStatus({type: 'submitting'});

		try {
			const res = await fetch(
				`${REMOTION_PRO_ORIGIN}/api/prompts/submit`,
				{
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify({
						muxAssetId: uploadState.muxAssetId,
						muxPlaybackId: uploadState.muxPlaybackId,
						title,
						prompt,
						githubUsername:
							usernameType === 'github' ? username : undefined,
						xUsername: usernameType === 'x' ? username : undefined,
					}),
				},
			);

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Submission failed');
			}

			const data = await res.json();
			setSubmitStatus({type: 'done', slug: data.slug});
		} catch (err) {
			setSubmitStatus({type: 'error', err: err as Error});
		}
	}, [submitPossible, uploadState, title, prompt, usernameType, username]);

	if (submitStatus.type === 'done') {
		return (
			<Page className="flex-col">
				<div className="m-auto max-w-[800px] w-full">
					<Card className="mx-4 px-8 py-8 mt-12 pt-8">
						<h1 className="text-3xl font-brand font-black">
							Submission received!
						</h1>
						<p className="mt-4 text-muted-foreground">
							Your prompt submission is pending review. Once approved, it will
							appear on the{' '}
							<a href="/prompts" className="underline">
								prompts gallery
							</a>
							.
						</p>
					</Card>
				</div>
			</Page>
		);
	}

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full">
				<Card className="mx-4 px-8 py-8 mt-12 pt-8">
					<h1 className="text-3xl font-brand font-black">
						Submit a prompt
					</h1>

					<h2 className="font-brand mt-5 font-bold">Title *</h2>
					<p className="text-muted-foreground text-sm">
						A short title for your prompt (max 80 characters).
					</p>
					<Input
						name="title"
						className="mt-3"
						placeholder="My cool Remotion prompt"
						value={title}
						maxLength={80}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<p className="text-muted-foreground text-xs mt-1">
						{title.length}/80
					</p>

					<h2 className="font-brand mt-5 font-bold">Video *</h2>
					<p className="text-muted-foreground text-sm">
						Upload a video showing the result of your prompt.
					</p>
					<div className="relative overflow-hidden flex h-40 border-black rounded-md mt-3 justify-center items-center border-solid border-2">
						{uploadState.type === 'idle' && (
							<>
								<input
									type="file"
									accept="video/*"
									onChange={onFileSelect}
									className="appearance-none w-full h-full cursor-pointer opacity-0"
								/>
								<div className="pointer-events-none inset-0 absolute flex items-center justify-center">
									<div className="text-muted-foreground font-medium text-sm">
										Drag a video or click here
									</div>
								</div>
							</>
						)}
						{uploadState.type === 'uploading' && (
							<div className="text-muted-foreground font-medium text-sm">
								Uploading {Math.round(uploadState.progress)}%
							</div>
						)}
						{uploadState.type === 'processing' && (
							<div className="text-muted-foreground font-medium text-sm">
								Processing video...
							</div>
						)}
						{uploadState.type === 'ready' && (
							<div className="text-muted-foreground font-medium text-sm flex flex-col items-center gap-2">
								<img
									src={`https://image.mux.com/${uploadState.muxPlaybackId}/thumbnail.png?width=240`}
									className="rounded"
									alt="Video thumbnail"
								/>
								Video ready
							</div>
						)}
						{uploadState.type === 'error' && (
							<div className="text-red-500 font-medium text-sm">
								{uploadState.message}
							</div>
						)}
					</div>

					<h2 className="font-brand mt-5 font-bold">Prompt *</h2>
					<p className="text-muted-foreground text-sm">
						The prompt you used to generate this video.
					</p>
					<Textarea
						name="prompt"
						className="mt-3"
						placeholder="Enter your full prompt here"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
					/>

					<h2 className="font-brand mt-5 font-bold">
						How should we credit you? *
					</h2>
					<RadioGroup
						name="usernameType"
						className="mt-3"
						onValueChange={(e: string) =>
							setUsernameType(e as UsernameType)
						}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={usernameType === 'github'}
								value="github"
								id="github"
							/>
							<Label htmlFor="github">GitHub username</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={usernameType === 'x'}
								value="x"
								id="x"
							/>
							<Label htmlFor="x">X (Twitter) username</Label>
						</div>
					</RadioGroup>

					{usernameType && (
						<Input
							name="username"
							className="mt-3"
							placeholder={
								usernameType === 'github'
									? 'Your GitHub username'
									: 'Your X username (without @)'
							}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					)}

					<div className="h-8" />
					<Button
						onClick={submit}
						disabled={!submitPossible}
						type="submit"
					>
						Submit
					</Button>
					{submitStatus.type === 'error' && (
						<p className="text-red-500 mt-4 text-sm">
							An error occurred: {submitStatus.err.message}
						</p>
					)}
				</Card>
			</div>
		</Page>
	);
};

export default PromptSubmit;
