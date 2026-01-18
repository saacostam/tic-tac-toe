package app

import (
	"log"
	"myapp/domain"
	"slices"
)

// End Game
type endGameUseCase struct {
	eventAdapter domain.EventAdapter
	gameRepo     domain.GameRepo
	userRepo     domain.UserRepo
}

func NewEndGameUseCase(
	eventAdapter domain.EventAdapter,
	gameRepo domain.GameRepo,
	userRepo domain.UserRepo,
) *endGameUseCase {
	return &endGameUseCase{
		eventAdapter: eventAdapter,
		gameRepo:     gameRepo,
		userRepo:     userRepo,
	}
}

func (uc *endGameUseCase) Execute(
	gameId string,
	userId string,
) error {
	game, getGameByIdErr := uc.gameRepo.GetGameById(gameId)

	if getGameByIdErr != nil {
		return getGameByIdErr
	}

	if game == nil {
		return domain.NewDomainError(
			"game not found",
			"[endGameUserCase.GetGameById] game not found by id "+gameId,
			domain.ErrBadRequest,
			nil,
		)
	}

	// Remove userId
	var newPlayers []string = []string{}
	for _, playerId := range game.Players {
		if playerId != userId {
			newPlayers = append(newPlayers, playerId)
		}
	}
	game.Players = newPlayers

	// Update state or delete
	hasRemovedGame := false
	if game.Status == domain.GameStarted || len(game.Players) == 0 {
		removeErr := uc.gameRepo.RemoveGame(gameId)
		if removeErr != nil {
			return removeErr
		}
		hasRemovedGame = true
	} else {
		updatedErr := uc.gameRepo.UpdateGameById(gameId, *game)
		if updatedErr != nil {
			return updatedErr
		}
	}

	// Notify
	// TODO: Parallel call this or create batch call to game
	message := ""
	if hasRemovedGame {
		message = "Game was ended"
	}
	for _, playerId := range game.Players {
		if err := uc.eventAdapter.Publish(playerId, domain.UserGameChangedEventType, message); err != nil {
			return err
		}
	}

	if hasRemovedGame {
		if err := uc.eventAdapter.Broadcast(domain.GamesChangedEventType); err != nil {
			return err
		}
	}

	return nil
}

// Join Game
type joinGameUseCase struct {
	eventAdapter domain.EventAdapter
	gameRepo     domain.GameRepo
	userRepo     domain.UserRepo
}

func NewJoinGameUseCase(
	eventAdapter domain.EventAdapter,
	gameRepo domain.GameRepo,
	userRepo domain.UserRepo,
) *joinGameUseCase {
	return &joinGameUseCase{
		eventAdapter: eventAdapter,
		gameRepo:     gameRepo,
		userRepo:     userRepo,
	}
}

func (uc *joinGameUseCase) Execute(userId string, gameId string) error {
	user, err := uc.userRepo.GetUserById(userId)

	if err != nil {
		return err
	}

	if user == nil {
		return domain.NewDomainError(
			"user does not exist",
			"[JoinGameUseCase] user by id "+userId+" not found",
			domain.ErrNotFound,
			nil,
		)
	}

	gamesByUser, err := uc.gameRepo.GetGamesByUserId(user.ID)

	if err != nil {
		return err
	}

	if slices.ContainsFunc(gamesByUser, domain.GameService.IsOpen) {
		return domain.NewDomainError(
			"user already has a game in progress",
			"[JoinGameUseCase] user by id "+userId+" has an open game",
			domain.ErrConflict,
			nil,
		)
	}

	game, err := uc.gameRepo.GetGameById(gameId)
	if err != nil {
		return err
	}

	if game == nil {
		return domain.NewDomainError(
			"game does not exist",
			"[JoinGameUseCase] game by id "+gameId+" not found",
			domain.ErrNotFound,
			nil,
		)
	}

	if game.Status == domain.GameFinished {
		return domain.NewDomainError(
			"cannot join this game — it has already ended.",
			"[JoinGameUseCase] attempting to join game with id "+gameId+" that has already started",
			domain.ErrConflict,
			nil,
		)
	}

	isOpen := domain.GameService.IsOpen(*game)
	if !isOpen {
		return domain.NewDomainError(
			"cannot join game, already full",
			"[JoinGameUseCase] game by id "+gameId+" already full",
			domain.ErrConflict,
			nil,
		)
	}

	game.Players = append(game.Players, user.ID)
	updateErr := uc.gameRepo.UpdateGameById(gameId, *game)

	if updateErr != nil {
		return updateErr
	}

	// TODO: Parallel call this or create batch call to game
	for _, playerId := range game.Players {
		if err := uc.eventAdapter.Publish(playerId, domain.UserGameChangedEventType, ""); err != nil {
			return err
		}
	}

	return nil
}

// Start Game
type startGameUseCase struct {
	eventAdapter domain.EventAdapter
	gameRepo     domain.GameRepo
	userRepo     domain.UserRepo
}

func NewStartGameUseCase(
	eventAdapter domain.EventAdapter,
	gameRepo domain.GameRepo,
	userRepo domain.UserRepo,
) *startGameUseCase {
	return &startGameUseCase{
		eventAdapter: eventAdapter,
		gameRepo:     gameRepo,
		userRepo:     userRepo,
	}
}

func (uc *startGameUseCase) Execute(userId string) error {
	log.Println("[StartGameUseCase] start")

	user, userErr := uc.userRepo.GetUserById(userId)

	if userErr != nil {
		return userErr
	}

	log.Println("[StartGameUseCase] after querying user from user repo", user)

	if user == nil {
		return domain.NewDomainError(
			"user does not exist",
			"[StartGameUseCase] user by id "+userId+" not found",
			domain.ErrNotFound,
			nil,
		)
	}

	gamesByUser, gbuErr := uc.gameRepo.GetGamesByUserId(user.ID)

	if gbuErr != nil {
		log.Println("[StartGameUseCase] error from querying games from game repo", gbuErr.Error())
		return gbuErr
	}

	log.Println("[StartGameUseCase] after querying games from game repo")

	if slices.ContainsFunc(gamesByUser, domain.GameService.IsOpen) {
		return domain.NewDomainError(
			"user already has a game in progress",
			"[StartGameUseCase] user by id "+userId+" has an open game",
			domain.ErrConflict,
			nil,
		)
	}

	cgErr := uc.gameRepo.CreateGame(user.ID)

	if cgErr != nil {
		return cgErr
	}

	uc.eventAdapter.Broadcast(
		domain.GamesChangedEventType,
	)

	return nil
}

// Query Available Games
type queryAvailableGameUseCase struct {
	gameRepo domain.GameRepo
}

func NewQueryAvailableGameUseCase(
	gameRepo domain.GameRepo,
) *queryAvailableGameUseCase {
	return &queryAvailableGameUseCase{
		gameRepo: gameRepo,
	}
}

func (uc *queryAvailableGameUseCase) Execute() ([]domain.Game, error) {
	return uc.gameRepo.GetOpenGames()
}

// Query User Game
type queryUserGameUseCase struct {
	gameRepo domain.GameRepo
}

func NewQueryUserGameUseCase(
	gameRepo domain.GameRepo,
) *queryUserGameUseCase {
	return &queryUserGameUseCase{
		gameRepo: gameRepo,
	}
}

func (uc *queryUserGameUseCase) Execute(userId string) (*domain.Game, error) {
	games, err := uc.gameRepo.GetGamesByUserId(userId)
	if err != nil {
		return nil, err
	}

	if len(games) == 0 {
		return nil, nil
	}

	lastGame := games[len(games)-1]
	return &lastGame, nil
}

// Send Turn
type sendTurnUseCase struct {
	eventAdapter domain.EventAdapter
	gameRepo     domain.GameRepo
}

func NewSendTurnUseCase(
	eventAdapter domain.EventAdapter,
	gameRepo domain.GameRepo,
) *sendTurnUseCase {
	return &sendTurnUseCase{
		eventAdapter: eventAdapter,
		gameRepo:     gameRepo,
	}
}

func (uc *sendTurnUseCase) Execute(
	gameId string,
	userId string,
	x int,
	y int,
) error {
	game, getGameByIdErr := uc.gameRepo.GetGameById(gameId)

	if getGameByIdErr != nil {
		return getGameByIdErr
	}

	if game == nil {
		return domain.NewDomainError(
			"game not found",
			"[sendTurnUseCase.GetGameById] game not found by id "+gameId,
			domain.ErrBadRequest,
			nil,
		)
	}

	// Valid State
	if len(game.Players) < 2 || game.Status == domain.GameFinished {
		return domain.NewDomainError(
			"game is not playable",
			"[sendTurnUseCase.gameState] game with id "+gameId+" can't apply turn, as it is in invalid state",
			domain.ErrBadRequest,
			nil,
		)
	}

	// Apply turn
	turn := domain.Turn{
		X:        x,
		Y:        y,
		PlayerId: userId,
	}

	gameWithTurn, getGameByIdErr := domain.GameService.ApplyTurn(*game, turn)
	if getGameByIdErr != nil {
		return getGameByIdErr
	}
	game = gameWithTurn

	// Check checkWin condition
	checkWin := domain.GameService.CheckWinCondition(*game, domain.CheckWinConditionArgs{
		Player1UserId: game.Players[0],
		Player2UserId: game.Players[1],
	})
	if checkWin.HasWinCondition {
		game.Status = domain.GameFinished
		game.WinnerPlayerId = &checkWin.WinnerUserId
	}

	// Update state
	updatedErr := uc.gameRepo.UpdateGameById(gameId, *game)
	if updatedErr != nil {
		return updatedErr
	}

	// TODO: Parallel call this or create batch call to game
	for _, playerId := range game.Players {
		if err := uc.eventAdapter.Publish(playerId, domain.UserGameChangedEventType, ""); err != nil {
			return err
		}
	}

	return nil
}
