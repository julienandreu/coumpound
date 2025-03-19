import { BaseStep } from "./base.step";

export class LogStep extends BaseStep {
    override inputs = {
        data: ""
    };

    override async run() {
        await super.run();

        console.dir(this.inputs.data, { depth: null });
    }
}