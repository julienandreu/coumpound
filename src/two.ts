export const compose = (...fns: ((input: any) => any)[]) => () => fns.reduce((acc, fn) => fn(acc), null);

export const from = (input: Record<string, any>) => (): Record<string, any> => {
    return input;
};

export const extract = (key: keyof Record<string, any>) => (input: Record<string, any>): any => {
    return input[key];
};

export const add = (value: number) => (input: number) => (): number => {
    return parseInt(input.toString()) + parseInt(value.toString());
};