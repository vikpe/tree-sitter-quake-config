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
