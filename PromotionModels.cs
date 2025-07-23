using System.ComponentModel.DataAnnotations;

namespace SmartPromo.Models
{
    // Entity Model
    public class Promotion
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public string ArticleName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public decimal PromotionalPrice { get; set; }
        public float PromotionPercentage { get; set; }
        public int CurrentStock { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "pending"; // pending, approved, rejected, active, expired
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Conditions { get; set; }
        public int? MaxUsage { get; set; }
        public int CurrentUsage { get; set; } = 0;
        public decimal? RevenueImpact { get; set; }
        public bool IsAiGenerated { get; set; } = false;

        // Navigation properties
        public virtual Article? Article { get; set; }
    }

    // DTO Models
    public class PromotionDto
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public string ArticleName { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal PromotionalPrice { get; set; }
        public float PromotionPercentage { get; set; }
        public int CurrentStock { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Conditions { get; set; }
        public int? MaxUsage { get; set; }
        public int CurrentUsage { get; set; }
        public decimal? RevenueImpact { get; set; }
        public bool IsAiGenerated { get; set; }
    }

    public class PromotionCreateRequest
    {
        [Required]
        public int ArticleId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Promotional price must be greater than 0")]
        public decimal PromotionalPrice { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? Description { get; set; }
        public string? Conditions { get; set; }
        public int? MaxUsage { get; set; }

        // Validation
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (EndDate <= StartDate)
            {
                yield return new ValidationResult(
                    "End date must be after start date",
                    new[] { nameof(EndDate) });
            }

            if (StartDate < DateTime.Today)
            {
                yield return new ValidationResult(
                    "Start date cannot be in the past",
                    new[] { nameof(StartDate) });
            }
        }
    }

    public class PromotionUpdateRequest
    {
        public int Id { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Promotional price must be greater than 0")]
        public decimal? PromotionalPrice { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public string? Conditions { get; set; }
        public int? MaxUsage { get; set; }
        public string? Status { get; set; }
    }

    public class PromotionApprovalRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [RegularExpression("^(approved|rejected)$", ErrorMessage = "Status must be 'approved' or 'rejected'")]
        public string Status { get; set; } = string.Empty;

        public string? Reason { get; set; }
    }

    public class PromotionListResponse
    {
        public List<PromotionDto> Promotions { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
    }

    // AI Integration Models
    public class AIPromotionGenerationRequest
    {
        public int? CategoryId { get; set; }
        public int? MinStock { get; set; } = 10;
        public int? MaxPromotions { get; set; } = 20;
        public string? PredictionMethod { get; set; } = "ai"; // ai, classic
    }

    // Supporting Models
    public class Article
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
    }

    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
