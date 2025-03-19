import { customAlphabet } from 'nanoid';
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pid } from "node:process";
import { parse } from 'yaml';
import { build } from "./factory";
import { JSONPath } from 'jsonpath-plus';
import { Workflow } from './types';

const VAR_REGEX = /\${{\s*([^}]+)\s*}}/gmi;

const nanoid = customAlphabet('0123456789abcdefghjkmnpqrstuvwxyz', 5);

function getValueFromPath({ path, json }: { path: string, json: Record<string, unknown> }): unknown {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return JSONPath({ path, json })?.[0];
    } catch (error) {
        console.error(error);

        return undefined;
    }
}

function processInputs(
    contextFilePath: string,
    inputs: Record<string, unknown> = {}
) {
    const rawContext: string = readFileSync(contextFilePath, "utf-8");
    const context = JSON.parse(rawContext) as Record<string, unknown>;

    return Object.fromEntries(Object.entries(inputs).map(([key, value]) => {
        const matchedEntries = String(value).match(VAR_REGEX) ?? [];
        if (typeof value === "string" && matchedEntries.length === 1 && matchedEntries[0] === value) {
            const varKey = value.replace(VAR_REGEX, "$1").trim();
            const varValue = getValueFromPath({ path: varKey, json: context });

            return [key, varValue];
        }

        if (Array.isArray(value)) {
            return [key, value.map((v): unknown => {
                if (typeof v === "string" && VAR_REGEX.test(v)) {
                    let finalValue = v;

                    for (const match of v.match(VAR_REGEX) ?? []) {
                        const varKey = match.replace(VAR_REGEX, "$1").trim();
                        const varValue = getValueFromPath({ path: varKey, json: context });

                        finalValue = finalValue.replace(
                            match, 
                            typeof varValue === "string" ? varValue : JSON.stringify(varValue)
                        );
                    }

                    const varKey = v.replace(VAR_REGEX, "$1").trim();
                    const varValue = getValueFromPath({ path: varKey, json: context });

                    return [key, finalValue.replace(
                        VAR_REGEX,
                        typeof varValue === "string" ? varValue : JSON.stringify(varValue)
                    )];
                }

                return v;
            })];
        }

        if (typeof value === "string" && VAR_REGEX.test(value)) {
            let finalValue = value;

            for (const match of value.match(VAR_REGEX) ?? []) {
                const varKey = match.replace(VAR_REGEX, "$1").trim();
                const varValue = getValueFromPath({ path: varKey, json: context });

                finalValue = finalValue.replace(
                    match, 
                    typeof varValue === "string" ? varValue : JSON.stringify(varValue)
                );
            }

            const varKey = value.replace(VAR_REGEX, "$1").trim();
            const varValue = getValueFromPath({ path: varKey, json: context });

            return [key, finalValue.replace(
                VAR_REGEX,
                typeof varValue === "string" ? varValue : JSON.stringify(varValue)
            )];
        }

        return [key, value];
    }));
}

export async function run() {
    const runId = `${pid.toString()}.${nanoid()}.yml`;

    const sourcePath = resolve(__dirname, "..", "..", "workflows", "test.yml");
    const runPath = resolve(__dirname, "..", "..", "memory", runId);

    writeFileSync(runPath, JSON.stringify({}, null, 2));

    const workflow = readFileSync(sourcePath, "utf-8");
    const parsedWorkflow = parse(workflow) as Workflow;

    console.dir(
        {
            "Workflow": parsedWorkflow,
            "Detected variables": Array.from(workflow.matchAll(VAR_REGEX)).map(([, varName]) => varName?.trim()).filter(Boolean),
        },
        { depth: null }
    );

    for (const step of parsedWorkflow.steps) {
        console.group("Running step", step.name);
        const stepClass = build(step.uses);
        const stepInstance = new stepClass(runPath, step.name, step.id);
        stepInstance.setInputs(processInputs(runPath, step.inputs));
        await stepInstance.run();

        if (step.id) {
            const context = JSON.parse(readFileSync(stepInstance.contextFilePath, "utf-8")) as Record<string, unknown>;
            writeFileSync(stepInstance.contextFilePath, JSON.stringify({
                ...context,
                [step.id]: {
                    inputs: stepInstance.inputs,
                    outputs: stepInstance.outputs,
                },
            }, null, 2));
        }
        console.groupEnd();
    }

    rmSync(runPath, { force: true });
}