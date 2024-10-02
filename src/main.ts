
const input = {
    a: 1,
    b: 2,
};

type Input = typeof input;

type Step = {
    name: string;
    run: (...args: any[]) => Promise<any>;
    input: string[] | null;
};

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

type Flow = {
    name: string;
    steps: Step[];
}

const ucc: Flow = {
    name: 'ucc',
    steps: [
        start,
        add,
        end,
    ],
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
            switch (typeof result) {
                case 'object':
                    Object.entries(result).forEach(([key, value]) => {
                        results.set(`${step.name}.${key}`, value);
                    });
                default:
                    results.set(step.name, result);
                    break;
            }
            continue;
        }

        if (step.input) {
            const inputs: unknown[] = [];

            for (const key of step.input) {
                const value = results.get(key);

                if (!value) {
                    console.error(`Missing input for ${key}, adding step to queue`);
                    queue.push(step);
                    continue;
                }

                inputs.push(value);
            }

            const result = await step.run(...inputs);
            switch (typeof result) {
                case 'object':
                    Object.entries(result).forEach(([key, value]) => {
                        results.set(`${step.name}.${key}`, value);
                    });
                default:
                    results.set(step.name, result);
                    break;
            }
            continue;
        }
    };

    console.log(`Flow complete ${flow.name} in ${iteration} iterations`);

    return true;
}

run(ucc, input);