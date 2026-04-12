package http

import (
	"log"
	"net/http"

	"myapp/app"
	"myapp/domain"
	"myapp/infra"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func RegisterWebSocketRoutes(
	r *gin.Engine,
	addUserUC *app.AddUserUseCase,
	removeUserUC *app.RemoveUserUseCase,
	eventAdapter *infra.WebSocketEventAdapter,
) {
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

		userId, err := addUserUC.Execute(name)
		if err != nil {
			log.Println("AddUser error:", err)
			return
		}

		eventAdapter.AddConnection(userId, conn)
		eventAdapter.Publish(userId, domain.UserIdEventType, userId)

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Println("Disconnected:", userId)
				eventAdapter.RemoveConnection(userId)
				_, _ = removeUserUC.Execute(userId)
				return
			}
		}
	})
}
