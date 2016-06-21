"use strict";
var Util;
(function (Util) {
    /**
     *  All registered roles.
    **/
    Util.roles = {};
    /**
     *  All registered controllers.
    **/
    Util.controllers = [];
    /**
     * Logs the specified error.
     * @param error
    **/
    function logError(error) {
        console.log(error);
    }
    Util.logError = logError;
    /**
     * Spawns a creep with the specified role.
     * @param role          The role to spawn
     * @param spawnName     The name of the spawn to spawn at
     * @param creepName     The name of the creep to use
    **/
    function spawnCreep(role, spawnName, creepName, memory) {
        var spawn = Game.spawns[spawnName];
        if (spawn == null) {
            logError("spawnCreep: Invalid spawn name");
            return null;
        }
        var mem = { role: role.name, sector: null };
        if (memory) {
            for (var key in memory) {
                mem[key] = memory[key];
            }
        }
        return spawn.createCreep(role.bodies[0], creepName, mem);
    }
    Util.spawnCreep = spawnCreep;
    /**
     * Gets the spawn cost of the specified role/level.
     * @param role
     * @param level
     */
    function getCreepSpawnCost(role, level) {
        if (level === void 0) { level = 0; }
        return role.bodies[level]
            .map(function (p) { return BODYPART_COST[p]; })
            .reduce(function (a, b) { return a + b; });
    }
    Util.getCreepSpawnCost = getCreepSpawnCost;
    function creepTicker(role) {
        return function (target, propertyKey, descriptor) {
            Util.roles[role.name] = {
                role: role,
                ticker: target[propertyKey]
            };
        };
    }
    Util.creepTicker = creepTicker;
    function controllerTicker() {
        return function (target, propertyKey, descriptor) { Util.controllers.push(target[propertyKey]); };
    }
    Util.controllerTicker = controllerTicker;
    function QuickFindAny(creep, type, memoryname, opts) {
        if (!creep.memory[memoryname]) {
            var obj_1 = creep.room.find(type, opts)[0];
            if (obj_1 == null)
                return null;
            creep.memory[memoryname] = obj_1["id"];
            return obj_1;
        }
        else {
            var obj = Game.getObjectById(creep.memory[memoryname]);
            if (obj == null || (!opts || (typeof opts.filter == "function" && !opts.filter(obj)))) {
                creep.memory[memoryname] = null;
                return QuickFindAny(creep, type, memoryname, opts);
            }
            return obj;
        }
    }
    Util.QuickFindAny = QuickFindAny;
})(Util || (Util = {}));
module.exports = Util;
//# sourceMappingURL=util.js.map