# Konvata - Cryptocurrency Tracker

Konvata is a modern, responsive web application built with Next.js that allows users to track cryptocurrency prices, view historical data, and perform currency conversions. The application leverages the CoinLayer API to provide real-time and historical cryptocurrency data.

## 🚀 Features

- **Real-time Cryptocurrency Prices**: View current prices for top cryptocurrencies
- **Historical Data**: Interactive charts showing price history
- **Currency Conversion**: Convert between different cryptocurrencies and fiat currencies
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js with React-ChartJS-2
- **API**: CoinLayer API
- **State Management**: React Hooks
- **Type Safety**: TypeScript

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/konvata.git
   cd konvata
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory and add your CoinLayer API key:

   ```
   COINLAYER_API_KEY=your_api_key_here
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Project Structure

```
konvata/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── components/         # Reusable components
│   ├── lib/                # Utility functions
│   └── page.tsx            # Main page component
├── public/                 # Static files
└── styles/                 # Global styles
```

## 🚀 Deployment

You can deploy this application to any platform that supports Next.js. Here's how to deploy to Vercel:

1. Push your code to a GitHub repository
2. Import your project on Vercel
3. Add your `COINLAYER_API_KEY` to the environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fvenus)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinLayer API](https://coinlayer.com/) for providing cryptocurrency data
- [Next.js](https://nextjs.org/) for the React framework
- [Chart.js](https://www.chartjs.org/) for data visualization
