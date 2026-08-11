import {Button} from '@remotion/design';
import React from 'react';
import {NewBackButton} from './NewBackButton';
import {Page} from './Page';

export const PromptsSubmitPage: React.FC = () => {
	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full">
				<div className="mx-4 px-8 py-8 pt-8">
					<NewBackButton text="Back to gallery" link="/prompts" />
					<h1 className="text-3xl font-brand font-black">Share your video</h1>
					<p className="text-muted-foreground text-sm font-brand">
						Submissions are currently disabled while we work on something
						better!
					</p>
					<Button href="/prompts" className="font-brand rounded-full mt-4">
						Back to gallery
					</Button>
				</div>
			</div>
		</Page>
	);
};
