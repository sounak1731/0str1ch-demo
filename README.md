# 0str1ch AI-Native Work OS Demo

This is a fully working demo of the 0str1ch AI-Native Work OS, built with Next.js, Tailwind CSS, and Genkit for AI workflows.

## Features

- **Spreadsheet Canvas**: An interactive grid displaying sales data.
- **Chart Widget**: A bar chart visualizing revenue by region.
- **Toolbox**: A floating toolbar for quick actions.
- **AI Chat Panel**: An AI-powered chat for data analysis, forecasting, and cleaning.

## Getting Started

Follow these instructions to get the demo up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```

### Running the Development Server

To start the development server for both the Next.js app and the Genkit AI flows, run:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## How to Test

Once the application is running, you can test the core features:

1.  **Data Cleaning**:
    - Click the "Magic Wand" icon in the toolbox on the left.
    - This simulates a data cleaning operation by calling the `/api/clean` endpoint and refreshing the data in the spreadsheet. For the demo, it just reloads the original data.

2.  **Analyze Query**:
    - Open the AI Chat panel by clicking the chat icon on the far right.
    - Type a query about the sales data into the input field, for example: `What is the total revenue per product?`
    - Press Enter or click the send button.
    - The AI will analyze the data and provide a summary in the chat.

3.  **Sales Forecast**:
    - In the AI Chat panel, click the "Generate Forecast" button.
    - This will trigger the `/api/forecast` endpoint.
    - A new chart will appear below the main spreadsheet, showing the forecasted sales for the next 3 months.
