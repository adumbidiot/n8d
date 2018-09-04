#[macro_use]
extern crate serde_derive;
extern crate serde;

use serde::Serializer;
use serde::Serialize;

use std::collections::HashMap;
use std::collections::VecDeque;

fn get_possible_states(state: &State, team: char) -> Vec<State>{
	let mut states = Vec::new();
	
	for i in 0..9 {
		if state.arr[i] == 'N' {
			let mut new_state = state.clone();
			new_state.arr[i] = team;
			states.push(new_state);
		}
	}
	
	return states;
}

fn get_winner_row(s: &State, index: usize) -> char {
	let index = index * 3;
	if s.arr[index] == 'N'{
		return 'N';
	}
	
	for i in 0..3 {
		if s.arr[index] != s.arr[index + i]{
			return 'N';
		}
	}
	
	return s.arr[index];
}

fn get_winner_col(s: &State, index: usize) -> char {
	if s.arr[index] == 'N'{
		return 'N';
	}
	
	for i in 0..3 {
		if s.arr[index] != s.arr[index + i * 3] {
			return 'N';
		}
	}
	
	return s.arr[index];
}

fn get_winner_diag(s: &State, index: usize) -> char{
	let index = index * 2;
	
	if s.arr[index] == 'N' {
		return 'N';
	}
	
	let step = 4 / ((index / 2) + 1);
	
	for i in 0..3{
		if s.arr[index] != s.arr[index + i * step] {
			return 'N';
		}
	}
	
	return s.arr[index];
}

fn get_winner(s: &State) -> char{
	for i in 0..3 {
		let winner = get_winner_row(s, i);
		if winner != 'N' {
			return winner;
		}
		
		let winner = get_winner_col(s, i);
		if winner != 'N' {
			return winner;
		}
	}
	
	for i in 0..2 {
		let winner = get_winner_diag(s, i);
		if winner != 'N' {
			return winner;
		}
	}
	
	return 'N';
}

fn hash_state(s: &State) -> usize {
	let mut hash = 0;
	for i in 0..9 {
		let val = match s.arr[i] {
			'N' => 0,
			'X' => 1,
			'O' => 2,
			_ => panic!("Error")
		};
		hash += 3usize.pow(i as u32) * val;
		
	}
	
	return hash;
}

fn generate_state(hash: usize) -> State {
	let mut hash = hash;
	let mut state = State::new();
	
	for i in 0..9 {
		let val = match hash % 3 {
			0 => 'N',
			1 => 'X',
			2 => 'O',
			_ => panic!("why")
		};
		
		state.arr[i] = val;
		hash = hash / 3;
	}
	
	return state;
}

#[derive(Debug)]
pub struct Compiler {
	pub queue: VecDeque<usize>,
	pub nodes: HashMap<usize, Node>,
	pub winners: VecDeque<usize>,
	pub unscored_nodes: Vec<usize>,
	pub nodes_processed: usize,
	pub winners_processed: usize,
	pub nodes_scored: usize
}

impl Compiler {
	pub fn new() -> Compiler {
		let mut compiler = Compiler {
			queue: VecDeque::new(),
			nodes: HashMap::new(),
			winners: VecDeque::new(),
			unscored_nodes: Vec::new(),
			nodes_processed: 0,
			winners_processed: 0,
			nodes_scored: 0
		};
		
		let start_node: usize = compiler.create_node(&State::from("NNNNNNNNN"), 0);
		compiler.queue.push_back(start_node);
		
		return compiler;
	}
	
	pub fn create_node(&mut self, state: &State, level: usize) -> usize{
		let index = hash_state(state);
		let n = Node::new()
			.id(index)
			.level(level);
		
		self.nodes.insert(index, n);
		
		return index;
	}
	
	pub fn get_id(&self, s: &State) -> usize{
		return hash_state(s);
	}
	
	pub fn is_node_state(&self, state: &State) -> bool{
		return self.nodes.contains_key(&hash_state(state));
	}
	
	pub fn get_node(&mut self, index: usize) -> &mut Node{
		return self.nodes.get_mut(&index).unwrap();
	}	
	
	pub fn process(&mut self){
		if self.queue.len() == 0 {
			return;
		}
		
		let node_id = self.queue.pop_front().unwrap();
		let node_level = self.get_node(node_id).level;
		
		let team = match self.get_node(node_id).level % 2 {
			0 => 'X',
			1 => 'O',
			_ => panic!("wot in tarntation")
		};
		
		self.nodes_processed += 1;
		
		if get_winner(&generate_state(node_id)) != 'N' {
			return; //Can't keep playing after someone has won, no need to process
		}else{
			self.unscored_nodes.push(node_id);
		}
		
		{
			let states = get_possible_states(&generate_state(node_id), team);
			
			let mut state_ids = Vec::new();
			
			for i in 0..states.len() {
				let mut id = 0;
				
				if self.is_node_state(&states[i]) {
					//This node has already been found..
					id = self.get_id(&states[i]);
					state_ids.push(id);//just prepare it for parent/child relations
				}else{
					//We discovered a new Node!
					id = self.create_node(&states[i], node_level + 1); //Setup the node..
					self.queue.push_back(id); //and set it to be processed some time in the future.
					//Since its new, we can check to see if its a "winner"
					if get_winner(&generate_state(id)) != 'N' {
						//It is!
						self.winners.push_back(id); //Save to score it later
					}
				}
				
				self.get_node(id).parents.push(node_id);
				self.get_node(node_id).children.push(id);
			}
		}
	}
	
	pub fn post_process(&mut self){
		if self.winners.len() == 0 {
			return;
		}
		
		let node_id = self.winners.pop_front().unwrap();
		let winner = get_winner(&generate_state(node_id));
		let score = match winner {
			'X' => 100,
			'O' => -100,
			_ => panic!("wut")
		};
		
		self.get_node(node_id).score = score;
		self.winners_processed += 1;
	}
	
	pub fn score_nodes(&mut self){
		if self.unscored_nodes.len() == 0 {
			return;
		}
		
		let node_id = self.unscored_nodes.pop().unwrap();
		//assert!(self.get_node(node_id).score == 0);
		
		let mut scores = Vec::new();
		
		let it = self.get_node(node_id).children.clone();
		
		for child_id in it.iter() {
			scores.push(self.get_node(child_id.clone()).score);
		}
		
		if scores.len() == 0 {
			scores.push(0);
		}
		
		let score = match self.get_node(node_id).level % 2 {
			 0 => scores.iter().max().unwrap(),
			 1 => scores.iter().min().unwrap(),
			 _ => panic!("HMMMMMMMMMMMMMMMM")
		};
		
		self.get_node(node_id).score = score.clone();
		
		self.nodes_scored += 1;
	}
	
	pub fn export(self) -> Vec<u8>{
		let mut e = ExportData::new();
		e.nodes = self.nodes;
		//e.state_map = self.state_map;
		//e.index_map = self.index_map;
		
		let mut buf = Vec::new();
		//e.serialize(&mut Serializer::new(&mut buf)).unwrap();
		return buf;
	}
	
	pub fn get_export_data(self) -> ExportData {
		let mut e = ExportData::new();
		e.nodes = self.nodes;
		return e;
	}
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Node {
	pub id: usize,
	level: usize,
	parents: Vec<usize>,
	pub children: Vec<usize>,
	pub score: i8,
}

impl Node {
	fn new() -> Node {
		return Node {
			id: 0,
			level: 0,
			parents: Vec::new(),
			children: Vec::new(),
			score: 0
		};
	}
	
	fn id(mut self, id: usize) -> Node {
		self.id = id;
		return self;
	}
	
	fn level(mut self, level: usize) -> Node {
		self.level = level;
		return self;
	}
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct State {
	arr: [char; 9]
}


impl State {
	pub fn new() -> State {
		State {
			arr: ['N'; 9] 
		}
	}
	
	pub fn from(s: &str) -> State {
		let mut state = State::new();
		let arr: Vec<char> = s.chars().collect();
		for i in 0..9 {
			state.arr[i] = arr[i];
		}
		return state;
	}

	pub fn to_string(&self) -> String{
		//GOD LEFT RUST UNFINISHED
		let mut v = Vec::new();
		for i in 0..9{
			v.push(self.arr[i] as u8);
		}
		return String::from_utf8(v).unwrap();
	}
}

#[derive(Serialize, Deserialize)]
pub struct ExportData {
	pub nodes: HashMap<usize, Node>
}

impl ExportData {
	pub fn new() -> ExportData {
		return ExportData {
			nodes: HashMap::new()
		}
	}
}

#[cfg(test)]
mod tests;