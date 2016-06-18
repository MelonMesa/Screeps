/// <reference path="screeps.d.ts" />
var Util;
(function (Util) {
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
        return spawn.createCreep(role.body, creepName, memory || role.memory);
    }
    Util.spawnCreep = spawnCreep;
})(Util || (Util = {}));
module.exports = Util;
//# sourceMappingURL=util.js.map