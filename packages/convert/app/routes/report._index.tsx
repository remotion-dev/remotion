import React, {useCallback, useState} from 'react';
import {DropZone} from '~/components/DropZone';
import {Page} from '~/components/Page';
import {Button} from '~/components/ui/button';
import {Card} from '~/components/ui/card';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio';
import {Textarea} from '~/components/ui/textarea';

type Product =
	| 'remotion'
	| 'media-parser'
	| 'webcodecs'
	| 'remotion-audio'
	| 'remotion-video'
	| 'other';
type Usage = 'public-testset' | 'internally' | 'confidential';

// 1GB file size limit
const MAX_FILE_SIZE_BYTES = 1073741824;

type SubmitStatus =
	| {
			type: 'idle';
	  }
	| {
			type: 'submitting';
	  }
	| {
			type: 'done';
	  }
	| {type: 'error'; err: Error};

const Report: React.FC = () => {
	const [description, setDescription] = useState('');
	const [url, setUrl] = useState<string | null>(null);
	const [filename, setFilename] = useState<string | null>(null);
	const [product, setProduct] = useState<Product | null>(null);
	const [remotionVersion, setRemotionVersion] = useState('');
	const [usage, setUsage] = useState<Usage | null>(null);
	const [contact, setContact] = useState('');
	const [fileSizeError, setFileSizeError] = useState<string | null>(null);

	const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
		type: 'idle',
	});

	const requiresRemotionVersion =
		product === 'remotion' ||
		product === 'remotion-audio' ||
		product === 'remotion-video';

	const submitPossible =
		url &&
		description &&
		product &&
		usage &&
		contact &&
		(!requiresRemotionVersion || remotionVersion) &&
		(submitStatus.type === 'idle' || submitStatus.type === 'error');

	const submit = useCallback(async () => {
		if (!submitPossible) {
			return;
		}

		setSubmitStatus({type: 'submitting'});

		try {
			await fetch('https://www.remotion.pro/api/report', {
				method: 'POST',
				body: JSON.stringify({
					url,
					product,
					description,
					usage,
					contact,
					filename,
					remotionVersion: requiresRemotionVersion ? remotionVersion : null,
				}),
				headers: {
					'content-type': 'application/json',
				},
			});
			setSubmitStatus({type: 'done'});
		} catch (err) {
			setSubmitStatus({type: 'error', err: err as Error});
		}
	}, [
		contact,
		description,
		filename,
		product,
		remotionVersion,
		requiresRemotionVersion,
		submitPossible,
		url,
		usage,
	]);

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full">
				<Card className="mx-4 px-8 py-8 mt-12 pt-8">
					<h1 className="text-3xl font-brand font-black">Report a video</h1>
					<DropZone
						onFilename={(f) => {
							setFilename(f);
							setFileSizeError(null); // Clear any previous file size errors
						}}
						onUrl={(u) => {
							setUrl(u);
						}}
						onError={(error) => {
							setFileSizeError(error);
						}}
						maxSizeBytes={MAX_FILE_SIZE_BYTES}
					/>
					{fileSizeError && (
						<p className="text-red-500 mt-2 text-sm">{fileSizeError}</p>
					)}
					<p className="text-muted-foreground text-sm mt-2">
						<strong>Note:</strong> Maximum file size is 1GB.
					</p>
					<br />
					<h2 className="font-brand mt-5 font-bold">
						Which product has an issue with this video?
					</h2>

					<RadioGroup
						name="product"
						className="mt-3"
						onValueChange={(e: string) => {
							setProduct(e as Product);
						}}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={product === 'remotion'}
								value="remotion"
								id="remotion"
							/>
							<Label htmlFor="remotion">
								Remotion - &lt;OffthreadVideo&gt;
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={product === 'remotion-audio'}
								value="remotion-audio"
								id="remotion-audio"
							/>
							<Label htmlFor="remotion-audio">
								Remotion - &lt;Audio&gt; from @remotion/media
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={product === 'remotion-video'}
								value="remotion-video"
								id="remotion-video"
							/>
							<Label htmlFor="remotion-video">
								Remotion - &lt;Video&gt; from @remotion/media
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={product === 'webcodecs'}
								value="webcodecs"
								id="webcodecs"
							/>
							<Label htmlFor="webcodecs">remotion.dev/convert</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={product === 'other'}
								value="other"
								id="other"
							/>
							<Label htmlFor="other">Other (mention below)</Label>
						</div>
					</RadioGroup>

					{requiresRemotionVersion && (
						<>
							<h2 className="font-brand mt-5 font-bold">
								Which version of Remotion are you using?
							</h2>
							<p className="text-muted-foreground text-sm">
								Run `npx remotion version` to see. See{' '}
								<a
									href="https://remotion.dev/changelog"
									rel="noopener noreferrer"
									target="_blank"
								>
									remotion.dev/changelog
								</a>{' '}
								for latest version.
							</p>
							<Input
								name="remotionVersion"
								className="mt-3"
								placeholder="e.g. 4.0.100"
								value={remotionVersion}
								onChange={(e) => setRemotionVersion(e.target.value)}
							/>
						</>
					)}

					<h2 className="font-brand mt-5 font-bold">Describe the issue:</h2>
					<Textarea
						name="description"
						className="mt-3"
						placeholder="Enter all information you deem to be relevant"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<h2 className="font-brand mt-5 font-bold">
						May we add this video to the testset?{' '}
					</h2>
					<p className="text-muted-foreground text-sm">
						This allows us to write tests for this video and avoid regressions.
						The testset is public on GitHub.
					</p>
					<RadioGroup
						id="usage"
						onValueChange={(e) => {
							setUsage(e as Usage);
						}}
						className="mt-3"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="public-testset"
								checked={usage === 'public-testset'}
								id="public-testset"
							/>
							<Label htmlFor="public-testset">
								Yes, you may commit it to the public testset
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="internally"
								checked={usage === 'internally'}
								id="internally"
							/>
							<Label htmlFor="internally">
								Only internal testing - don{"'"}t commit to the public testset
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								value="confidential"
								checked={usage === 'confidential'}
								id="confidential"
							/>
							<Label htmlFor="confidential">
								Confidential - delete the video after testing
							</Label>
						</div>
					</RadioGroup>
					<h2 className="font-brand mt-5 font-bold">
						Your email / Discord username *
					</h2>
					<p className="text-muted-foreground text-sm">
						Required. For any follow-up questions, or to notify you when the
						issue is fixed.
					</p>

					<Input
						name="contact"
						className="mt-3"
						placeholder="Your Email or Discord username (required)"
						value={contact}
						onChange={(e) => setContact(e.target.value)}
					/>

					<div className="h-8" />
					<Button onClick={submit} disabled={!submitPossible} type="submit">
						Submit
					</Button>
					{submitStatus.type === 'done' && (
						<p className="text-green-500 mt-4 text-sm">
							Thank you! We have received your report and will get back to you.
						</p>
					)}
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

export default Report;
