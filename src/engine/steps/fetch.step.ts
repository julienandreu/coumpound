import { BaseStep } from "./base.step";

export class FetchStep extends BaseStep {
    override inputs = {
        url: "",
        method: "",
        data: {},
        headers: {},
    };

    override outputs = {
        status: 0,
        headers: {},
        response: {},
    };

    override async run() {
        await super.run();

        const response = await fetch(this.inputs.url, {
            method: this.inputs.method,
            headers: this.inputs.headers,
            body: this.inputs.data as BodyInit,
        });

        const headers: [string, string][] = [];
        response.headers.forEach((value, key) => {
            headers.push([key, value]);
        });

        this.outputs.headers = Object.fromEntries(headers);
        this.outputs.response = await response.text();
        this.outputs.status = response.status;
    }
}