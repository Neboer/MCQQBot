import pino from "pino";


const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    },
    level: 'debug'
})
export default logger;