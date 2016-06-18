/// <reference path="screeps.d.ts" />

const roleHarvester = require('role.harvester');

module.exports.loop = () => {

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleHarvester.run(creep);
    }
}