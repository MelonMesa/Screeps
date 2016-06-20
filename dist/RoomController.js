/// <reference path="screeps.d.ts" />
"use strict";
var RoomController;
(function (RoomController) {
    function doRoomLogic() {
        for (var roomname in Game.rooms) {
            var room = Game.rooms[roomname];
            var memory = room.memory;
            if (memory.sources == null || memory.noSources) {
                memory.sources = findSources(room);
                memory.noSources = memory.sources == null;
            }
        }
    }
    RoomController.doRoomLogic = doRoomLogic;
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
                    if (newpos.lookFor("terrain") == "plain")
                        workSpotCount++;
                }
            }
            memories.push({ name: source.id, workersMax: workSpotCount, currentWorkers: 0 });
        }
        return memories;
    }
})(RoomController || (RoomController = {}));
module.exports = RoomController;
//# sourceMappingURL=RoomController.js.map