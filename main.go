package main

import (
	// "bytes"
	"crypto/rand"
	"encoding/binary"
	// "encoding/gob"
	"fmt"
	// "html/template"
	random "math/rand"
	"os"
	"runtime"
	// "time"

	"github.com/gin-gonic/gin"
	"github.com/igm/sockjs-go/sockjs"

	"./middleware"
)

func IsProduction() bool {
	return false
}

func init() {
	if IsProduction() {
		fmt.Println("*PRODUCTION*")
	} else {
		fmt.Println("*DEVELOPMENT*")
	}

	fmt.Printf("CPU count %v", runtime.NumCPU())
	fmt.Println("")

	runtime.GOMAXPROCS(runtime.NumCPU())

	// init random seed
	var n int64
	binary.Read(rand.Reader, binary.BigEndian, &n)
	random.Seed(n)
}

func websocketHandler(c *gin.Context) {
	sockjsHandler := sockjs.NewHandler("/api/messages", sockjs.DefaultOptions, receiveMessage)
	sockjsHandler.ServeHTTP(c.Writer, c.Request)
}

func receiveMessage(session sockjs.Session) {
	for {
		if msg, err := session.Recv(); err == nil {
			session.Send(msg)
			continue
		}
		break
	}
}

func main() {

	defaultBind := ":8082"                     //default port
	if port := os.Getenv("PORT"); port != "" { // used by gin to auto reload
		defaultBind = ":" + port
	}

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()
	r.RedirectTrailingSlash = true

	r.GET("/ws", websocketHandler)

	// Simple group: v1
	// api := r.Group("/api")

	// LIST OF API CALLS
	// api.POST("/register", handler.DoRegister)
	// api.POST("/forgetpass", handler.DoForgetPassword)
	// api.POST("/login", handler.DoLogin)
	// api.GET("/logout", handler.DoLogout)

	// serve index.html in root path. set this FIRST
	r.GET("/", func(c *gin.Context) {
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.File("template/index.html")
	})

	// serve html partials
	r.Static("/template", "./template")

	// serve static file, if not found display index.html
	r.Use(middleware.Static("public", "template/index.html"))
	// Listen and server on 0.0.0.0:8081
	fmt.Printf("PORT %v\n", defaultBind)

	r.Run(defaultBind)

}
