export const add = (...input: number[]): number => input.reduce((acc, curr) => parseInt(acc.toString()) + parseInt(curr.toString()), 0);

export const multiply = (...input: number[]): number => input.reduce((acc, curr) => parseInt(acc.toString()) * parseInt(curr.toString()), 1);

export const side_effect = (input: number): number => {
    const timestamp = Date.now();
    const last = parseInt(timestamp.toString().slice(-1));
    console.log("Side effect", last);
    return input + last;
}

export const decompose = (input: number): number[] => input.toString().split("").map(Number);

export const extract = <T extends Record<string, any>>(source: T, key: keyof T): T[keyof T] => {
    return source[key];
}

export const loop = <T extends (index: number, item: number) => ReturnType<T>>(input: number[], fn: T): ReturnType<T>[] => {
    return input.map(fn);
}