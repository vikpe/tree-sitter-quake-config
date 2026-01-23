(comment) @comment
(ERROR) @error

(alias_name) @number

(alias_declaration_complex (alias_function) @keyword)
(alias_declaration_simple (alias_function) @keyword)
(bind_declaration_complex
  (bind_function) @keyword
  (bind_key (keyname)) @variable.parameter
)

(bind_declaration_simple (bind_function)) @keyword

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
