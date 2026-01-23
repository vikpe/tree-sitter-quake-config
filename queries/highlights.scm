(comment) @comment
(ERROR) @error

(alias_declaration
  function: (_) @function
  name: (_) @attribute
)

(variable_ref) @variable

(number) @number
(operator) @operator


(if_statement
  [
    (if_keyword)
    (then_keyword)
    (else_keyword)
  ] @keyword
)
