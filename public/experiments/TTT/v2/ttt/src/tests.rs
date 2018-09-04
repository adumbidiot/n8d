use super::*;
	
#[test]
fn winner_row_none() {
	let s = State::from("NNNNNNNNN");
	for i in 0..3 {
		assert_eq!('N', get_winner_row(&s, i));
	}
}
	
#[test]
fn winner_row_0() {
	let s = State::from("XXXNNNNNN");
    assert_eq!('X', get_winner_row(&s, 0));
	assert_eq!('N', get_winner_row(&s, 1));
	assert_eq!('N', get_winner_row(&s, 2));
}
	
#[test]
fn winner_row_1() {
	let s = State::from("NNNXXXNNN");
    assert_eq!('N', get_winner_row(&s, 0));
	assert_eq!('X', get_winner_row(&s, 1));
	assert_eq!('N', get_winner_row(&s, 2));
}
	
#[test]
fn winner_row_2() {
	let s = State::from("NNNNNNXXX");
	assert_eq!('N', get_winner_row(&s, 0));
	assert_eq!('N', get_winner_row(&s, 1));
	assert_eq!('X', get_winner_row(&s, 2));
}

#[test]
fn winner_col_none() {
	let s = State::from("NNNNNNNNN");
	for i in 0..3 {
		assert_eq!('N', get_winner_col(&s, i));
	}
}

#[test]
fn winner_col_0() {
	let s = State::from("XNNXNNXNN");
	assert_eq!('X', get_winner_col(&s, 0));
	assert_eq!('N', get_winner_col(&s, 1));
	assert_eq!('N', get_winner_col(&s, 2));
}

#[test]
fn winner_col_1() {
	let s = State::from("NXNNXNNXN");
	assert_eq!('N', get_winner_col(&s, 0));
	assert_eq!('X', get_winner_col(&s, 1));
	assert_eq!('N', get_winner_col(&s, 2));
}

#[test]
fn winner_col_2() {
	let s = State::from("NNXNNXNNX");
	assert_eq!('N', get_winner_col(&s, 0));
	assert_eq!('N', get_winner_col(&s, 1));
	assert_eq!('X', get_winner_col(&s, 2));
}

#[test]
fn winner_diag_none(){
	let s = State::from("NNNNNNNNN");
	for i in 0..2 {
		assert_eq!('N', get_winner_diag(&s, i));
	}
}

#[test]
fn winner_diag_0(){
	let s = State::from("XNNNXNNNX");
	assert_eq!('X', get_winner_diag(&s, 0));
	assert_eq!('N', get_winner_diag(&s, 1));
}

#[test]
fn winner_diag_1(){
	let s = State::from("NNXNXNXNN");
	assert_eq!('N', get_winner_diag(&s, 0));
	assert_eq!('X', get_winner_diag(&s, 1));
}

#[test]
fn winner_all_none(){
	let s = State::from("NNNNNNNNN");
	assert_eq!('N', get_winner(&s));
}

#[test]
fn winner_all_diag_0(){
	let s = State::from("XNNNXNNNX");
	assert_eq!('X', get_winner(&s));
}

#[test]
fn hash_state_0(){
	let s = State::from("NNNNNNNNN");
	assert_eq!(0, hash_state(&s));
}

#[test]
fn hash_state_891(){
	let s = State::from("NNNNONXNN");
	assert_eq!(891, hash_state(&s));
}

#[test]
fn recover_state_0(){
	let s = State::from("NNNNNNNNN");
	assert_eq!(generate_state(0), s);
}

#[test]
fn recover_state_891(){
	let s = State::from("NNNNONXNN");
	assert_eq!(generate_state(891), s);
}

#[test]
fn recover_state_11826(){
	let s = State::from("NNNNONXOX");
	assert_eq!(generate_state(11826), s);
}
