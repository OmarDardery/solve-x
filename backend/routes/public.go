package routes

import (
	"net/http"

	"github.com/OmarDardery/solve-the-x-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterPublicRoutes registers all public (non-authenticated) routes
func RegisterPublicRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	registerPublicOpportunityRoutes(rg.Group("/opportunities"), db)
	registerPublicTagRoutes(rg.Group("/tags"), db)
}

// ------------------ PUBLIC OPPORTUNITIES ------------------

func registerPublicOpportunityRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get all opportunities (public endpoint for browsing)
	rg.GET("", func(c *gin.Context) {
		opportunities, err := models.GetAllOpportunities(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, opportunities)
	})

	// Also handle with trailing slash for compatibility
	rg.GET("/", func(c *gin.Context) {
		opportunities, err := models.GetAllOpportunities(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, opportunities)
	})

	// Get specific opportunity by ID (public)
	rg.GET("/:id", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		opportunity, err := models.GetOpportunityByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, opportunity)
	})
}

// ------------------ PUBLIC TAGS ------------------

func registerPublicTagRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	// Get all tags (public endpoint for browsing)
	rg.GET("", func(c *gin.Context) {
		tags, err := models.GetAllTags(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tags)
	})

	// Also handle with trailing slash for compatibility
	rg.GET("/", func(c *gin.Context) {
		tags, err := models.GetAllTags(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tags)
	})

	// Get specific tag by ID (public)
	rg.GET("/:id", func(c *gin.Context) {
		id := uintFromParam(c.Param("id"))
		tag, err := models.GetTagByID(db, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tag)
	})
}
