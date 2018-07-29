export let MathHelper = {
    TWO_PI: Math.PI * 2,
    
    clamp(input: number, lower: number, upper: number): number {
        let output: number = input;
        if(input < lower) {
            output = lower;
        } else if(input > upper) {
            output = upper;
        }

        return output;
    },

    between(input: number, lowerBound: number, upperBound: number): boolean {
        return input >= lowerBound && input <= upperBound;
    },

    strictlyBetween(input: number, lowerBound: number, upperBound: number): boolean {
        return input > lowerBound && input < upperBound;
    },

    square(input: number): number {
        return input * input;
    },

    approxEqual(e1: number, e2: number, epsilon: number = 0.01): boolean {
        return Math.abs(e2 - e1) <= epsilon;
    }
};
