# Amazon DSP Auto Dispute — Browser Automation Workflow

## Navigation Path

### Step 1: Performance Summary
- URL: `https://logistics.amazon.com` → Performance → Performance Summary
- Select station from dropdown (e.g., "DAT9")
- Select week (e.g., "Week 7, Feb 8-Feb 14")
- Navigate to previous week using `<` arrow

### Step 2: Quality Dashboard
- Click "Quality" section (or go via Performance → Quality Dashboard)
- Shows all metrics. **3 clickable links lead to the 3 dispute categories:**

| Dashboard Link | Value | Dispute Category | Engine |
|---|---|---|---|
| **Delivery Completion Rate** | 99.48% | DCR/RTS | `rts-engine.ts` |
| **Delivery Success Behaviors** | 228 | DSB/Concessions | `concession-engine.ts` |
| **Customer Delivery Feedback - Negative** | 130 | CDF/Feedback | `feedback-engine.ts` |

- Other metrics (CDF DPMO, POD Acceptance Rate, Pickup Success, etc.) are informational only
- **"Dispute data" button** in top right corner

### Step 3: Click Into Metric (e.g., CDF Negative = 130)
- Opens a **table view** with columns:
  - Delivery Associate (name + transporter ID, clickable)
  - DA Mishandled Package (dot = yes, `--` = no)
  - DA was Unprofessional
  - DA did not follow my delivery instructions
  - Delivered to Wrong Address
  - Never Received Delivery
  - Received Wrong Item
  - Feedback Details (text description)
  - Tracking ID (e.g., TBA328430307123, clickable)
  - Delivery Date
- **Paginated**: 10+ pages, ~15 rows per page
- Has search bar and download button (top right)

### Step 4: Click Tracking ID → Delivery Contrast Map Popup
Opens a modal/popup with critical evidence data:

| Field | Example Value |
|-------|--------------|
| **Service Area / DSP** | DAT9 / TRVL |
| **Delivery Associate** | Michael Chaney jr |
| **Transporter ID** | AJBQW2MI4V11 |
| **Delivery Date** | 2026-02-08 10:57:14.914 |
| **Dropoff Location** | DELIVERED_TO_DOORSTEP |
| **Delivery Details** | Address, city, zip, "Group stop", "Safe delivery location", "Front door receive" |
| **Distance between Actual and Planned** | 160.63 meters |
| **Planned Location** (highlighted blue) | 33.692718505859375°, -84.51522827148438° |
| **Actual Location** (highlighted pink) | 33.691459°, -84.514382° |
| **View more details on Cortex** | Link |
| **Photo On Delivery** | Expandable section |
| **Map** | Interactive map with planned (blue circle) vs actual (red pin) |

### Key Evidence for Disputes
- **Distance mismatch**: If actual vs planned > threshold, supports "delivered to wrong address" dispute
- **GPS coordinates**: Proves where driver actually was vs where they should have been
- **Photo On Delivery**: Visual proof of delivery location
- **Dropoff Location**: DELIVERED_TO_DOORSTEP vs other statuses
- **Feedback type columns**: Which complaint categories are checked (dots)

### Dispute Submission
- "Dispute data" button on Quality Dashboard (top right)
- Needs the evidence gathered from each tracking ID popup

## Automation Script Requirements (Browserbase + Playwright)

### Phase 1: Login (User handles)
- User navigates to logistics.amazon.com
- User logs in with credentials + MFA/OTP
- Agent detects successful login (e.g., "Hello, Travel Management Professionals LLC" visible)

### Phase 2: Navigate to Quality Dashboard
1. Click Performance nav → Quality Dashboard
2. Select correct station (DAT9 or whichever)
3. Navigate to **previous week** using week selector
4. Read all metric values and scores

### Phase 3: Scrape Each Disputable Metric
For each metric with issues (CDF Negative, DSB, DCR):
1. Click the metric value link
2. Iterate through all pages of the table
3. For each row: extract DA name, feedback type, tracking ID, date
4. Click each tracking ID to open the Delivery Contrast Map popup
5. Extract: distance, planned GPS, actual GPS, dropoff location, delivery details, photo status
6. Close popup (X button)
7. Move to next tracking ID
8. Navigate to next page when done

### Phase 4: Build & Submit Disputes
1. Use extracted evidence to determine which items are disputable
2. Click "Dispute data" button
3. Fill in dispute forms with evidence from popups
4. Submit disputes

### Performance Notes
- ~130 negative feedback items = 130 popup opens + reads
- 10 pages × 15 rows = 150 items to process
- Each popup: open, read, close = ~3-5 seconds
- Total estimate: ~10-15 minutes per week's data
