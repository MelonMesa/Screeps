/// <reference path="screeps.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var util = require("./util");
var RoomActor = require("./RoomActor");
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
        var Harvester = (function (_super) {
            __extends(Harvester, _super);
            function Harvester() {
                _super.apply(this, arguments);
            }
            /**
             * Runs the harvester role
             * @param creep
            **/
            Harvester.run = function (creep) {
                if (creep.carry.energy < creep.carryCapacity) {
                    var source = RoomActor.QuickFindAny(creep, FIND_SOURCES, "minesource");
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
                else {
                    var spawndropsite = RoomActor.QuickFindAny(creep, FIND_MY_SPAWNS, "transportspawn");
                    if (creep.transfer(spawndropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.spawns["Spawn1"]);
                    }
                }
            };
            __decorate([
                util.creepTicker(Harvester_1.role)
            ], Harvester, "run", null);
            return Harvester;
        }(RoomActor));
    })(Harvester = Role.Harvester || (Role.Harvester = {}));
})(Role || (Role = {}));
module.exports = Role.Harvester;
//# sourceMappingURL=role_harvester.js.map