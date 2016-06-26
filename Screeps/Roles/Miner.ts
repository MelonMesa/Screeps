/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {

    /** State that a miner can be in. */
    enum MinerState {
        /** Miner is awaiting work. Default state. */
        Idle,

        /** Miner is following a path to a mining point. */
        PathingToMinePoint,

        /** Miner is mining. */
        Mining
    }

    export interface MinerMemory extends Util.CreepMemory {
        mineType: string; // RESOURCE_*
        mineTargetID: string;

        state: MinerState;
    }

    export class Miner extends Base {
        constructor() {
            super();

            this._name = "miner";
            this._bodies = [
                [WORK, CARRY, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {
            const mem: MinerMemory = creep.memory;
            var moveCode: Util.FollowPathStatus;

            const mineTarget = mem.mineTargetID && Game.getObjectById<RoomObject>(mem.mineTargetID);

            // Switch on creep state
            switch (mem.state || MinerState.Idle) {
                case MinerState.Idle:

                    if (mineTarget != null) {
                        mem.path = creep.room.findPath(creep.pos, mineTarget.pos);
                        mem.path.pop(); // don't actually step onto the target tile
                        mem.state = MinerState.PathingToMinePoint;
                        mem.pathTarget = { x: mineTarget.pos.x, y: mineTarget.pos.y };
                    }
                    break;

                case MinerState.PathingToMinePoint:

                    // See if we're at destination
                    moveCode = Util.followPath(creep, 1);
                    switch (moveCode) {
                        case Util.FollowPathStatus.Ok:
                            break;
                        case Util.FollowPathStatus.Finished:
                            // Clean up path
                            delete mem.path;
                            delete mem.pathTarget;

                            // Start mining!
                            mem.state = MinerState.Mining;
                            break;
                        default:
                            mem.state = MinerState.Idle;
                            delete mem.path;
                            delete mem.pathTarget;
                            break;
                    }
                    break;

                case MinerState.Mining:

                    if (mineTarget == null) {
                        Util.logError(`Miner.run: Mining target is null somehow`);
                        mem.state = MinerState.Idle;
                        delete mem.mineTargetID;
                    }
                    else {
                        const err = creep.harvest(<Source|Mineral>mineTarget);
                        switch (err) {
                            case OK:
                            case ERR_NOT_ENOUGH_RESOURCES:
                                break;
                            default:
                                Util.logError(`Miner.run: creep.harvest returned unhandled error code '${err}'`);
                                mem.state = MinerState.Idle;
                                break;
                        }
                    }
                    break;

            }
        }

    }

    register(new Miner());
}