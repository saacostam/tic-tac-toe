package http

import (
	"bytes"
	"io"
	"net/http"

	"myapp/app"

	"github.com/gin-gonic/gin"
)

type sendTurnRequest struct {
	X int `json:"x"`
	Y int `json:"y"`
}

func RegisterGameRoutes(
	r *gin.Engine,
	startGameUC *app.StartGameUseCase,
	joinGameUC *app.JoinGameUseCase,
	endGameUC *app.EndGameUseCase,
	sendTurnUC *app.SendTurnUseCase,
	queryGamesUC *app.QueryAvailableGameUseCase,
	queryUserGameUC *app.QueryUserGameUseCase,
) {
	games := r.Group("/")

	games.POST("/:userId/games", func(c *gin.Context) {
		if err := startGameUC.Execute(c.Param("userId")); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusCreated)
	})

	games.POST("/:userId/games/:gameId/join", func(c *gin.Context) {
		if err := joinGameUC.Execute(c.Param("userId"), c.Param("gameId")); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	})

	games.POST("/:userId/games/:gameId/end", func(c *gin.Context) {
		if err := endGameUC.Execute(c.Param("gameId"), c.Param("userId")); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	})

	games.POST("/:userId/games/:gameId/turn", func(c *gin.Context) {
		body, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

		var req sendTurnRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := sendTurnUC.Execute(
			c.Param("gameId"),
			c.Param("userId"),
			req.X,
			req.Y,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	})

	r.GET("/games", func(c *gin.Context) {
		games, err := queryGamesUC.Execute()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, games)
	})

	r.GET("/:userId/games", func(c *gin.Context) {
		game, err := queryUserGameUC.Execute(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, game)
	})
}
