
const input = {
    a: 1,
    b: 2,
};

// SDK

type Input = typeof input;

type Step = {
    name: string;
    run: (...args: any[]) => Promise<any>;
    input: string[] | null;
};

type Flow = {
    name: string;
    steps: Step[];
}

const run = async (flow: Flow, input: Input): Promise<boolean> => {
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
        if (step.input === null) {
            const result = await step.run(input);
            if (typeof result === 'object') {
                Object.entries(result).forEach(([key, value]) => {
                    results.set(`${step.name}.${key}`, value);
                });
            }
            results.set(step.name, result);
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
            continue;
        }
    };

    console.log(`Flow complete ${flow.name} in ${iteration} iterations`);

    return true;
}

// Steps

const start: Step = {
    name: 'start',
    run: async (input: Input): Promise<Input> => {
        console.dir({ name: 'start', input }, { depth: null });

        return input;
    },
    input: null,
};

const end: Step = {
    name: 'end',
    run: async (input: Input): Promise<Input> => {
        console.dir({ name: 'end', input }, { depth: null });

        return input;
    },
    input: ['add'],
};

const add: Step = {
    name: 'add',
    run: async (a: number, b: number): Promise<number> => {
        console.dir({ name: 'add', a, b }, { depth: null });

        return a + b;
    },
    input: ['start.a', 'start.b'],
};

const ucc: Flow = {
    name: 'ucc',
    steps: [
        end,
        add,
        start,
    ],
};

run(ucc, input);