'use strict';

const Joi = require('joi');
const { coHandler } = require('../utils');
const Promise = require('bluebird');
const ranking = require('../controllers/ranking/ranking');

exports.routes = Promise.coroutine(function*(server, options) {

    let routesArray = [
        {
            method: 'GET',
            path: options.prefix + '/mlranking',
            config: {
                tags: ['api'],
                handler: ranking.mlranking,
                validate: {
                    query: {
                        user_id: Joi.number().description("user's id")
                    }
                },
                response: {
                    schema: Joi.array().items(Joi.number()).label(`user's players ranking - by ml`)
                }
            }
        }
    ];

    server.route(routesArray);
});