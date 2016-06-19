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
    var ControllerFeeder;
    (function (ControllerFeeder_1) {
        /**
         * Details for the "controllerfeeder" role.
        **/
        ControllerFeeder_1.role = {
            name: "controllerfeeder",
            bodies: [[WORK, CARRY, MOVE]]
        };
        /**
         * Spawns a controller-feeder creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(ControllerFeeder_1.role, spawnName, creepName);
        }
        ControllerFeeder_1.spawn = spawn;
        var ControllerFeeder = (function () {
            function ControllerFeeder() {
            }
            /**
             * Runs the controller-feeder role
             * @param creep
            **/
            ControllerFeeder.run = function (creep) {
                if (creep.carry.energy > 0) {
                    var controller = creep.room.controller;
                    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller);
                    }
                }
                else {
                    var pickupsite = util.QuickFindAny(creep, FIND_MY_STRUCTURES, "feederspawn", {
                        filter: function (structure) {
                            return (structure.structureType == STRUCTURE_EXTENSION && structure.energy > 0);
                        }
                    });
                    if (pickupsite) {
                        if (pickupsite.structureType == STRUCTURE_EXTENSION) {
                            if (pickupsite.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(pickupsite);
                            }
                        }
                        else if (pickupsite.structureType == STRUCTURE_CONTAINER || pickupsite.structureType == STRUCTURE_STORAGE) {
                            if (pickupsite.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(pickupsite);
                            }
                        }
                    }
                }
            };
            __decorate([
                util.creepTicker(ControllerFeeder_1.role)
            ], ControllerFeeder, "run", null);
            return ControllerFeeder;
        }());
    })(ControllerFeeder = Role.ControllerFeeder || (Role.ControllerFeeder = {}));
})(Role || (Role = {}));
module.exports = Role.ControllerFeeder;
//# sourceMappingURL=role_controllerfeeder.js.map