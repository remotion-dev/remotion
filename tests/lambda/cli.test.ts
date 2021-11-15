import { parsedLambdaCli } from "../../packages/lambda/src/cli/args";
import { LambdaInternals } from "../../packages/lambda/src/index";
import { getProcessStdErrOutput, getProcessWriteOutput } from "./console-hooks";

test("Deploy function", async () => {
  await LambdaInternals.executeCommand(["functions", "deploy"]);
  expect(getProcessWriteOutput()).toContain(
    "Deployed as remotion-render-abcdef\n"
  );
});

test("Deploy function and list it", async () => {
  await LambdaInternals.executeCommand(["functions", "deploy"]);
  await LambdaInternals.executeCommand(["functions", "ls"]);
  expect(getProcessWriteOutput()).toContain("Getting functions...");
  expect(getProcessWriteOutput()).toContain("Memory (MB)");
  expect(getProcessWriteOutput()).toMatch(
    /remotion-render-abcdef\s+(.*)\s+1024\s+120/g
  );
});

test("Deploy function and it already exists should fail", async () => {
  await LambdaInternals.executeCommand(["functions", "deploy"]);
  await expect(() =>
    LambdaInternals.executeCommand(["functions", "deploy"])
  ).rejects.toThrow(/Exited process with code 1/);

  expect(getProcessStdErrOutput()).toMatch(
    /Error: Already found a function \(remotion-render-abcdef\) with version (.*) deployed in region us-east-1/
  );
});

test('If no functions are there and is quiet, should return "()"', async () => {
  parsedLambdaCli.q = true;
  await LambdaInternals.executeCommand(["functions", "ls"]);
  expect(getProcessWriteOutput()).toBe("()");
});

test("Should handle functions rm called with no functions", async () => {
  await LambdaInternals.executeCommand(["functions", "rm", "()"]);
  expect(getProcessWriteOutput()).toBe("No functions to remove.");
});
