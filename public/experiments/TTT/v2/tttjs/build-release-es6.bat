cargo +nightly build --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/tttjs.wasm --out-dir ./dist-es6
wasm2es6js dist-es6/tttjs_bg.wasm --base64 -o dist-es6/tttjs.js