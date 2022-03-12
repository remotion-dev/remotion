import path from "path";
import {bundle} from '@remotion/bundler';
import {getCompositions} from "@remotion/renderer";
import {loadConfig} from "./get-config-file-name";
import {parsedCli} from "./parse-command-line";

export const listCompositionsCommand = async () => {
    const file = parsedCli._[1];
    const fullPath = path.join(process.cwd(), file);

    loadConfig();

    const bundled = await bundle(fullPath);

    const compositions = await getCompositions(bundled);

    console.log(compositions.map(({ id }) => id).join('\n'))
}
