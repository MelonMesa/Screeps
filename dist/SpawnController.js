"use strict";
var util = require("./util");
var SectorController = require("./SectorController");
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
    SpawnController.prototype.getMemory = function () {
        return Memory["spawnController"] || (Memory["spawnController"] = {
            buildQueue: [],
            nextRequestID: 1
        });
    };
    /**
     * Requests the specified creep to be spawned.
     * The creep details will be added to the spawn queue.
     * The creep will get spawned when the following requirements are satisfied:
     * - there is a spawner available in the room specified that can spawn the specified role
     * - the sector has enough allocated resources to afford the spawn
     * Returns a unique ID for the request that can be used to cancel it.
     * @param sector
     * @param room
     * @param role
     * @param level
     */
    SpawnController.prototype.requestSpawnCreep = function (sector, room, role, level) {
        if (level === void 0) { level = 0; }
        var mem = this.getMemory();
        mem.buildQueue.push({
            sectorName: sector.name,
            roomName: room.name,
            roleName: role.name,
            level: level,
            requestID: mem.nextRequestID
        });
        return mem.nextRequestID++;
    };
    SpawnController.prototype.run = function () {
        var memory = this.getMemory();
        // Iterate each spawn request
        for (var i = 0; i < memory.buildQueue.length; i++) {
            var request = memory.buildQueue[i];
            var room = Game.rooms[request.roomName];
            if (room) {
                // Check if the sector can afford
                var sector = SectorController.getSector(request.sectorName);
                if (sector.getMemory(room).resources.energy < util.getCreepSpawnCost(util.roles[request.roleName].role, request.level))
                    continue;
                // Find a spawn for it
                var spawns = room.find(FIND_MY_SPAWNS);
                for (var j = 0; j < spawns.length; j++) {
                    var spawn = spawns[j];
                    if (!spawn.spawning) {
                        var body = util.roles[request.roleName].role.bodies[request.level];
                        var err = spawn.canCreateCreep(body);
                        if (err === OK) {
                            var creepMem = {
                                role: request.roleName,
                                sector: request.sectorName
                            };
                            err = spawn.createCreep(body, undefined, creepMem);
                            if (err !== OK) {
                                util.logError("Got error code " + err + " when spawning creep '" + request.roleName + "' for sector '" + request.sectorName + "', even though it passed canCreateCreep check");
                            }
                            memory.buildQueue.splice(i, 1);
                            i--;
                        }
                        else {
                            util.logError("Got error code " + err + " when checking if it's OK to spawn creep '" + request.roleName + "' for sector '" + request.sectorName + "'");
                        }
                    }
                }
            }
        }
    };
    return SpawnController;
}());
var instance = new SpawnController();
module.exports = instance;
//# sourceMappingURL=SpawnController.js.map