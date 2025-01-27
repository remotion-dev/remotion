import React, {useCallback, useState} from 'react';
import {DropZone} from '~/components/DropZone';
import {Page} from '~/components/Page';
import {Button} from '~/components/ui/button';
import {Card} from '~/components/ui/card';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio';
import {Textarea} from '~/components/ui/textarea';

type Product = 'remotion' | 'media-parser' | 'webcodecs';
type Usage = 'public-testset' | 'internally' | 'confidential';

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
	const [usage, setUsage] = useState<Usage | null>(null);
	const [contact, setContact] = useState('');

	const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
		type: 'idle',
	});

	const submitPossible =
		url &&
		description &&
		product &&
		usage &&
		contact &&
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
				}),
				headers: {
					'content-type': 'application/json',
				},
			});
			setSubmitStatus({type: 'done'});
		} catch (err) {
			setSubmitStatus({type: 'error', err: err as Error});
		}
	}, [contact, description, filename, product, submitPossible, url, usage]);

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full">
				<Card className="mx-4 px-8 py-8 mt-12 pt-8">
					<h1 className="text-3xl font-brand font-black">Report a video</h1>
					<DropZone
						onFilename={(f) => {
							setFilename(f);
						}}
						onUrl={(u) => {
							setUrl(u);
						}}
					/>
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
								checked={product === 'media-parser'}
								value="media-parser"
								id="media-parser"
							/>
							<Label htmlFor="media-parser">@remotion/media-parser</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem
								checked={product === 'webcodecs'}
								value="webcodecs"
								id="webcodecs"
							/>
							<Label htmlFor="webcodecs">
								@remotion/webcodecs or remotion.dev/convert
							</Label>
						</div>
					</RadioGroup>

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
						Your email / Discord username
					</h2>
					<p className="text-muted-foreground text-sm">
						For any follow-up questions, or to notify you when the issue is
						fixed.
					</p>

					<Input
						name="description"
						className="mt-3"
						placeholder="Your Email"
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
