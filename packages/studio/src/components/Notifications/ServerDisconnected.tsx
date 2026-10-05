import React, {useCallback, useContext, useRef} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	SERVER_DISCONNECTED_BACKGROUND,
	SERVER_DISCONNECTED_SHADOW,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_60,
} from '../../helpers/colors';
import {getCodexAnnotation} from '../../helpers/get-codex-annotation';
import {getSkillPrefix} from '../../helpers/get-skill-prefix';
import {hoverableStyle} from '../../helpers/hoverable';
import {requestCodexAnnotation} from '../../helpers/request-codex-annotation';
import {SkillsIcon} from '../../icons/skills';
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

const skillCommand: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 6,
	verticalAlign: 'middle',
};

const skillsIcon: React.CSSProperties = {
	height: 18,
	width: 18,
};

const annotationButton: React.CSSProperties = {
	backgroundColor: TRANSPARENT,
	display: 'inline-flex',
	marginTop: 6,
	textAlign: 'left',
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: WHITE_ALPHA_60,
		hoverColor: WHITE,
	}),
};

const annotationButtonContent: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 6,
	padding: 0,
};

const annotationButtonLabel: React.CSSProperties = {
	fontSize: 14,
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
	const skillPrefix = getSkillPrefix();
	const isInAgent =
		skillPrefix === '$' || remotionSkillsInfo?.studioServerStartedByAgent;
	const restartSkill = isInAgent
		? (remotionSkillsInfo?.studioRestartSkill ?? null)
		: null;
	const restartCommand = restartSkill
		? `${skillPrefix}${restartSkill}`
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
						Run{' '}
						{restartSkill ? (
							<span style={skillCommand}>
								<SkillsIcon color={WHITE} style={skillsIcon} aria-hidden />
								<span>{restartCommand}</span>
							</span>
						) : (
							<code style={inlineCode}>{restartCommand}</code>
						)}{' '}
						to run it again.
					</span>
				) : (
					<span>Fast refresh will not work.</span>
				)}
				{canAnnotate && restartSkill ? (
					<div>
						<Button
							style={annotationButton}
							buttonContainerStyle={annotationButtonContent}
							onClick={onSendToChatGPT}
						>
							<svg
								aria-hidden="true"
								fill={WHITE}
								fillRule="evenodd"
								height={16}
								viewBox="0 0 24 24"
								width={16}
							>
								<path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
							</svg>
							<span style={annotationButtonLabel}>Send to ChatGPT</span>
						</Button>
					</div>
				) : null}
			</div>
		</div>
	);
};
