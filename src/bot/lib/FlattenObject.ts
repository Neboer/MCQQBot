export interface NestedObject {
    [key: string]: any;
}

export const flattenObj = (ob: NestedObject): NestedObject => {
    let result: NestedObject = {};

    for (const i in ob) {
        if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
            const temp = flattenObj(ob[i]);
            for (const j in temp) {
                result[i + '.' + j] = temp[j];
            }
        } else {
            result[i] = ob[i];
        }
    }

    return result;
};