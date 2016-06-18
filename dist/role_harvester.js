/// <reference path="screeps.d.ts" />
var util = require("./util");
var Role;
(function (Role) {
    var Harvester;
    (function (Harvester) {
        Harvester.role = {
            body: [WORK, CARRY, MOVE],
            memory: { role: "harvester" }
        };
        /**
         * Spawns a harvester creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(Harvester.role, spawnName, creepName);
        }
        Harvester.spawn = spawn;
        /**
         * Runs the harvester role
         * @param creep
        **/
        function run(creep) {
            if (creep.carry.energy < creep.carryCapacity) {
                var sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
            else {
                if (creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns["Spawn1"]);
                }
            }
        }
        Harvester.run = run;
    })(Harvester = Role.Harvester || (Role.Harvester = {}));
})(Role || (Role = {}));
module.exports = Role.Harvester;
//# sourceMappingURL=role_harvester.js.map