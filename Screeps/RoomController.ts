/// <reference path="screeps.d.ts" />

import util = require("./util");

module RoomController {

    export function doRoomLogic(): void {
        for (const roomname in Game.rooms) {
            const room = Game.rooms[roomname];

            const memory: RoomMemory = room.memory;
            if (memory.sources == null || memory.noSources) {
                memory.sources = findSources(room);
                memory.noSources = memory.sources == null;
            }
        }
    }

    function findSources(room: Room): SourceMemory[] {
        var memories: SourceMemory[] = [];
        const sources = room.find<Source>(FIND_SOURCES);
        if (!sources) return null;;
        for (var i = 0; i < sources.length; i++) {
            const source = sources[i];

            var workSpotCount = 0;
            for (var x = -1; x <= 1; x++) {
                for (var y = -1; y <= 1; y++) {
                    const newpos = new RoomPosition(source.pos.x + x, source.pos.y + y, source.room.name);
                    if (newpos.lookFor("terrain") == "plain")
                        workSpotCount++;
                }
            }
            memories.push( { name: source.id, workersMax: workSpotCount, currentWorkers: [] });
        }
        return memories;
    }
}
export = RoomController;