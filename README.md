# tree-sitter-quake-config

## prereqs

- [install tree-sitter](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html#installation)

```sh
# 1. create a local/user config
tree-sitter init-config

# 2. install dsl
bun install --ignore-scripts
```

## commands

```sh
# generate
tree-sitter generate

# build
tree-sitter build

# highlight
tree-sitter highlight examples/test.cfg
```
