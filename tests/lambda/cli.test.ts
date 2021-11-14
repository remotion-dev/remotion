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
    /A function with version (.*) is already deployed in region us-east-1, it is called remotion-render-abcdef/
  );
});
