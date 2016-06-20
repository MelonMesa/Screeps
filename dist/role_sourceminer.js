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
    var SourceMiner;
    (function (SourceMiner_1) {
        /**
         * Details for the "harvester" role.
        **/
        SourceMiner_1.role = {
            name: "miner",
            bodies: [[WORK, MOVE]]
        };
        /**
         * Spawns a harvester creep.
         * @param spawnName
         * @param creepName
        **/
        function spawn(spawnName, creepName) {
            return util.spawnCreep(SourceMiner_1.role, spawnName, creepName);
        }
        SourceMiner_1.spawn = spawn;
        var SourceMiner = (function () {
            function SourceMiner() {
            }
            /**
             * Runs the harvester role
             * @param creep
            **/
            SourceMiner.run = function (creep) {
                var roommemory = creep.room.memory;
                var minermemory = creep.memory;
                if (roommemory.noSources || !roommemory.sources)
                    return;
                if (minermemory.source) {
                    var source = Game.getObjectById(minermemory.source);
                    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                    return;
                }
                else {
                    for (var i = 0; i < roommemory.sources.length; i++) {
                        var source = roommemory.sources[i];
                        for (var j = 0; j < source.workersMax; j++) {
                            var worker = source.currentWorkers[j];
                            if (!worker || !Game.getObjectById(worker)) {
                                source.currentWorkers[j] = creep.id;
                                minermemory.source = source.name;
                                return;
                            }
                        }
                    }
                }
            };
            __decorate([
                util.creepTicker(SourceMiner_1.role)
            ], SourceMiner, "run", null);
            return SourceMiner;
        }());
    })(SourceMiner = Role.SourceMiner || (Role.SourceMiner = {}));
})(Role || (Role = {}));
module.exports = Role.SourceMiner;
//# sourceMappingURL=role_sourceminer.js.map