import { JSONPath } from "jsonpath-plus";
import { BaseStep } from "./base.step";

export class FieldStep extends BaseStep {
    override inputs = {
        path: "",
        source: {},
    };

    override outputs = {
        values: [],
    };

    override async run() {
        await super.run();

        this.outputs.values = JSONPath({ path: this.inputs.path, json: this.inputs.source });
    }
}