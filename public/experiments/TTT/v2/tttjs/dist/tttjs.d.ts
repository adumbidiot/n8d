/* tslint:disable */
export class Compiler {
constructor(...args: any[]);
free(): void;
static  new(): Compiler;

 change_compilation(arg0: number): void;

 get_nodes_processed(): number;

 get_winners_processed(): number;

 get_nodes_scored(): number;

 run(): void;

 export(): any;

}
export class AI {
constructor(...args: any[]);
free(): void;
static  new(): AI;

 load(arg0: any): void;

 get_move(arg0: string, arg1: number): string;

 get_score(arg0: string): number;

}
