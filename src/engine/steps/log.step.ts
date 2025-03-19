import { BaseStep } from "./base.step";

export class LogStep extends BaseStep {
    override inputs = {
        data: ""
    };

    override async run() {
        await Promise.resolve();
        console.log("LOG", this.inputs.data);
    }
}