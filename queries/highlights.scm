(comment) @comment
(ERROR) @error

(alias_name) @number

(alias_declaration (alias_function) @keyword)
(alias_declaration_sub (alias_function) @keyword)
(bind_declaration
  (bind_function) @keyword
  (bind_key (keyname)) @variable.parameter
)

(bind_declaration_sub (bind_function)) @keyword

; (bind_function
;   key: (keyname) @variable.parameter
; )

; (alias_name) @string
(user_variable_ref) @variable
(ezquake_variable_ref) @keyword
(qizmo_macro_ref) @keyword
(function_param_ref) @keyword

(plus_command) @string.special

(number) @number
(operator) @operator

(function_name) @function

(if_statement
  [
    (if_keyword)
    (then_keyword)
    (else_keyword)
  ] @keyword
)
