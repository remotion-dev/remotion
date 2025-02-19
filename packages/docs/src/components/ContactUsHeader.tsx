import React from 'react';
import styles from './AboutUsHeader.module.css';

export const ContactUsHeader: React.FC = () => {
	return (
		<div className={styles.writeincss}>
			<div style={{flex: 1}}>
				<h1 className={styles.writeincsstitle}>Contact us</h1>
				<p>
					We are here to help you with any questions you may have about
					licensing and to help you determine if Remotion is the right fit for
					your project.
				</p>
				<p>
					If you have specific requirements, please let us know via email.
					Alternatively, you can also schedule a video call with us and include
					your questions in the booking description. Please note that we do not
					provide technical support via email or evaluation call.
				</p>
			</div>
		</div>
	);
};
