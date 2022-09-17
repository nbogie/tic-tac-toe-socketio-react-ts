export function collect<T>(n: number, cb: (ix: number) => T): T[] {
    const outputArray: T[] = [];
    for (let i = 0; i < n; i++) {
        outputArray.push(cb(i));
    }
    return outputArray;
}
