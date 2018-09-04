var TTT = (function (exports) {
    'use strict';

    (function() {
        var wasm;
        const __exports = {};
        
        
        const stack = [];
        
        function addBorrowedObject(obj) {
            stack.push(obj);
            return ((stack.length - 1) << 1) | 1;
        }
        
        let cachegetUint8Memory = null;
        function getUint8Memory() {
            if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
                cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
            }
            return cachegetUint8Memory;
        }
        
        function getArrayU8FromWasm(ptr, len) {
            return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
        }
        
        let cachedGlobalArgumentPtr = null;
        function globalArgumentPtr() {
            if (cachedGlobalArgumentPtr === null) {
                cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
            }
            return cachedGlobalArgumentPtr;
        }
        
        let cachegetUint32Memory = null;
        function getUint32Memory() {
            if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
                cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
            }
            return cachegetUint32Memory;
        }
        
        const slab = [{ obj: undefined }, { obj: null }, { obj: true }, { obj: false }];
        
        function getObject(idx) {
            if ((idx & 1) === 1) {
                return stack[idx >> 1];
            } else {
                const val = slab[idx >> 1];
                
                return val.obj;
                
            }
        }
        
        let slab_next = slab.length;
        
        function dropRef(idx) {
            
            idx = idx >> 1;
            if (idx < 4) return;
            let obj = slab[idx];
            
            obj.cnt -= 1;
            if (obj.cnt > 0) return;
            
            // If we hit 0 then free up our space in the slab
            slab[idx] = slab_next;
            slab_next = idx;
        }
        
        function takeObject(idx) {
            const ret = getObject(idx);
            dropRef(idx);
            return ret;
        }
        
        class ConstructorToken {
            constructor(ptr) {
                this.ptr = ptr;
            }
        }
        
        function freeCompiler(ptr) {
            
            wasm.__wbg_compiler_free(ptr);
        }
        /**
        */
        class Compiler {
            
            static __construct(ptr) {
                return new Compiler(new ConstructorToken(ptr));
            }
            
            constructor(...args) {
                if (args.length === 1 && args[0] instanceof ConstructorToken) {
                    this.ptr = args[0].ptr;
                    return;
                }
                
                // This invocation of new will call this constructor with a ConstructorToken
                let instance = Compiler.new(...args);
                this.ptr = instance.ptr;
                
            }
            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                freeCompiler(ptr);
            }
            /**
            * @returns {Compiler}
            */
            static new() {
                return Compiler.__construct(wasm.compiler_new());
            }
            /**
            * @returns {number}
            */
            get_nodes_processed() {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                return wasm.compiler_get_nodes_processed(this.ptr);
            }
            /**
            * @returns {number}
            */
            get_winners_processed() {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                return wasm.compiler_get_winners_processed(this.ptr);
            }
            /**
            * @returns {number}
            */
            get_nodes_scored() {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                return wasm.compiler_get_nodes_scored(this.ptr);
            }
            /**
            * @returns {void}
            */
            run() {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                return wasm.compiler_run(this.ptr);
            }
            /**
            * @returns {Uint8Array}
            */
            export() {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                const ptr = this.ptr;
                this.ptr = 0;
                const retptr = globalArgumentPtr();
                wasm.compiler_export(retptr, ptr);
                const mem = getUint32Memory();
                const rustptr = mem[retptr / 4];
                const rustlen = mem[retptr / 4 + 1];
                
                const realRet = getArrayU8FromWasm(rustptr, rustlen).slice();
                wasm.__wbindgen_free(rustptr, rustlen * 1);
                return realRet;
                
            }
            /**
            * @returns {any}
            */
            export_js() {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                const ptr = this.ptr;
                this.ptr = 0;
                return takeObject(wasm.compiler_export_js(ptr));
            }
        }
        __exports.Compiler = Compiler;
        
        function freeAI(ptr) {
            
            wasm.__wbg_ai_free(ptr);
        }
        /**
        */
        class AI {
            
            static __construct(ptr) {
                return new AI(new ConstructorToken(ptr));
            }
            
            constructor(...args) {
                if (args.length === 1 && args[0] instanceof ConstructorToken) {
                    this.ptr = args[0].ptr;
                    return;
                }
                
                // This invocation of new will call this constructor with a ConstructorToken
                let instance = AI.new(...args);
                this.ptr = instance.ptr;
                
            }
            free() {
                const ptr = this.ptr;
                this.ptr = 0;
                freeAI(ptr);
            }
            /**
            * @returns {AI}
            */
            static new() {
                return AI.__construct(wasm.ai_new());
            }
            /**
            * @param {any} arg0
            * @returns {void}
            */
            load(arg0) {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                try {
                    return wasm.ai_load(this.ptr, addBorrowedObject(arg0));
                    
                } finally {
                    stack.pop();
                    
                }
                
            }
            /**
            * @param {number} arg0
            * @param {string} arg1
            * @returns {number}
            */
            get_move(arg0, arg1) {
                if (this.ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                return wasm.ai_get_move(this.ptr, arg0, arg1.codePointAt(0));
            }
        }
        __exports.AI = AI;
        
        function addHeapObject(obj) {
            if (slab_next === slab.length) slab.push(slab.length + 1);
            const idx = slab_next;
            const next = slab[idx];
            
            slab_next = next;
            
            slab[idx] = { obj, cnt: 1 };
            return idx << 1;
        }
        
        let cachedDecoder = new TextDecoder('utf-8');
        
        function getStringFromWasm(ptr, len) {
            return cachedDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
        }
        
        __exports.__wbindgen_json_parse = function(ptr, len) {
            return addHeapObject(JSON.parse(getStringFromWasm(ptr, len)));
        };
        
        let cachedEncoder = new TextEncoder('utf-8');
        
        function passStringToWasm(arg) {
            
            const buf = cachedEncoder.encode(arg);
            const ptr = wasm.__wbindgen_malloc(buf.length);
            getUint8Memory().set(buf, ptr);
            return [ptr, buf.length];
        }
        
        __exports.__wbindgen_json_serialize = function(idx, ptrptr) {
            const [ptr, len] = passStringToWasm(JSON.stringify(getObject(idx)));
            getUint32Memory()[ptrptr / 4] = ptr;
            return len;
        };
        
        __exports.__wbindgen_throw = function(ptr, len) {
            throw new Error(getStringFromWasm(ptr, len));
        };
        
        function init(wasm_path) {
            const fetchPromise = fetch(wasm_path);
            let resultPromise;
            if (typeof WebAssembly.instantiateStreaming === 'function') {
                resultPromise = WebAssembly.instantiateStreaming(fetchPromise, { './tttjs': __exports });
            } else {
                resultPromise = fetchPromise
                .then(response => response.arrayBuffer())
                .then(buffer => WebAssembly.instantiate(buffer, { './tttjs': __exports }));
            }
            return resultPromise.then(({instance}) => {
                wasm = init.wasm = instance.exports;
                return;
            });
        }    self.TTT = Object.assign(init, __exports);
    })();

    let _internals = window.TTT;
    window.TTT = undefined;

    let AI = _internals.AI;
    let Compiler = _internals.Compiler;

    let ready = false;
    let promise = null;

    function init(path){
    	promise = _internals(path);
    	promise.then(() => {
    		ready = true;
    	});
    	return promise;
    }

    function isReady(){
    	return ready;
    }

    function getPromise(){
    	return promise;
    }

    exports.init = init;
    exports.isReady = isReady;
    exports.getPromise = getPromise;
    exports.AI = AI;
    exports.Compiler = Compiler;

    return exports;

}({}));
