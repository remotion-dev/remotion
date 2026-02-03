import {
	Button,
	Input,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Textarea,
} from '@remotion/design';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {REMOTION_PRO_ORIGIN} from './config';
import {MuxPlayer} from './MuxPlayer';
import {NewBackButton} from './NewBackButton';
import {Page} from './Page';

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

export const PromptsSubmitPage: React.FC = () => {
	const [title, setTitle] = useState('');
	const [prompt, setPrompt] = useState('');
	const [toolUsed, setToolUsed] = useState('');
	const [modelUsed, setModelUsed] = useState('');
	const [usernameType, setUsernameType] = useState<UsernameType>('github');
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

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const startUpload = useCallback(async (file: File) => {
		setUploadState({type: 'uploading', progress: 0});

		try {
			const res = await fetch(`${REMOTION_PRO_ORIGIN}/api/prompts/upload`, {
				method: 'POST',
				headers: {'content-type': 'application/json'},
			});
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
						if (!statusRes.ok) {
							throw new Error(
								`Failed to fetch upload status: ${statusRes.status}`,
							);
						}

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
					} catch (error) {
						// eslint-disable-next-line no-console
						console.error('Error while polling upload status', error);
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
	}, []);

	const onFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			startUpload(file);
		},
		[startUpload],
	);

	const onPageDrop: React.DragEventHandler = useCallback(
		(e) => {
			e.preventDefault();
			if (uploadState.type !== 'idle') return;
			const file = e.dataTransfer?.files?.[0];
			if (!file) return;
			startUpload(file);
		},
		[startUpload, uploadState.type],
	);

	const onPageDragOver: React.DragEventHandler = useCallback((e) => {
		e.preventDefault();
	}, []);

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
			const res = await fetch(`${REMOTION_PRO_ORIGIN}/api/prompts/submit`, {
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify({
					muxAssetId: uploadState.muxAssetId,
					muxPlaybackId: uploadState.muxPlaybackId,
					title,
					prompt,
					toolUsed: toolUsed || undefined,
					modelUsed: modelUsed || undefined,
					githubUsername: usernameType === 'github' ? username : undefined,
					xUsername: usernameType === 'x' ? username : undefined,
				}),
			});

			if (!res.ok) {
				const submissionData = await res.json();
				throw new Error(submissionData.error || 'Submission failed');
			}

			const data = await res.json();
			setSubmitStatus({type: 'done', slug: data.slug});
		} catch (err) {
			setSubmitStatus({type: 'error', err: err as Error});
		}
	}, [
		submitPossible,
		uploadState,
		title,
		prompt,
		usernameType,
		username,
		toolUsed,
		modelUsed,
	]);

	if (submitStatus.type === 'done') {
		return (
			<Page className="flex-col">
				<div className="m-auto max-w-[800px] w-full">
					<div className="mx-4 px-8 py-8 mt-12 pt-8">
						<h1 className="text-3xl font-brand font-black">
							Submission received!
						</h1>
						<div className="mt-4 text-muted-foreground font-brand">
							Thanks for submitting your prompt! Your prompt submission is
							pending review.
							<br /> Once approved, it will appear on the{' '}
							<a href="/prompts" className="underline">
								prompts gallery
							</a>
							.
						</div>
						<div className="mt-4 text-muted-foreground font-brand">
							Note that this showcase is curated - we may reject submissions if
							they are repetitive or not up to our quality standards. In that
							case, we will not give notification or reason.
						</div>
						<Button
							onClick={() => {
								window.location.href = '/prompts';
							}}
							className="font-brand rounded-full mt-4"
						>
							Back to gallery
						</Button>
					</div>
				</div>
			</Page>
		);
	}

	return (
		<Page className="flex-col" onDrop={onPageDrop} onDragOver={onPageDragOver}>
			<div className="m-auto max-w-[800px] w-full">
				<div className="mx-4 px-8 py-8 pt-8">
					<NewBackButton text="Back to gallery" link="/prompts" />
					<h1 className="text-3xl font-brand font-black">Submit a prompt</h1>
					<p className="text-muted-foreground text-sm font-brand">
						Submit a prompt to be featured in the{' '}
						<a
							href="/prompts"
							className="underline hover:text-text underline-offset-4"
						>
							prompt gallery.
						</a>
					</p>
					<p className="text-muted-foreground text-sm font-brand">
						Note that this showcase is curated - we may reject submissions if
						they are repetitive or not up to our quality standards. In that
						case, we will not give notification or reason.
					</p>
					<h2 className="font-brand mt-5 font-bold">Title *</h2>
					<p className="text-muted-foreground text-sm mb-0 font-brand">
						A short title for your prompt (max 80 characters).
					</p>
					<Input
						name="title"
						placeholder="Newspaper highlighting animation"
						className="font-brand mt-3"
						value={title}
						maxLength={80}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<p className="text-muted-foreground text-xs mt-1 mb-0 font-brand">
						{title.length}/80
					</p>
					<h2 className="font-brand mt-5 font-bold">Video *</h2>
					<p className="text-muted-foreground text-sm mb-0 font-brand">
						Upload a video showing the result of your prompt. You can also drop
						a file anywhere on this page.
					</p>
					<input
						ref={fileInputRef}
						type="file"
						accept="video/*"
						onChange={onFileSelect}
						className="hidden"
					/>
					<div className="flex flex-col items-center py-12">
						{uploadState.type === 'idle' && (
							<Button
								className="font-brand rounded-full"
								onClick={() => fileInputRef.current?.click()}
							>
								Choose video file
							</Button>
						)}
						{uploadState.type === 'uploading' && (
							<div className="text-muted-foreground font-brand font-medium text-sm">
								Uploading {Math.round(uploadState.progress)}%
							</div>
						)}
						{uploadState.type === 'processing' && (
							<div className="text-muted-foreground font-brand font-medium text-sm">
								Processing video...
							</div>
						)}
						{uploadState.type === 'ready' && (
							<div className="w-full">
								<MuxPlayer
									playbackId={uploadState.muxPlaybackId}
									title={title || 'Preview'}
								/>
							</div>
						)}
						{uploadState.type === 'error' && (
							<div className="text-red-500 font-brand font-medium text-sm">
								{uploadState.message}
							</div>
						)}
					</div>

					<h2 className="font-brand mt-5 font-bold">Prompt(s) *</h2>
					<p className="text-muted-foreground text-sm mb-0 font-brand">
						The prompts you used to generate this video. Separate multiple
						prompts with an empty line.
					</p>
					<Textarea
						name="prompt"
						className="font-brand mt-3"
						placeholder="Enter your full prompt here"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
					/>

					<h2 className="font-brand mt-5 font-bold">Tool used</h2>
					<p className="text-muted-foreground text-sm mb-0 font-brand">
						Which tool did you use to generate this video? (e.g. Claude Code,
						Cursor, Codex)
					</p>
					<Input
						name="toolUsed"
						placeholder="Claude Code"
						className="font-brand mt-3"
						value={toolUsed}
						onChange={(e) => setToolUsed(e.target.value)}
					/>

					<h2 className="font-brand mt-5 font-bold">Model used</h2>
					<p className="text-muted-foreground text-sm mb-0 font-brand">
						Which AI model did you use? (e.g. Opus 4.5, GPT-5.2)
					</p>
					<Input
						name="modelUsed"
						placeholder="Opus 4.5"
						className="font-brand mt-3"
						value={modelUsed}
						onChange={(e) => setModelUsed(e.target.value)}
					/>

					<h2 className="font-brand mt-5 font-bold">
						How should we credit you? *
					</h2>
					<Tabs
						defaultValue="github"
						className="mt-3"
						onValueChange={(value: string) => {
							setUsernameType(value as UsernameType);
							setUsername('');
						}}
					>
						<TabsList>
							<TabsTrigger value="github">GitHub</TabsTrigger>
							<TabsTrigger value="x">X (Twitter)</TabsTrigger>
						</TabsList>
						<TabsContent value="github">
							<Input
								name="username"
								className="font-brand"
								placeholder="Your GitHub username"
								value={usernameType === 'github' ? username : ''}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</TabsContent>
						<TabsContent value="x">
							<Input
								name="username"
								className="font-brand"
								placeholder="Your X username (without @)"
								value={usernameType === 'x' ? username : ''}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</TabsContent>
					</Tabs>

					<div className="h-8" />
					<Button
						onClick={submit}
						disabled={!submitPossible}
						type="submit"
						className="font-brand rounded-full w-full bg-brand text-white"
					>
						Submit
					</Button>
					{submitStatus.type === 'error' && (
						<p className="text-red-500 mt-4 text-sm font-brand">
							An error occurred: {submitStatus.err.message}
						</p>
					)}
				</div>
			</div>
		</Page>
	);
};
