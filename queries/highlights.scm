; (comment) @comment

; (command
;   name: (_) @function
; )

; ; (bind
; ;   function: (_) @function
; ; )

; ; (conditional) @keyword

; ; (command_without_args) @function

; (bracket) @punctuation
; (number) @number
; (ref) @variable
; (function) @function

; (bind_key) @attribute

; ; (expression
; ;   content: (value)        @value
; ;   content: (conditional)  @keyword
; ;   content: (terminator)   @punctuation
; ;   content: (operator)     @operator
; ; )

; (operator) @operator
; (conditional) @keyword
; (single_quoted_string) @number
; ;
; ;
; ;
; ; (brackets) @operator
; ; (expression
; ;   (content) (_) @number
; ; )

; ; (string) @string

; ; [
; ;   (alias_function)
; ;   (bind)
; ;   (set_function)
; ; ] @variable.function

; ; (value) @number
; ; (variable) @variable
; ; [
; ; (variable_ref)
; ; (macro_ref)
; ; ] @number
; ; (operator) @operator

; ; (alias) @function
; ; (assignment) @function
; ; (bind) @function
; ; (setting_name) @keyword
; ; (bind_key) @number
