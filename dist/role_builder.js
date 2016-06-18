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
    var Builder;
    (function (Builder_1) {
        /**
         * Details for the "builder" role.
        **/
        Builder_1.role = {
            name: "builder",
            body: [WORK, CARRY, MOVE]
        };
        /**
         * Spawns a builder creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(Builder_1.role, spawnName, creepName);
        }
        Builder_1.spawn = spawn;
        var Builder = (function () {
            function Builder() {
            }
            /**
             * Runs the builder role
             * @param creep
            **/
            Builder.run = function (creep) {
                if (creep.carry.energy > 0) {
                    // find closest construction site
                    //Game.getObjectById(
                    var memory = creep.memory;
                    if (memory.target == null) {
                        var target_1 = Builder.findTarget(creep.pos);
                        if (target_1 == null) {
                            return;
                        }
                        memory.target = target_1.id;
                    }
                    var target = Game.getObjectById(memory.target);
                    var err = creep.build(target);
                    switch (err) {
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(target);
                            break;
                        case ERR_INVALID_TARGET:
                            util.logError("Builder.run: Got ERR_INVALID_TARGET " + err + " when building! Target is " + target);
                            memory.target = null;
                            break;
                        case OK:
                            break;
                        default:
                            util.logError("Builder.run: Unhandled error code " + err + " when building!");
                            break;
                    }
                }
                else {
                    var spawndropsite = util.QuickFindAny(creep, FIND_MY_SPAWNS, "transportspawn");
                    if (spawndropsite.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawndropsite);
                    }
                }
            };
            /**
             * Finds a construction site closest to the specified position.
             * @param pos
            **/
            Builder.findTarget = function (pos) {
                return pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            };
            __decorate([
                util.creepTicker(Builder_1.role)
            ], Builder, "run", null);
            return Builder;
        }());
    })(Builder = Role.Builder || (Role.Builder = {}));
})(Role || (Role = {}));
module.exports = Role.Builder;
//# sourceMappingURL=role_builder.js.map