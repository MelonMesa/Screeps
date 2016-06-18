/// <reference path="screeps.d.ts" />
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var util = require("./util");
var Role;
(function (Role) {
    var Scout;
    (function (Scout_1) {
        /**
         * Details for the "harvester" role.
        **/
        Scout_1.role = {
            name: "Scout",
            body: [MOVE, MOVE, MOVE]
        };
        /**
         * Spawns a harvester creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(Scout_1.role, spawnName, creepName);
        }
        Scout_1.spawn = spawn;
        var Scout = (function () {
            function Scout() {
            }
            /**
             * Runs the harvester role
             * @param creep
            **/
            Scout.run = function (creep) {
                var memory = creep.memory;
                if (memory.target == null) {
                    var target_1 = Scout.findTarget();
                    if (target_1 == null) {
                        return;
                    }
                    memory.target = target_1.id;
                }
                var target = Game.getObjectById(memory.target);
                console.log(target.id);
                if (!creep.pos.isEqualTo(target)) {
                    creep.moveTo(target.pos);
                }
                else {
                    creep.memory[(target.name + "_scouted_creeps_memory")] = creep.room.find(FIND_CREEPS);
                }
            };
            /**
             * Finds a construction site closest to the specified position.
             * @param pos
            **/
            Scout.findTarget = function () {
                for (var flagname in Game.flags) {
                    if (flagname.match("^scout").length > 0) {
                        return Game.flags[flagname];
                    }
                }
                return null;
            };
            __decorate([
                util.creepTicker(Scout_1.role)
            ], Scout, "run", null);
            return Scout;
        }());
    })(Scout = Role.Scout || (Role.Scout = {}));
})(Role || (Role = {}));
module.exports = Role.Scout;
//# sourceMappingURL=role_scout.js.map