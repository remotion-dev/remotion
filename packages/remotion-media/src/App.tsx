import React, {useEffect, useState} from 'react';
import variants from '../variants.json';
import {getCategoryLabel} from './agents';
import './index.css';

const CopyLink = ({href}: {readonly href: string}) => {
	const [copied, setCopied] = React.useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(href);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 1000);
	};

	return (
		<span
			onClick={handleCopy}
			className=" text-sm hover:text-blue-500 cursor-pointer"
		>
			{copied ? 'Copied' : 'Copy link'}
		</span>
	);
};

const VideoVariant = ({
	variant,
}: {
	readonly variant: (typeof variants)[number];
}) => {
	return (
		<div className="bg-white p-2 mb-2 border-2 border-b-4 rounded-md">
			<a
				href={`/${variant.fileNames[0]}`}
				className="leading-tight hover:text-blue-500"
			>
				<strong className="mr-2 inline-block font-brand">
					{variant.fileNames[0]}
				</strong>
			</a>
			<div className="flex-1" />
			<div className="text-neutral-500 text-sm font-brand">
				{variant.size < 1024 * 1024
					? `${(variant.size / 1024).toFixed(0)} KB`
					: `${(variant.size / 1024 / 1024).toFixed(1)} MB`}{' '}
				{' ∙ '}
				{variant.container.toUpperCase()}
				{' ∙ '}
				{variant.videoCodec === 'none'
					? 'No video'
					: variant.videoCodec.toUpperCase()}
				{' ∙ '}
				{variant.audioCodec === 'none'
					? 'No audio'
					: variant.audioCodec.toUpperCase()}
				{' ∙ '}
				<CopyLink href={`https://remotion.media/${variant.fileNames[0]}`} />
				{' ∙ '}
				<a
					href={`/${variant.fileNames[0]}`}
					download={variant.fileNames[0]}
					className=" text-sm hover:text-blue-500 cursor-pointer"
				>
					Download
				</a>
				{' ∙ '}
				<a
					href={`https://remotion.dev/convert?url=${encodeURIComponent(
						`https://remotion.media/${variant.fileNames[0]}`,
					)}`}
					download={variant.fileNames[0]}
					className=" text-sm hover:text-blue-500 cursor-pointer"
				>
					Probe
				</a>
			</div>
			{variant.fileNames.length > 1 && (
				<div className="text-neutral-500 text-sm font-brand">
					<span>Aliases: </span>
					{variant.fileNames.slice(1).map((fileName) => (
						<span key={fileName} className="mr-2">
							{fileName}
						</span>
					))}
				</div>
			)}
		</div>
	);
};

const CategoryGroup = ({
	category,
	variants: v,
}: {
	readonly category: string;
	readonly variants: (typeof variants)[number][];
}) => {
	return (
		<div id={`category-${category}`} className="scroll-mt-4">
			<h3 className="text-lg font-bold mt-5 mb-4 font-brand">
				{getCategoryLabel(category)}
			</h3>
			{v.map((variant) => (
				<VideoVariant key={variant.fileNames[0]} variant={variant} />
			))}
		</div>
	);
};

const groups = variants.reduce(
	(acc, variant) => {
		acc[variant.category] = acc[variant.category] || [];
		acc[variant.category].push(variant);
		return acc;
	},
	{} as Record<string, (typeof variants)[number][]>,
);

const categoryKeys = Object.keys(groups);

const Sidebar = ({
	activeCategory,
	showBackToTop,
}: {
	readonly activeCategory: string | null;
	readonly showBackToTop: boolean;
}) => {
	return (
		<nav className="hidden lg:block sticky top-4 self-start w-48 shrink-0 pt-6">
			<ul className="flex flex-col gap-1">
				{categoryKeys.map((category) => (
					<li key={category}>
						<a
							href={`#category-${category}`}
							className={`block px-3 py-1.5 rounded-md text-sm font-brand transition-colors ${
								activeCategory === category
									? 'bg-blue-100 text-blue-700 font-semibold'
									: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
							}`}
						>
							{getCategoryLabel(category)}
						</a>
					</li>
				))}
				{showBackToTop && (
					<li className="mt-2 pt-2 border-t border-neutral-200">
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								window.scrollTo({top: 0});
							}}
							className="block px-3 py-1.5 rounded-md text-sm font-brand text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
						>
							Back to top
						</a>
					</li>
				)}
			</ul>
		</nav>
	);
};

export function App() {
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [showBackToTop, setShowBackToTop] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setShowBackToTop(window.scrollY > 500);
		};

		window.addEventListener('scroll', handleScroll, {passive: true});
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const observers: IntersectionObserver[] = [];
		const visibleCategories = new Set<string>();

		for (const category of categoryKeys) {
			const el = document.getElementById(`category-${category}`);
			if (!el) continue;

			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						visibleCategories.add(category);
					} else {
						visibleCategories.delete(category);
					}

					// Pick the first visible category in document order
					for (const key of categoryKeys) {
						if (visibleCategories.has(key)) {
							setActiveCategory(key);
							return;
						}
					}
				},
				{rootMargin: '-10% 0px -80% 0px'},
			);
			observer.observe(el);
			observers.push(observer);
		}

		return () => {
			for (const observer of observers) observer.disconnect();
		};
	}, []);

	return (
		<div className="max-w-[960px] w-full m-auto mt-4 px-4 mb-20">
			<h2 className="text-2xl font-bold mt-10 mb-2 font-brand">
				Audio and video files for testing
			</h2>
			<p className="text-neutral-500 font-brand mt-1 mb-8">
				All files are available on{' '}
				<code className="font-brand text-brand">remotion.media/[filename]</code>
				.
				<br />
				Hosted on Cloudflare R2 Free Tier, allowing for theoretically unlimited
				bandwidth. <br />
				Files may be used royalty-free and without attribution.
				<br />
				For agents, use{' '}
				<a href="/AGENTS.md" className="font-brand text-brand hover:underline">
					AGENTS.md
				</a>
				.
			</p>
			<div className="flex gap-8 items-start">
				<Sidebar
					activeCategory={activeCategory}
					showBackToTop={showBackToTop}
				/>
				<div className="flex-1 min-w-0">
					{Object.entries(groups).map(([category, categoryVariants]) => (
						<CategoryGroup
							key={category}
							category={category}
							variants={categoryVariants}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default App;
