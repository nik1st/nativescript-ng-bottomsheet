export interface AnimationRange {
    from: number;
    to: number;
}

export interface AnimationDefinition {
    getRange: () => AnimationRange;
    curve(progress: number): number;
    step(deltaResult: number): void;
}

export function amountFromTo(range: AnimationRange) {
        return (t: number) => {
            return range.from + t * (range.to - range.from);
        };
}

export function animate(
    duration: number,
    defs: AnimationDefinition[]) {
    return new Promise((resolve) => {
        const start = new Date();
        const timerId = setInterval(() => {
            const timePassed = new Date().valueOf() - start.valueOf();

            let progress = timePassed / duration;
            if (progress > 1) progress = 1;

            for (const def of defs) {
                const delta = def.curve(progress);
                const v = amountFromTo(def.getRange())(delta);
                def.step(v);
            }

            if (progress === 1) {
                clearInterval(timerId);
                resolve();
            }
        }, 1);
    });
}