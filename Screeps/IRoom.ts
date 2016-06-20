interface SourceMemory {
    name?: string;
    currentWorkers: string[];
    workersMax?: number;
}

interface RoomMemory {
    sources?: SourceMemory[];
    noSources?: boolean;
}