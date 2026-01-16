import type {AnyRemotionOption} from './option';

let disableAskAI = false;

const cliFlag = 'disable-ask-ai' as const;

export const disableAskAIOption = {
  name: 'Disable the Ask AI option',
  cliFlag,
  description: () => (
    <>
      If the Cmd + I shortcut of the Ask AI modal conflicts with your studio, you can disable it.
    </>
  ),
  ssrName: null,
  docLink: 'https://www.remotion.dev/docs/config#setdisabledaskai',
  type: false as boolean,
  getValue: ({commandLine}) => {
    if (commandLine[cliFlag] !== undefined) {
      return {
        value: commandLine[cliFlag] as boolean,
        source: 'cli',
      };
    }

    return {
      value: disableAskAI,
      source: 'config',
    };
  },
  setConfig(value) {
    disableAskAI = value;
  },
} satisfies AnyRemotionOption<boolean>;
