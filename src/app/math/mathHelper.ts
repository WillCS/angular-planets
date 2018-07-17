export let MathHelper = {
    clamp(input: number, lower: number, upper: number): number {
        let output: number = input;
        if(input < lower) {
            output = lower;
        } else if(input > upper) {
            output = upper;
        }

        return output;
    }
};
