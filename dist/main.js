/// <reference path="screeps.d.ts" />
var roleHarvester = require('./role_harvester');
var Main;
(function (Main) {
    function loop() {
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            roleHarvester.run(creep);
        }
    }
    Main.loop = loop;
})(Main || (Main = {}));
module.exports = Main;
//# sourceMappingURL=main.js.map