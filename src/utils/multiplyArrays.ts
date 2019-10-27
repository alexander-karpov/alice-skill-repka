export function multiplyArrays<T>(...arrays: T[][]): T[][] {
    const rows: T[][] = [];
    const [first, ...rest] = arrays;

    if (!first) {
        return rows;
    }

    for (let x of first) {
        const restAll = multiplyArrays(...rest);

        if (rest.length) {
            for (let r of restAll) {
                rows.push([x, ...r]);
            }
        } else {
            rows.push([x]);
        }
    }

    return rows;
}
