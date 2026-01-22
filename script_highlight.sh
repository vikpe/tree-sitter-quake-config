#!/bin/bash
generate_and_highlight() {
    clear
    tree-sitter generate
    tree-sitter highlight examples/test.cfg
    echo
    # tree-sitter parse examples/test.cfg
    echo
}

generate_and_highlight
while inotifywait -q -e modify "config.json" "grammar.js" "examples/test.cfg" "queries/highlights.scm"; do
    generate_and_highlight
done
