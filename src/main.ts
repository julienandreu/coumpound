import { one } from "./one.ts";

const input = { first: 1, second: 2 };

const a = one.add(one.extract(input, "first"), one.extract(input, "second"));

const b = one.multiply(a, a);

const c = one.multiply(b, one.side_effect(b));

const d = one.decompose(c);

const e = one.loop(d, one.add);

const final = input;

console.dir({ input, a, b, c, d, e, final }, { depth: null });