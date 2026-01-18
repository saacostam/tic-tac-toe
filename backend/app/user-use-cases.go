package app

import (
	"myapp/domain"
)

// Add User

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

// Get User

type getUserUseCase struct {
	userRepo domain.UserRepo
}

func NewGetUserUseCase(
	userRepo domain.UserRepo,
) *getUserUseCase {
	return &getUserUseCase{
		userRepo: userRepo,
	}
}

func (uc *getUserUseCase) Execute(id string) (*domain.User, error) {
	user, err := uc.userRepo.GetUserById(id)

	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, domain.NewDomainError(
			"user not found",
			"[GetUserUseCase] user not found",
			domain.ErrBadRequest,
			nil,
		)
	}

	return user, nil
}

// Remove User

type removeUserUseCase struct {
	eventAdapter domain.EventAdapter
	gameRepo     domain.GameRepo
	userRepo     domain.UserRepo
}

func NewRemoveUserUseCase(
	eventAdapter domain.EventAdapter,
	gameRepo domain.GameRepo,
	userRepo domain.UserRepo,
) *removeUserUseCase {
	return &removeUserUseCase{
		eventAdapter: eventAdapter,
		gameRepo:     gameRepo,
		userRepo:     userRepo,
	}
}

func (uc *removeUserUseCase) Execute(id string) (string, error) {
	user, err := uc.userRepo.GetUserById(id)

	if err != nil {
		return "", err
	}

	if user == nil {
		return id, nil
	}

	// Remove games from player
	games, err := uc.gameRepo.GetGamesByUserId(user.ID)

	for _, game := range games {
		uc.gameRepo.RemoveGame(game.ID)

		// Notify each player
		for _, playerId := range game.Players {
			uc.eventAdapter.Publish(playerId, domain.UserGameRemovedEventType, "")
		}
	}

	// Notify games-update
	uc.eventAdapter.Broadcast(domain.GamesChangedEventType)

	// Remove player
	remErr := uc.userRepo.RemoveUser(id)

	return id, remErr
}
