import { UnknownStepError } from "./errors/unknown-step.error";
import { FetchStep } from "./steps/fetch.step";
import { FieldStep } from "./steps/field.step";
import { LogStep } from "./steps/log.step";
import { OpenAIStep } from "./steps/openai.step";

export function build(code: string) {
    switch (code) {
        case "Log":
            return LogStep;
        case "Fetch":
            return FetchStep;
        case "Field":
            return FieldStep;
        case "OpenAI":
            return OpenAIStep;
        default:
            throw new UnknownStepError(`Unknown step: ${code}`);
    }
}