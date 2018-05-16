/**
 * Created by Tomer on 16-May-18.
 */
const models = require('../lib/models');
const _ = require('underscore');
const treeModel = require('tree-model');
const tree = new treeModel();
const dbConn = models.dbConn;

/**
 *
 * @param rows
 * @returns {{}}
 */
const create_mergeIdToRow_dic = (rows) => {
    let mergeIdToRow = {};
    _.each(rows, (row) => {
        mergeIdToRow[row.merge_id] = {
            merge_id: row.merge_id,
            sample_count: row.sample_count,
            distance: row.distance,
            idx2: row.idx2,
            idx1: row.idx1
        }
    });

    return mergeIdToRow;
};

/**
 *
 * @param mergeId
 * @param mergeIdToRow
 * @param numberOfSamples
 */
const create_ml_tree = (mergeId, mergeIdToRow, numberOfSamples) => {

    let currentNode = undefined;

    // Recursion stops when reaching leaf - sample
    if (mergeId >= numberOfSamples) {

        let currentRow = mergeIdToRow[mergeId];

        // Creates node
        currentNode = tree.parse({
            merge_id: currentRow.merge_id,
            distance: currentRow.distance
        });

        // Adds its children - recursion call
        currentNode.addChild(create_ml_tree(currentRow.idx1, mergeIdToRow, numberOfSamples));
        currentNode.addChild(create_ml_tree(currentRow.idx2, mergeIdToRow, numberOfSamples));
    } else {

        // Creates node
        currentNode = tree.parse({
            merge_id: mergeId,
            distance: 0
        });
    }

    return currentNode;
};

/**
 *
 * @param firstNode
 * @param secondNode
 * @returns {boolean}
 */
const isNodesEquals = (firstNode, secondNode) => {
    return firstNode.model.merge_id === secondNode.model.merge_id;
};

/**
 *
 * @param firstNode
 * @param secondNode
 */
const calculate_nodes_distances = (firstNode, secondNode) => {

    let firstNodePath = firstNode.getPath();
    let secondNodePath = secondNode.getPath();

    let flag = true;
    let curNodeIdx = 0;
    while (flag && curNodeIdx < firstNodePath.length - 1 && curNodeIdx < secondNodePath.length - 1) {

        if (!isNodesEquals(firstNodePath[curNodeIdx + 1], secondNodePath[curNodeIdx + 1])) {
            flag = false;
        } else {
            curNodeIdx += 1;
        }
    }

    // Calc first node path distance
    let firstDistance = 0;
    for (let i = curNodeIdx; i < firstNodePath.length; i++) {
        firstDistance += firstNodePath[i].model.distance / 2.0;
    }

    // Calc second node path distance
    let secondDistance = 0;
    for (let i = curNodeIdx; i < secondNodePath.length; i++) {
        secondDistance += secondNodePath[i].model.distance / 2.0;
    }

    return firstDistance + secondDistance;
};

/**
 *
 * @param tree
 * @param numberOfSamples
 * @returns {Array}
 */
const calculate_distances = (tree, numberOfSamples) => {

    let distances = [];

    for (let i = 0; i < numberOfSamples; i++) {
        for (let j = 0; j < numberOfSamples; j++) {
            let idx1 = i;
            let idx2 = j;

            let idx1Node = tree.first((nd) => {
                return nd.model.merge_id === idx1;
            });
            let idx2Node = tree.first((nd) => {
                return nd.model.merge_id === idx2;
            });
            let currentDistance = calculate_nodes_distances(idx1Node, idx2Node);

            // Pushes
            distances.push([
                idx1 + 1,
                idx2 + 1,
                currentDistance
            ]);
        }
    }

    return distances;
};

/**
 * Script starts here
 */

// Gets ml clustering results
dbConn.query(`SELECT idx1, idx2, distance, sample_count, merge_id
              FROM iscout.clustring_results
              order by merge_id desc`, (err, data) => {

    if (err) {
        console.log('error');
    } else {

        // Number of samples based on number of clustering merging plus one
        let numberOfSamples = data.length + 1;

        // Saves max merge id - the first row because i used order by in query
        let maxMergeId = data[0].merge_id;

        // Creates mergeIdToRow dictionary
        let mergeIdToRow = create_mergeIdToRow_dic(data);

        // Creates tree from ml clustering results
        let clusterTree = create_ml_tree(maxMergeId, mergeIdToRow, numberOfSamples);

        console.log('Tree O.K.!!!');

        let distances = calculate_distances(clusterTree, numberOfSamples);

        dbConn.query(`INSERT INTO ml_distances
                      (from_idx, to_idx, distance)
                      VALUES ?`, [distances], (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Finished!!!');
                process.exit();
            }
        });
    }
});