"""
Seed script: run from backend/ directory
    python -m scripts.seed
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal, engine
from app.models import *  # noqa
from app.database import Base
from app.models.user import User, UserRole
from app.models.category import Category, CategoryType
from app.models.idea import Idea
from app.services.auth_service import hash_password

Base.metadata.create_all(bind=engine)


CATEGORIES = [
    {"name": "SaaS & Software", "type": CategoryType.startup, "description": "Cloud-based software products and platforms"},
    {"name": "E-Commerce & Retail", "type": CategoryType.startup, "description": "Online stores and retail innovation"},
    {"name": "Health & Wellness", "type": CategoryType.startup, "description": "Digital health, fitness, and wellness solutions"},
    {"name": "EdTech", "type": CategoryType.startup, "description": "Education technology and learning platforms"},
    {"name": "Sustainable Manufacturing", "type": CategoryType.manufacturing, "description": "Eco-friendly production and green materials"},
    {"name": "Consumer Electronics", "type": CategoryType.manufacturing, "description": "Smart devices and hardware products"},
    {"name": "Food & Beverage Production", "type": CategoryType.manufacturing, "description": "Artisan food manufacturing and F&B"},
    {"name": "Agri-Tech", "type": CategoryType.startup, "description": "Technology solutions for agriculture"},
]

IDEAS = [
    # SaaS & Software
    {
        "title": "AI-Powered Contract Review SaaS",
        "category_name": "SaaS & Software",
        "problem_statement": "Small businesses and freelancers sign contracts without legal review, exposing them to unfavorable clauses. Hiring lawyers for every contract is cost-prohibitive.",
        "solution": "A SaaS platform that uses LLMs to review contracts in minutes, highlighting risky clauses, suggesting alternatives, and providing plain-English summaries.",
        "target_market": "Freelancers, SMEs, and startups (500M+ globally) who sign 5-50 contracts per year without dedicated legal counsel.",
        "revenue_model": "Freemium with 3 free reviews/month; Pro plan $29/month unlimited; Enterprise $199/month with API access.",
        "feasibility_score": 8.2,
        "technical_difficulty": "medium",
        "capital_required_range": "$15,000 - $50,000",
        "tags": ["AI", "legal-tech", "SaaS", "contracts", "LLM"],
        "is_idea_of_the_day": True,
    },
    {
        "title": "No-Code Internal Tool Builder for SMEs",
        "category_name": "SaaS & Software",
        "problem_statement": "Small and medium enterprises waste thousands of hours on repetitive manual processes (data entry, approvals, reporting) but can't afford custom software development.",
        "solution": "A drag-and-drop internal tool builder that connects to existing databases and APIs, letting non-technical staff build dashboards, forms, and workflows in hours.",
        "target_market": "Operations managers at SMEs (10-200 employees) in retail, logistics, and services sectors.",
        "revenue_model": "Subscription tiers: Starter $49/month (3 apps), Business $149/month (unlimited apps), Enterprise custom pricing.",
        "feasibility_score": 7.5,
        "technical_difficulty": "high",
        "capital_required_range": "$50,000 - $150,000",
        "tags": ["no-code", "SaaS", "productivity", "SME", "workflow"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Micro-SaaS Churn Prediction Dashboard",
        "category_name": "SaaS & Software",
        "problem_statement": "SaaS companies lose 5-7% of revenue monthly to churn, often without early warning signals. Existing solutions require data science teams to implement.",
        "solution": "A plug-and-play churn prediction tool that integrates with Stripe, Intercom, and Segment in under 10 minutes, providing risk scores and recommended interventions.",
        "target_market": "Bootstrapped and early-stage SaaS founders managing 100-10,000 subscribers.",
        "revenue_model": "Flat fee $79/month up to 5,000 subscribers; $149/month up to 25,000.",
        "feasibility_score": 7.8,
        "technical_difficulty": "medium",
        "capital_required_range": "$5,000 - $20,000",
        "tags": ["SaaS", "churn", "analytics", "machine-learning", "retention"],
        "is_idea_of_the_day": False,
    },
    # E-Commerce
    {
        "title": "Hyper-Local Artisan Marketplace",
        "category_name": "E-Commerce & Retail",
        "problem_statement": "Local artisans and craftspeople struggle to compete with mass-market platforms. Buyers want unique, locally-made goods but can't easily discover them.",
        "solution": "A geo-first marketplace connecting buyers with artisans within a 50km radius, featuring same-day delivery partnerships with local courier services.",
        "target_market": "Urban consumers aged 25-45 who value sustainability and local economy; artisans and small makers in metro areas.",
        "revenue_model": "12% transaction commission; premium seller listings $15/month; featured placement ads.",
        "feasibility_score": 7.0,
        "technical_difficulty": "medium",
        "capital_required_range": "$20,000 - $60,000",
        "tags": ["marketplace", "local", "artisan", "e-commerce", "sustainability"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "B2B Wholesale Surplus Liquidation Platform",
        "category_name": "E-Commerce & Retail",
        "problem_statement": "Manufacturers and retailers sit on billions in excess inventory every year. Existing liquidation channels are opaque and slow, leaving money on the table.",
        "solution": "An auction-based B2B platform where manufacturers list surplus goods in bulk lots; verified business buyers bid in real-time with transparent pricing.",
        "target_market": "Mid-size manufacturers ($5M-$50M revenue) with seasonal or excess inventory; discount retailers and wholesalers.",
        "revenue_model": "5% buyer's premium; 3% seller fee; $299/month premium seller subscription for unlimited listings.",
        "feasibility_score": 7.3,
        "technical_difficulty": "medium",
        "capital_required_range": "$30,000 - $80,000",
        "tags": ["B2B", "liquidation", "surplus", "wholesale", "marketplace"],
        "is_idea_of_the_day": False,
    },
    # Health & Wellness
    {
        "title": "AI Mental Health Journaling Coach",
        "category_name": "Health & Wellness",
        "problem_statement": "Therapy waitlists stretch 3-6 months in many regions. Millions suffer from mild-to-moderate anxiety and depression with no accessible daily support tool.",
        "solution": "A mobile app combining guided journaling with an AI coach that analyzes entries for mood patterns, suggests CBT-based exercises, and escalates to human therapists when distress signals appear.",
        "target_market": "Adults 18-40 experiencing mild anxiety/depression who are on therapy waitlists or cannot afford regular sessions.",
        "revenue_model": "Freemium: basic journaling free; AI coaching subscription $12/month; therapy referral affiliate revenue.",
        "feasibility_score": 7.9,
        "technical_difficulty": "high",
        "capital_required_range": "$40,000 - $120,000",
        "tags": ["mental-health", "AI", "mobile-app", "wellness", "CBT"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Corporate Wellness Micro-Break Platform",
        "category_name": "Health & Wellness",
        "problem_statement": "Remote workers report 40% higher burnout rates. Companies spend on wellness benefits but see low utilization because existing apps require 20-30 minute sessions workers don't have.",
        "solution": "A browser extension that delivers 90-second guided micro-breaks (breathing exercises, desk stretches, eye relaxation) triggered by work pattern analysis.",
        "target_market": "HR managers at remote-first companies (50-500 employees); individual remote workers.",
        "revenue_model": "B2B: $4/employee/month; B2C: $5/month individual plan.",
        "feasibility_score": 8.0,
        "technical_difficulty": "low",
        "capital_required_range": "$8,000 - $25,000",
        "tags": ["wellness", "remote-work", "B2B", "browser-extension", "HR-tech"],
        "is_idea_of_the_day": False,
    },
    # EdTech
    {
        "title": "Peer-to-Peer Skill Exchange Platform",
        "category_name": "EdTech",
        "problem_statement": "People want to learn new skills but can't justify expensive courses. Many professionals have valuable skills they'd teach in exchange for learning something else.",
        "solution": "A skill-barter platform where users list skills they offer and want to learn, matched by an algorithm. Sessions conducted via built-in video with a time-banking credit system.",
        "target_market": "Lifelong learners and professionals aged 22-45 seeking affordable, peer-led skill development.",
        "revenue_model": "Freemium: 3 free exchanges/month; Premium $15/month unlimited; enterprise team accounts $99/month.",
        "feasibility_score": 6.8,
        "technical_difficulty": "medium",
        "capital_required_range": "$15,000 - $45,000",
        "tags": ["EdTech", "skill-swap", "marketplace", "learning", "peer-to-peer"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "AI Tutor for Competitive Exam Preparation",
        "category_name": "EdTech",
        "problem_statement": "Students preparing for high-stakes exams (GMAT, GRE, medical licensing) spend thousands on coaching. Personalized tutoring that adapts to individual weak areas is unaffordable for most.",
        "solution": "An adaptive AI tutor that identifies knowledge gaps through diagnostic tests, generates personalized practice questions, and explains concepts using multiple teaching styles.",
        "target_market": "Students aged 20-35 preparing for professional certification exams globally; 50M+ exam-takers annually.",
        "revenue_model": "Per-exam subscription: $49 for 3-month access; institutional licensing for universities and coaching centers.",
        "feasibility_score": 8.4,
        "technical_difficulty": "high",
        "capital_required_range": "$60,000 - $200,000",
        "tags": ["EdTech", "AI-tutor", "exam-prep", "adaptive-learning", "LLM"],
        "is_idea_of_the_day": False,
    },
    # Sustainable Manufacturing
    {
        "title": "Recycled Ocean Plastic Furniture Line",
        "category_name": "Sustainable Manufacturing",
        "problem_statement": "8 million tons of plastic enter oceans annually. Consumers want sustainable furniture but existing eco-options are expensive or aesthetically unappealing.",
        "solution": "A DTC furniture brand manufacturing outdoor and indoor furniture from certified recovered ocean plastic, combining durability with modern design at near-conventional price points.",
        "target_market": "Environmentally conscious homeowners aged 28-50, hotels, restaurants, and corporate offices with ESG commitments.",
        "revenue_model": "DTC e-commerce with 55-65% margins; B2B bulk orders for hospitality; premium licensing of the 'Ocean-Certified' label.",
        "feasibility_score": 6.5,
        "technical_difficulty": "high",
        "capital_required_range": "$150,000 - $500,000",
        "tags": ["sustainability", "manufacturing", "ocean-plastic", "furniture", "DTC"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Biodegradable Packaging Manufacturing",
        "category_name": "Sustainable Manufacturing",
        "problem_statement": "E-commerce growth has accelerated plastic packaging waste. Regulations in 60+ countries are banning single-use plastics, forcing brands to find alternatives quickly.",
        "solution": "A manufacturing facility producing compostable packaging from agricultural waste (sugarcane bagasse, cassava starch), sold to e-commerce brands and food delivery companies.",
        "target_market": "E-commerce brands (50-500 orders/day) and food delivery platforms in markets with plastic regulations.",
        "revenue_model": "B2B sales with volume pricing; subscription supply contracts with guaranteed monthly minimums.",
        "feasibility_score": 7.2,
        "technical_difficulty": "high",
        "capital_required_range": "$200,000 - $800,000",
        "tags": ["sustainability", "packaging", "biodegradable", "manufacturing", "B2B"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Solar-Powered Cold Storage Units for Farmers",
        "category_name": "Sustainable Manufacturing",
        "problem_statement": "40% of food produced in developing nations is lost post-harvest due to lack of refrigeration. Grid power is unreliable in rural areas, making conventional cold storage impractical.",
        "solution": "Manufacture compact, off-grid solar cold storage units designed for 1-5 ton capacity, with IoT temperature monitoring and pay-as-you-go financing through mobile money.",
        "target_market": "Smallholder farmers and agricultural cooperatives in India, Sub-Saharan Africa, and Southeast Asia.",
        "revenue_model": "Unit sales + PAYG financing (15-20% markup over 24 months); IoT monitoring subscription $10/month.",
        "feasibility_score": 7.6,
        "technical_difficulty": "high",
        "capital_required_range": "$300,000 - $1,000,000",
        "tags": ["solar", "cold-storage", "agriculture", "manufacturing", "impact"],
        "is_idea_of_the_day": False,
    },
    # Consumer Electronics
    {
        "title": "Smart Posture Correction Wearable",
        "category_name": "Consumer Electronics",
        "problem_statement": "80% of desk workers suffer from back and neck pain caused by poor posture. Existing posture correctors are uncomfortable and generate alert fatigue.",
        "solution": "A slim, adhesive wearable with 3-axis gyroscope that learns the user's personal posture baseline and delivers subtle haptic nudges (not alerts) to correct drift in real time.",
        "target_market": "Desk workers aged 25-50, remote workers, and gamers concerned about long-term musculoskeletal health.",
        "revenue_model": "Hardware at $89/unit; companion app subscription $5/month; B2B corporate wellness bundles.",
        "feasibility_score": 7.1,
        "technical_difficulty": "high",
        "capital_required_range": "$80,000 - $250,000",
        "tags": ["wearable", "health-tech", "hardware", "posture", "consumer-electronics"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "AI-Enhanced Indoor Air Quality Monitor",
        "category_name": "Consumer Electronics",
        "problem_statement": "Indoor air is 2-5x more polluted than outdoor air. Existing monitors display raw data that consumers don't know how to act on.",
        "solution": "A home air quality device that monitors PM2.5, VOCs, CO2, humidity, and temperature, with an AI engine that identifies pollution sources and suggests actionable fixes via mobile app.",
        "target_market": "Health-conscious homeowners with children, allergy/asthma sufferers, and smart home enthusiasts.",
        "revenue_model": "Device: $129; app premium features $4/month; filter replacement subscription $8/month.",
        "feasibility_score": 7.4,
        "technical_difficulty": "high",
        "capital_required_range": "$100,000 - $350,000",
        "tags": ["IoT", "air-quality", "consumer-electronics", "health-tech", "smart-home"],
        "is_idea_of_the_day": False,
    },
    # Food & Beverage
    {
        "title": "Functional Mushroom Beverage Line",
        "category_name": "Food & Beverage Production",
        "problem_statement": "Consumers are seeking alternatives to caffeine and alcohol that still provide social and functional benefits. The adaptogen market is growing 15% YoY but lacks great-tasting options.",
        "solution": "Manufacture a line of ready-to-drink functional beverages featuring lion's mane, reishi, and chaga mushroom extracts in sparkling formats, targeting the 'mindful drinking' trend.",
        "target_market": "Health-conscious millennials and Gen Z adults aged 22-40 interested in nootropics, adaptogens, and alcohol-free socializing.",
        "revenue_model": "DTC subscription ($39/12-pack monthly); retail distribution (grocery, wellness stores); wholesale to cafes and restaurants.",
        "feasibility_score": 7.7,
        "technical_difficulty": "medium",
        "capital_required_range": "$75,000 - $250,000",
        "tags": ["F&B", "functional-food", "mushrooms", "adaptogens", "DTC"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Upcycled Grain Snack Manufacturing",
        "category_name": "Food & Beverage Production",
        "problem_statement": "Breweries and distilleries discard millions of tons of spent grain annually. Meanwhile, demand for high-protein, sustainable snacks is surging.",
        "solution": "Partner with local craft breweries to collect spent grain and manufacture high-protein crackers, granola bars, and dog treats under a sustainability-forward brand.",
        "target_market": "Health-conscious consumers, sustainability-focused shoppers, and pet owners; natural food retailers.",
        "revenue_model": "Retail sales: $4.99-$7.99 per pack; private label for breweries; B2B bulk to offices and gyms.",
        "feasibility_score": 7.3,
        "technical_difficulty": "medium",
        "capital_required_range": "$50,000 - $150,000",
        "tags": ["upcycling", "snacks", "F&B", "sustainability", "manufacturing"],
        "is_idea_of_the_day": False,
    },
    # Agri-Tech
    {
        "title": "Drone-as-a-Service Crop Monitoring",
        "category_name": "Agri-Tech",
        "problem_statement": "Farmers lose 20-40% of crops annually to undetected pests, disease, and nutrient deficiency. Satellite imagery is too low-resolution; hiring agronomists is too expensive.",
        "solution": "A subscription service where farmers schedule drone flights over their fields; AI analyzes multispectral imagery to detect crop stress zones and prescribe targeted interventions.",
        "target_market": "Mid-to-large farms (50+ acres) growing high-value crops (fruits, vegetables, specialty crops) in North America, Europe, and India.",
        "revenue_model": "Subscription: $199/month per 100 acres; per-flight pricing $99; AI report add-on $49/report.",
        "feasibility_score": 8.1,
        "technical_difficulty": "high",
        "capital_required_range": "$100,000 - $400,000",
        "tags": ["agri-tech", "drone", "AI", "precision-agriculture", "crop-monitoring"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Vertical Farming Franchise for Urban Restaurants",
        "category_name": "Agri-Tech",
        "problem_statement": "Restaurants struggle with inconsistent produce quality and supply chain disruptions. Urban consumers demand hyper-local, pesticide-free produce year-round.",
        "solution": "Modular vertical farming units (2m x 1m footprint) installed in restaurant basements and back-of-house areas, with remote monitoring and a franchise-style growing protocol.",
        "target_market": "Independent restaurants and small chains in dense urban markets focused on 'farm-to-table' branding.",
        "revenue_model": "Unit lease $500/month; growing supplies subscription; consulting fee for initial setup and training.",
        "feasibility_score": 6.9,
        "technical_difficulty": "medium",
        "capital_required_range": "$30,000 - $100,000",
        "tags": ["agri-tech", "vertical-farming", "urban-agriculture", "restaurant-tech", "sustainability"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "AI Soil Health Diagnostic Service",
        "category_name": "Agri-Tech",
        "problem_statement": "Soil testing is infrequent and results arrive weeks later from labs. Farmers make fertilizer decisions on gut feel, leading to over-application and soil degradation.",
        "solution": "A mail-in soil testing service with 48-hour turnaround and an AI platform that produces field-specific fertilization plans, integrating with tractor GPS for variable-rate application.",
        "target_market": "Commercial grain and vegetable farmers in North America and Europe managing 100+ acres.",
        "revenue_model": "Test kit: $49 (includes lab analysis); AI prescription plan: $29/field; annual monitoring subscription: $199.",
        "feasibility_score": 8.3,
        "technical_difficulty": "medium",
        "capital_required_range": "$40,000 - $120,000",
        "tags": ["agri-tech", "soil-health", "AI", "precision-agriculture", "sustainability"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Aquaponics Starter Kit for Home Growers",
        "category_name": "Agri-Tech",
        "problem_statement": "Interest in home food production surged post-pandemic but most people lack the space and expertise for traditional gardening. Aquaponics grows fish and vegetables together but is seen as complex.",
        "solution": "A plug-and-play 100L aquaponics kit with pre-seeded media, starter fish, a companion app with step-by-step guidance, and a community forum, designed for apartment balconies.",
        "target_market": "Urban apartment dwellers aged 25-45 interested in home food production, sustainability, and wellness.",
        "revenue_model": "Kit: $299; refill packs (seeds, nutrients, fish food) $25/month subscription; premium app features $4/month.",
        "feasibility_score": 6.7,
        "technical_difficulty": "medium",
        "capital_required_range": "$25,000 - $80,000",
        "tags": ["agri-tech", "aquaponics", "home-farming", "sustainability", "DTC"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Predictive Maintenance SaaS for CNC Machines",
        "category_name": "SaaS & Software",
        "problem_statement": "Unplanned CNC machine downtime costs manufacturers $22,000 per hour on average. Traditional maintenance schedules are time-based, not condition-based, leading to both over-maintenance and unexpected failures.",
        "solution": "IoT sensors retrofit onto CNC machines stream vibration, temperature, and acoustic data to an ML platform that predicts failures 72+ hours in advance and auto-schedules maintenance.",
        "target_market": "Precision machining shops and mid-size manufacturers with 5-50 CNC machines in aerospace, automotive, and medical device sectors.",
        "revenue_model": "Per-machine subscription: $199/machine/month; sensor hardware rental $49/machine/month; professional services for integration.",
        "feasibility_score": 8.5,
        "technical_difficulty": "high",
        "capital_required_range": "$80,000 - $300,000",
        "tags": ["IIoT", "predictive-maintenance", "manufacturing", "SaaS", "machine-learning"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Modular Tiny Home Manufacturing",
        "category_name": "Sustainable Manufacturing",
        "problem_statement": "Housing affordability has reached crisis levels in most urban markets. Traditional construction is slow, expensive, and wasteful. Young adults and retirees seek affordable, quality housing alternatives.",
        "solution": "Factory-produce modular tiny home units (25-50 sqm) with sustainable materials, designed for quick assembly on owned land. Sell as permanent residences, ADUs, or vacation cabins.",
        "target_market": "First-time homebuyers priced out of traditional markets, rural landowners, and Airbnb hosts seeking additional units.",
        "revenue_model": "Unit sales $35,000-$75,000; customization packages; financing partnerships with credit unions.",
        "feasibility_score": 7.0,
        "technical_difficulty": "high",
        "capital_required_range": "$250,000 - $750,000",
        "tags": ["housing", "modular", "manufacturing", "sustainability", "tiny-home"],
        "is_idea_of_the_day": False,
    },
    {
        "title": "Online STEM Bootcamp for Rural Students",
        "category_name": "EdTech",
        "problem_statement": "Rural students lack access to quality STEM education and coding bootcamps available in cities. The digital divide is widening the opportunity gap for underserved youth.",
        "solution": "A live, cohort-based online STEM bootcamp with subsidized laptops, local mentor matching, and job placement support, partnering with rural schools and government programs.",
        "target_market": "Rural students aged 14-22 with basic internet access; school districts and government rural development programs as B2B buyers.",
        "revenue_model": "Income share agreement (15% for 2 years after employment); B2B contracts with schools and NGOs; government grants.",
        "feasibility_score": 7.4,
        "technical_difficulty": "low",
        "capital_required_range": "$20,000 - $60,000",
        "tags": ["EdTech", "STEM", "rural", "online-education", "social-impact"],
        "is_idea_of_the_day": False,
    },
]


def seed():
    db = SessionLocal()
    try:
        # Seed users
        admin_exists = db.query(User).filter(User.email == "admin@ideaforge.app").first()
        if not admin_exists:
            admin = User(
                email="admin@ideaforge.app",
                hashed_password=hash_password("IdeaForge#2026Admin"),
                full_name="IdeaForge Admin",
                role=UserRole.admin,
            )
            db.add(admin)

        user_exists = db.query(User).filter(User.email == "user@ideaforge.app").first()
        if not user_exists:
            test_user = User(
                email="user@ideaforge.app",
                hashed_password=hash_password("IdeaForge#2026User"),
                full_name="Test User",
                role=UserRole.user,
            )
            db.add(test_user)

        db.commit()
        print("✓ Users seeded")

        # Seed categories
        cat_map = {}
        for cat_data in CATEGORIES:
            existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not existing:
                cat = Category(**cat_data)
                db.add(cat)
                db.flush()
                cat_map[cat.name] = cat.id
            else:
                cat_map[existing.name] = existing.id

        db.commit()
        print("✓ Categories seeded")

        # Seed ideas
        for idea_data in IDEAS:
            cat_name = idea_data.pop("category_name")
            cat_id = cat_map.get(cat_name)
            if not cat_id:
                print(f"  Warning: category '{cat_name}' not found, skipping idea '{idea_data['title']}'")
                continue

            existing = db.query(Idea).filter(Idea.title == idea_data["title"]).first()
            if not existing:
                idea = Idea(
                    category_id=cat_id,
                    created_by_admin=True,
                    **idea_data,
                )
                db.add(idea)
            else:
                idea_data["category_name"] = cat_name  # restore for idempotency

        db.commit()
        print(f"✓ Ideas seeded")
        print("\nSeed complete. Credentials:")
        print("  Admin:     admin@ideaforge.app / IdeaForge#2026Admin")
        print("  Test user: user@ideaforge.app  / IdeaForge#2026User")

    except Exception as e:
        db.rollback()
        print(f"✗ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
