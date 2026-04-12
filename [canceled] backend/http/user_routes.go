package http

import (
	"net/http"

	"myapp/app"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(
	r *gin.Engine,
	getUserUC *app.GetUserUseCase,
) {
	r.GET("/users/:userId", func(c *gin.Context) {
		userId := c.Param("userId")
		if userId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
			return
		}

		user, err := getUserUC.Execute(userId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, user)
	})
}
