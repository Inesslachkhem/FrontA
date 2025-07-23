using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SmartPromo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PromotionsController> _logger;

        public PromotionsController(ApplicationDbContext context, ILogger<PromotionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/promotions
        [HttpGet]
        public async Task<ActionResult<PromotionListResponse>> GetPromotions(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? search = null)
        {
            try
            {
                var query = _context.Promotions.AsQueryable();

                // Apply status filter
                if (!string.IsNullOrEmpty(status) && status != "all")
                {
                    query = query.Where(p => p.Status == status);
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => 
                        p.ArticleName.Contains(search) || 
                        p.Description.Contains(search) ||
                        p.CategoryName.Contains(search));
                }

                // Get total count
                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                // Apply pagination
                var promotions = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(p => new PromotionDto
                    {
                        Id = p.Id,
                        ArticleId = p.ArticleId,
                        ArticleName = p.ArticleName,
                        CategoryName = p.CategoryName,
                        CurrentPrice = p.CurrentPrice,
                        PromotionalPrice = p.PromotionalPrice,
                        PromotionPercentage = p.PromotionPercentage,
                        CurrentStock = p.CurrentStock,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate,
                        Status = p.Status,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt,
                        CreatedBy = p.CreatedBy,
                        Description = p.Description,
                        Conditions = p.Conditions,
                        MaxUsage = p.MaxUsage,
                        CurrentUsage = p.CurrentUsage,
                        RevenueImpact = p.RevenueImpact,
                        IsAiGenerated = p.IsAiGenerated
                    })
                    .ToListAsync();

                var response = new PromotionListResponse
                {
                    Promotions = promotions,
                    Total = totalItems,
                    Page = page,
                    Limit = limit,
                    TotalPages = totalPages
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting promotions");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // GET: api/promotions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PromotionDto>> GetPromotion(int id)
        {
            try
            {
                var promotion = await _context.Promotions
                    .Where(p => p.Id == id)
                    .Select(p => new PromotionDto
                    {
                        Id = p.Id,
                        ArticleId = p.ArticleId,
                        ArticleName = p.ArticleName,
                        CategoryName = p.CategoryName,
                        CurrentPrice = p.CurrentPrice,
                        PromotionalPrice = p.PromotionalPrice,
                        PromotionPercentage = p.PromotionPercentage,
                        CurrentStock = p.CurrentStock,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate,
                        Status = p.Status,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt,
                        CreatedBy = p.CreatedBy,
                        Description = p.Description,
                        Conditions = p.Conditions,
                        MaxUsage = p.MaxUsage,
                        CurrentUsage = p.CurrentUsage,
                        RevenueImpact = p.RevenueImpact,
                        IsAiGenerated = p.IsAiGenerated
                    })
                    .FirstOrDefaultAsync();

                if (promotion == null)
                {
                    return NotFound(new { message = "Promotion not found" });
                }

                return Ok(promotion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting promotion {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // POST: api/promotions
        [HttpPost]
        public async Task<ActionResult<PromotionDto>> CreatePromotion([FromBody] PromotionCreateRequest request)
        {
            try
            {
                // Get article details
                var article = await _context.Articles.FindAsync(request.ArticleId);
                if (article == null)
                {
                    return BadRequest(new { message = "Article not found" });
                }

                // Calculate promotion percentage
                var promotionPercentage = ((article.Price - request.PromotionalPrice) / article.Price) * 100;

                var promotion = new Promotion
                {
                    ArticleId = request.ArticleId,
                    ArticleName = article.Name,
                    CategoryName = article.Category?.Name ?? "Unknown",
                    CurrentPrice = article.Price,
                    PromotionalPrice = request.PromotionalPrice,
                    PromotionPercentage = (float)promotionPercentage,
                    CurrentStock = article.Stock,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = User.Identity?.Name ?? "System",
                    Description = request.Description,
                    Conditions = request.Conditions,
                    MaxUsage = request.MaxUsage,
                    CurrentUsage = 0,
                    IsAiGenerated = false
                };

                _context.Promotions.Add(promotion);
                await _context.SaveChangesAsync();

                var createdPromotion = new PromotionDto
                {
                    Id = promotion.Id,
                    ArticleId = promotion.ArticleId,
                    ArticleName = promotion.ArticleName,
                    CategoryName = promotion.CategoryName,
                    CurrentPrice = promotion.CurrentPrice,
                    PromotionalPrice = promotion.PromotionalPrice,
                    PromotionPercentage = promotion.PromotionPercentage,
                    CurrentStock = promotion.CurrentStock,
                    StartDate = promotion.StartDate,
                    EndDate = promotion.EndDate,
                    Status = promotion.Status,
                    CreatedAt = promotion.CreatedAt,
                    UpdatedAt = promotion.UpdatedAt,
                    CreatedBy = promotion.CreatedBy,
                    Description = promotion.Description,
                    Conditions = promotion.Conditions,
                    MaxUsage = promotion.MaxUsage,
                    CurrentUsage = promotion.CurrentUsage,
                    RevenueImpact = promotion.RevenueImpact,
                    IsAiGenerated = promotion.IsAiGenerated
                };

                return CreatedAtAction(nameof(GetPromotion), new { id = promotion.Id }, createdPromotion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating promotion");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PUT: api/promotions/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<PromotionDto>> UpdatePromotion(int id, [FromBody] PromotionUpdateRequest request)
        {
            try
            {
                var promotion = await _context.Promotions.FindAsync(id);
                if (promotion == null)
                {
                    return NotFound(new { message = "Promotion not found" });
                }

                // Update fields if provided
                if (request.PromotionalPrice.HasValue)
                {
                    promotion.PromotionalPrice = request.PromotionalPrice.Value;
                    promotion.PromotionPercentage = ((promotion.CurrentPrice - request.PromotionalPrice.Value) / promotion.CurrentPrice) * 100;
                }

                if (request.StartDate.HasValue)
                    promotion.StartDate = request.StartDate.Value;

                if (request.EndDate.HasValue)
                    promotion.EndDate = request.EndDate.Value;

                if (!string.IsNullOrEmpty(request.Description))
                    promotion.Description = request.Description;

                if (!string.IsNullOrEmpty(request.Conditions))
                    promotion.Conditions = request.Conditions;

                if (request.MaxUsage.HasValue)
                    promotion.MaxUsage = request.MaxUsage.Value;

                if (!string.IsNullOrEmpty(request.Status))
                    promotion.Status = request.Status;

                promotion.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedPromotion = new PromotionDto
                {
                    Id = promotion.Id,
                    ArticleId = promotion.ArticleId,
                    ArticleName = promotion.ArticleName,
                    CategoryName = promotion.CategoryName,
                    CurrentPrice = promotion.CurrentPrice,
                    PromotionalPrice = promotion.PromotionalPrice,
                    PromotionPercentage = promotion.PromotionPercentage,
                    CurrentStock = promotion.CurrentStock,
                    StartDate = promotion.StartDate,
                    EndDate = promotion.EndDate,
                    Status = promotion.Status,
                    CreatedAt = promotion.CreatedAt,
                    UpdatedAt = promotion.UpdatedAt,
                    CreatedBy = promotion.CreatedBy,
                    Description = promotion.Description,
                    Conditions = promotion.Conditions,
                    MaxUsage = promotion.MaxUsage,
                    CurrentUsage = promotion.CurrentUsage,
                    RevenueImpact = promotion.RevenueImpact,
                    IsAiGenerated = promotion.IsAiGenerated
                };

                return Ok(updatedPromotion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating promotion {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // DELETE: api/promotions/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePromotion(int id)
        {
            try
            {
                var promotion = await _context.Promotions.FindAsync(id);
                if (promotion == null)
                {
                    return NotFound(new { message = "Promotion not found" });
                }

                _context.Promotions.Remove(promotion);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting promotion {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PATCH: api/promotions/{id}/approve
        [HttpPatch("{id}/approve")]
        public async Task<ActionResult<PromotionDto>> ApprovePromotion(int id, [FromBody] PromotionApprovalRequest request)
        {
            try
            {
                var promotion = await _context.Promotions.FindAsync(id);
                if (promotion == null)
                {
                    return NotFound(new { message = "Promotion not found" });
                }

                promotion.Status = "approved";
                promotion.UpdatedAt = DateTime.UtcNow;

                // Log approval reason if provided
                if (!string.IsNullOrEmpty(request.Reason))
                {
                    // Add to audit log or notes
                    _logger.LogInformation("Promotion {Id} approved. Reason: {Reason}", id, request.Reason);
                }

                await _context.SaveChangesAsync();

                var approvedPromotion = new PromotionDto
                {
                    Id = promotion.Id,
                    ArticleId = promotion.ArticleId,
                    ArticleName = promotion.ArticleName,
                    CategoryName = promotion.CategoryName,
                    CurrentPrice = promotion.CurrentPrice,
                    PromotionalPrice = promotion.PromotionalPrice,
                    PromotionPercentage = promotion.PromotionPercentage,
                    CurrentStock = promotion.CurrentStock,
                    StartDate = promotion.StartDate,
                    EndDate = promotion.EndDate,
                    Status = promotion.Status,
                    CreatedAt = promotion.CreatedAt,
                    UpdatedAt = promotion.UpdatedAt,
                    CreatedBy = promotion.CreatedBy,
                    Description = promotion.Description,
                    Conditions = promotion.Conditions,
                    MaxUsage = promotion.MaxUsage,
                    CurrentUsage = promotion.CurrentUsage,
                    RevenueImpact = promotion.RevenueImpact,
                    IsAiGenerated = promotion.IsAiGenerated
                };

                return Ok(approvedPromotion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving promotion {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PATCH: api/promotions/{id}/reject
        [HttpPatch("{id}/reject")]
        public async Task<ActionResult<PromotionDto>> RejectPromotion(int id, [FromBody] PromotionApprovalRequest request)
        {
            try
            {
                var promotion = await _context.Promotions.FindAsync(id);
                if (promotion == null)
                {
                    return NotFound(new { message = "Promotion not found" });
                }

                promotion.Status = "rejected";
                promotion.UpdatedAt = DateTime.UtcNow;

                // Log rejection reason if provided
                if (!string.IsNullOrEmpty(request.Reason))
                {
                    _logger.LogInformation("Promotion {Id} rejected. Reason: {Reason}", id, request.Reason);
                }

                await _context.SaveChangesAsync();

                var rejectedPromotion = new PromotionDto
                {
                    Id = promotion.Id,
                    ArticleId = promotion.ArticleId,
                    ArticleName = promotion.ArticleName,
                    CategoryName = promotion.CategoryName,
                    CurrentPrice = promotion.CurrentPrice,
                    PromotionalPrice = promotion.PromotionalPrice,
                    PromotionPercentage = promotion.PromotionPercentage,
                    CurrentStock = promotion.CurrentStock,
                    StartDate = promotion.StartDate,
                    EndDate = promotion.EndDate,
                    Status = promotion.Status,
                    CreatedAt = promotion.CreatedAt,
                    UpdatedAt = promotion.UpdatedAt,
                    CreatedBy = promotion.CreatedBy,
                    Description = promotion.Description,
                    Conditions = promotion.Conditions,
                    MaxUsage = promotion.MaxUsage,
                    CurrentUsage = promotion.CurrentUsage,
                    RevenueImpact = promotion.RevenueImpact,
                    IsAiGenerated = promotion.IsAiGenerated
                };

                return Ok(rejectedPromotion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting promotion {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
