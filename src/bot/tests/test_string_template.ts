import {Eta} from "eta"

const eta = new Eta()
const res = eta.renderString("Hello <%= it.name %>", {name: "Ben"})
console.log(res)
