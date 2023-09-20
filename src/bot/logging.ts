import pino from "pino";

const is_dev = process.env.NODE_ENV == "development"
const pino_obj = is_dev ?
  {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    },
    level: 'debug'
  } : {};

const logger = pino(pino_obj);
export default logger;