import React, {useCallback, useState} from 'react';
import {Page} from '~/components/Page';
import {Button} from '~/components/ui/button';
import {Card} from '~/components/ui/card';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio';
import {Textarea} from '~/components/ui/textarea';
import {handleDrop} from '~/lib/upload-report';

const Report: React.FC = () => {
	const onDrop: React.DragEventHandler = useCallback(async (e) => {
		const firstItem = e.dataTransfer?.files?.[0];
		if (!firstItem) {
			return;
		}

		e.preventDefault();

		await handleDrop(firstItem);
	}, []);

	const [file, setFile] = useState<File | null>(null);
	const [description, setDescription] = useState('');

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full">
				<Card className="mx-4 px-8 py-8 mt-12 pt-8">
					<h1 className="text-3xl font-brand font-black">Report a video</h1>
					<input
						onDrop={onDrop}
						type="file"
						placeholder="Video URL"
						className="mt-10"
					/>
					<br />
					<h2 className="font-brand mt-5 font-bold">
						Which product has an issue with this video?
					</h2>

					<RadioGroup name="product" defaultValue="remotion" className="mt-3">
						<div className="flex items-center space-x-2">
							<RadioGroupItem checked value="remotion" id="remotion" />
							<Label htmlFor="remotion">
								Remotion - &lt;OffthreadVideo&gt;
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="media-parser" id="media-parser" />
							<Label htmlFor="media-parser">@remotion/media-parser</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="webcodecs" id="webcodecs" />
							<Label htmlFor="webcodecs">
								@remotion/webcodecs or remotion.dev/convert
							</Label>
						</div>
					</RadioGroup>

					<h2 className="font-brand mt-5 font-bold">Describe the issue:</h2>
					<Textarea
						name="description"
						className="mt-3"
						placeholder="Conversion fails on Chrome"
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
					<RadioGroup id="usage" defaultValue="public-testset" className="mt-3">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="public-testset" id="public-testset" />
							<Label htmlFor="public-testset">
								Yes, you may commit it to the public testset
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="internally" id="internally" />
							<Label htmlFor="internally">
								Only internal testing - don{"'"}t commit to the public testset
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="confidential" id="confidential" />
							<Label htmlFor="confidential">
								Confidential - delete the video after testing
							</Label>
						</div>
					</RadioGroup>
					<div className="h-8" />
					<Button type="submit">Submit</Button>
				</Card>
			</div>
		</Page>
	);
};

export default Report;
