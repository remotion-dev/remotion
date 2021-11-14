import { Internals } from "../../packages/babel-loader/node_modules/remotion/dist";
import { cleanFnStore } from "../../packages/lambda/src/api/mock-functions";

let stdoutOutput: string[] = [];
let stderrOutput: string[] = [];

export const getProcessWriteOutput = () => {
  return stdoutOutput
    .filter(Internals.truthy)
    .map((c) => c.toString())
    .join("\n");
};
export const getProcessStdErrOutput = () => {
  return stderrOutput
    .filter(Internals.truthy)
    .map((c) => c.toString())
    .join("\n");
};

const originalStdout = process.stdout.write;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalStderr = process.stderr.write;

beforeEach(() => {
  stdoutOutput = [];
  stderrOutput = [];
  cleanFnStore();
  // @ts-expect-error
  process.stdout.write = (str: string) => {
    // originalStdout(str);
    stdoutOutput.push(str);
  };
  console.log = (str: string) => {
    // originalStdout(str);
    stdoutOutput.push(str);
  };
  console.error = (str: string) => {
    // originalStdErr(str);
    stderrOutput.push(str);
  };

  // @ts-expect-error
  process.stderr.write = (str: string) => {
    // originalStderr(str);
    stderrOutput.push(str);
  };
});

afterEach(() => {
  process.stdout.write = originalStdout;
  process.stderr.write = originalStderr;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
