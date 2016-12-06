/** Command Type Restrictions*/
export type Command = 'DROP' | 'MOVE' | 'LEFT' | 'RIGHT' | 'REPORT';
/** Direction Type Restrictions*/
export type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';


/** define the command data interface for http transport*/
export interface ICommand {
    command: Command;
    X?: number;
    Y?: number;
    D?: Direction;
    index?: number;
}

/** define the vector interface for calculation*/
export interface IVector {
    X: number;
    Y: number;
    Add?(vector: IVector): void;
}
/** define a region [minX, maxX] by [minY, maxY] with hitTest supports*/
export interface IRegion {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    //test if the vector is inside the region
    hitTest(vector: IVector): boolean;
}

/**interface for Master to route the message*/
export interface DataRoute {
    target: '<MASTER>'|'robot'|'logger'|'tester';
    data: any;
}
/**interface for sending command to Master*/
export interface MasterDirective {
    directive: 'kill'|'exit';
    name?: string;
}
/**Log entry*/
export interface Log {
    index: number;
    source: string;
    status: string;
}

/**interface for sending command to Tester*/
export interface TestOptions {
    key: 'Unit Direction' | 'Unit HitTest' | 'Functional';
    count?: number;
}