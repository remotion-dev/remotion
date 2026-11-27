import React, {useEffect, useId, useRef, useState} from 'react';
import styles from './StudioFallbackAlternatives.module.css';

const SKILL_COMMAND = '/remotion-elements';

export const CopyField: React.FC<{
	readonly label: string;
	readonly value: string;
}> = ({label, value}) => {
	const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
		'idle',
	);
	const codeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (copyState !== 'copied') {
			return;
		}

		const timeout = window.setTimeout(() => setCopyState('idle'), 2000);
		return () => window.clearTimeout(timeout);
	}, [copyState]);

	return (
		<>
			<div className={styles.field}>
				<code
					ref={codeRef}
					aria-label={label}
					className={styles.code}
					onFocus={(event) =>
						window.getSelection()?.selectAllChildren(event.currentTarget)
					}
					tabIndex={0}
				>
					{value.startsWith(`${SKILL_COMMAND} `) ? (
						<>
							<span className={styles.skill}>{SKILL_COMMAND}</span>
							{value.slice(SKILL_COMMAND.length)}
						</>
					) : (
						value
					)}
				</code>
				<button
					aria-label={`Copy ${label}`}
					className={styles.copyButton}
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(value);
							setCopyState('copied');
						} catch {
							setCopyState('error');
							codeRef.current?.focus();
						}
					}}
					title={`Copy ${label}`}
					type="button"
				>
					<svg
						aria-hidden="true"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						{copyState === 'copied' ? (
							<path d="m5 12 4 4L19 6" />
						) : (
							<>
								<rect x="9" y="9" width="13" height="13" rx="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</>
						)}
					</svg>
				</button>
			</div>
			<p
				aria-live="polite"
				className={
					copyState === 'error' ? styles.copyError : styles.visuallyHidden
				}
			>
				{copyState === 'copied'
					? 'Copied.'
					: copyState === 'error'
						? 'Could not copy. The text is selected, copy it with your keyboard.'
						: null}
			</p>
		</>
	);
};

const tabs = [
	{id: 'agent', label: 'Agent / CLI'},
	{id: 'studio', label: 'Studio'},
] as const;

export const StudioFallbackAlternatives: React.FC<{
	readonly agentPrompt: string;
	readonly children: React.ReactNode;
	readonly cliCommand: string;
}> = ({agentPrompt, children, cliCommand}) => {
	const [activeTab, setActiveTab] =
		useState<(typeof tabs)[number]['id']>('agent');
	const id = useId();

	return (
		<div className={styles.container}>
			<div
				aria-label="Install method"
				className={styles.tabList}
				onKeyDown={(event) => {
					if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
						return;
					}

					const index = tabs.findIndex((tab) => tab.id === activeTab);
					const next =
						tabs[
							(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
								tabs.length
						];
					setActiveTab(next.id);
					document.getElementById(`${id}-${next.id}-tab`)?.focus();
				}}
				role="tablist"
			>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						aria-controls={`${id}-panel`}
						aria-selected={tab.id === activeTab}
						className={styles.tab}
						id={`${id}-${tab.id}-tab`}
						onClick={() => setActiveTab(tab.id)}
						role="tab"
						tabIndex={tab.id === activeTab ? 0 : -1}
						type="button"
					>
						{tab.label}
					</button>
				))}
			</div>
			<div
				aria-labelledby={`${id}-${activeTab}-tab`}
				className={styles.panel}
				id={`${id}-panel`}
				role="tabpanel"
			>
				{activeTab === 'agent' ? (
					<>
						<p className={styles.label}>Install the Agent Skill (once):</p>
						<CopyField label="command" value="npx remotion skills add" />
						<p className={styles.label}>Paste this prompt into your agent:</p>
						<CopyField
							label="prompt"
							value={`${SKILL_COMMAND} ${agentPrompt}`}
						/>
						<p className={styles.label}>Or run the command yourself:</p>
						<CopyField label="CLI command" value={cliCommand} />
					</>
				) : (
					children
				)}
			</div>
		</div>
	);
};
