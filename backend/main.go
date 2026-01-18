package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"time"

	"myapp/app"
	"myapp/domain"
	"myapp/infra"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	// -------------------------------------------------
	// Gin setup
	// -------------------------------------------------
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// -------------------------------------------------
	// Event Adapter (WebSocket)
	// -------------------------------------------------
	eventAdapter := infra.NewWebSocketEventAdapter()

	// -------------------------------------------------
	// Repositories and services
	// -------------------------------------------------
	userRepo := infra.NewInMemoryUserRepo()
	gameRepo := infra.NewInMemoryGameRepo()

	addUserUseCase := app.NewAddUserUseCase(eventAdapter, userRepo)
	removeUserUseCase := app.NewRemoveUserUseCase(eventAdapter, gameRepo, userRepo)

	// -------------------------------------------------
	// WebSocket endpoint
	// -------------------------------------------------
	r.GET("/ws/:name", func(c *gin.Context) {
		name := c.Param("name")

		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("WS upgrade error:", err)
			return
		}
		defer conn.Close()

		createdUserId, err := addUserUseCase.Execute(name)

		log.Println("Connected:", createdUserId)

		eventAdapter.AddConnection(createdUserId, conn)

		if err != nil {
			log.Println("AddUserUseCase error:", err)
			return
		}

		log.Println(createdUserId)

		// Notify user Id
		eventAdapter.Publish(createdUserId, domain.UserIdEventType, createdUserId)

		// Keep connection alive
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Println("Disconnected:", createdUserId)
				eventAdapter.RemoveConnection(createdUserId)
				_, err = removeUserUseCase.Execute(createdUserId)
				break
			}
		}
	})

	// -------------------------------------------------
	// User endpoints
	// -------------------------------------------------
	getUserUseCase := app.NewGetUserUseCase(userRepo)

	r.GET("/users/:userId", func(c *gin.Context) {
		userID := c.Param("userId")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
			return
		}

		user, err := getUserUseCase.Execute(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, user)
	})

	// -------------------------------------------------
	// Game endpoints
	// -------------------------------------------------
	endGameUseCase := app.NewEndGameUseCase(
		eventAdapter,
		gameRepo,
		userRepo,
	)

	r.POST("/:userId/games/:gameId/end", func(c *gin.Context) {
		if err := endGameUseCase.Execute(
			c.Param("gameId"),
			c.Param("userId"),
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	})

	joinGameUseCase := app.NewJoinGameUseCase(
		eventAdapter,
		gameRepo,
		userRepo,
	)

	r.POST("/:userId/games/:gameId/join", func(c *gin.Context) {
		if err := joinGameUseCase.Execute(
			c.Param("userId"),
			c.Param("gameId"),
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	})

	sendTurnUseCase := app.NewSendTurnUseCase(
		eventAdapter,
		gameRepo,
	)

	r.POST("/:userId/games/:gameId/turn", func(c *gin.Context) {
		userId := c.Param("userId")
		gameId := c.Param("gameId")

		body, _ := io.ReadAll(c.Request.Body)
		log.Println("HANDLER RAW BODY:", string(body))

		// restore body so binding can still try
		c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

		var req sendTurnRequest
		if err := c.ShouldBindBodyWithJSON(&req); err != nil {
			log.Printf("bind error (%T): %v\n", err, err)
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		log.Println(req.X, req.Y)

		if err := sendTurnUseCase.Execute(
			gameId,
			userId,
			req.X,
			req.Y,
		); err != nil {
			// Domain errors should ideally be mapped properly
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.Status(http.StatusOK)
	})

	startGameUseCase := app.NewStartGameUseCase(
		eventAdapter,
		gameRepo,
		userRepo,
	)

	r.POST("/:userId/games", func(c *gin.Context) {
		userID := c.Param("userId")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
			return
		}

		if err := startGameUseCase.Execute(userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusCreated)
	})

	queryAvailableGamesUseCase := app.NewQueryAvailableGameUseCase(gameRepo)

	r.GET("/games", func(c *gin.Context) {
		games, err := queryAvailableGamesUseCase.Execute()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, games)
	})

	queryUserGameUseCase := app.NewQueryUserGameUseCase(gameRepo)

	r.GET("/:userId/games", func(c *gin.Context) {
		game, err := queryUserGameUseCase.Execute(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, game)
	})

	// -------------------------------------------------
	// Start server
	// -------------------------------------------------
	log.Println("Server running on :8000")
	log.Fatal(r.Run(":8000"))
}

type sendTurnRequest struct {
	X int `json:"x"`
	Y int `json:"y"`
}
