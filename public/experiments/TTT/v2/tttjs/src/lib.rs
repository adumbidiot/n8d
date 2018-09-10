extern crate wasm_bindgen;
extern crate ttt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct AI {
	ai: ttt::AI
}

#[wasm_bindgen]
impl AI{
	#[wasm_bindgen(constructor)]
	pub fn new() -> AI{
		AI {
			ai: ttt::AI::new()
		}
	}
	
	#[wasm_bindgen]
	pub fn load(&mut self, val: &JsValue){
		self.ai.load(val.into_serde().unwrap());
	}
	
	#[wasm_bindgen]
	pub fn get_move(&self, id_str: &str, team: u8) -> String {
		let id = id_str.parse::<ttt::NodeIndex>().unwrap();
		let res = self.ai.get_move(id, team);
		return res.to_string();
	}
	
	#[wasm_bindgen]
	pub fn get_score(&self, id_str: String) -> i8 {
		let id = id_str.parse::<ttt::NodeIndex>().unwrap();
		let res = self.ai.get_score(&id);
		return res;
	}
}


#[wasm_bindgen]
pub struct Compiler {
	compiler: ttt::Compiler,
}

#[wasm_bindgen]
impl Compiler {
	#[wasm_bindgen(constructor)]
	pub fn new() -> Compiler {
		let mut c = ttt::Compiler::new();
		c.compilation = Some(Box::new(ttt::ttt::TTTCompilation::new()));
		c.init_compilation();
		
		return Compiler {
			compiler: c,
		};
	}
	
	#[wasm_bindgen]
	pub fn change_compilation(&mut self, board_size: u8){
		self.compiler.compilation.as_mut().unwrap().reset();
		self.compiler.compilation.as_mut().unwrap().as_any().downcast_mut::<ttt::ttt::TTTCompilation>().unwrap().set_board_size(board_size);
		self.compiler.init_compilation();
	}
	
	#[wasm_bindgen]
	pub fn get_nodes_processed(&self) -> usize {
		return self.compiler.get_nodes_processed();
	}
	
	#[wasm_bindgen]
	pub fn get_winners_processed(&self) -> usize {
		return self.compiler.get_winners_processed();
	}
	
	#[wasm_bindgen]
	pub fn get_nodes_scored(&self) -> usize {
		return self.compiler.get_nodes_scored();
	}
	
	#[wasm_bindgen]
	pub fn run(&mut self){
		while self.compiler.queue.len() != 0 {
			self.compiler.process();
		}
		
		while self.compiler.winners.len() != 0 {
			self.compiler.post_process();
		}
		
		while self.compiler.unscored_nodes.len() != 0 {
			self.compiler.score_nodes();
		}
	}
	
	#[wasm_bindgen]
	pub fn export(&mut self) -> JsValue {
		let data = self.compiler.export();
		return JsValue::from_serde(&data).unwrap();
	}
}