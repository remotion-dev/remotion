import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';

const container: React.CSSProperties = {
	position: 'fixed',
	justifyContent: 'flex-end',
	alignItems: 'flex-start',
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	padding: 30,
	pointerEvents: 'none',
	backgroundColor: 'transparent',
	fontFamily: 'SF Pro, Arial, Helvetica, sans-serif',
};

const message: React.CSSProperties = {
	backgroundColor: '#e74c3c',
	color: 'white',
	paddingLeft: 20,
	paddingRight: 20,
	paddingTop: 12,
	paddingBottom: 12,
	borderRadius: 4,
	boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
	lineHeight: 1.5,
};

const inlineCode: React.CSSProperties = {
	fontSize: 16,
	fontFamily: 'monospace',
};

let pageIsGoingToReload = false;
window.addEventListener('beforeunload', () => {
	pageIsGoingToReload = true;
});

export const ServerDisconnected: React.FC = () => {
	const {previewServerState: ctx} = useContext(StudioServerConnectionCtx);
	const fav = document.getElementById('__remotion_favicon') as HTMLLinkElement;

	if (ctx.type !== 'disconnected') {
		fav.setAttribute('href', '/favicon.ico');
		return null;
	}

	if (pageIsGoingToReload) {
		return null;
	}

	const base64Favicon =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARiSURBVHgB7d1NThRBFAfw/2tGgru5gXMD8QZ4AmVjAi6kN0TiAm8gnkBcGARNumcx4E48Ae0JaE9gewLHlQSZelaNgyHGL/RVd1X3+y10RQL58+rVx1QBKKWUUkoppZRSSimllFJKKVUjQs32stEiJcktZiwxzKL9Fvqzb6S0/44JVBKbtwa9aj29U6JjagtkJzsYzBEyBi9d5utsQIULCcxvelgo03R5jBarJZCXw/17E+bt82r4Hy4gtuEQekUbK8h7IHvDV5vMZht+VAlRfmYw3EhXKrSA10Ce2X7RIzpGDVzlgM1wPb2bI2JeA9nN99/b/waoV+XCmTAex1g13gLZyUZrdjjJ0CAbTB5bMN4C2ctHxwxaRABiCsZLIG6KmxC/R2BiCCaBBwn4NgJk10B2GOWj3Wz/IQLlpUL28oOjyy4AG1AZppuhVYt4hWRZ1o8gDGc6rL4YHjxCQMQDOcNCEI38bxnmLTc9d30PARAPZAITZP/4A1ctx3bjcw0NEw8koeQ64tRnu25qeggTb+q2/BmRcyv9K7yw3MTOsmiFuLMOtICblJzS5+Mm+opoIBOgFYHMuL5yVHcoooFQuwJxag9FNJCIG/rv1BqKaCDfzshbqbZQxAJxK3SJI9qATUPJstdef0axQGJbof+jwRc6eQ2PxAIx4DZXx3duSrybv3oCTyR7yACdYR762sIXDKQbFfId4ZGPJi8YCA3QLf05YvF+IhYIEV1Dx9hNu8XdbLQFQV6OcDuFaFNyKiwWiJ19DNBN/VN8XoMQrRABDFqCEJ32CiBisT08rRAZAwjRQAKjgcgQO+rVQARMb3gJ0UAkML+DEA1EwAQkdkNMcnOx1Zcxf8V9ol7y88GSm4tdDKRy1xsgSIes/0BM4ndN5HZ7OzZkMePperqSQ5jkkFWhO6r76WrYJ4b2N+YTumF60QeeSG6/d2DI4rHvW1eCPaT9Q9YZw/sVOMlZVoUWM8zpg/Su97dVJGdZFVrKhbFR05MdYoFcwWmF1rF9kbG8UeP7KaI3qBp628QTHrueUccwdZHw/ZDWNHY7tU1u1B2GIxqIYSO2Dd0Ud79wnq/eaOpBgR4EMVDW/oijINu87d7U6hYaJBrInA0k0iu4bvVtZ1KrBRrm4Vr06GNkF3cO7RCVhvK4pmiFOISkjOStk1lVrBQIiPh5SAyN3fWKWeMuEBjxCmEkh3bVvokAzd5idL2iQqDEA1nASXmK+XFIfeTCo5gFAudllvo8G20TUeNVElMQ58QrxLHD1jbB3GumSnhsz7qHE9BhTEGc87aOm16KJHi7rfqj8yfI53E1j/l9eK8L651stJUQeXx/iuzU1QztZLGIsRp+xvtOh3Qo3/qCedumEC6qZetpJztwz7O6UAa4FNsP7ELTfXbWbskUdjgq9M9VCJoFcwvTlfyPDd9t3XNJjA+2IZcGpmxi+7tpjW3OupurJziZhtKWPzWhlFJKKaWUUkoppZRSSiml/uwrgZ/Bfwo/wccAAAAASUVORK5CYII=';

	fav.setAttribute('href', base64Favicon);

	return (
		<div style={container} className="css-reset">
			<div style={message}>
				The studio server has disconnected. <br />
				{window.remotion_studioServerCommand ? (
					<span>
						Run{' '}
						<code style={inlineCode}>
							{window.remotion_studioServerCommand}
						</code>{' '}
						to run it again.
					</span>
				) : (
					<span>Fast refresh will not work.</span>
				)}
			</div>
		</div>
	);
};
