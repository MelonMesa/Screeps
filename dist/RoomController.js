"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var util = require("./util");
var RoomController;
(function (RoomController_1) {
    var RoomController = (function () {
        function RoomController() {
        }
        RoomController.run = function () {
            for (var roomname in Game.rooms) {
                var room = Game.rooms[roomname];
                var memory = room.memory;
                if (memory.sources == null || memory.noSources) {
                    memory.sources = findSources(room);
                    memory.noSources = memory.sources == null || memory.sources.length === 0;
                }
            }
        };
        __decorate([
            util.controllerTicker()
        ], RoomController, "run", null);
        return RoomController;
    }());
    function findSources(room) {
        var memories = [];
        var sources = room.find(FIND_SOURCES);
        if (!sources)
            return null;
        ;
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            var workSpotCount = 0;
            for (var x = -1; x <= 1; x++) {
                for (var y = -1; y <= 1; y++) {
                    var newpos = new RoomPosition(source.pos.x + x, source.pos.y + y, source.room.name);
                    if (newpos.lookFor("terrain") != "wall")
                        workSpotCount++;
                }
            }
            memories.push({ name: source.id, workersMax: workSpotCount, currentWorkers: [] });
        }
        return memories;
    }
})(RoomController || (RoomController = {}));
module.exports = RoomController;
//# sourceMappingURL=RoomController.js.map