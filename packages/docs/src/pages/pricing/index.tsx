import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {Pricing} from '@remotion/promo-pages/dist/homepage/Pricing.js';
import Layout from '@theme/Layout';
import React, {type ReactNode} from 'react';
import styles from './styles.module.css';

type FaqItem = {
	readonly question: string;
	readonly answer: ReactNode;
};

const faqItems: FaqItem[] = [
	{
		question: 'What is Remotion?',
		answer: (
			<>
				<p>
					This page is for Remotion pricing and company licenses. If you want to
					learn about Remotion itself first, go to the main site.
				</p>
				<p>
					<Link to="/">Go to main site</Link>
				</p>
			</>
		),
	},
	{
		question: 'Who is eligible for the free license?',
		answer: (
			<>
				<p>You are eligible to use Remotion for free if you are:</p>
				<ul>
					<li>an individual</li>
					<li>a for-profit organisation with up to 3 employees</li>
					<li>a non-profit or not-for-profit organisation</li>
					<li>
						evaluating whether Remotion is a good fit, and are not yet using it
						in a commercial way
					</li>
				</ul>
				<p>
					<Link to="/contact">Contact us</Link> in case you need confirmation if
					your use case is acceptable.
				</p>
			</>
		),
	},
	{
		question: 'Why is Remotion free for some and paid for others?',
		answer: (
			<p>
				The Remotion project works similarly as many open source projects, in
				that way, that the code is openly available on GitHub and that
				individuals use it freely and contribute back. But to pay for the time
				that it takes to maintain such an ambitious project, we need to generate
				money. This is also good for you: You get regular updates, good support,
				motivated maintainers and an overall healthy product. By separating
				individuals and companies, we are charging those who are most able to
				afford it.
			</p>
		),
	},
	{
		question:
			'What is the difference in functionality between the free and paid version?',
		answer: (
			<p>
				There is no difference between the free and paid version.
				<br />
				We discriminate the price of the same software for various users:
				Remotion is free for individuals and small organizations, but paid for
				bigger organizations.
			</p>
		),
	},
	{
		question: 'What does prioritized support mean?',
		answer: (
			<>
				<p>
					Support is provided on a best-effort basis, but we will respond first
					to people who own a company license. We try to reply and help
					everybody who files an issue or contacts us. We recommend to ask
					questions or get help in public channels such as GitHub Issues or
					Discord whenever possible where community members also have the chance
					to reply. See our Support Policy for details.
				</p>
				<p>
					<Link to="/docs/support">Support policy</Link>
				</p>
			</>
		),
	},
	{
		question: 'How is commercial use allowed?',
		answer: (
			<p>
				Any commercial use case is allowed as long as you are not selling
				Remotion as a product itself or allowing people to circumvent cases
				where they would have to buy a license themselves.
				<br />
				<br />
				Example of an accepted use case:
				<br />
				Allowing users to create and render their own personalized video based
				on your Remotion template.
				<br />
				<br />
				Example of an unacceptable use case:
				<br />
				Allowing users to submit any Remotion video, meaning a Remotion project,
				to your server for rendering.
			</p>
		),
	},
	{
		question: 'What is considered an automation?',
		answer: (
			<p>
				An automation is defined as owning code that calls one of the following
				APIs or commands programmatically: <code>renderMedia()</code>,{' '}
				<code>renderStill()</code>, <code>renderFrames()</code>,{' '}
				<code>renderMediaOnLambda()</code>, <code>renderStillOnLambda()</code>,{' '}
				<code>renderMediaOnCloudRun()</code>,{' '}
				<code>renderStillOnCloudRun()</code>, <code>renderMediaOnVercel()</code>
				, <code>renderStillOnVercel()</code>, <code>renderMediaOnWeb()</code>,{' '}
				<code>renderStillOnWeb()</code>, <code>npx remotion render</code>,{' '}
				<code>npx remotion still</code>, <code>npx remotion lambda render</code>
				, <code>npx remotion lambda still</code>,{' '}
				<code>npx remotion cloudrun render</code>,{' '}
				<code>npx remotion cloudrun still</code>, or using the{' '}
				<code>&lt;Player&gt;</code> component.
				<br />
				<br />
				Building an automation makes the use case fall under the Remotion for
				Automators option.
			</p>
		),
	},
	{
		question: 'When do I need to purchase Renders?',
		answer: (
			<p>
				If you are setting up an automation to render videos programmatically,
				you need to purchase Renders.
				<br />
				Low-volume video production, such as rendering locally or one-off
				renders on a server, does not require purchasing Renders.
			</p>
		),
	},
	{
		question: 'Can I use an LLM to generate Remotion code on behalf of a user?',
		answer: (
			<>
				<p>
					Yes, it is allowed to build a service that generates Remotion code
					using artificial intelligence and renders it. Allowing end-users to
					edit the Remotion code is also permitted if the code was initially
					generated by your service.
				</p>
				<p>
					However, it is not allowed to let users bring or upload their own
					Remotion code to your service for rendering.
				</p>
				<p>
					See the{' '}
					<a href="https://www.remotion.pro/terms#RenderingService">
						Terms and Conditions
					</a>{' '}
					for the full policy on rendering services.
				</p>
			</>
		),
	},
	{
		question:
			'We are an agency making videos for a client. Do we need a license?',
		answer: (
			<p>
				In case of collaborations between teams or companies, the combined
				headcount counts for the company size threshold. This means, if the
				total headcount of both companies or teams adds up to 4 people or more,
				you need a license. Of course you still only need a license for the
				developers who are actively working on the project.
				<br />
				<br />
				The responsibility for purchasing a license falls upon the entity that
				will ultimately own the output generated using Remotion.
			</p>
		),
	},
	{
		question:
			'We require a purchase order process or a vendor onboarding. Do you do this?',
		answer: (
			<p>
				Compliance forms and leaving our platform, meaning Remotion Dashboard,
				for license management, such as billing and payment, requires an
				Enterprise License.
			</p>
		),
	},
	{
		question: 'Can we use Remotion in a serverless architecture?',
		answer: (
			<p>
				Yes. You can use a solution such as Remotion Lambda to render a video
				serverlessly. This also counts as a Render.
			</p>
		),
	},
	{
		question: "What if these plans don't fit our use case?",
		answer: (
			<p>
				You can <Link to="/contact">contact us</Link> if you would like to
				discuss a custom agreement.
			</p>
		),
	},
	{
		question: 'How is 1 render defined?',
		answer: (
			<>
				<p>
					1 render is the successful generation of a video, audio, GIF, PDF or
					still image.
				</p>
				<p>Previews in the Studio or Player do not count as renders.</p>
			</>
		),
	},
	{
		question: 'Where is my Remotion project hosted?',
		answer: (
			<p>
				You have set up your own infrastructure using cloud services like AWS,
				Google Cloud, or Azure.
				<br />
				Acquiring Renders refers to the permission to use Remotion to render on
				the server but does not include the costs of such cloud services.
			</p>
		),
	},
	{
		question: 'What if we go beyond the usage my license allows?',
		answer: (
			<p>
				If you go beyond the render limit of your license, you can increase the
				number of renders at any time in your Remotion Dashboard, and the price
				will be prorated for the current period and included in your next
				invoice. We expect that you make those adjustments in the Remotion
				Dashboard within 30 days after you have exceeded your limit.
				<br />
				<br />
				The same applies to the number of Seats, if you onboarded more Creators
				than you bought Seats for.
			</p>
		),
	},
	{
		question: 'Is there a refund period?',
		answer: (
			<p>
				There are no refunds because you can already evaluate Remotion before
				using it commercially.
			</p>
		),
	},
	{
		question: 'Can we upgrade / downgrade / cancel / get a receipt?',
		answer: (
			<p>
				Your Remotion Dashboard allows you to do all of these without having to
				contact a human.
			</p>
		),
	},
	{
		question: 'What payment methods are accepted?',
		answer: (
			<p>
				We use Stripe as a payment service. It accepts all major payment
				methods.
			</p>
		),
	},
	{
		question: 'For how long do I need to maintain my license?',
		answer: (
			<p>
				Remotion for Creators:
				<br />
				You need to have at least 1 Seat active as long as you are using
				Remotion to render videos, either locally or as one-off renders on a
				server.
				<br />
				<br />
				Remotion for Automators:
				<br />
				You must maintain an active license while working on a Remotion project
				or rendering videos through your automation. Once you stop rendering
				videos and no longer use Remotion in any other capacity, such as the
				Remotion Player, you may cancel your license.
			</p>
		),
	},
];

const FaqQuestion: React.FC<FaqItem> = ({question, answer}) => {
	return (
		<details className={styles.faqItem}>
			<summary>{question}</summary>
			<div className={styles.answer}>{answer}</div>
		</details>
	);
};

const PricingPage: React.FC = () => {
	return (
		<div className={styles.page}>
			<Layout>
				<Head>
					<title>Pricing | Remotion</title>
					<meta
						name="description"
						content="Remotion pricing, free license eligibility, company licenses, and enterprise options."
					/>
				</Head>
				<main className={styles.container}>
					<h1 className={styles.visuallyHidden}>Pricing</h1>
					<Pricing faqHref="#faq" />
					<section id="faq" aria-labelledby="pricing-faq">
						<h2 id="pricing-faq" className={styles.faqTitle}>
							FAQ
						</h2>
						<div className={styles.faqList}>
							{faqItems.map((item) => (
								<FaqQuestion
									key={item.question}
									question={item.question}
									answer={item.answer}
								/>
							))}
						</div>
					</section>
				</main>
			</Layout>
		</div>
	);
};

export default PricingPage;
