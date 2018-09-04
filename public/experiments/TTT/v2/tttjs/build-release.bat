cargo +nightly build --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/tttjs.wasm --no-modules --no-modules-global TTT --out-dir ./dist