import { BaseStep } from "./base.step";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export class OpenAIStep extends BaseStep {
    override inputs = {
        systemPrompt: '',
        userPrompt: '',
        model: 'gpt-4o',
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
    };

    override outputs = {
        response: {},
    };

    override async run() {
        await super.run();

        const response = await openai.responses.create({
            model: this.inputs.model,
            input: [
                {
                    "role": "system",
                    "content": [
                        {
                        "type": "input_text",
                        "text": this.inputs.systemPrompt
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                        "type": "input_text",
                        "text": this.inputs.userPrompt
                        }
                    ]
                },
            ],
            text: {
                "format": {
                "type": "text"
                }
            },
            reasoning: {},
            tools: [],
            temperature: this.inputs.temperature,
            max_output_tokens: this.inputs.max_output_tokens,
            top_p: this.inputs.top_p
        });

        this.outputs.response = response.output_text;
    }
}