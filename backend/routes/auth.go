package routes

import (
	"fmt"
	"math/rand"
	"net/http"

	"github.com/OmarDardery/solve-the-x-backend/mail_service"
	"github.com/OmarDardery/solve-the-x-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SignUpInput struct {
	Code      int    `json:"code" binding:"required"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
}

// OrganizationSignUpInput has different fields for organizations
type OrganizationSignUpInput struct {
	Code     int    `json:"code" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Contact  string `json:"contact"`
	Link     string `json:"link"`
}

type SignInInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// SendCodeHandler sends a verification code to the provided email
func SendCodeHandler(db *gorm.DB, codes *map[string]int, mailman *mail_service.Mailman) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required,email"`
		}
		if err := ctx.ShouldBindJSON(&input); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		(*codes)[input.Email] = rand.Intn(900000) + 100000 // ensures value is between 100000–999999

		err := mailman.SendVerificationEmail(input.Email, fmt.Sprintf("%06d", (*codes)[input.Email]))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Verification code sent successfully",
		})
	}
}

// SignUpHandler handles user registration for students, professors, and organizations
func SignUpHandler(db *gorm.DB, codes *map[string]int, mailman *mail_service.Mailman) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := ctx.Param("role")

		var err error

		// Handle organization separately due to different input structure
		if role == "organization" {
			var input OrganizationSignUpInput
			if err := ctx.ShouldBindJSON(&input); err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			if code, exists := (*codes)[input.Email]; !exists || code != input.Code {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing verification code"})
				return
			}

			err = models.CreateOrganization(db, input.Name, input.Email, input.Password, input.Contact, input.Link)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			ctx.JSON(http.StatusOK, gin.H{
				"message": "organization registered successfully",
			})
			return
		}

		// Handle student and professor
		var input SignUpInput
		if err := ctx.ShouldBindJSON(&input); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if code, exists := (*codes)[input.Email]; !exists || code != input.Code {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing verification code"})
			return
		}

		switch role {
		case "student":
			err = models.CreateStudent(db, input.FirstName, input.LastName, input.Email, input.Password)
		case "professor":
			err = models.CreateProfessor(db, input.FirstName, input.LastName, input.Email, input.Password)
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
			return
		}

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": role + " registered successfully",
		})
	}
}

// SignInHandler authenticates a student or professor and returns a JWT.
func SignInHandler(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := ctx.Param("role")

		var input SignInInput
		if err := ctx.ShouldBindJSON(&input); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var (
			token string
			err   error
		)

		switch role {
		case "student":
			user, authErr := models.AuthenticateStudent(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			token, err = user.GetJWT()
		case "professor":
			user, authErr := models.AuthenticateProfessor(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			token, err = user.GetJWT()
		case "organization":
			user, authErr := models.AuthenticateOrganization(db, input.Email, input.Password)
			if authErr != nil {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			token, err = user.GetJWT()
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
			return
		}

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"token": token,
			"role":  role,
		})
	}
}
