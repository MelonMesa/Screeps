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
            body: [WORK, MOVE]
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
                var source = util.QuickFindAny(creep, FIND_SOURCES, "minesource");
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
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