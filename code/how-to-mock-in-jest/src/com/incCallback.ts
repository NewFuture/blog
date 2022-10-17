export function incCallback<T>(callback: (i: number) => T) {
    let i = 0;
    return () => callback(i++);
}