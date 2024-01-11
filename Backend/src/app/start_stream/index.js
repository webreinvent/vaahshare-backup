'use strict';

// const { register: registerSchema } = require('./schema/register');

const {streamHandler} = require('./handlers/startStream');

module.exports = async fastify => {
    fastify.route({
        method: 'GET',
        url: '/start-stream',
        // schema: registerSchema,
        handler: streamHandler,
    });
};
