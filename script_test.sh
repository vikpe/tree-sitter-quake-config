#!/bin/bash
FILE_NAME="$1"

generate_and_test() {
    clear
    tree-sitter generate
    if [[ -n "$FILE_NAME" ]]; then
        tree-sitter test --rebuild --file-name "$FILE_NAME"
    else
        tree-sitter test --rebuild
    fi
}

generate_and_test
while inotifywait -q -e modify "grammar.js" "test/corpus"; do
    generate_and_test
done
