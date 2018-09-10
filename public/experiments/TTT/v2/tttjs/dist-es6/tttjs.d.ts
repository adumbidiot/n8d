/* tslint:disable */
export class Compiler {
constructor(...args: any[]);
free(): void;
static  new(): Compiler;

 get_nodes_processed(): number;

 get_winners_processed(): number;

 get_nodes_scored(): number;

 run(): void;

 export(): Uint8Array;

 export_js(): any;

}
export class AI {
constructor(...args: any[]);
free(): void;
static  new(): AI;

 load(arg0: any): void;

 get_move(arg0: number, arg1: string): number;

}
