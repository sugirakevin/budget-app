# GeoBudget App (Node.js Version)

A smart, location-aware budgeting application with a serverless-style backend for scraping real-time data.

## Features
-   **Real-Time Scraper**: Fetches grocery prices from Lidl CZ (simulated fallback if blocked).
-   **International Support**: Works for US, UK, EU, CZ, and more.
-   **Smart Estimates**: Calculates gas and grocery budgets based on location.

## How to Run
You need Node.js installed.

1.  Open a terminal in this folder (`budget-app`).
2.  Install dependencies (first time only):
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  Open your browser to:
    `http://localhost:3000`

## Project Structure
-   `public/`: Frontend files (HTML, JS, CSS).
-   `api/scrape.js`: The backend logic for scraping.
-   `server.js`: The local Express server.
