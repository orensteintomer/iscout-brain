'use strict';

const Joi = require('joi');
const { coHandler } = require('../utils');
const Promise = require('bluebird');

exports.routes = Promise.coroutine(function*(server, options) {

    let routesArray = [

    ];

    server.route(routesArray);
});