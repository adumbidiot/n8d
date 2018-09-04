(function () {
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

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
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

	function setData(text, data) {
		text.data = '' + data;
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

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;
		component._staged = {};

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
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
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

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

	function _stage(newState) {
		assign(this._staged, newState);
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
		_stage,
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

	/* src\AIGame.html generated by Svelte v2.13.2 */

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
			AIPiece: 'O', //X,
			ai: null
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
			let {winner, boardState, ai} = this.get();
			if(winner != 'N' || fullBoard(boardState)){
				return;
			}
			
			let move = ai.get_move(this.getHash(), this.getAIPiece());
			
			console.log("Node:", move);
			
			boardState = genState(move);
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
		TTT.getPromise().then(() => {
			let c = new TTT.Compiler(); 
			
			let t0 = performance.now();
			c.run();
			let t1 = performance.now();
			
			
			let report = `Compile Report: 
		Compile Time: ${(t1 - t0)} ms
		Nodes Processed: ${c.get_nodes_processed()} nodes
		Winners Processed: ${c.get_winners_processed()} nodes
		Nodes Scored: ${c.get_nodes_scored()} nodes
		`;
			
			let t2 = performance.now();
			let table = c.export_js();
			let t3 = performance.now();
			
			report += `Export Time: ${t3 - t2} ms`;
			
			console.log(report);
			
			//console.log(msgpack.encode(table));
			
			let ai = new TTT.AI();
			ai.load(table);
			this.set({ai});
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
				insert(target, div, anchor);
				append(div, canvas);
				component.refs.canvas = canvas;
				append(div, text);
				append(div, div_1);
				append(div_1, text_1);
				append(div_1, text_2);
				component.refs.boardHash = div_1;
				append(div, text_3);
				append(div, div_2);
				append(div_2, text_4);
				append(div_2, text_5);
				append(div, text_6);
				append(div, button);
				append(div, text_8);
				append(div, button_1);
			},

			p(changed, ctx) {
				if (changed.hash) {
					setData(text_2, ctx.hash);
				}

				if (changed.winnerText) {
					setData(text_5, ctx.winnerText);
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
			flush(this);
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

}());
