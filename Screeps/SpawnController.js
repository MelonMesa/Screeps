"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var util = require("./util");
var SpawnController;
(function (SpawnController_1) {
    var spawnRatios = [
        { roleName: "miner", ratio: 1 },
        { roleName: "transporter", ratio: 1 },
        { roleName: "miner", ratio: 4 },
        { roleName: "transporter", ratio: 4 },
        { roleName: "controllerfeeder", ratio: 4 },
        { roleName: "builder", ratio: 1 },
    ];
    var ratioSum = spawnRatios.map(function (s) { return s.ratio; }).reduce(function (a, b) { return a + b; });
    spawnRatios.forEach(function (s) { return s.ratio /= ratioSum; });
    var SpawnController = (function () {
        function SpawnController() {
        }
        SpawnController.run = function () {
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
                        if (spawn.canCreateCreep(roleDetails.bodies[0]) === OK) {
                            util.spawnCreep(roleDetails, spawnName);
                            console.log("Spawning a " + roleDetails.name + " at " + spawnName);
                            memory.buildQueue = null;
                        }
                    }
                }
            }
        };
        __decorate([
            util.controllerTicker()
        ], SpawnController, "run", null);
        return SpawnController;
    }());
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
        for (var roleName in roleCall) {
            roleCall[roleName] /= ratioSum;
        }
        // find ratios less than target, in order
        for (var i = 0; i < spawnRatios.length; i++) {
            var spawnRatio = spawnRatios[i];
            if ((roleCall[spawnRatio.roleName] || 0) <= spawnRatio.ratio) {
                console.log("SpawnController.findNextRoleToSpawn: " + spawnRatio.roleName + "(" + i + ") " + roleCall[spawnRatio.roleName]);
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