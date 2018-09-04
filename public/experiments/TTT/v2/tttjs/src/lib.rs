#![feature(macros_in_extern)]

extern crate wasm_bindgen;
extern crate ttt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct AI {
	table: ttt::ExportData
}


impl AI {
	pub fn get_node(&self, id: usize) -> &ttt::Node {
		return self.table.nodes.get(&id).unwrap();
	}
}

#[wasm_bindgen]
impl AI{
	#[wasm_bindgen(constructor)]
	pub fn new() -> AI{
		AI {
			table: ttt::ExportData::new(),
		}
	}
	
	#[wasm_bindgen]
	pub fn load(&mut self, val: &JsValue){
		self.table = val.into_serde().unwrap();
	}
	
	#[wasm_bindgen]
	pub fn get_move(&self, id: usize, team: char) -> usize{
		let node = self.get_node(id);
		
		let mut child_id = node.children[0];
		for i in 0..node.children.len(){
			if team == 'X' && self.get_node(child_id).score < self.get_node(node.children[i]).score {
				child_id = node.children[i];
			}else if team == 'O' && self.get_node(child_id).score > self.get_node(node.children[i]).score{
				child_id = node.children[i];
			}
		}
		
		return child_id;
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
		return Compiler {
			compiler: ttt::Compiler::new()
		}
	}
	#[wasm_bindgen]
	pub fn get_nodes_processed(&self) -> usize{
		return self.compiler.nodes_processed;
	}
	
	#[wasm_bindgen]
	pub fn get_winners_processed(&self) -> usize{
		return self.compiler.winners_processed;
	}
	
	#[wasm_bindgen]
	pub fn get_nodes_scored(&self) -> usize{
		return self.compiler.nodes_scored;
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
	pub fn export(self) -> Vec<u8> {
		return self.compiler.export();
	}
	
	#[wasm_bindgen]
	pub fn export_js(self) -> JsValue{
		let data = self.compiler.get_export_data();
		/*
		let ret = match serde_json::to_string(&data){
			Ok(e) => "ok".to_string(),
			Err(e) => format!("{}", e),
			_ => "what".to_string()
		};
		*/
		return JsValue::from_serde(&data).unwrap();
	}
}

