import util from 'util';
import { info, error } from './logging.js';

const infoLogger = (component, apiMethod, data, message = '') => {
    try {
        let logObj = {
            component,
            apiMethod,
            data,
            message,
        };
        info(logObj);
    } catch (err) {
        console.log('error in InfoLogger', err);
    }
};

const errorLogger = (component, apiMethod, data, message = '') => {
    try {
        if (typeof (data) === 'object') {
            data = util.format(data);
        }
        let logObj = {
            component,
            apiMethod,
            data,
            message,
        };
        error(logObj);
    } catch (err) {
        console.log('error in errorLogger', err);
    }
};

export { infoLogger, errorLogger };
