import { NotImplementedError } from "../errors/not-implemented.error";

export class BaseStep {
    inputs: Record<string, unknown> = {} as const;
    outputs: Record<string, unknown> = {} as const;
    context: Record<string, unknown> = {};

    constructor(
        public contextFilePath: string,
        public name: string,
        public id?: string,
    ) { }

    setInputs(inputs: Record<string, unknown>) {
        this.inputs = inputs;
    }

    async run(): Promise<void> {
        await Promise.resolve();
        throw new NotImplementedError(`${this.constructor.name}.run() must be implemented`);
    }
}