package middleware

import (
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func exists(name string) bool {
	_, err := os.Stat(name)
	return !os.IsNotExist(err)
}

// Static returns a middleware handler that serves static files in the given directory.
func Static(directory string, defaultPage string) gin.HandlerFunc {
	directory, err := filepath.Abs(directory)
	if err != nil {
		panic(err)
	}
	fileserver := http.FileServer(http.Dir(directory))

	return func(c *gin.Context) {

		p := path.Join(directory, c.Request.URL.Path)
		if exists(p) {
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		} else {
			c.Writer.Header().Set("Cache-Control", "no-cache")
			// if not .something request, give back default page
			if strings.Index(c.Request.URL.Path, ".") < 0 {
				c.File(defaultPage)
			} else {
				c.Abort()
			}
		}
	}
}
