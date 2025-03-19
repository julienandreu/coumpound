import { UnknownStepError } from "./errors/unknown-step.error";
import { LogStep } from "./steps/log.step";

export function build(code: string) {
    switch (code) {
        case "Log":
            return LogStep;
        default:
            throw new UnknownStepError(`Unknown step: ${code}`);
    }
}