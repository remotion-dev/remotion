import { cleanFnStore } from "../../packages/lambda/src/api/mock-functions";

let stdoutOutput: string[] = [];
let stderrOutput: string[] = [];

export const getProcessWriteOutput = () => {
  return stdoutOutput.map((c) => c.toString()).join("\n");
};
export const getProcessStdErrOutput = () => {
  return stderrOutput.map((c) => c.toString()).join("\n");
};

const originalStdout = process.stdout.write;
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

  // @ts-expect-error
  process.stderr.write = (str: string) => {
    // originalStderr(str);
    stderrOutput.push(str);
  };
});

afterEach(() => {
  process.stdout.write = originalStdout;
  process.stderr.write = originalStderr;
});
