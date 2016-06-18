class RoomActor {

    protected static OnInit(creep: Creep) {
    }

    static QuickFindAny<T>(creep: Creep, type: number, memoryname: string, opts?: { filter: any | string; }): T {

        if (!creep.memory[memoryname]) {
            const obj = creep.room.find<T>(type, opts)[0];
            if (obj == null) return null;
            creep.memory[memoryname] = obj["id"];
            return obj;
        }
        else {
            return Game.getObjectById<T>(creep.memory[memoryname]);
        }
    }

    protected static run(creep: Creep) {
        if (!creep.memory["firstspawn"]) {
            creep.memory["firstspawn"] = true;
            RoomActor.OnInit(creep);
        }
    };
}

export = RoomActor;