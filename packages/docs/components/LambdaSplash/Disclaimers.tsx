import React from 'react';
import styles from './disclaimers.module.css';

export const Disclaimers: React.FC = () => {
	return (
		<div>
			<div className={styles.disclaimer}>
				1) Measured render time when rendering Remotion Lambda Trailer.{' '}
				Instructions to reproduce can be found{' '}
				<a
					target="_blank"
					href="https://github.com/remotion-dev/trailer-lambda"
				>
					in the README.
				</a>
			</div>
			<div className={styles.disclaimer}>
				2) Rendering the composition <code>2hrvideo</code> in the example folder
				in the Remotion repository with <code>--frames-per-lambda=1080</code>,
				an ARM64 Lambda function with 2048MB RAM, on warm Lambdas on the
				us-east-1 region. Does not include S3 and data transfer costs.
			</div>
			<div className={styles.disclaimer}>
				3) See <a href="/docs/lambda/cost-example">here</a> for example costs
				for various scenarios. Estimated cost per minute of video when rendering
				the Remotion Lambda trailer with <code>--frames-per-lambda=12</code>, an
				ARM64 Lambda function with 2048MB RAM, on warm Lambdas on the us-east-1
				region. Does not include S3 and data transfer costs. Check{' '}
				<a href="/docs/license">Licensing</a> whether you need to acquire a
				license to use Remotion Lambda.
			</div>
		</div>
	);
};
