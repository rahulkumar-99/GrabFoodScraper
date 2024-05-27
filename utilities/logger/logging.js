const info = (data) => {
    try {
        let currentTime = new Date();
        if (typeof (data) === 'string') {
            console.log('string log => ', data, ' at ', currentTime);
        }
        if (typeof (data) === 'object') {
            data.logType = 'info';
            data.dt = currentTime;
            console.log('Info log =>', JSON.stringify(data));
        }
    } catch (err) {
        console.log('Error in Logging info function ', JSON.stringify(err));
    }
};

const error = (data) => {
    try {
        let currentTime = new Date();
        if (typeof (data) === 'string') {
            console.log('string log => ', data, ' at ', currentTime);
        }
        if (typeof (data) === 'object') {
            data.logType = 'error';
            data.dt = currentTime;
            console.log('Error log =>', JSON.stringify(data, Object.getOwnPropertyNames(data)));
        }
    } catch (err) {
        console.log('Error in Logging error function ', JSON.stringify(err));
    }
};

const devLog = (data) => {
    try {
        let currentTime = new Date();
        if (typeof (data) === 'string') {
            console.log('string log => ', data, ' at ', currentTime);
        }
        if (typeof (data) === 'object') {
            data.logType = 'devLog';
            data.dt = currentTime;
            console.log('dev log =>', JSON.stringify(data));
        }
    } catch (err) {
        console.log('Error in Logging DevLog function ', JSON.stringify(err));
    }
};

export {
    info,
    error
};