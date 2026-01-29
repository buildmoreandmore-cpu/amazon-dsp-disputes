# Amazon DSP Dispute Automation Tool

Automate the dispute process for Amazon Delivery Service Partners (DSPs) by processing CSV exports and generating ready-to-submit dispute spreadsheets.

## Features

- **CSV Upload**: Drag-and-drop interface for Amazon concession CSV files
- **Auto-Generated Dispute Reasons**: Intelligent rules-based system that generates dispute justifications
- **Priority Tiering**: Automatically sorts disputes by impact and likelihood of success
- **Repeat Driver Detection**: Identifies drivers with 3+ concessions for coaching
- **XLSX Export**: Download submission-ready spreadsheets for Amazon
- **Markdown Summary**: Generate shareable reports for your team

## Priority Tiers

| Tier | Description | Priority |
|------|-------------|----------|
| 1 | Impacts DSB | Highest |
| 2 | Within geo fence + has POD | High |
| 3 | Attended delivery | Medium |
| 4 | Manual review required | Low |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Usage

1. **Upload**: Drag and drop your Amazon concession CSV file
2. **Review**: Examine the processed disputes and summary statistics
3. **Download**: Get your XLSX file ready for submission

## CSV Format

The tool expects Amazon's standard concession export format with these columns:

- Delivery Associate Name
- Delivery Associate
- Impacts DSB
- Delivery Type
- Simultaneous deliveries
- Delivered over 50m from pin
- Incorrect scan - Attended
- Incorrect scan - Unattended
- No POD
- Scanned Not Delivered
- Tracking ID
- Pickup Date
- Delivery Attempt Date
- Delivery Date
- Concession date
- Service Area
- DSP

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react
- **CSV Parsing**: csv-parse
- **XLSX Generation**: SheetJS (xlsx)

## Deployment

This application is optimized for deployment on Vercel:

```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

## License

MIT
