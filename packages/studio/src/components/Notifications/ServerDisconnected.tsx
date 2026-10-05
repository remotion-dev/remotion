import React, {useCallback, useContext, useRef} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	SERVER_DISCONNECTED_BACKGROUND,
	SERVER_DISCONNECTED_SHADOW,
	TRANSPARENT,
	WHITE,
} from '../../helpers/colors';
import {getCodexAnnotation} from '../../helpers/get-codex-annotation';
import {requestCodexAnnotation} from '../../helpers/request-codex-annotation';
import {Button} from '../Button';
import {useSettings} from '../SettingsContext';

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
	backgroundColor: TRANSPARENT,
	fontFamily: 'SF Pro, Arial, Helvetica, sans-serif',
};

const message: React.CSSProperties = {
	backgroundColor: SERVER_DISCONNECTED_BACKGROUND,
	color: WHITE,
	paddingLeft: 20,
	paddingRight: 20,
	paddingTop: 12,
	paddingBottom: 12,
	borderRadius: 4,
	boxShadow: SERVER_DISCONNECTED_SHADOW,
	lineHeight: 1.5,
	pointerEvents: 'auto',
};

const inlineCode: React.CSSProperties = {
	fontSize: 16,
	fontFamily: 'monospace',
};

const annotationButton: React.CSSProperties = {
	backgroundColor: TRANSPARENT,
	marginTop: 8,
};

let pageIsGoingToReload = false;
window.addEventListener('beforeunload', () => {
	pageIsGoingToReload = true;
});

export const ServerDisconnected: React.FC = () => {
	const {previewServerState: ctx} = useContext(StudioServerConnectionCtx);
	const {remotionSkillsInfo} = useSettings();
	const annotationTarget = useRef<HTMLDivElement>(null);
	const canAnnotate = getCodexAnnotation() !== null;
	const isInAgent =
		canAnnotate || remotionSkillsInfo?.studioServerStartedByAgent;
	const restartSkill = isInAgent
		? (['remotion-studio', 'remotion-best-practices'].find((skillName) =>
				remotionSkillsInfo?.skills.some(
					({name, installedInProject, installedGlobally}) =>
						name === skillName && (installedInProject || installedGlobally),
				),
			) ?? null)
		: null;
	const restartCommand = restartSkill
		? `/${restartSkill}`
		: window.remotion_studioServerCommand;
	const onSendToChatGPT = useCallback(() => {
		if (restartSkill === null) {
			return;
		}

		requestCodexAnnotation({
			target: annotationTarget.current,
			initialComment: `$${restartSkill} Restart the Remotion Studio server.`,
			metadata: {
				action: 'Restart Studio server',
				skill: restartSkill,
			},
		});
	}, [restartSkill]);
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
			<div ref={annotationTarget} style={message} role="alert">
				The studio server has disconnected. <br />
				{restartCommand ? (
					<span>
						Run <code style={inlineCode}>{restartCommand}</code> to run it
						again.
					</span>
				) : (
					<span>Fast refresh will not work.</span>
				)}
				{canAnnotate && restartSkill ? (
					<div>
						<Button
							size="compact"
							style={annotationButton}
							onClick={onSendToChatGPT}
						>
							Send to ChatGPT
						</Button>
					</div>
				) : null}
			</div>
		</div>
	);
};
