export type Inputs = Record<string, unknown>;

export interface Step {
    name: string;
    uses: string;
    id?: string;
    inputs?: Inputs;
}

export interface Workflow {
    name: string;
    steps: Step[];
}