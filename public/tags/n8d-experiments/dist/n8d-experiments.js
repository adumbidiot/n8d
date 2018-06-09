var N8DExperiments = (function () {
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

	function createComment() {
		return document.createComment('');
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
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

	/* src\n8d-experiments.html generated by Svelte v2.7.2 */

	function manifestPromise({src}) {
		return fetch(src).then(res => res.json());
	}

	function add_css() {
		var style = createElement("style");
		style.id = 'svelte-140c3am-style';
		style.textContent = ".experiment-header.svelte-140c3am{font-weight:200;padding-bottom:10px;color:white}.img-icon.svelte-140c3am{height:50px}.project-bubble.svelte-140c3am{background-color:grey;border:1px solid grey;border-radius:40px;margin:2px}.experiment-bg.svelte-140c3am{background-color:#030303;border-radius:10px}";
		appendNode(style, document.head);
	}

	function create_main_fragment(component, ctx) {
		var div, div_1, h1, text_1, div_2, promise, text_3, br;

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
				div_1 = createElement("div");
				h1 = createElement("h1");
				h1.textContent = "Experiments";
				text_1 = createText("\r\n\t\t");
				div_2 = createElement("div");

				info.block.c();

				text_3 = createText("\r\n\t\t");
				br = createElement("br");
				h1.className = "experiment-header svelte-140c3am";
				div_2.className = "row justify-content-center";
				div_1.className = "col-md-12 experiment-bg svelte-140c3am";
				div.className = "row";
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(div_1, div);
				appendNode(h1, div_1);
				appendNode(text_1, div_1);
				appendNode(div_2, div_1);

				info.block.m(div_2, info.anchor = null);
				info.mount = () => div_2;

				appendNode(text_3, div_1);
				appendNode(br, div_1);
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

	// (25:27)       <p style="color: white;">Loading...</p>     {:then manifest}
	function create_pending_block(component, ctx) {
		var p;

		return {
			c() {
				p = createElement("p");
				p.textContent = "Loading...";
				setStyle(p, "color", "white");
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

	// (28:4) {#each manifest as entry}
	function create_each_block(component, ctx) {
		var div, a, div_1, a_href_value;

		function select_block_type(ctx) {
			if (ctx.entry.img) return create_if_block;
			return create_if_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

		return {
			c() {
				div = createElement("div");
				a = createElement("a");
				div_1 = createElement("div");
				if_block.c();
				div_1.className = "project-bubble svelte-140c3am";
				a.href = a_href_value = ctx.entry.url || "";
				div.className = "col-md-4";
			},

			m(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(a, div);
				appendNode(div_1, a);
				if_block.m(div_1, null);
			},

			p(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(div_1, null);
				}

				if ((changed.manifestPromise) && a_href_value !== (a_href_value = ctx.entry.url || "")) {
					a.href = a_href_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block.d();
			}
		};
	}

	// (32:8) {#if entry.img}
	function create_if_block(component, ctx) {
		var img, img_alt_value, img_src_value;

		return {
			c() {
				img = createElement("img");
				img.alt = img_alt_value = ctx.entry.imgAlt || "";
				img.src = img_src_value = ctx.entry.img || "";
				img.className = "img-icon svelte-140c3am";
			},

			m(target, anchor) {
				insertNode(img, target, anchor);
			},

			p(changed, ctx) {
				if ((changed.manifestPromise) && img_alt_value !== (img_alt_value = ctx.entry.imgAlt || "")) {
					img.alt = img_alt_value;
				}

				if ((changed.manifestPromise) && img_src_value !== (img_src_value = ctx.entry.img || "")) {
					img.src = img_src_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(img);
				}
			}
		};
	}

	// (34:8) {:else}
	function create_if_block_1(component, ctx) {
		var p, text_value = ctx.entry.imgAlt, text;

		return {
			c() {
				p = createElement("p");
				text = createText(text_value);
			},

			m(target, anchor) {
				insertNode(p, target, anchor);
				appendNode(text, p);
			},

			p(changed, ctx) {
				if ((changed.manifestPromise) && text_value !== (text_value = ctx.entry.imgAlt)) {
					text.data = text_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (27:3) {:then manifest}
	function create_then_block(component, ctx) {
		var each_anchor;

		var each_value = ctx.manifest;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		return {
			c() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insertNode(each_anchor, target, anchor);
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
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (41:3) {:catch error}
	function create_catch_block(component, ctx) {
		var p, text, text_1_value = ctx.error.message, text_1;

		return {
			c() {
				p = createElement("p");
				text = createText("Error: ");
				text_1 = createText(text_1_value);
				setStyle(p, "color", "red");
			},

			m(target, anchor) {
				insertNode(p, target, anchor);
				appendNode(text, p);
				appendNode(text_1, p);
			},

			p(changed, ctx) {
				if ((changed.manifestPromise) && text_1_value !== (text_1_value = ctx.error.message)) {
					text_1.data = text_1_value;
				}
			},

			d(detach) {
				if (detach) {
					detachNode(p);
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

	function N8d_experiments(options) {
		init(this, options);
		this._state = assign({}, options.data);
		this._recompute({ src: 1 }, this._state);
		this._intro = true;

		if (!document.getElementById("svelte-140c3am-style")) add_css();

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(N8d_experiments.prototype, proto);

	N8d_experiments.prototype._recompute = function _recompute(changed, state) {
		if (changed.src) {
			if (this._differs(state.manifestPromise, (state.manifestPromise = manifestPromise(state)))) changed.manifestPromise = true;
		}
	};

	return N8d_experiments;

}());
