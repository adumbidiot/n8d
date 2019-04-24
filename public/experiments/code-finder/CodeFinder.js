(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.CodeFinder = {}));
}(this, function (exports) { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
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

	function setData(text, data) {
		text.data = '' + data;
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

	/* src\CodeFinderGui.html generated by Svelte v2.16.1 */

	function data(){
		return {
			getCodes: false,
		};
	}
	function add_css() {
		var style = createElement("style");
		style.id = 'svelte-16jr0t4-style';
		style.textContent = ".toggle.svelte-16jr0t4{width:100px;height:50px;background-color:#b9d295;border-radius:50px;top:25px;position:absolute;right:10px;text-align:center;line-height:50px;color:#2f1830;user-select:none;font-size:30px}.toggle.svelte-16jr0t4:hover{width:96px;height:46px;line-height:46px;background-color:#2f1830 !important}.toggle-start.svelte-16jr0t4:hover{border:2px solid #b9d295;color:#b9d295 !important}.toggle-pause.svelte-16jr0t4:hover{border:2px solid #ec0b43;color:#ec0b43 !important}.toggle-pause.svelte-16jr0t4{background-color:#ec0b43 !important;color:#ec0b43 !important}.code-display.svelte-16jr0t4{width:200px;height:50px;border:2px solid #b9d295;position:absolute;top:25px;left:25px;color:#b9d295;border-radius:25px;text-align:center;line-height:46px;font-size:30px}.main.svelte-16jr0t4{border-radius:50px;height:100px;width:400px;background-color:#2f1830;user-select:none;position:relative}";
		append(document.head, style);
	}

	function create_main_fragment(component, ctx) {
		var div2, div0, text0_value = ctx.getCodes? 'Stop' : 'Start', text0, div0_class_value, text1, div1;

		return {
			c() {
				div2 = createElement("div");
				div0 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n\t");
				div1 = createElement("div");
				div1.textContent = "Press Start...";
				div0.className = div0_class_value = "toggle " + (ctx.getCodes ? 'toggle-stop' : 'toggle-start') + " svelte-16jr0t4";
				div1.className = "code-display svelte-16jr0t4";
				div2.className = "main svelte-16jr0t4";
			},

			m(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, text0);
				append(div2, text1);
				append(div2, div1);
			},

			p(changed, ctx) {
				if ((changed.getCodes) && text0_value !== (text0_value = ctx.getCodes? 'Stop' : 'Start')) {
					setData(text0, text0_value);
				}

				if ((changed.getCodes) && div0_class_value !== (div0_class_value = "toggle " + (ctx.getCodes ? 'toggle-stop' : 'toggle-start') + " svelte-16jr0t4")) {
					div0.className = div0_class_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div2);
				}
			}
		};
	}

	function CodeFinderGui(options) {
		init(this, options);
		this._state = assign(data(), options.data);
		this._intro = true;

		if (!document.getElementById("svelte-16jr0t4-style")) add_css();

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(CodeFinderGui.prototype, proto);

	exports.CodeFinderGui = CodeFinderGui;

	Object.defineProperty(exports, '__esModule', { value: true });

}));