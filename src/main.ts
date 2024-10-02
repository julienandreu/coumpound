
const input = {
    a: 1,
    b: 2,
};

// SDK

type Input = typeof input;

type Step = {
    name: string;
    run: (...args: any[]) => Promise<any>;
    input: string[];
};

type Flow = {
    name: string;
    steps: Step[];
}

const run = async (flow: Flow, input: Input): Promise<any> => {
    console.log(`Starting flow ${flow.name}`);

    let queue = [...flow.steps];
    let results = new Map<string, unknown>();
    let iteration = 0;

    while (queue.length > 0) {
        iteration++;
        const step = queue.shift();

        if (!step) {
            console.log('Queue empty, flow complete');
            break;
        }

        console.log(`Processing step ${step.name}`);
        if (step.input.length === 0) {
            const result = await step.run(input);
            if (typeof result === 'object') {
                Object.entries(result).forEach(([key, value]) => {
                    results.set(`${step.name}.${key}`, value);
                });
            }
            results.set(step.name, result);
            results.set('final', result);
            continue;
        }

        if (step.input) {
            const inputs: unknown[] = [];

            for (const key of step.input) {
                const value = results.get(key);

                if (!value) {
                    console.error(`Missing input for ${key}, adding step to queue`);
                    queue.push(step);
                    break;
                }

                inputs.push(value);
            }

            const result = await step.run(...inputs);
            if (typeof result === 'object') {
                Object.entries(result).forEach(([key, value]) => {
                    results.set(`${step.name}.${key}`, value);
                });
            }
            results.set(step.name, result);
            results.set('final', result);
            continue;
        }
    };

    console.log(`Flow complete ${flow.name} in ${iteration} iterations`);

    return results.get('final');
}

// Executors

const add = async (a: number, b: number): Promise<number> => {
    console.dir({ message: `Adding ${a} and ${b}`, a, b }, { depth: null });

    return a + b;
}

const modulo = async (a: number, b: number): Promise<number> => {
    console.dir({ message: `Modulo ${a} and ${b}`, a, b }, { depth: null });

    return a % b;
}

const printer = (message: string) => (input: any) => {
    console.dir({ message, input }, { depth: null });

    return input;
}

const ucc: Flow = {
    name: 'ucc',
    steps: [
        {
            name: 'start',
            run: printer('Start'),
            input: [],
        } satisfies Step,
        {
            name: 'add',
            run: add,
            input: ['start.a', 'start.b'],
        } satisfies Step,
        {
            name: 'end',
            run: printer('End'),
            input: ['add'],
        } satisfies Step,
    ],
};

const final = await run(ucc, input);

console.log({ final });

export { };

