interface SourceMemory {
    name?: string;
    currentWorkers: number;
    workersMax?: number;
}

interface RoomMemory {
    sources?: SourceMemory[];
    noSources?: boolean;
}