#!/bin/bash
generate_and_highlight() {
    tree-sitter generate
    clear
    tree-sitter highlight examples/test.cfg
}

generate_and_highlight
while inotifywait -q -e modify "grammar.js" "examples/test.cfg"; do
    generate_and_highlight
done
