/**
 * Created by Tomer on 16-May-18.
 */
const models = require('../../models');
const _ = require('underscore');
const dbConn = models.dbConn;
/**
 *
 * @param request
 * @param reply
 */
exports.mlranking = (request, reply)=> {

    let query = `SELECT to_idx, min(distance) dis
                 FROM iscout.ml_distances
                 WHERE from_idx IN (SELECT viewed_player_id
                                    FROM iscout.user_views 
                                    WHERE user_id=?)
                 GROUP BY to_idx
                 ORDER BY dis ASC`;
    dbConn.query(query, [request.query.user_id], (err, data) => {

        if (err){
            reply(models.Boom.badImplementation(err));
        } else {

            let res = _.map(data, (row) => {
                return row.to_idx;
            });

            reply(res).code(200)
        }
    });
};