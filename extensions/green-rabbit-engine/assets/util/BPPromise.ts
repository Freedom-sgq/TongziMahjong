export class BPPromise {

    /**
     *  @example
     *  interface TestParams {
            test: number;
        }

        const p = Promise.resolve({test: 123});
        const [err, data] = await BPPromise.safe<TestParams>(p);
        console.log(data.test);
     */
    public static safe<T, U = Error>(promise: Promise<T>, errEx?: object): Promise<[U, undefined] | [null, T]> {
        return promise
            .then<[null, T]>((data: T) => [null, data])
            .catch<[U, undefined]>((err: U) => {
                if (errEx) {
                    const merged = Object.assign({}, err, errEx);
                    return [merged, undefined];
                }

                return [err, undefined];
            });
    }
}
