import {flattenObj, NestedObject} from "../bot/lib/FlattenObject";

const ob: NestedObject = {
    Company: "GeeksforGeeks",
    Address: "Noida",
    contact: +91 - 999999999,
    mentor: {
        HTML: "GFG",
        CSS: "GFG",
        JavaScript: [
            "abc",
            "123",
            "sdk"
        ]
    }
};

console.log(flattenObj(ob));
