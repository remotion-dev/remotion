import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {IconForTemplate} from '../../components/IconForTemplate';
import {Seo} from '../../components/Seo';
import {SkiaIcon} from '../../components/icons/skia';
import {TimelineIcon} from '../../components/icons/timeline';
import styles from './styles.module.css';

const content: React.CSSProperties = {
	maxWidth: 1000,
	margin: 'auto',
	padding: '0 20px',
};

const para: React.CSSProperties = {
	textAlign: 'center',
	marginBottom: 50,
};

const lowerpara: React.CSSProperties = {
	textAlign: 'center',
	color: 'var(--light-text-color)',
};

const outer: React.CSSProperties = {
	display: 'flex',
	cursor: 'pointer',
	color: 'var(--text-color)',
	textDecoration: 'none',
};

const icon: React.CSSProperties = {
	display: 'flex',
	margin: 0,
	marginRight: 10,
	height: 30,
	width: 30,
	justifyContent: 'center',
	alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
	fontWeight: 'bold',
};

const descriptionStyle: React.CSSProperties = {
	fontSize: 14,
	marginTop: 10,
	color: 'var(--light-text-color)',
	marginBottom: 10,
};

const Item: React.FC<{
	readonly label: string;
	readonly description: string;
	readonly children: React.ReactNode;
}> = ({children, label, description}) => {
	return (
		<div>
			<div
				style={{flexDirection: 'row', display: 'flex', alignItems: 'center'}}
			>
				<div style={icon}>{children}</div>
				<div style={labelStyle}>{label}</div>
			</div>
			<div>
				<p
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: description,
					}}
					style={descriptionStyle}
				/>
			</div>
		</div>
	);
};

export default () => {
	const imgSrc = `/generated/template-all.png`;
	const context = useDocusaurusContext();

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(`Starter Templates | Remotion`)}
				{Seo.renderDescription(
					'Jumpstart your Remotion project with a template.',
				)}
				{Seo.renderImage(imgSrc, context.siteConfig.url)}
			</Head>
			<div style={content}>
				<h1 className={styles.title}>
					Find the right
					<br />
					template
				</h1>
				<p style={para}>
					Jumpstart your project with a template that fits your usecase.
				</p>
				<h3>Free templates</h3>
				<div className={styles.grid}>
					{CreateVideoInternals.FEATURED_TEMPLATES.map((template) => {
						return (
							<Link
								key={template.cliId}
								className={styles.item}
								style={outer}
								to={`/templates/${template.cliId}`}
							>
								<Item
									label={template.homePageLabel}
									description={template.description}
								>
									<IconForTemplate scale={0.7} template={template} />
								</Item>
							</Link>
						);
					})}
				</div>
				<br />
				<br />
				<h3>Paid templates</h3>
				<div className={styles.grid}>
					<Link
						key={'map'}
						className={styles.item}
						style={outer}
						to={`https://www.remotion.pro/mapbox-globe`}
					>
						<Item
							label={'Mapbox Globe'}
							description={'A rotateable and zoomeable 3D Globe'}
						>
							<svg style={{height: 0.7 * 36}} viewBox="0 0 512 512">
								<path
									fill="currentcolor"
									d="M256 464c7.4 0 27-7.2 47.6-48.4c8.8-17.7 16.4-39.2 22-63.6H186.4c5.6 24.4 13.2 45.9 22 63.6C229 456.8 248.6 464 256 464zM178.5 304h155c1.6-15.3 2.5-31.4 2.5-48s-.9-32.7-2.5-48h-155c-1.6 15.3-2.5 31.4-2.5 48s.9 32.7 2.5 48zm7.9-144H325.6c-5.6-24.4-13.2-45.9-22-63.6C283 55.2 263.4 48 256 48s-27 7.2-47.6 48.4c-8.8 17.7-16.4 39.2-22 63.6zm195.3 48c1.5 15.5 2.2 31.6 2.2 48s-.8 32.5-2.2 48h76.7c3.6-15.4 5.6-31.5 5.6-48s-1.9-32.6-5.6-48H381.8zm58.8-48c-21.4-41.1-56.1-74.1-98.4-93.4c14.1 25.6 25.3 57.5 32.6 93.4h65.9zm-303.3 0c7.3-35.9 18.5-67.7 32.6-93.4c-42.3 19.3-77 52.3-98.4 93.4h65.9zM53.6 208c-3.6 15.4-5.6 31.5-5.6 48s1.9 32.6 5.6 48h76.7c-1.5-15.5-2.2-31.6-2.2-48s.8-32.5 2.2-48H53.6zM342.1 445.4c42.3-19.3 77-52.3 98.4-93.4H374.7c-7.3 35.9-18.5 67.7-32.6 93.4zm-172.2 0c-14.1-25.6-25.3-57.5-32.6-93.4H71.4c21.4 41.1 56.1 74.1 98.4 93.4zM256 512A256 256 0 1 1 256 0a256 256 0 1 1 0 512z"
								/>
							</svg>
						</Item>
					</Link>
					<Link
						key={'map'}
						className={styles.item}
						style={outer}
						to={`https://www.remotion.pro/watercolor-map`}
					>
						<Item
							label={'Watercolor Map'}
							description={'A beautiful 2D map for travel videos'}
						>
							<SkiaIcon
								style={{
									height: 0.7 * 32,
								}}
							/>
						</Item>
					</Link>
					<Link
						key={'map'}
						className={styles.item}
						style={outer}
						to={`https://www.remotion.pro/timeline`}
					>
						<Item
							label={'<Timeline />'}
							description={
								'A copy pasteable component for timeline-based editing'
							}
						>
							<TimelineIcon
								style={{
									height: 0.7 * 32,
								}}
							/>
						</Item>
					</Link>
				</div>

				<br />
				<p style={lowerpara}>
					{"Couldn't"} find what you need? Check out the list of{' '}
					<Link to={'/docs/resources'}>Resources</Link>.
				</p>
			</div>
			<br />
		</Layout>
	);
};
