from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for Angular frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample data for demonstration
SAMPLE_ARTICLES = [
    {"id": 101, "name": "iPhone 15 Pro", "price": 1199.99, "stock": 35, "category": "Electronics"},
    {"id": 102, "name": "Samsung Galaxy S24", "price": 999.99, "stock": 42, "category": "Electronics"},
    {"id": 103, "name": "MacBook Pro 14\"", "price": 1999.99, "stock": 23, "category": "Computers"},
    {"id": 104, "name": "Dell XPS 13", "price": 1299.99, "stock": 18, "category": "Computers"},
    {"id": 105, "name": "PlayStation 5", "price": 499.99, "stock": 15, "category": "Gaming"},
    {"id": 106, "name": "Xbox Series X", "price": 499.99, "stock": 20, "category": "Gaming"},
    {"id": 107, "name": "Nintendo Switch", "price": 299.99, "stock": 30, "category": "Gaming"},
    {"id": 108, "name": "AirPods Pro", "price": 249.99, "stock": 50, "category": "Electronics"},
]

def generate_ai_promotion(article):
    """Generate AI-powered promotion for an article"""
    
    # Calculate optimal promotion percentage based on various factors
    base_discount = random.uniform(5, 25)  # Base discount between 5-25%
    
    # Adjust based on stock level (higher stock = higher discount)
    if article["stock"] > 40:
        stock_multiplier = 1.2
    elif article["stock"] > 20:
        stock_multiplier = 1.0
    else:
        stock_multiplier = 0.8
    
    # Adjust based on price range (higher price = lower discount)
    if article["price"] > 1500:
        price_multiplier = 0.8
    elif article["price"] > 500:
        price_multiplier = 1.0
    else:
        price_multiplier = 1.2
    
    final_discount = base_discount * stock_multiplier * price_multiplier
    final_discount = max(5, min(30, final_discount))  # Keep between 5-30%
    
    promotional_price = article["price"] * (1 - final_discount / 100)
    
    # Generate AI scores
    scores = {
        "stock_score": round(random.uniform(6.5, 9.5), 1),
        "elasticity_score": round(random.uniform(7.0, 9.0), 1),
        "sales_score": round(random.uniform(7.5, 9.5), 1),
        "promotion_score": round(random.uniform(8.0, 9.5), 1),
        "final_score": 0
    }
    scores["final_score"] = round(sum(scores.values()) / 4, 1)
    
    # Generate impact predictions
    volume_increase = random.uniform(40, 120)  # 40-120% increase
    current_volume = random.randint(10, 50)
    predicted_volume = int(current_volume * (1 + volume_increase / 100))
    
    current_revenue = current_volume * article["price"]
    predicted_revenue = predicted_volume * promotional_price
    revenue_change = ((predicted_revenue - current_revenue) / current_revenue) * 100
    
    impact = {
        "current_monthly_sales_volume": current_volume,
        "predicted_monthly_sales_volume": predicted_volume,
        "volume_change_percentage": round(volume_increase, 1),
        "current_monthly_revenue": round(current_revenue, 2),
        "predicted_monthly_revenue": round(predicted_revenue, 2),
        "revenue_change_percentage": round(revenue_change, 1),
        "profit_change_percentage": round(revenue_change * 0.7, 1)  # Assume 30% cost
    }
    
    # Determine risk level
    if scores["final_score"] >= 8.5 and revenue_change > 20:
        risk_level = "low"
    elif scores["final_score"] >= 7.0 and revenue_change > 0:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    # Generate recommendation
    if risk_level == "low":
        recommendation = f"Excellent opportunity for {article['name']}. High confidence in significant revenue growth with minimal risk."
    elif risk_level == "medium":
        recommendation = f"Good opportunity for {article['name']}. Moderate revenue increase expected with acceptable risk."
    else:
        recommendation = f"Cautious approach recommended for {article['name']}. Monitor closely due to higher risk factors."
    
    return {
        "article_id": article["id"],
        "article_name": article["name"],
        "current_price": article["price"],
        "promotional_price": round(promotional_price, 2),
        "promotion_percentage": round(final_discount, 1),
        "current_stock": article["stock"],
        "prediction_method": "ai",
        "scores": scores,
        "impact": impact,
        "recommendation": recommendation,
        "risk_level": risk_level,
        "created_at": datetime.utcnow().isoformat()
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Flask AI Service is running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    })

@app.route('/ai/generate-promotions', methods=['POST'])
def generate_promotions():
    """Generate AI-powered promotions"""
    try:
        data = request.get_json() or {}
        
        category_id = data.get('category_id')
        min_stock = data.get('min_stock', 10)
        max_promotions = data.get('max_promotions', 20)
        prediction_method = data.get('prediction_method', 'ai')
        
        logger.info(f"Generating promotions with params: {data}")
        
        # Filter articles based on criteria
        filtered_articles = SAMPLE_ARTICLES.copy()
        
        # Filter by category if specified
        if category_id:
            category_map = {1: "Electronics", 2: "Computers", 3: "Gaming"}
            target_category = category_map.get(category_id)
            if target_category:
                filtered_articles = [a for a in filtered_articles if a["category"] == target_category]
        
        # Filter by minimum stock
        filtered_articles = [a for a in filtered_articles if a["stock"] >= min_stock]
        
        # Limit the number of results
        filtered_articles = filtered_articles[:max_promotions]
        
        # Generate promotions
        promotions = []
        for article in filtered_articles:
            promotion = generate_ai_promotion(article)
            promotions.append(promotion)
        
        # Sort by final score (best promotions first)
        promotions.sort(key=lambda x: x["scores"]["final_score"], reverse=True)
        
        logger.info(f"Generated {len(promotions)} promotions")
        
        return jsonify({
            "success": True,
            "promotions": promotions,
            "count": len(promotions),
            "method": prediction_method,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating promotions: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/ai/promotion-statistics', methods=['GET'])
def get_promotion_statistics():
    """Get promotion statistics"""
    try:
        # Generate mock statistics
        stats = {
            "total_promotions": random.randint(50, 200),
            "average_promotion": round(random.uniform(10, 20), 1),
            "total_revenue_impact": round(random.uniform(10000, 50000), 2),
            "method_distribution": {
                "ai": random.randint(60, 80),
                "classic": random.randint(20, 40)
            },
            "risk_distribution": {
                "low": random.randint(40, 60),
                "medium": random.randint(25, 35),
                "high": random.randint(5, 15)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/ai/articles', methods=['GET'])
def get_articles():
    """Get available articles for promotion generation"""
    try:
        category_id = request.args.get('category_id', type=int)
        
        articles = SAMPLE_ARTICLES.copy()
        
        if category_id:
            category_map = {1: "Electronics", 2: "Computers", 3: "Gaming"}
            target_category = category_map.get(category_id)
            if target_category:
                articles = [a for a in articles if a["category"] == target_category]
        
        return jsonify({
            "articles": articles,
            "count": len(articles),
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting articles: {str(e)}")
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/ai/predict-performance', methods=['POST'])
def predict_performance():
    """Predict promotion performance"""
    try:
        data = request.get_json()
        article_id = data.get('article_id')
        promotional_price = data.get('promotional_price')
        
        if not article_id or not promotional_price:
            return jsonify({
                "error": "Missing required parameters: article_id, promotional_price"
            }), 400
        
        # Find article
        article = next((a for a in SAMPLE_ARTICLES if a["id"] == article_id), None)
        if not article:
            return jsonify({
                "error": "Article not found"
            }), 404
        
        # Generate performance prediction
        discount_percentage = ((article["price"] - promotional_price) / article["price"]) * 100
        
        performance = {
            "predicted_sales_increase": round(discount_percentage * 2.5, 1),  # Rough estimate
            "predicted_revenue_change": round(random.uniform(-10, 50), 1),
            "confidence_score": round(random.uniform(0.7, 0.95), 2),
            "recommended": discount_percentage >= 5 and discount_percentage <= 25,
            "risk_factors": [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add risk factors based on conditions
        if discount_percentage > 25:
            performance["risk_factors"].append("High discount percentage may impact profit margins")
        if article["stock"] < 15:
            performance["risk_factors"].append("Low stock levels may limit promotion effectiveness")
        if promotional_price < 100:
            performance["risk_factors"].append("Low price point may have different elasticity patterns")
        
        return jsonify(performance)
        
    except Exception as e:
        logger.error(f"Error predicting performance: {str(e)}")
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

if __name__ == '__main__':
    print("🤖 Starting Flask AI Promotion Service...")
    print("🌐 Service will be available at: http://localhost:5000")
    print("📊 Available endpoints:")
    print("   GET  /health                    - Health check")
    print("   POST /ai/generate-promotions    - Generate AI promotions")
    print("   GET  /ai/promotion-statistics   - Get promotion statistics")
    print("   GET  /ai/articles               - Get available articles")
    print("   POST /ai/predict-performance    - Predict promotion performance")
    print("\n🚀 Starting server...")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
