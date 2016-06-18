"use strict";
var RoomActor = (function () {
    function RoomActor() {
    }
    RoomActor.OnInit = function (creep) {
    };
    RoomActor.QuickFindAny = function (creep, type, memoryname, opts) {
        if (!creep.memory[memoryname]) {
            var obj = creep.room.find(type, opts)[0];
            if (obj == null)
                return null;
            creep.memory[memoryname] = obj["id"];
            return obj;
        }
        else {
            return Game.getObjectById(creep.memory[memoryname]);
        }
    };
    RoomActor.run = function (creep) {
        if (!creep.memory["firstspawn"]) {
            creep.memory["firstspawn"] = true;
            RoomActor.OnInit(creep);
        }
    };
    ;
    return RoomActor;
}());
module.exports = RoomActor;
//# sourceMappingURL=RoomActor.js.map