var TTTGUI = (function (exports) {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._bind = options._bind;

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		this.root._lock = true;
		callAll(this.root._beforecreate);
		callAll(this.root._oncreate);
		callAll(this.root._aftercreate);
		this.root._lock = false;
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var proto = {
		destroy,
		get,
		fire,
		on,
		set,
		_recompute: noop,
		_set,
		_mount,
		_differs
	};

	const key = new Map();

	key.set('N', 0);
	key.set('X', 1);
	key.set('O', 2);
	key.set(0, 'N');
	key.set(1, 'X');
	key.set(2, 'O');

	function hashState(arr) {
		let num = 0;
		for (let i = 0; i != 9; i++) {
			num += Math.pow(3, i) * key.get(arr[i]);
		}
		return num;
	}

	function genState(num) {
		let state = [];
		while (num > 0) {
			state.push(key.get(num % 3));
			num = (num / 3) | 0;
		}

		for (let i = state.length; i != 9; i++) {
			state.push('N');
		}
		
		return state;
	}

	function getWinnerRow(index, arr){
		index *= 3;
		if(arr[index] == 'N'){
			return 'N';
		}
		
		for(let i = 0; i != 3; i++){
			if(arr[index] != arr[index + i]){
				return 'N';
			}
		}
		
		return arr[index];
	}

	function getWinnerCol(index, arr){
		if(arr[index] == 'N'){
			return 'N';
		}
		
		for(let i = 0; i != 3; i++){
			if(arr[index] != arr[index + i * 3]){
				return 'N';
			}
		}
		
		return arr[index];
	}

	function getWinnerDiag(index, arr){
		index *= 2;
		
		if(arr[index] == 'N'){
			return 'N';
		}
		
		let step = 4 / ((index / 2) + 1);
		
		for(let i = 0; i != 3; i++){
			if(arr[index] != arr[index + i * step]){
				return 'N';
			}
		}
		
		return arr[index];
	}

	function getWinnerDetails(arr){
		for(let i = 0; i != 3; i++){
			let winner = getWinnerRow(i, arr);
			if(winner != 'N'){
				return {winner, tiles: [i * 3, i * 3 + 1, i * 3 + 2], orientation: 'row'};
			}
		}
		
		for(let i = 0; i != 3; i++){
			let winner = getWinnerCol(i, arr);
			if(winner != 'N'){
				return {winner, tiles: [i, i + 3, i + 6], orientation: 'col'};
			}
		}
		
		for(let i = 0; i != 2; i++){
			let winner = getWinnerDiag(i, arr);
			if(winner != 'N'){
				let step = 4 / (i + 1);
				return {winner, tiles: [i * 2, i * 2 + step, i * 2 + 2 * step], orientation: 'diag'};
			}
		}
		
		return {winner: 'N', tiles: [], orientation: ''};
	}

	function fullBoard(board){
		for(let i = 0; i != 9; i++){
			if(board[i] == 'N'){
				return false;
			}
		}
		return true;
	}

	function invertPiece(piece){
		return (piece == 'X') ? 'O' : 'X';
	}

	class AI {
		constructor(){
			this.table = null;
		}
		
		async loadFromURL(url){
			let data = await fetch(url).then(res => res.arrayBuffer());
			this.table = msgpack.decode(new Uint8Array(data));
		}
		
		loadFromLocalStorage(key){
			let data = new Uint8Array(JSON.parse(localStorage.getItem('table')).data);
			this.table = msgpack.decode(data);
		}
		
		getMove(team, hash){
			let children = this.table[hash].children;
			
			console.log(children);
			
			let top = this.table[children[0]];
			
			for(let i = 0; i != children.length; i++){
				if(team == 'X' && top.score <= (this.table[children[i]].score)){
					top = this.table[children[i]];
				}else if(team == 'O' && Math.min(top.score, this.table[children[i]].score) != top.score){
					top = this.table[children[i]];
				}
			}
			
			return top;
		}
	}

	/* src\gui\AIGame.html generated by Svelte v2.9.7 */

	let ai = new AI();

	function hash$1({boardState}) {
		return hashState(boardState);
	}

	function winnerText({winner, AIPiece}) {
		if(winner == 'N'){
			return 'Nobody';
		}else if(winner == 'T'){
			return 'Tie';
		}else if(winner == AIPiece){
			return 'AI'
		}else if(winner == invertPiece(AIPiece)){
			return 'Player';
		}
	}

	function data() {
		return {
			boardState: new Array(9),
			userTurn: 'X',
			winner: 'N',
			start: 'player',
			AIPiece: 'O' //X
		}
	}
	var methods = {
		handleBoardClick(e){
			let {winner, boardState, userTurn} = this.get();
			if(winner != 'N' || fullBoard(boardState)){
				return;
			}
			
			let rect = this.refs.canvas.getBoundingClientRect();
			let x = e.clientX - rect.left;
			let y = e.clientY - rect.top;
			
			x = (x / 100) | 0;
			y = (y / 100) | 0;
			let i = y * 3 + x;
			
			
			if(boardState[i] != 'N'){
				return;
			}
			
			boardState[i] = userTurn;
			
			userTurn = invertPiece(userTurn);
			this.set({boardState, userTurn});
			this.AITurn();
		},
		drawBoard(board){
			let {boardState} = this.get();
			let winnerDetails = getWinnerDetails(boardState);
			if(winnerDetails.winner != 'N'){
				this.set({winner: winnerDetails.winner});
			}else if(fullBoard(boardState)){
				this.set({winner: 'T'});
			}
			
			let ctx = this.refs.canvas.getContext('2d');
			ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
			ctx.beginPath();
			
			for(let i = 0; i != 9; i++){
				let x = (i % 3) * 100;
				let y = ((i / 3) | 0) * 100;
				ctx.rect(x, y, 100, 100);
			}
			
			ctx.stroke();
			
			
			if(winnerDetails.winner != 'N'){
				ctx.save();
				ctx.fillStyle= "red";
				for(let i = 0; i != winnerDetails.tiles.length; i++){
					let x = (winnerDetails.tiles[i] % 3) * 100;
					let y = ((winnerDetails.tiles[i] / 3) | 0) * 100;
					ctx.fillRect(x, y, 100, 100);
				}
				ctx.restore();
			}
			
			
			
			ctx.font = "30px Arial";
			ctx.textAlign = "center";
			for(let i = 0; i != board.length; i++){
				let x = ((i % 3) * 100) + 50;
				
				switch(board[i]){
					case 'X': {
						ctx.fillText('X', x, (((i / 3) | 0) * 100) + 50);
						break;
					}
					case 'O': {
						ctx.fillText('O', x, (((i / 3) | 0) * 100) + 50);
						break;
					}
				}
			}
		},
		getHash(){
			return this.get().hash;
		},
		AITurn(){
			let {winner, boardState} = this.get();
			if(winner != 'N' || fullBoard(boardState)){
				return;
			}
			
			let move = ai.getMove(this.getAIPiece(), this.getHash());
			console.log(move);
			boardState = genState(move.id);
			this.set({boardState, userTurn: invertPiece(this.getAIPiece())});
		},
		playerTurn(){
			
		},
		restart(){
			this.init();
			if(this.getAIPiece() == 'X')
				this.AITurn();
		},
		init(){
			let {boardState} = this.get();
			boardState.fill('N');
			this.set({boardState, winner: 'N', userTurn: 'X'});
		},
		getAIPiece(){
			return this.get().AIPiece;
		},
		changePiece(){
			this.set({AIPiece: invertPiece(this.getAIPiece())});
			this.restart();
		}
	};

	function oncreate(data){
		this.init();
		ai.loadFromURL('table.TTT').then(() => {
			ai.table[81].score = 0;
			if(this.getAIPiece() == 'X')
				this.AITurn();
		});
	}
	function onupdate({changed, current, previous}){
		if(changed.boardState){
			this.drawBoard(current.boardState);
		}
	}
	function create_main_fragment(component, ctx) {
		var div, canvas, text, div_1, text_1, text_2, text_3, div_2, text_4, text_5, text_6, button, text_8, button_1;

		function click_handler(event) {
			component.handleBoardClick(event);
		}

		function click_handler_1(event) {
			component.restart();
		}

		function click_handler_2(event) {
			component.changePiece();
		}

		return {
			c() {
				div = createElement("div");
				canvas = createElement("canvas");
				text = createText("\r\n\t");
				div_1 = createElement("div");
				text_1 = createText("Hash: ");
				text_2 = createText(ctx.hash);
				text_3 = createText("\r\n\t");
				div_2 = createElement("div");
				text_4 = createText("Winner: ");
				text_5 = createText(ctx.winnerText);
				text_6 = createText("\r\n\t");
				button = createElement("button");
				button.textContent = "Restart";
				text_8 = createText("\r\n\t");
				button_1 = createElement("button");
				button_1.textContent = "Change Piece";
				this.c = noop;
				addListener(canvas, "click", click_handler);
				canvas.width = "300";
				canvas.height = "300";
				div_1.className = "boardState";
				setStyle(div_1, "color", "white");
				setStyle(div_2, "color", "white");
				addListener(button, "click", click_handler_1);
				addListener(button_1, "click", click_handler_2);
				setStyle(div, "background-color", "grey");
				setStyle(div, "width", "300px");
				setStyle(div, "user-select", "none");
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(canvas, div);
				component.refs.canvas = canvas;
				appendNode(text, div);
				appendNode(div_1, div);
				appendNode(text_1, div_1);
				appendNode(text_2, div_1);
				component.refs.boardHash = div_1;
				appendNode(text_3, div);
				appendNode(div_2, div);
				appendNode(text_4, div_2);
				appendNode(text_5, div_2);
				appendNode(text_6, div);
				appendNode(button, div);
				appendNode(text_8, div);
				appendNode(button_1, div);
			},

			p(changed, ctx) {
				if (changed.hash) {
					text_2.data = ctx.hash;
				}

				if (changed.winnerText) {
					text_5.data = ctx.winnerText;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(canvas, "click", click_handler);
				if (component.refs.canvas === canvas) component.refs.canvas = null;
				if (component.refs.boardHash === div_1) component.refs.boardHash = null;
				removeListener(button, "click", click_handler_1);
				removeListener(button_1, "click", click_handler_2);
			}
		};
	}

	class AIGame extends HTMLElement {
		constructor(options = {}) {
			super();
			init(this, options);
			this.refs = {};
			this._state = assign(data(), options.data);
			this._recompute({ boardState: 1, winner: 1, AIPiece: 1 }, this._state);
			this._intro = true;
			this._handlers.update = [onupdate];

			this.attachShadow({ mode: 'open' });

			if (!options.root) {
				this._oncreate = [];
			}

			this._fragment = create_main_fragment(this, this._state);

			this.root._oncreate.push(() => {
				oncreate.call(this);
				this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
			});

			this._fragment.c();
			this._fragment.m(this.shadowRoot, null);

			if (options.target) this._mount(options.target, options.anchor);
		}

		static get observedAttributes() {
			return ["boardState","winner","AIPiece","hash","winnerText"];
		}

		get boardState() {
			return this.get().boardState;
		}

		set boardState(value) {
			this.set({ boardState: value });
		}

		get winner() {
			return this.get().winner;
		}

		set winner(value) {
			this.set({ winner: value });
		}

		get AIPiece() {
			return this.get().AIPiece;
		}

		set AIPiece(value) {
			this.set({ AIPiece: value });
		}

		get hash() {
			return this.get().hash;
		}

		set hash(value) {
			this.set({ hash: value });
		}

		get winnerText() {
			return this.get().winnerText;
		}

		set winnerText(value) {
			this.set({ winnerText: value });
		}

		attributeChangedCallback(attr, oldValue, newValue) {
			this.set({ [attr]: newValue });
		}

		connectedCallback() {
			callAll(this._oncreate);
		}
	}

	assign(AIGame.prototype, proto);
	assign(AIGame.prototype, methods);
	assign(AIGame.prototype, {
		_mount(target, anchor) {
			target.insertBefore(this, anchor);
		}
	});

	customElements.define("ttt-ai", AIGame);

	AIGame.prototype._recompute = function _recompute(changed, state) {
		if (changed.boardState) {
			if (this._differs(state.hash, (state.hash = hash$1(state)))) changed.hash = true;
		}

		if (changed.winner || changed.AIPiece) {
			if (this._differs(state.winnerText, (state.winnerText = winnerText(state)))) changed.winnerText = true;
		}
	};

	//import TTTGUI from './TTTGUI.html';

	exports.AIGame = AIGame;

	return exports;

}({}));
