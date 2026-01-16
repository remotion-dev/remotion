import type {AnyRemotionOption} from './option';

let AskAIEnabled = true;

const cliFlag = 'disable-ask-ai' as const;

export const AskAIOption = {
  name: 'Disable or Enable the Ask AI option',
  cliFlag,
  description: () => (
    <>
      If the Cmd + I shortcut of the Ask AI modal conflicts with your studio, you can disable it using this.
    </>
  ),
  ssrName: null,
  docLink: 'https://www.remotion.dev/docs/config#setaskaienabled',
  type: false as boolean,
  getValue: ({commandLine}) => {
    if (commandLine[cliFlag] !== undefined) {
      return {
        value: commandLine[cliFlag] as boolean,
        source: 'cli',
      };
    }

    return {
      value: AskAIEnabled,
      source: 'config',
    };
  },
  setConfig(value) {
    AskAIEnabled = value;
  },
} satisfies AnyRemotionOption<boolean>;
