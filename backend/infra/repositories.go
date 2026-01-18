package infra

import (
	"fmt"
	"log"
	"myapp/domain"
	"strconv"
	"sync"

	"github.com/google/uuid"
)

type InMemoryUserRepo struct {
	mu     sync.Mutex
	users  map[string]domain.User
	lastID int
}

func NewInMemoryUserRepo() *InMemoryUserRepo {
	return &InMemoryUserRepo{
		users:  map[string]domain.User{},
		lastID: 0,
	}
}

func (repo *InMemoryUserRepo) CreateUser(name string) (domain.User, error) {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	repo.lastID++
	user := domain.User{
		ID:   strconv.Itoa(repo.lastID),
		Name: name,
	}
	repo.users[user.ID] = user
	return user, nil
}

func (repo *InMemoryUserRepo) GetUserById(id string) (*domain.User, error) {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	log.Println("[InMemoryUserRepo.GetUserById] users", repo.users)

	user, exists := repo.users[id]
	if !exists {
		return nil, nil
	}
	return &user, nil
}

func (repo *InMemoryUserRepo) RemoveUser(id string) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	if _, exists := repo.users[id]; !exists {
		return domain.NewDomainError(
			"user not found",
			"cannot delete non-existent user with ID: "+fmt.Sprint(id),
			domain.ErrNotFound,
			nil,
		)
	}
	delete(repo.users, id)
	return nil
}

// Game Repo
type InMemoryGameRepo struct {
	mu    sync.Mutex
	games map[string]domain.Game
}

func NewInMemoryGameRepo() *InMemoryGameRepo {
	return &InMemoryGameRepo{
		games: map[string]domain.Game{},
	}
}

func (repo *InMemoryGameRepo) CreateGame(userId string) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	gameID := uuid.NewString() // generates a unique string ID

	game := domain.Game{
		ID:      gameID,
		Players: []string{userId},
		Turns:   []domain.Turn{},
		Status:  domain.GameStarted,
	}

	repo.games[game.ID] = game
	return nil
}

func (repo *InMemoryGameRepo) GetGameById(gameId string) (*domain.Game, error) {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	game, exists := repo.games[gameId]
	if !exists {
		return nil, nil
	}

	return &game, nil
}

func (repo *InMemoryGameRepo) GetGamesByUserId(userId string) ([]domain.Game, error) {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	var userGames []domain.Game

	for _, game := range repo.games {
		for _, playerId := range game.Players {
			if playerId == userId {
				userGames = append(userGames, game)
				break
			}
		}
	}

	return userGames, nil
}

func (repo *InMemoryGameRepo) GetOpenGames() ([]domain.Game, error) {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	var openGames []domain.Game
	for _, game := range repo.games {
		if len(game.Players) < 2 && game.Status == domain.GameStarted {
			openGames = append(openGames, game)
		}
	}

	return openGames, nil
}

func (repo *InMemoryGameRepo) UpdateGameById(gameId string, game domain.Game) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	_, exists := repo.games[gameId]
	if !exists {
		return domain.NewDomainError(
			"game does not exist",
			"[InMemoryGameRepo] cannot update game by id "+gameId,
			domain.ErrNotFound,
			nil,
		)
	}

	repo.games[gameId] = game
	return nil
}

func (repo *InMemoryGameRepo) RemoveGame(gameId string) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	delete(repo.games, gameId)
	return nil
}
