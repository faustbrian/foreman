import "jest-extended";

import { ExecaSyncReturnValue } from "execa";
import { resolve } from "path";
import { Foreman, ProcessDescription, ProcessState } from "../src";

function start(name: string): ExecaSyncReturnValue {
	return foreman.start(
		{
			script: resolve(__dirname, "app.js"),
		},
		{ name },
	);
}

function kill(): void {
	try {
		foreman.stop("stub");
		foreman.stop("hapi");
	} catch (error) {
		// not running...
	}
}

const foreman: Foreman = new Foreman();

beforeAll(() => {
	kill();

	start("hapi");
});

afterAll(() => kill());

test(".list()", () => {
	const processes: ProcessDescription[] | undefined = foreman.list();

	expect(processes).toBeArray();
	expect(processes).not.toBeEmpty();
});

test(".describe()", () => {
	const process: ProcessDescription | undefined = foreman.describe("hapi");

	expect(process).toBeObject();
});

test(".start()", () => {
	const { failed } = start("stub");

	expect(failed).toBeFalse();
});

test(".stop()", () => {
	const { failed } = foreman.stop("stub");

	expect(failed).toBeFalse();
});

test(".restart()", () => {
	const { failed } = foreman.restart("stub");

	expect(failed).toBeFalse();
});

test(".reload()", () => {
	const { failed } = foreman.reload("stub");

	expect(failed).toBeFalse();
});

test(".reset()", () => {
	const { failed } = foreman.reset("stub");

	expect(failed).toBeFalse();
});

test(".delete()", () => {
	const { failed } = foreman.delete("stub");

	expect(failed).toBeFalse();
});

test(".flush()", () => {
	const { failed } = foreman.flush();

	expect(failed).toBeFalse();
});

test(".reloadLogs()", () => {
	const { failed } = foreman.reloadLogs();

	expect(failed).toBeFalse();
});

test(".ping()", () => {
	const { failed } = foreman.ping();

	expect(failed).toBeFalse();
});

test(".update()", () => {
	const { failed } = foreman.update();

	expect(failed).toBeFalse();
});

test(".status()", () => {
	expect(foreman.status("hapi")).toBe(ProcessState.Online);
});

test(".isOnline()", () => {
	expect(foreman.isOnline("hapi")).toBeTrue();
});

test(".isStopped()", () => {
	expect(foreman.isStopped("hapi")).toBeFalse();
});

test(".isStopping()", () => {
	expect(foreman.isStopping("hapi")).toBeFalse();
});

test(".isWaiting()", () => {
	expect(foreman.isWaiting("hapi")).toBeFalse();
});

test(".isLaunching()", () => {
	expect(foreman.isLaunching("hapi")).toBeFalse();
});

test(".isErrored()", () => {
	expect(foreman.isErrored("hapi")).toBeFalse();
});

test(".isOneLaunch()", () => {
	expect(foreman.isOneLaunch("hapi")).toBeFalse();
});

test(".isUnknown()", () => {
	expect(foreman.isUnknown("hapi")).toBeFalse();
});

test(".has()", () => {
	expect(foreman.has("hapi")).toBeTrue();
});

test(".missing()", () => {
	expect(foreman.missing("hapi")).toBeFalse();
});
