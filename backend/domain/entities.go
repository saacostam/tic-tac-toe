package domain

type GameStatus int

const (
	GameStarted GameStatus = iota
	GameFinished
)

type Game struct {
	ID             string
	Players        []string
	Turns          []Turn
	Status         GameStatus
	WinnerPlayerId *string
}

type Turn struct {
	PlayerId string
	X        int
	Y        int
}

type User struct {
	ID   string
	Name string
}
