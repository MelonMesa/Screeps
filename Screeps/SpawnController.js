/// <reference path="screeps.d.ts" />
"use strict";
var util = require("./util");
var SpawnController;
(function (SpawnController) {
    var spawnRatios = [
        { roleName: "miner", ratio: 1 },
        { roleName: "transporter", ratio: 1 },
        { roleName: "miner", ratio: 1 },
        { roleName: "transporter", ratio: 1 },
        { roleName: "controllerfeeder", ratio: 1 },
        { roleName: "builder", ratio: 1 },
    ];
    var ratioSum = spawnRatios.map(function (s) { return s.ratio; }).reduce(function (a, b) { return a + b; });
    spawnRatios.forEach(function (s) { return s.ratio /= ratioSum; });
    function doSpawnLogic() {
        var memory = Memory;
        var spawns = Game.spawns;
        for (var spawnName in spawns) {
            var spawn = spawns[spawnName];
            if (!spawn.spawning) {
                //console.log(`I want to find work for ${spawnName}`);
                if (!memory.buildQueue) {
                    memory.buildQueue = findNextRoleToSpawn();
                }
                if (memory.buildQueue) {
                    if (!util.roles[memory.buildQueue]) {
                        util.logError("SpawnController.doSpawnLogic: Invalid role '" + memory.buildQueue + "'!");
                        return;
                    }
                    var roleDetails = util.roles[memory.buildQueue].role;
                    if (spawn.canCreateCreep(roleDetails.body) === OK) {
                        util.spawnCreep(roleDetails, spawnName);
                        console.log("Spawning a " + roleDetails.name + " at " + spawnName);
                        memory.buildQueue = null;
                    }
                }
            }
        }
    }
    SpawnController.doSpawnLogic = doSpawnLogic;
    function findNextRoleToSpawn() {
        // tally up how many of each role we have
        var roleCall = {};
        var totalCount = 0;
        for (var creepName in Game.creeps) {
            var creep = Game.creeps[creepName];
            var memory = creep.memory;
            roleCall[memory.role] = (roleCall[memory.role] || 0) + 1;
            totalCount++;
        }
        // normalise
        if (totalCount > 0) {
            for (var roleName in roleCall) {
                roleCall[roleName] /= totalCount;
            }
        }
        // find ratios less than target, in order
        for (var i = 0; i < spawnRatios.length; i++) {
            var spawnRatio = spawnRatios[i];
            if ((roleCall[spawnRatio.roleName] || 0) <= spawnRatio.ratio) {
                return spawnRatio.roleName;
            }
        }
        // uhhh
        //console.log(roleCall);
        return null;
    }
})(SpawnController || (SpawnController = {}));
module.exports = SpawnController;
//# sourceMappingURL=SpawnController.js.map