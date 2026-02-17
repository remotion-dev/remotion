import {Button, InlineCode, Link} from '@remotion/design';
import React, {useEffect, useState} from 'react';
import {codeToHtml} from 'shikiji';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
} from '~/components/ui/dialog';
import {copyText} from './copy-text';
import {generateCode} from './generate-code';
import type {TimingComponent} from './types';

const CodeBlock: React.FC<{
	readonly code: string;
	readonly highlightedHtml: string;
}> = ({code, highlightedHtml}) => {
	return (
		<div className="overflow-auto rounded-md bg-[#24292e]">
			{highlightedHtml ? (
				<div
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{__html: highlightedHtml}}
					className="p-4 text-sm [&_pre]:m-0 [&_pre]:bg-transparent"
				/>
			) : (
				<pre className="p-4 text-sm text-gray-300">
					<code>{code}</code>
				</pre>
			)}
		</div>
	);
};

export const CodeModal: React.FC<{
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
	readonly components: TimingComponent[];
}> = ({open, onOpenChange, components}) => {
	const [highlightedImports, setHighlightedImports] = useState<string>('');
	const [highlightedCode, setHighlightedCode] = useState<string>('');
	const [copied, setCopied] = useState<'imports' | 'code' | null>(null);

	const generated = generateCode(components);

	useEffect(() => {
		if (!open) return;

		if (generated.imports) {
			codeToHtml(generated.imports, {
				lang: 'typescript',
				theme: 'github-dark',
			}).then((html) => {
				setHighlightedImports(html);
			});
		}

		codeToHtml(generated.code, {
			lang: 'typescript',
			theme: 'github-dark',
		}).then((html) => {
			setHighlightedCode(html);
		});
	}, [generated.imports, generated.code, open]);

	const handleCopy = async (type: 'imports' | 'code') => {
		const textToCopy = type === 'imports' ? generated.imports : generated.code;

		try {
			await copyText(textToCopy);
			setCopied(type);
			setTimeout(() => setCopied(null), 2000);
		} catch {
			// Fallback using clipboard API directly
			await navigator.clipboard.writeText(textToCopy);
			setCopied(type);
			setTimeout(() => setCopied(null), 2000);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogDescription>
						Copy this code into your Remotion project:
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 overflow-y-auto flex-1 min-h-0">
					{generated.imports ? (
						<div>
							<div className="flex items-center gap-2 mb-2">
								<span className="text-sm font-medium text-muted-foreground">
									Imports
								</span>
								<Button
									type="button"
									onClick={() => handleCopy('imports')}
									className="h-7 px-2 text-xs w-[60px]"
									depth={0.5}
								>
									{copied === 'imports' ? 'Copied!' : 'Copy'}
								</Button>
							</div>
							<CodeBlock
								code={generated.imports}
								highlightedHtml={highlightedImports}
							/>
						</div>
					) : null}

					<div>
						<div className="flex items-center gap-2 mb-2">
							<span className="text-sm font-medium text-muted-foreground">
								Code
							</span>
							<Button
								type="button"
								onClick={() => handleCopy('code')}
								className="h-7 px-2 text-xs w-[60px]"
								depth={0.5}
							>
								{copied === 'code' ? 'Copied!' : 'Copy'}
							</Button>
						</div>
						<CodeBlock
							code={generated.code}
							highlightedHtml={highlightedCode}
						/>
					</div>
				</div>
				<DialogDescription>
					<InlineCode>frame</InlineCode> is from the{' '}
					<Link
						href="https://www.remotion.dev/docs/use-current-frame"
						target="_blank"
						rel="noopener noreferrer"
					>
						<InlineCode>useCurrentFrame()</InlineCode>
					</Link>{' '}
					hook. <div className="h-[2px]" />
					<InlineCode>fps</InlineCode> is from the{' '}
					<Link
						href="https://www.remotion.dev/docs/use-video-config"
						target="_blank"
						rel="noopener noreferrer"
					>
						<InlineCode>useVideoConfig()</InlineCode>
					</Link>{' '}
					hook. <div className="h-[2px]" />
					See also:{' '}
					<Link
						href="https://www.remotion.dev/docs/animating-properties"
						target="_blank"
						rel="noopener noreferrer"
					>
						Animating properties
					</Link>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
};
