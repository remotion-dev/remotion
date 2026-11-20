import {Button, Card, ChoiceButton} from '@remotion/design';
import React, {useCallback, useEffect, useRef, useState} from 'react';

const FAQ = '/docs/license/faq';
const CONTACT = '/contact';
const BUY = 'https://www.remotion.dev/dashboard';
const GET_STARTED = '/docs';

type StepId = 'holder' | 'nonprofitKind' | 'collab' | 'size' | 'how';
type ResultId =
	| 'individual'
	| 'evaluation'
	| 'nonprofit'
	| 'public'
	| 'small'
	| 'creators'
	| 'automators'
	| 'both';

type Option = {
	readonly code: string;
	readonly label: string;
	readonly next: StepId | ResultId;
	readonly joint: boolean | null;
};

type Step = {
	readonly question: (joint: boolean) => string;
	readonly hint: string | null;
	readonly options: Option[];
};

type Result = {
	readonly kind: 'free' | 'paid' | 'ask';
	readonly title: string;
	readonly options: string[];
	readonly price: [string, string][] | null;
	readonly why: (joint: boolean) => string;
	readonly learnMore: string;
};

// Each option has a short code. The codes of all answers, joined by "-",
// form the URL hash, so a result can be shared as a link.
const STEPS: Record<StepId, Step> = {
	holder: {
		question: () => 'Who would use Remotion?',
		hint: null,
		options: [
			{
				code: 'individual',
				label: 'Individual or freelancer',
				next: 'individual',
				joint: null,
			},
			{
				code: 'company',
				label: 'Company or agency',
				next: 'collab',
				joint: null,
			},
			{
				code: 'nonprofit',
				label: 'Non-profit',
				next: 'nonprofitKind',
				joint: null,
			},
			{
				code: 'public',
				label: 'Government body, school or university',
				next: 'public',
				joint: null,
			},
			{
				code: 'eval',
				label: 'Nobody yet, still evaluating',
				next: 'evaluation',
				joint: null,
			},
		],
	},
	nonprofitKind: {
		question: () => 'Does the non-profit mainly serve commercial interests?',
		hint: 'For example, a trade association, an industry group or a subsidiary of a company.',
		options: [
			{
				code: 'charity',
				label: 'No',
				next: 'nonprofit',
				joint: null,
			},
			{
				code: 'commercial',
				label: 'Yes',
				next: 'public',
				joint: null,
			},
		],
	},
	collab: {
		question: () => 'Does another company work on the Remotion code?',
		hint: "For example, a client owns the code or a partner helps develop it. Delivering finished videos, or selling an app or templates, doesn't count.",
		options: [
			{
				code: 'own',
				label: 'No',
				next: 'size',
				joint: false,
			},
			{
				code: 'joint',
				label: 'Yes',
				next: 'size',
				joint: true,
			},
		],
	},
	size: {
		question: (joint) =>
			joint
				? 'How many employees do both companies have together?'
				: 'How many employees does the company have?',
		hint: "Count every employee, including part-time ones, whether or not they use Remotion. Under the current license, freelancers and contractors don't count.",
		options: [
			{
				code: 'small',
				label: '1 to 3',
				next: 'small',
				joint: null,
			},
			{
				code: 'large',
				label: '4 or more',
				next: 'how',
				joint: null,
			},
		],
	},
	how: {
		question: () => 'Who starts each render?',
		hint: 'A person starts renders in the Studio, on the command line, with a script or with an AI agent. Software means an app, a schedule or end users start renders, or a website embeds the Player.',
		options: [
			{
				code: 'person',
				label: 'A person',
				next: 'creators',
				joint: null,
			},
			{
				code: 'software',
				label: 'Software',
				next: 'automators',
				joint: null,
			},
			{
				code: 'both',
				label: 'Both',
				next: 'both',
				joint: null,
			},
		],
	},
};

const OWNER_NOTE = ' The company that owns the code holds the license.';

const RESULTS: Record<ResultId, Result> = {
	individual: {
		kind: 'free',
		title: 'Free License',
		options: [],
		price: [['$0', 'for personal and commercial use']],
		why: () =>
			"Individuals don't need to buy anything. This includes freelance work, as long as clients only get the finished videos.",
		learnMore: `${FAQ}#who-is-eligible-for-the-free-license`,
	},
	evaluation: {
		kind: 'free',
		title: 'Free License',
		options: [],
		price: [['$0', 'during evaluation']],
		why: () =>
			'Trying Remotion out is free until it is put to use. Building a product with Remotion counts as using it, even before it ships.',
		learnMore: `${FAQ}#who-is-eligible-for-the-free-license`,
	},
	nonprofit: {
		kind: 'free',
		title: 'Free License',
		options: [],
		price: [['$0', 'for non-profits of any size']],
		why: () =>
			'Registered charities and foundations can use Remotion for free. We may ask for proof of non-profit status.',
		learnMore: `${FAQ}#are-non-profit-organizations-eligible-for-the-free-license`,
	},
	public: {
		kind: 'ask',
		title: 'Free License or Company License',
		options: [],
		price: null,
		why: () =>
			"Government bodies, schools and universities, even non-profit ones, and non-profits serving commercial interests need written permission to use the Free License. Tell us about the organization and we'll confirm in writing which one applies.",
		learnMore: `${FAQ}#are-non-profit-organizations-eligible-for-the-free-license`,
	},
	small: {
		kind: 'free',
		title: 'Free License',
		options: [],
		price: [['$0', 'including automations and the Player']],
		why: (joint) =>
			joint
				? 'Both companies together have 3 employees or fewer.'
				: 'Companies with up to 3 employees use Remotion for free.',
		learnMore: `${FAQ}#we-are-an-agency-making-videos-for-a-client-do-we-need-a-license`,
	},
	creators: {
		kind: 'paid',
		title: 'Company License',
		options: ['Remotion for Creators'],
		price: [['$25', 'per Seat per month']],
		why: (joint) =>
			'One Seat is needed for each person who makes videos.' +
			(joint ? OWNER_NOTE : ''),
		learnMore: `${FAQ}#how-much-does-a-company-license-cost`,
	},
	automators: {
		kind: 'paid',
		title: 'Company License',
		options: ['Remotion for Automators'],
		price: [['$0.01', 'per render, $100 minimum per month']],
		why: (joint) =>
			'Renders started by software, or an embedded Player, count as automation.' +
			(joint ? OWNER_NOTE : ''),
		learnMore: `${FAQ}#what-is-considered-an-automation`,
	},
	both: {
		kind: 'paid',
		title: 'Company License',
		options: ['Remotion for Creators', 'Remotion for Automators'],
		price: [
			['$25', 'per Seat per month'],
			['$0.01', 'per render, $100 minimum per month'],
		],
		why: (joint) =>
			'Seats count toward the $100 monthly minimum.' +
			(joint ? OWNER_NOTE : ''),
		learnMore: `${FAQ}#how-much-does-a-company-license-cost`,
	},
};

const LEAD: Record<Result['kind'], string> = {
	free: 'Eligible for the',
	paid: 'Requires a',
	ask: 'Depending on the organization',
};

const isStepId = (id: StepId | ResultId): id is StepId => id in STEPS;

// Follows the answers through the questions. Answers that no longer fit the
// path are dropped.
const walk = (answers: string[]) => {
	const steps: {id: StepId; picked: string | null}[] = [];
	let joint = false;
	let id: StepId | ResultId = 'holder';
	while (isStepId(id)) {
		const option: Option | undefined = STEPS[id].options.find(
			(o) => o.code === answers[steps.length],
		);
		steps.push({id, picked: option ? option.code : null});
		if (!option) {
			return {steps, joint, result: null};
		}

		if (option.joint !== null) {
			joint = option.joint;
		}

		id = option.next;
	}

	return {steps, joint, result: RESULTS[id]};
};

const readHash = (): string[] => {
	const hash = window.location.hash.replace(/^#/, '');
	return /^[a-z]+(-[a-z]+)*$/.test(hash) ? hash.split('-') : [];
};

export const LicenseQuiz: React.FC = () => {
	const [answers, setAnswers] = useState<string[]>([]);
	const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>(
		'idle',
	);
	const scrollTarget = useRef<number | null>(null);
	const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

	const {steps, joint, result} = walk(answers);
	const validAnswers = steps
		.map((s) => s.picked)
		.filter((p): p is string => p !== null);
	const code = validAnswers.join('-');

	useEffect(() => {
		setAnswers(readHash());
		const onHashChange = () => setAnswers(readHash());
		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	}, []);

	useEffect(() => {
		const hash = code ? `#${code}` : '';
		if (window.location.hash === hash) {
			return;
		}

		window.history.replaceState(
			null,
			'',
			hash || window.location.pathname + window.location.search,
		);
	}, [code]);

	useEffect(() => {
		if (scrollTarget.current === null) {
			return;
		}

		const target = stepRefs.current[scrollTarget.current];
		scrollTarget.current = null;
		target?.scrollIntoView({
			block: 'nearest',
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
				? 'auto'
				: 'smooth',
		});
	}, [code]);

	const pick = useCallback((stepIndex: number, optionCode: string) => {
		setCopyState('idle');
		scrollTarget.current = stepIndex + 1;
		setAnswers((prev) => [...prev.slice(0, stepIndex), optionCode]);
	}, []);

	const copyLink = useCallback(() => {
		const link = window.location.href;
		try {
			navigator.clipboard.writeText(link).then(
				() => {
					setCopyState('copied');
					setTimeout(() => setCopyState('idle'), 2000);
				},
				() => setCopyState('manual'),
			);
		} catch {
			setCopyState('manual');
		}
	}, []);

	return (
		<div className="font-brand text-text flex flex-col gap-10 my-8 max-w-2xl">
			{steps.map((s, i) => {
				const step = STEPS[s.id];
				return (
					<div
						key={s.id}
						ref={(el) => {
							stepRefs.current[i] = el;
						}}
						className="flex flex-col gap-4 scroll-mt-24"
					>
						<div className="flex flex-col gap-1">
							<div className="text-xl font-bold" id={`license-quiz-q-${i}`}>
								{step.question(joint)}
							</div>
							{step.hint ? (
								<div className="text-[var(--subtitle)] text-pretty">
									{step.hint}
								</div>
							) : null}
						</div>
						<div
							role="group"
							aria-labelledby={`license-quiz-q-${i}`}
							className="flex flex-wrap gap-3"
						>
							{step.options.map((o) => (
								<ChoiceButton
									key={o.code}
									selected={s.picked === o.code}
									description={null}
									className="min-h-12 py-0 justify-center"
									onClick={() => pick(i, o.code)}
								>
									{o.label}
								</ChoiceButton>
							))}
						</div>
					</div>
				);
			})}
			{result ? (
				<div
					ref={(el) => {
						stepRefs.current[steps.length] = el;
					}}
					className="flex flex-col gap-4 scroll-mt-24"
				>
					<Card className="p-6 sm:p-8 flex flex-col gap-6" aria-live="polite">
						<div className="flex flex-col gap-1">
							<div className="text-[var(--subtitle)]">{LEAD[result.kind]}</div>
							<div className="text-3xl font-bold text-balance">
								{result.title}
							</div>
							{result.options.length === 1 ? (
								<div className="font-medium">
									with the {result.options[0]} option
								</div>
							) : null}
							{result.options.length > 1 ? (
								<div className="font-medium">
									with these options:
									<ul className="m-0 mt-1 pl-5">
										{result.options.map((o) => (
											<li key={o}>{o}</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
						<div className="text-[var(--subtitle)] text-pretty max-w-[52ch]">
							{result.why(joint)}{' '}
							<a className="bluelink whitespace-nowrap" href={result.learnMore}>
								Learn more
							</a>
						</div>
						{result.price ? (
							<div className="flex flex-col gap-1 pt-5 border-t border-black/10 dark:border-white/10">
								{result.price.map(([amount, unit]) => (
									<div
										key={amount}
										className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1"
									>
										<span className="text-4xl font-bold tabular-nums">
											{amount}
										</span>
										<span className="text-[var(--subtitle)]">{unit}</span>
									</div>
								))}
							</div>
						) : null}
						<div className="flex flex-wrap gap-3">
							{result.kind === 'paid' ? (
								<>
									<Button href={BUY} className="bg-brand text-white">
										Buy now
									</Button>
									<Button href={CONTACT}>Contact us</Button>
								</>
							) : result.kind === 'ask' ? (
								<Button href={CONTACT} className="bg-brand text-white">
									Contact us
								</Button>
							) : (
								<Button href={GET_STARTED} className="bg-brand text-white">
									Get started
								</Button>
							)}
							<Button onClick={copyLink}>
								{copyState === 'copied' ? 'Link copied' : 'Copy link'}
							</Button>
						</div>
						{copyState === 'manual' ? (
							<label className="flex flex-col gap-1.5">
								<span className="text-[var(--subtitle)]">
									Copy this link to share your answers.
								</span>
								<input
									readOnly
									name="license-quiz-link"
									value={window.location.href}
									onFocus={(e) => e.currentTarget.select()}
									className="font-brand text-text bg-transparent border-2 border-solid border-black rounded-lg px-3 py-2.5 w-full"
								/>
							</label>
						) : null}
					</Card>
				</div>
			) : null}
		</div>
	);
};
