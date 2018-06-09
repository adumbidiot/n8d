var N8DResources = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function isPromise(value) {
		return value && typeof value.then === 'function';
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

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	var transitionManager = {
		running: false,
		transitions: [],
		bound: null,
		stylesheet: null,
		activeRules: {},
		promise: null,

		add(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule(rule, name) {
			if (!this.stylesheet) {
				const style = createElement('style');
				document.head.appendChild(style);
				transitionManager.stylesheet = style.sheet;
			}

			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule(`@keyframes ${name} ${rule}`, this.stylesheet.cssRules.length);
			}
		},

		next() {
			this.running = false;

			const now = window.performance.now();
			let i = this.transitions.length;

			while (i--) {
				const transition = this.transitions[i];

				if (transition.program && now >= transition.program.end) {
					transition.done();
				}

				if (transition.pending && now >= transition.pending.start) {
					transition.start(transition.pending);
				}

				if (transition.running) {
					transition.update(now);
					this.running = true;
				} else if (!transition.pending) {
					this.transitions.splice(i, 1);
				}
			}

			if (this.running) {
				requestAnimationFrame(this.bound);
			} else if (this.stylesheet) {
				let i = this.stylesheet.cssRules.length;
				while (i--) this.stylesheet.deleteRule(i);
				this.activeRules = {};
			}
		},

		deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(anim => anim && anim.indexOf(name) === -1)
				.join(', ');
		},

		groupOutros() {
			this.outros = {
				remaining: 0,
				callbacks: []
			};
		},

		wait() {
			if (!transitionManager.promise) {
				transitionManager.promise = Promise.resolve();
				transitionManager.promise.then(() => {
					transitionManager.promise = null;
				});
			}

			return transitionManager.promise;
		}
	};

	function handlePromise(promise, info) {
		var token = info.token = {};

		function update(type, index, key, value) {
			if (info.token !== token) return;

			info.resolved = key && { [key]: value };

			const child_ctx = assign(assign({}, info.ctx), info.resolved);
			const block = type && (info.current = type)(info.component, child_ctx);

			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							transitionManager.groupOutros();
							block.o(() => {
								block.d(1);
								info.blocks[i] = null;
							});
						}
					});
				} else {
					info.block.d(1);
				}

				block.c();
				block[block.i ? 'i' : 'm'](info.mount(), info.anchor);

				info.component.root.set({}); // flush any handlers that were created
			}

			info.block = block;
			if (info.blocks) info.blocks[index] = block;
		}

		if (isPromise(promise)) {
			promise.then(value => {
				update(info.then, 1, info.value, value);
			}, error => {
				update(info.catch, 2, info.error, error);
			});

			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}

			info.resolved = { [info.value]: promise };
		}
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
				handler.__calling = true;
				handler.call(this, data);
				handler.__calling = false;
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
		component.store = component.root.store || options.store;
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

	/* src\n8d-resources.html generated by Svelte v2.7.2 */

	function manifestPromise({src}) {
		if(src){
			return fetch(src).then((res) => {
				if(res.status === 404){
					throw new Error('404: Resource List Not Found');
				}else if(res.status > 400){
					throw new Error('Bad HTTP Status');
				}
				
				return res.json();
			});
		}else{
			return [];
		}
	}

	function create_main_fragment(component, ctx) {
		var div, h1, text_1, promise;

		let info = {
			component,
			ctx,
			current: null,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 'manifest',
			error: 'error'
		};

		handlePromise(promise = ctx.manifestPromise, info);

		return {
			c() {
				div = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Resources";
				text_1 = createText("\r\n\t");

				info.block.c();

				this.c = noop;
				div.className = "main";
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(h1, div);
				appendNode(text_1, div);

				info.block.m(div, info.anchor = null);
				info.mount = () => div;
			},

			p(changed, _ctx) {
				ctx = _ctx;
				info.ctx = ctx;

				if (('manifestPromise' in changed) && promise !== (promise = ctx.manifestPromise) && handlePromise(promise, info)) ; else {
					info.block.p(changed, assign(assign({}, ctx), info.resolved));
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}

				info.block.d();
				info = null;
			}
		};
	}

	// (43:25)     <p>Loading...</p>   {:then manifest}
	function create_pending_block(component, ctx) {
		var p;

		return {
			c() {
				p = createElement("p");
				p.textContent = "Loading...";
			},

			m(target, anchor) {
				insertNode(p, target, anchor);
			},

			p: noop,

			d(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (47:2) {#each manifest as entry}
	function create_each_block(component, ctx) {
		var div, a, div_1, text_value = ctx.entry.label, text, a_href_value;

		return {
			c() {
				div = createElement("div");
				a = createElement("a");
				div_1 = createElement("div");
				text = createText(text_value);
				div_1.className = "link-button";
				a.href = a_href_value = ctx.entry.url;
				a.target = "_blank";
				div.className = "entry";
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(a, div);
				appendNode(div_1, a);
				appendNode(text, div_1);
			},

			p(changed, ctx) {
				if ((changed.manifestPromise) && text_value !== (text_value = ctx.entry.label)) {
					text.data = text_value;
				}

				if ((changed.manifestPromise) && a_href_value !== (a_href_value = ctx.entry.url)) {
					a.href = a_href_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (45:1) {:then manifest}
	function create_then_block(component, ctx) {
		var div;

		var each_value = ctx.manifest;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "entry-wrapper";
			},

			m(target, anchor) {
				insertNode(div, target, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},

			p(changed, ctx) {
				if (changed.manifestPromise) {
					each_value = ctx.manifest;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (55:1) {:catch error}
	function create_catch_block(component, ctx) {
		var div, h2, text_1, p, text_2_value = ctx.error.message, text_2;

		return {
			c() {
				div = createElement("div");
				h2 = createElement("h2");
				h2.textContent = "Error";
				text_1 = createText("\r\n\t\t\t");
				p = createElement("p");
				text_2 = createText(text_2_value);
				div.className = "error";
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(h2, div);
				appendNode(text_1, div);
				appendNode(p, div);
				appendNode(text_2, p);
			},

			p(changed, ctx) {
				if ((changed.manifestPromise) && text_2_value !== (text_2_value = ctx.error.message)) {
					text_2.data = text_2_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.entry = list[i];
		child_ctx.each_value = list;
		child_ctx.entry_index = i;
		return child_ctx;
	}

	class N8d_resources extends HTMLElement {
		constructor(options = {}) {
			super();
			init(this, options);
			this._state = assign({}, options.data);
			this._recompute({ src: 1 }, this._state);
			this._intro = true;

			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = `<style>.main{background-color:#777777;text-align:center;border-radius:3rem;border:1rem solid black}h1{color:#383838;user-select:none}.entry-wrapper{padding-bottom:5rem}.entry{padding-bottom:1rem}.link-button{background-color:#FF0000;width:50%;left:25%;position:relative;color:#000000;border-radius:1rem;user-select:none;transition-duration:1s;font-size:1.2rem}.link-button:hover{color:#FF0000;background-color:#000000;transition-duration:1s}a{text-decoration:none}.error{color:#D00000}</style>`;

			this._fragment = create_main_fragment(this, this._state);

			this._fragment.c();
			this._fragment.m(this.shadowRoot, null);

			if (options.target) this._mount(options.target, options.anchor);
		}

		static get observedAttributes() {
			return ["src"];
		}

		get src() {
			return this.get().src;
		}

		set src(value) {
			this.set({ src: value });
		}

		attributeChangedCallback(attr, oldValue, newValue) {
			this.set({ [attr]: newValue });
		}
	}

	assign(N8d_resources.prototype, proto);
	assign(N8d_resources.prototype, {
		_mount(target, anchor) {
			target.insertBefore(this, anchor);
		}
	});

	customElements.define("n8d-resources", N8d_resources);

	N8d_resources.prototype._recompute = function _recompute(changed, state) {
		if (changed.src) {
			if (this._differs(state.manifestPromise, (state.manifestPromise = manifestPromise(state)))) changed.manifestPromise = true;
		}
	};

	return N8d_resources;

}());
