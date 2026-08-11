import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';
import headerStyles from './header.module.css';
import styles from './styles.module.css';

const PageHeader: React.FC = () => {
	return (
		<div>
			<h1 className={headerStyles.title}>Add to showcase</h1>
			<p>
				The <a href="/showcase">Showcase</a> features videos made with Remotion
				to show use cases, share code and celebrate the creations of the
				Remotion community.
			</p>
			<p>
				You too can add your creations to the showcase! Please read carefully
				the instructions to make it as effortlessly as possible for us to accept
				your video to the showcase.
			</p>
			<h2>Guidelines</h2>
			<ul>
				<li>Metadata:</li>
				<ul>
					<li>Title: Max 80 characters, no emojis, no CAPS text</li>
					<li>
						Description: Max 280 characters, use descriptive and neutral
						language, focusing on how Remotion was used for your project. To
						plug your project, use the links section.
					</li>
					<li>
						There are 4 types of links that you can add - all of them are
						optional:
					</li>
					<ul>
						<li>Video: A link to where you published your video originally.</li>
						<li>
							Source code: A direct link to the source code of the video if it
							is public.
						</li>
						<li>
							Website: An opportunity to link to your product if you have one
						</li>
						<li>
							Tutorial: If you have a blog or video tutorial about the process
							of your video, you can link it.
						</li>
					</ul>
				</ul>
				<li>
					Order: The videos will be reshuffled every day again to balance out
					the videos who appear on top.
				</li>
				<li>
					Quality: We aim to keep a minimum bar of quality for the showcase,
					therefore we will sometimes reject submissions. Don{"'"}t submit
					videos that are overly simplistic, similar to videos already in the
					showcase or don{"'"}t live up to your ability. Only submit your best
					videos and if you submit multiple videos, remove the ones that you
					like the least.
				</li>
				<li>
					Permission: By submitting, you allow us to host your video and to
					repost it on other channels like Twitter and Instagram (we will always
					attribute you).
				</li>
			</ul>
			<h2>How to submit</h2>
			<ol>
				<li>
					<a href="https://showcase-upload.remotion.dev/" target="_blank">
						Click here
					</a>{' '}
					to upload your video.
				</li>
				<li>
					We will automatically host your video, and create static and animated
					preview images. These assets are associated with the{' '}
					<code>muxId</code>. Once uploaded, you will see a JSON markup and a
					GitHub link where you can edit the list of showcase videos.
				</li>
				<li>
					Edit the list of showcase videos on GitHub by adding the JSON object
					to the bottom of the list. Fill in the placeholders in angle brackets
					according to the guidelines above and send your pull request.
				</li>
			</ol>
			<p>We look forward to your submissions! 🙌</p>
		</div>
	);
};

const ShowcaseAdd: React.FC = () => {
	return (
		<Layout>
			<Head>
				<title>Add to showcase</title>
			</Head>

			<header className={clsx('hero ', styles.heroBanner)}>
				<div className="container">
					<PageHeader />
				</div>
			</header>
		</Layout>
	);
};

export default ShowcaseAdd;
