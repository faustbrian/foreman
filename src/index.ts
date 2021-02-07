import { ExecaSyncReturnValue, sync } from "execa";

export enum ProcessState {
	Online = "online",
	Stopped = "stopped",
	Stopping = "stopping",
	Waiting = "waiting restart",
	Launching = "launching",
	Errored = "errored",
	OneLaunch = "one-launch-status",
}

export type ProcessIdentifier = string | number;
export type ProcessDescription = Record<string, any>;

export class Foreman {
	public list(): ProcessDescription[] {
		try {
			const { stdout } = this.shellSync("pm2 jlist");

			if (!stdout) {
				return [];
			}

			const lastLine: string | undefined = stdout.split("\n").pop();

			if (!lastLine) {
				return [];
			}

			return Object.values(JSON.parse(lastLine)) || [];
		} catch (error) {
			return [];
		}
	}

	public describe(id: ProcessIdentifier): ProcessDescription | undefined {
		try {
			const processes: ProcessDescription[] | undefined = this.list();

			return processes
				? processes.find((process: ProcessDescription) => [process.id, process.name].includes(id))
				: undefined;
		} catch (error) {
			return undefined;
		}
	}

	public start(opts: Record<string, any>, flags: Record<string, any> = {}): ExecaSyncReturnValue {
		let command = `pm2 start ${opts.script}`;

		if (opts.node_args) {
			command += ` --node-args="${this.flagsToString(opts.node_args)}"`;
		}

		if (flags) {
			command += ` ${this.flagsToString(flags)}`;
		}

		if (opts.args) {
			command += ` -- ${opts.args}`;
		}

		return this.shellSync(command);
	}

	public stop(id: ProcessIdentifier, flags: Record<string, any> = {}): ExecaSyncReturnValue {
		let command = `pm2 stop ${id}`;

		if (flags) {
			command += ` ${this.flagsToString(flags)}`;
		}

		return this.shellSync(command);
	}

	public restart(id: ProcessIdentifier, flags: Record<string, any> = { "update-env": true }): ExecaSyncReturnValue {
		let command = `pm2 restart ${id}`;

		if (flags) {
			command += ` ${this.flagsToString(flags)}`;
		}

		return this.shellSync(command);
	}

	public reload(id: ProcessIdentifier): ExecaSyncReturnValue {
		return this.shellSync(`pm2 reload ${id}`);
	}

	public reset(id: ProcessIdentifier): ExecaSyncReturnValue {
		return this.shellSync(`pm2 reset ${id}`);
	}

	public delete(id: ProcessIdentifier): ExecaSyncReturnValue {
		return this.shellSync(`pm2 delete ${id}`);
	}

	public flush(): ExecaSyncReturnValue {
		return this.shellSync("pm2 flush");
	}

	public reloadLogs(): ExecaSyncReturnValue {
		return this.shellSync("pm2 reloadLogs");
	}

	public ping(): ExecaSyncReturnValue {
		return this.shellSync("pm2 ping");
	}

	public update(): ExecaSyncReturnValue {
		return this.shellSync("pm2 update");
	}

	public status(id: ProcessIdentifier): ProcessState | undefined {
		try {
			const process: ProcessDescription | undefined = this.describe(id);

			return process ? process.pm2_env.status : undefined;
		} catch (error) {
			return undefined;
		}
	}

	public isOnline(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Online;
	}

	public isStopped(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Stopped;
	}

	public isStopping(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Stopping;
	}

	public isWaiting(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Waiting;
	}

	public isLaunching(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Launching;
	}

	public isErrored(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Errored;
	}

	public isOneLaunch(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.OneLaunch;
	}

	public isUnknown(id: ProcessIdentifier): boolean {
		const status: ProcessState | undefined = this.status(id);

		if (status === undefined) {
			return true;
		}

		return !Object.values(ProcessState).includes(status);
	}

	public has(id: ProcessIdentifier): boolean {
		try {
			const { stdout } = this.shellSync(`pm2 id ${id} | awk '{ print $2 }'`);
			return !!stdout && !isNaN(Number(stdout));
		} catch (error) {
			return false;
		}
	}

	public missing(id: ProcessIdentifier): boolean {
		return !this.has(id);
	}

	protected flagsToString(flags: Record<string, any>): string {
		const mappedFlags: string[] = [];

		for (const [key, value] of Object.entries(flags)) {
			if (value !== undefined) {
				if (value === true) {
					mappedFlags.push(`--${key}`);
				} else if (typeof value === "string") {
					mappedFlags.push(value.includes(" ") ? `--${key}="${value}"` : `--${key}=${value}`);
				} else {
					mappedFlags.push(`--${key}=${value}`);
				}
			}
		}

		return mappedFlags.join(" ");
	}

	private shellSync(command: string): ExecaSyncReturnValue {
		return sync(command, { shell: true });
	}
}
