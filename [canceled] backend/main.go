package main

import (
	"log"
	"time"

	"myapp/app"
	"myapp/http"
	"myapp/infra"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// -------------------------------------------------
	// Infrastructure
	// -------------------------------------------------
	eventAdapter := infra.NewWebSocketEventAdapter()
	userRepo := infra.NewInMemoryUserRepo()
	gameRepo := infra.NewInMemoryGameRepo()

	// -------------------------------------------------
	// Use cases
	// -------------------------------------------------
	addUserUC := app.NewAddUserUseCase(eventAdapter, userRepo)
	removeUserUC := app.NewRemoveUserUseCase(eventAdapter, gameRepo, userRepo)
	getUserUC := app.NewGetUserUseCase(userRepo)

	startGameUC := app.NewStartGameUseCase(eventAdapter, gameRepo, userRepo)
	joinGameUC := app.NewJoinGameUseCase(eventAdapter, gameRepo, userRepo)
	endGameUC := app.NewEndGameUseCase(eventAdapter, gameRepo, userRepo)
	sendTurnUC := app.NewSendTurnUseCase(eventAdapter, gameRepo)
	queryGamesUC := app.NewQueryAvailableGameUseCase(gameRepo)
	queryUserGameUC := app.NewQueryUserGameUseCase(gameRepo)

	// -------------------------------------------------
	// Routes
	// -------------------------------------------------
	http.RegisterWebSocketRoutes(r, addUserUC, removeUserUC, eventAdapter)
	http.RegisterUserRoutes(r, getUserUC)
	http.RegisterGameRoutes(
		r,
		startGameUC,
		joinGameUC,
		endGameUC,
		sendTurnUC,
		queryGamesUC,
		queryUserGameUC,
	)

	log.Println("Server running on :8000")
	log.Fatal(r.Run(":8000"))
}
