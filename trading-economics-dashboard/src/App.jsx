import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { API_KEY } from './config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
);

// Main
const GDPAnalysisDashboard = () => {
  const [country, setCountry] = useState('mexico');
  const [gdpData, setGdpData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const countries = [
    { value: 'mexico', label: 'Mexico' },
    { value: 'sweden', label: 'Sweden' },
    { value: 'new zealand', label: 'New Zealand' },
    { value: 'thailand', label: 'Thailand' },
  ];
  const countryMap = countries.reduce((acc, country) => {
    acc[country.value] = country.label;
    return acc;
  }, {});
  useEffect(() => {
    const fetchGDPData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.tradingeconomics.com/historical/country/${country}/indicator/gdp?c=${API_KEY}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setGdpData(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGDPData();
  }, [country]);

  const processData = () => {
    if (!gdpData || gdpData.length === 0) return { dates: [], values: [], growthRates: [] };

    // Filter and sort data
    const filteredData = gdpData
      .filter(item => item.Country)
      .sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));

    // Extract dates and values
    const dates = filteredData.map(item => {
      const date = new Date(item.DateTime);
      return date.getFullYear();
    });
    const values = filteredData.map(item => item.Value);

    // Calculate growth rates
    const growthRates = [0];
    for (let i = 1; i < values.length; i++) {
      const growth = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
      growthRates.push(growth);
    }

    return { dates, values, growthRates };
  };

  const { dates, values, growthRates } = processData();

  const gdpChartData = {
    labels: dates,
    datasets: [
      {
        label: 'GDP (USD)',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const growthChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Yearly Growth Rate (%)',
        data: growthRates,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}${context.dataset.label.includes('GDP') ? 'B' : '%'}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'logarithmic',
        title: {
          display: true,
          text: 'GDP (USD, log scale)',
        },
      },
    },
  };

  const growthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Growth Rate (%)',
        },
      },
    },
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">GDP Growth Analysis</h1>
          <p className="text-gray-600 mt-2">
            Visualizing GDP trends and growth rates from 1960-2023 for {countryMap[country] || 'Unknown'}
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Country
              </label>
              <select
                id="country-select"
                value={country}
                onChange={handleCountryChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 bg-white border"
                disabled={loading}
              >
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Loading data...</span>
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                  Error: {error}
                </div>
              )}
            </div>
          </div>

          {gdpData.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  {countries.find(c => c.value === country)?.label} GDP Growth (1960-2023) - Logarithmic Scale
                </h2>
                <div className="h-96">
                  <Line data={gdpChartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Yearly GDP Growth Rate (%)
                </h2>
                <div className="h-96">
                  <Bar data={growthChartData} options={growthChartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>

        {gdpData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">GDP Data Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GDP (USD)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth Rate (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dates.map((date, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {values[index].toFixed(2)}B
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          growthRates[index] >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {growthRates[index].toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Data provided by Trading Economics API</p>
        </footer>
      </div>
    </div>
  );
};

export default GDPAnalysisDashboard;