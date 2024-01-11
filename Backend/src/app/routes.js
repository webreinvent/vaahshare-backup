'use strict';

const {errorHandler} = require('../errors');
const todoRoutes = require('./todos/routes');
const authRoutes = require('./auth');
const stream = require('./start_stream')
//
module.exports = async fastify => {
    fastify.setErrorHandler(errorHandler());
    // fastify.register(todoRoutes, { prefix: '/v1/todos' });
    // fastify.register(authRoutes, { prefix: '/v1/auth' });
    fastify.register(stream, {prefix: '/v1/stream'})
};



