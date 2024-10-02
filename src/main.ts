
// SDK

type Input = any;

type Step = {
    name: string;
    run: (...args: any[]) => Promise<any>;
    input: string[];
};

type Flow = {
    name: string;
    steps: Step[];
}

const run = async (flow: Flow, input: Input, options: { maxIterations?: number } = {}): Promise<any> => {
    console.dir({ message: `Starting flow ${flow.name}`, input, options }, { depth: null });

    let queue = [...flow.steps];
    let results = new Map<string, unknown>();
    let iteration = 0;

    while (queue.length > 0) {
        if (options.maxIterations && iteration >= options.maxIterations) {
            console.log(`Max iterations reached, flow stopped`);
            break;
        }

        iteration++;
        const step = queue.shift();

        if (!step) {
            console.log('Queue empty, flow complete');
            break;
        }

        console.dir({ message: `Processing step ${step.name}` }, { depth: null });
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

                if (value === undefined) {
                    console.error(`Missing input for ${key}, postponing step`);
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

const field = async <T extends Record<PropertyKey, unknown>>(source: T, key: keyof T): Promise<T[typeof key]> => {
    console.dir({ message: `Extracting field ${String(key)} from ${JSON.stringify(source)}`, source, key }, { depth: null });

    return source[key];
}

const modulo = async (a: number, b: number): Promise<number> => {
    console.dir({ message: `Modulo ${a} and ${b}`, a, b }, { depth: null });

    return a % b;
}

const printer = (message: string) => async (input: any) => {
    console.dir({ message, input }, { depth: null });

    return input;
}

const literal = (value: any) => async () => {
    console.dir({ message: `Literal`, value }, { depth: null });

    return value;
}

const loop = async (flow: Flow, input: unknown[], options: { maxIterations?: number } = {}): Promise<unknown[]> => {
    const results: unknown[] = [];

    for (let index = 0; index < input.length; index++) {
        const item = input[index];
        console.group(`Processing item ${index}`);
        const result = await run(flow, { index, item }, options);
        console.groupEnd();

        results.push(result);
    }
    return results;
}

const loopFlow: Flow = {
    name: 'loop',
    steps: [
        {
            name: 'start',
            run: printer('Start'),
            input: [],
        } satisfies Step,
        {
            name: 'value',
            run: literal(2),
            input: [],
        } satisfies Step,
        {
            name: 'modulo',
            run: modulo,
            input: ['start.index', 'value'],
        } satisfies Step,
        {
            name: 'a',
            run: literal('a'),
            input: [],
        } satisfies Step,
        {
            name: 'field',
            run: field,
            input: ['start.item', 'a'],
        } satisfies Step,
        {
            name: 'add',
            run: add,
            input: ['field', 'modulo'],
        } satisfies Step,
        {
            name: 'end',
            run: printer('End'),
            input: ['add'],
        } satisfies Step,
    ],
};

const mainFlow: Flow = {
    name: 'main',
    steps: [
        {
            name: 'start',
            run: printer('Start'),
            input: [],
        } satisfies Step,
        {
            name: 'prepare_loop',
            run: literal(loopFlow),
            input: [],
        } satisfies Step,
        {
            name: 'loop',
            run: loop,
            input: ['prepare_loop', 'start'],
        } satisfies Step,
        {
            name: 'end',
            run: printer('End'),
            input: ['loop'],
        } satisfies Step,
    ],
};

const input = [
    { a: 123 },
    { a: 2 },
];

const final = await run(mainFlow, input, { maxIterations: mainFlow.steps.length });
// const final = await run(loopFlow, { index: 456, item: input[0] }, { maxIterations: mainFlow.steps.length * 4 });

console.log({ final });

export { };

