cargo +nightly build --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/tttjs.wasm --no-modules --no-modules-global TTT --out-dir ./dist
wasm2es6js dist/tttjs_bg.wasm --base64 -o dist/output.js