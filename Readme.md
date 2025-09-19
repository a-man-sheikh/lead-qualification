# Product Offer API

A Node.js API for lead scoring and qualification using rule-based scoring and AI-powered intent classification.

> **📹 Demo Video:** [Watch the API in action](https://www.loom.com/share/d5946f9317404075bbed8f660771ae4d?sid=2f2cdcfc-a6eb-487b-8221-5bcb22b20adc)

> **⏱️ Performance Note:** The scoring API (`POST /api/score`) may take some time to complete as it calls the Google Gemini AI API for each lead to determine intent classification. Processing time depends on the number of leads being scored.

## Setup Steps

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/a-man-sheikh/lead-qualification
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   HOST_NAME=localhost
   ```

4. **Start MongoDB**
   Ensure MongoDB is running on your system

5. **Run the application**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:5000`

## API Usage Examples

### 1. Create Offer
**Endpoint:** `POST /api/offer`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smart Lead Scoring Platform",
    "value_props": [
      "AI-powered lead qualification",
      "Real-time scoring",
      "Integration with 50+ tools",
      "ROI tracking"
    ],
    "ideal_use_cases": [
      "Marketing automation",
      "Sales operations",
      "B2B technology companies",
      "Lead management"
    ]
  }'
```

**Postman:**
- Method: POST
- URL: `http://localhost:5000/api/offer`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Smart Lead Scoring Platform",
  "value_props": [
    "AI-powered lead qualification",
    "Real-time scoring",
    "Integration with 50+ tools",
    "ROI tracking"
  ],
  "ideal_use_cases": [
    "Marketing automation",
    "Sales operations",
    "B2B technology companies",
    "Lead management"
  ]
}
```

### 2. Upload Leads CSV
**Endpoint:** `POST /api/leads/upload`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/leads/upload \
  -F "file=@/path/to/your/leads.csv"
```

**Postman:**
- Method: POST
- URL: `http://localhost:5000/api/leads/upload`
- Body: form-data
- Key: `file`, Type: File, Value: Select your CSV file

**Required CSV Format:**
```csv
name,role,company,industry,location,linkedin_bio
John Doe,CEO,TechCorp,Technology,San Francisco,Experienced tech leader
Jane Smith,Marketing Manager,SalesPro,Marketing,New York,Digital marketing expert
```

### 3. Score Leads
**Endpoint:** `POST /api/score`

**cURL:**
```bash
curl -X POST http://localhost:5000/api/score
```

**Postman:**
- Method: POST
- URL: `http://localhost:5000/api/score`
- No body required

### 4. Get Results
**Endpoint:** `GET /api/results`

**Query Parameters:**
- `intent`: Filter by intent (High/Medium/Low)
- `minScore`: Minimum total score
- `maxScore`: Maximum total score
- `sortBy`: Sort field (totalScore, aiScore, ruleScore)
- `sortOrder`: Sort order (asc/desc)

**cURL:**
```bash
curl "http://localhost:5000/api/results?intent=High&minScore=50&sortBy=totalScore&sortOrder=desc"
```

**Postman:**
- Method: GET
- URL: `http://localhost:5000/api/results`
- Params: Add query parameters as needed

### 5. Export Results
**Endpoint:** `GET /api/results/export`

**cURL:**
```bash
curl -O http://localhost:5000/api/results/export
```

**Postman:**
- Method: GET
- URL: `http://localhost:5000/api/results/export`
- Response will be a downloadable CSV file

## Rule Logic & AI Prompts

### Scoring System Overview
The API uses a dual-scoring approach combining rule-based scoring (max 50 points) and AI-powered intent classification (max 50 points) for a total score of 100 points.

### Rule-Based Scoring Logic

#### 1. Role Relevance Scoring (Max 20 points)
**Decision Maker Roles (+20 points):**
- CEO, CTO, CFO, COO, CMO, CPO
- VP, Vice President, Director, Head of
- Founder, President, Owner, Managing Director
- Chief, Executive, Lead, Principal

**Influencer Roles (+10 points):**
- Manager, Senior, Lead, Specialist, Analyst
- Coordinator, Supervisor, Team Lead
- Project Manager, Product Manager
- Marketing Manager, Sales Manager, Operations Manager

#### 2. Industry Match Scoring (Max 20 points)
**Exact Match (+20 points):**
- Industry directly matches ideal use cases
- Keywords: SaaS, Software, Tech, Technology, FinTech, HealthTech, E-commerce, Retail, Manufacturing, Healthcare, Finance, Banking, Insurance, Real Estate, Education, Media, Entertainment, Gaming, Automotive, Aerospace, Energy, Telecommunications, Consulting, Legal, Marketing, Advertising

**Adjacent Industries (+10 points):**
- Related industries that might benefit from the product
- Example: SaaS ↔ Software ↔ Technology

#### 3. Data Completeness Scoring (Max 10 points)
- **100% complete:** +10 points
- **80-99% complete:** +7 points  
- **60-79% complete:** +5 points
- **<60% complete:** 0 points

### AI-Powered Intent Classification

#### AI Prompt Template
The AI service uses Google Gemini to analyze lead intent with this prompt structure:

```
You are an expert sales qualification AI. Analyze the following lead and product offer to determine buying intent.

PRODUCT/OFFER DETAILS:
- Name: [offer.name]
- Value Propositions: [offer.value_props.join(", ")]
- Ideal Use Cases: [offer.ideal_use_cases.join(", ")]

LEAD INFORMATION:
- Name: [lead.name]
- Role: [lead.role]
- Company: [lead.company]
- Industry: [lead.industry]
- Location: [lead.location]
- LinkedIn Bio: [lead.linkedin_bio]

ANALYSIS CRITERIA:
1. Role Authority: Does this person have decision-making power or influence?
2. Industry Fit: Does their industry align with the product's ideal use cases?
3. Company Size: Is this likely a target company size?
4. Profile Completeness: Does their profile suggest they're actively seeking solutions?
5. Pain Point Alignment: Does their role/industry likely face problems this product solves?

RESPONSE FORMAT:
Classify the buying intent as High, Medium, or Low and provide a brief 1-2 sentence explanation.

Your response should be in this exact format:
INTENT: [High/Medium/Low]
REASONING: [1-2 sentence explanation]
```

#### AI Scoring Mapping
- **High Intent:** 50 points
- **Medium Intent:** 30 points  
- **Low Intent:** 10 points

### Total Score Calculation
```
Total Score = Rule Score (0-50) + AI Score (0-50)
Final Classification:
- 80-100: High Priority Lead
- 50-79: Medium Priority Lead  
- 0-49: Low Priority Lead
```

### Business Rules
1. **Single Offer Rule:** Only one offer can exist at a time. Creating a new offer requires updating the existing one.
2. **Lead Replacement:** Uploading new leads replaces all existing leads in the database.
3. **Scoring Persistence:** Once scored, leads retain their scores unless re-scored.
4. **Error Handling:** Failed AI classifications default to "Low" intent with 10 points.
