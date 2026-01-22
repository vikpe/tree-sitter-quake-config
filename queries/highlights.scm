; (comment) @comment
(ERROR) @error

; [
;   (alias_name)
;   (bind_key)
;   (set_name)
;  ] @attribute

; [
;   ; (function)
;   (alias_function)
;   (bind_function)
;   (set_function)
; ] @function


; (conditional_expression
;   [
;     (if_key)
;     (then_key)
;     (else_key)
;   ] @keyword
; )

; (number) @number

; (binary_expression
;   (operator) @operator
; )

; ; (punctuation) @punctuation
; [(variable_ref) (macro_ref)] @variable
; (color_def) @string.special



(alias_declaration
  function: (_) @function
  name: (_) @keyword
)

(instruction) @string
