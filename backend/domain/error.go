package domain

/*
DOMAIN ERROR TYPES
*/

type DomainErrorType string

const (
	ErrBadRequest DomainErrorType = "BAD_REQUEST"
	ErrValidation DomainErrorType = "VALIDATION"
	ErrNotFound   DomainErrorType = "NOT_FOUND"
	ErrConflict   DomainErrorType = "CONFLICT"
	ErrInternal   DomainErrorType = "INTERNAL"
)

/*
FIELD ERROR
*/

type FieldError struct {
	Name  string
	Error string
}

/*
DOMAIN ERROR INTERFACE
*/

type DomainError interface {
	error             // Error() string
	DevError() string // internal / debug message
	Type() DomainErrorType
	Fields() []FieldError // field-level errors (optional)
}

/*
CONCRETE IMPLEMENTATION (UNEXPORTED)
*/

type domainError struct {
	msg     string
	devMsg  string
	errType DomainErrorType
	fields  []FieldError
}

/*
INTERFACE IMPLEMENTATION
*/

func (e *domainError) Error() string {
	return e.msg
}

func (e *domainError) DevError() string {
	return e.devMsg
}

func (e *domainError) Type() DomainErrorType {
	return e.errType
}

func (e *domainError) Fields() []FieldError {
	return e.fields
}

/*
FACTORY FUNCTION
*/

func NewDomainError(
	msg string,
	devMsg string,
	errType DomainErrorType,
	fields []FieldError,
) DomainError {
	return &domainError{
		msg:     msg,
		devMsg:  devMsg,
		errType: errType,
		fields:  fields,
	}
}
