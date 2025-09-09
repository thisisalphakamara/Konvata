"use client";

import { useEffect, useRef, useState } from "react";
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type HistoricalData = {
  date: string;
  price: number;
}[];

export default function HistoricalChart({ 
  symbol, 
  target, 
  onClose 
}: { 
  symbol: string; 
  target: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<HistoricalData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/historical?symbol=${symbol}&target=${target}&days=30`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to load historical data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching historical data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol && target) {
      fetchHistoricalData();
    }
  }, [symbol, target]);

  // Prepare chart data
  const chartData = {
    labels: data.map(item => format(new Date(item.date), 'MMM d')),
    datasets: [
      {
        label: `${symbol} Price in ${target}`,
        data: data.map(item => item.price),
        borderColor: 'rgb(99, 102, 241)', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 14 },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${symbol}: ${context.raw.toLocaleString()} ${target}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => `${value} ${target}`,
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">{symbol} Price History</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Last 30 days in {target}
          </p>
          
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="h-60 flex flex-col items-center justify-center text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <Line data={chartData} options={options} />
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {data.length > 0 && (
                  <>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Current Price</p>
                      <p className="text-lg font-semibold">
                        {data[data.length - 1].price.toLocaleString(undefined, { maximumFractionDigits: 6 })} {target}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">30d Change</p>
                      <p className={`text-lg font-semibold ${
                        data[0].price < data[data.length - 1].price 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {(
                          ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
                        ).toFixed(2)}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
