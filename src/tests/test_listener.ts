import {EventEmitter} from "events";

const s = new EventEmitter()

s.once("good", () => {
    console.log("help!")
})

s.once("good", () => {
    console.log("ok!")
})

s.emit("good")
s.emit("good")
s.emit("good")

