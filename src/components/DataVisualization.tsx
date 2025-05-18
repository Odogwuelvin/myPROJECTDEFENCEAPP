import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DataPoint, Channel, ChartData, ChartOptions } from '../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface DataVisualizationProps {
  data: DataPoint[];
  channel: Channel;
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d' | 'all';
}

const COLORS = [
  'rgba(54, 162, 235, 1)', // blue
  'rgba(255, 99, 132, 1)',  // red
  'rgba(75, 192, 192, 1)',  // green
  'rgba(255, 206, 86, 1)',  // yellow
  'rgba(153, 102, 255, 1)', // purple
  'rgba(255, 159, 64, 1)',  // orange
  'rgba(199, 199, 199, 1)', // gray
  'rgba(83, 102, 255, 1)',  // indigo
];

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, channel, timeframe }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (!data.length) return;

    // Sort data by date (oldest first)
    const sortedData = [...data].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Filter data based on timeframe
    let filteredData = sortedData;
    const now = new Date();
    
    if (timeframe !== 'all') {
      const cutoffTime = new Date();
      
      switch (timeframe) {
        case '1h':
          cutoffTime.setHours(now.getHours() - 1);
          break;
        case '6h':
          cutoffTime.setHours(now.getHours() - 6);
          break;
        case '24h':
          cutoffTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          cutoffTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffTime.setDate(now.getDate() - 30);
          break;
      }
      
      filteredData = sortedData.filter(d => new Date(d.createdAt) >= cutoffTime);
    }

    // Prepare chart data
    const labels = filteredData.map(d => format(new Date(d.createdAt), 'HH:mm:ss, MMM d'));
    
    const datasets = channel.fields.map((field, index) => {
      const color = COLORS[index % COLORS.length];
      
      return {
        label: field.name,
        data: filteredData.map(d => d.fieldValues[field.fieldNumber] || 0),
        borderColor: color,
        backgroundColor: color.replace('1)', '0.2)'),
        fill: false,
        tension: 0.4,
      };
    });

    setChartData({ labels, datasets });
  }, [data, channel.fields, timeframe]);

  const chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: channel.name,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!chartData || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border p-8">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default DataVisualization;