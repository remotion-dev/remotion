import {Button, Card, ChoiceButton} from '@remotion/design';
import React, {useCallback, useEffect, useRef, useState} from 'react';

const FAQ = '/docs/license/faq';
const CONTACT = '/contact';
const BUY = 'https://remotion.pro/dashboard';
const GET_STARTED = '/docs';

type StepId = 'holder' | 'collab' | 'size' | 'how';
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
	readonly description: string | null;
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
	readonly option: string | null;
	readonly price: [string, string] | null;
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
				code: 'me',
				label: 'Me, for my own projects',
				description:
					'Freelance work too, as long as my clients only get the finished videos.',
				next: 'individual',
				joint: null,
			},
			{
				code: 'company',
				label: 'My company',
				description:
					'The videos are for a company that employs me or that I own. This includes single-person companies and agencies.',
				next: 'collab',
				joint: null,
			},
			{
				code: 'nonprofit',
				label: 'Our non-profit',
				description: "We're a registered charity or foundation.",
				next: 'nonprofit',
				joint: null,
			},
			{
				code: 'public',
				label: 'Our government body, school or university',
				description: "Public or private, even if we're a non-profit.",
				next: 'public',
				joint: null,
			},
			{
				code: 'eval',
				label: "Nobody yet, we're trying it out",
				description: "We haven't decided to use Remotion yet.",
				next: 'evaluation',
				joint: null,
			},
		],
	},
	collab: {
		question: () => 'Does another company work on your Remotion code?',
		hint: null,
		options: [
			{
				code: 'own',
				label: 'No',
				description:
					'Our clients only get the finished videos. Our customers only use or buy our app or templates.',
				next: 'size',
				joint: false,
			},
			{
				code: 'joint',
				label: 'Yes',
				description:
					'A client owns our code, or a partner develops it with us.',
				next: 'size',
				joint: true,
			},
		],
	},
	size: {
		question: (joint) =>
			joint
				? 'How many employees do both companies have together?'
				: 'How many employees does your company have?',
		hint: "Count every employee, including part-time ones, whether or not they use Remotion. Under the current license, freelancers and contractors don't count.",
		options: [
			{
				code: 'small',
				label: '1 to 3',
				description: null,
				next: 'small',
				joint: null,
			},
			{
				code: 'large',
				label: '4 or more',
				description: null,
				next: 'how',
				joint: null,
			},
		],
	},
	how: {
		question: () => 'Who starts each render?',
		hint: null,
		options: [
			{
				code: 'person',
				label: 'A person',
				description:
					'We start each video ourselves, in the Studio, on the command line, with a script or with an AI agent.',
				next: 'creators',
				joint: null,
			},
			{
				code: 'software',
				label: 'Software',
				description:
					'Our app, a schedule or our users start renders, or our website embeds the Player.',
				next: 'automators',
				joint: null,
			},
			{
				code: 'both',
				label: 'Both',
				description: 'Some videos are made by people, others by software.',
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
		option: null,
		price: ['$0', 'for personal and commercial use'],
		why: () =>
			"You use Remotion for your own projects, so you don't need to buy anything.",
		learnMore: `${FAQ}#who-is-eligible-for-the-free-license`,
	},
	evaluation: {
		kind: 'free',
		title: 'Free License',
		option: null,
		price: ['$0', 'while you evaluate'],
		why: () =>
			'Trying Remotion out is free until you decide to use it. Building a product with Remotion counts as using it, even before it ships.',
		learnMore: `${FAQ}#who-is-eligible-for-the-free-license`,
	},
	nonprofit: {
		kind: 'free',
		title: 'Free License',
		option: null,
		price: ['$0', 'for non-profits of any size'],
		why: () =>
			'Non-profits can use Remotion for free. We may ask for proof of your status.',
		learnMore: `${FAQ}#are-non-profit-organizations-eligible-for-the-free-license`,
	},
	public: {
		kind: 'ask',
		title: 'Free License or Company License',
		option: null,
		price: null,
		why: () =>
			"Tell us about your organization and we'll confirm in writing which one applies.",
		learnMore: `${FAQ}#are-non-profit-organizations-eligible-for-the-free-license`,
	},
	small: {
		kind: 'free',
		title: 'Free License',
		option: null,
		price: ['$0', 'including automations and the Player'],
		why: (joint) =>
			joint
				? 'Both companies together have 3 employees or fewer.'
				: 'Companies with up to 3 employees use Remotion for free.',
		learnMore: `${FAQ}#we-are-an-agency-making-videos-for-a-client-do-we-need-a-license`,
	},
	creators: {
		kind: 'paid',
		title: 'Company License',
		option: 'Remotion for Creators option',
		price: ['$25', 'per Seat per month'],
		why: (joint) =>
			'You need one Seat for each person who makes videos.' +
			(joint ? OWNER_NOTE : ''),
		learnMore: `${FAQ}#how-much-does-a-company-license-cost`,
	},
	automators: {
		kind: 'paid',
		title: 'Company License',
		option: 'Remotion for Automators option',
		price: ['$0.01', 'per render, $100 minimum per month'],
		why: (joint) =>
			'Renders started by software, or an embedded Player, count as automation.' +
			(joint ? OWNER_NOTE : ''),
		learnMore: `${FAQ}#what-is-considered-an-automation`,
	},
	both: {
		kind: 'paid',
		title: 'Company License',
		option: 'Remotion for Creators and Remotion for Automators options',
		price: ['$25 + $0.01', 'per Seat and per render, $100 minimum per month'],
		why: (joint) =>
			'Seats count toward the $100 monthly minimum.' +
			(joint ? OWNER_NOTE : ''),
		learnMore: `${FAQ}#how-much-does-a-company-license-cost`,
	},
};

const LEAD: Record<Result['kind'], string> = {
	free: 'You qualify for the',
	paid: 'You need a',
	ask: 'Depending on your organization',
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

	const restart = useCallback(() => {
		setCopyState('idle');
		setAnswers([]);
		stepRefs.current[0]?.scrollIntoView({block: 'nearest'});
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
		<div className="font-brand text-text flex flex-col gap-10 my-8">
			{steps.map((s, i) => {
				const step = STEPS[s.id];
				const hasDescriptions = step.options.some(
					(o) => o.description !== null,
				);
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
							className={
								hasDescriptions
									? step.options.length === 2
										? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
										: 'grid grid-cols-1 gap-3'
									: 'flex flex-wrap gap-3'
							}
						>
							{step.options.map((o) => (
								<ChoiceButton
									key={o.code}
									selected={s.picked === o.code}
									description={o.description}
									className={
										hasDescriptions ? undefined : 'min-h-12 py-0 justify-center'
									}
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
							{result.option ? (
								<div className="font-medium">with the {result.option}</div>
							) : null}
						</div>
						<div className="text-[var(--subtitle)] text-pretty max-w-[52ch]">
							{result.why(joint)}{' '}
							<a className="bluelink whitespace-nowrap" href={result.learnMore}>
								Learn more
							</a>
						</div>
						{result.price ? (
							<div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 pt-5 border-t border-black/10 dark:border-white/10">
								<span className="text-4xl font-bold tabular-nums">
									{result.price[0]}
								</span>
								<span className="text-[var(--subtitle)]">
									{result.price[1]}
								</span>
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
					<div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 text-[var(--subtitle)]">
						<div>
							This is not a written confirmation.{' '}
							<a className="bluelink" href={CONTACT}>
								Contact us
							</a>{' '}
							if you&apos;re unsure.
						</div>
						<button
							type="button"
							onClick={restart}
							className="font-brand font-medium text-[1em] text-text bg-transparent border-0 p-0 cursor-pointer underline underline-offset-4"
						>
							Start over
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
};
