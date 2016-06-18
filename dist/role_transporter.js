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
    var Transporter;
    (function (Transporter_1) {
        /**
         * Details for the "harvester" role.
        **/
        Transporter_1.role = {
            name: "transporter",
            body: [CARRY, MOVE]
        };
        /**
         * Spawns a harvester creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(Transporter_1.role, spawnName, creepName);
        }
        Transporter_1.spawn = spawn;
        var Transporter = (function (_super) {
            __extends(Transporter, _super);
            function Transporter() {
                _super.apply(this, arguments);
            }
            /**
             * Runs the harvester role
             * @param creep
            **/
            Transporter.run = function (creep) {
                var energyresource = RoomActor.QuickFindAny(creep, FIND_DROPPED_RESOURCES, "transportsource", {
                    filter: { resourceType: RESOURCE_ENERGY }
                });
                if (creep.carry.energy < creep.carryCapacity && energyresource) {
                    if (creep.pickup(energyresource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(energyresource);
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
                util.creepTicker(Transporter_1.role)
            ], Transporter, "run", null);
            return Transporter;
        }(RoomActor));
    })(Transporter = Role.Transporter || (Role.Transporter = {}));
})(Role || (Role = {}));
module.exports = Role.Transporter;
//# sourceMappingURL=role_transporter.js.map