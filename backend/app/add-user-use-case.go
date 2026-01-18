package app

import (
	"myapp/domain"
)

type addUserUseCase struct {
	eventAdapter domain.EventAdapter
	userRepo     domain.UserRepo
}

func NewAddUserUseCase(
	eventAdapter domain.EventAdapter,
	userRepo domain.UserRepo,
) *addUserUseCase {
	return &addUserUseCase{
		eventAdapter: eventAdapter,
		userRepo:     userRepo,
	}
}

func (uc *addUserUseCase) Execute(name string) (string, error) {
	createdUser, createErr := uc.userRepo.CreateUser(name)

	return createdUser.ID, createErr
}
