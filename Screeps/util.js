/// <reference path="screeps.d.ts" />
"use strict";
var Util;
(function (Util) {
    /**
     *  All registered roles.
    **/
    Util.roles = {};
    /**
     * Logs the specified error.
     * @param error
    **/
    function logError(error) {
        console.error(error);
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
        var mem = { role: role.name };
        if (memory) {
            for (var key in memory) {
                mem[key] = memory[key];
            }
        }
        return spawn.createCreep(role.body, creepName, mem);
    }
    Util.spawnCreep = spawnCreep;
    function creepTicker(role) {
        return function (target, propertyKey, descriptor) {
            Util.roles[role.name] = {
                role: role,
                ticker: target[propertyKey]
            };
        };
    }
    Util.creepTicker = creepTicker;
})(Util || (Util = {}));
module.exports = Util;
//# sourceMappingURL=util.js.map