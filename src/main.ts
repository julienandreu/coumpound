import * as one from "./one.ts";
import * as two from "./two.ts";

const input = { first: 1, second: 2 };

const flow_1 = (input): number[] => {
    console.group("flow_1");
    const a = one.add(one.extract(input, "first"), one.extract(input, "second"));
    const b = one.multiply(a, a);
    const c = one.multiply(b, one.side_effect(b));
    const d = one.decompose(c);
    const e = one.loop(d, one.add);
    const final = e;

    console.log({
        input,
        a,
        b,
        c,
        d,
        e,
        final,
    }, { depth: null });
    console.groupEnd();

    return final;
}
const out_1 = flow_1(input);

const flow_2 = (input): number[] => {
    console.group("flow_2");

    const before_a_0 = two.from(input);
    const before_a_1 = two.compose(before_a_0, two.extract("first"));
    const before_a_2 = two.compose(before_a_0, two.extract("second"));

    const a = two.add(before_a_1(), before_a_2());

    const final = a();

    console.log({
        input,
        ba0: before_a_0(),
        ba1: before_a_1(),
        ba2: before_a_2(),
        a: a(),
        final,
    }, { depth: null });
    console.groupEnd();

    return input;
}
const out_2 = flow_2(input);

console.dir({ out_1, out_2 }, { depth: null });
