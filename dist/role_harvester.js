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
    var Harvester;
    (function (Harvester_1) {
        /**
         * Details for the "harvester" role.
        **/
        Harvester_1.role = {
            name: "harvester",
            body: [WORK, CARRY, MOVE]
        };
        /**
         * Spawns a harvester creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(Harvester_1.role, spawnName, creepName);
        }
        Harvester_1.spawn = spawn;
        var Harvester = (function () {
            function Harvester() {
            }
            /**
             * Runs the harvester role
             * @param creep
            **/
            Harvester.run = function (creep) {
                if (creep.carry.energy < creep.carryCapacity) {
                    var source = util.QuickFindAny(creep, FIND_SOURCES, "minesource");
                    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
                else {
                    var spawndropsite = util.QuickFindAny(creep, FIND_MY_SPAWNS, "transportspawn");
                    if (spawndropsite && creep.transfer(spawndropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.spawns["Spawn1"]);
                    }
                }
            };
            __decorate([
                util.creepTicker(Harvester_1.role)
            ], Harvester, "run", null);
            return Harvester;
        }());
    })(Harvester = Role.Harvester || (Role.Harvester = {}));
})(Role || (Role = {}));
module.exports = Role.Harvester;
//# sourceMappingURL=role_harvester.js.map