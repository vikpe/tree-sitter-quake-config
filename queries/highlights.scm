(comment) @comment
(ERROR) @error
; (unknown_statement) @error

(alias_declaration
  function: (alias_function) @keyword
  name: (alias_name) @variable
)

(expr_alias_declaration
  function: (alias_function) @keyword
  name: (alias_name) @variable
)

(number) @number

(bind_declaration
  function: (bind_function) @function
  key: (bind_key (keyname)) @variable.parameter
)

(set_declaration
  function: (set_function) @function
  name: (variable_name) @variable.parameter
)

(expr_bind_declaration
  function: (bind_function) @function
  key: (bind_key (keyname)) @variable.parameter
)

(function_call
  name: (function_name) @function
)

(expr_function_call
  name: (function_name) @function
)

(user_variable_ref) @string.special
(ezquake_variable_ref) @string.special
(qizmo_macro_ref) @string.special
(function_param_ref) @string.special

(plus_command) @string.special

(source_file
  (if_statement
    [
      (if_keyword)
      (then_keyword)
      (else_keyword)
    ] @keyword
  )
)

(expr_if_statement
  [
    (if_keyword)
    (then_keyword)
    (else_keyword)
  ] @keyword
)

(operator) @operator
