"use client";
import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { FiPlay, FiRefreshCw, FiInfo, FiX } from 'react-icons/fi';

interface Point {
  x: number;
  y: number;
  label: number;
}

interface Model {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const models: Model[] = [
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    description: 'A tree-like model that makes decisions based on feature thresholds. Each node represents a decision based on a feature value.',
    color: '#10b981',
    icon: '🌳'
  },
  {
    id: 'knn',
    name: 'K-Nearest Neighbors',
    description: 'Classifies points based on the majority class of their k nearest neighbors in the training data.',
    color: '#f59e0b',
    icon: '🎯'
  },
  {
    id: 'perceptron',
    name: 'Perceptron',
    description: 'A simple linear classifier that finds a hyperplane to separate two classes of data points.',
    color: '#3b82f6',
    icon: '🧠'
  },
  {
    id: 'logistic-regression',
    name: 'Logistic Regression',
    description: 'A probabilistic model that estimates the probability of a point belonging to a class using a sigmoid function.',
    color: '#8b5cf6',
    icon: '📊'
  },
  {
    id: 'kmeans',
    name: 'K-Means Clustering',
    description: 'Groups similar points together by finding cluster centers that minimize the distance to all points in each cluster.',
    color: '#ef4444',
    icon: '🎪'
  }
];

export default function MLPlayground() {
  const [selectedModel, setSelectedModel] = useState<string>('decision-tree');
  const [points, setPoints] = useState<Point[]>([]);
  const [predictions, setPredictions] = useState<Point[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateRandomPoints = (count: number = 20) => {
    const newPoints: Point[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 0.8 + 0.1; // 0.1 to 0.9
      const y = Math.random() * 0.8 + 0.1; // 0.1 to 0.9
      // Create some pattern for classification
      const label = x + y > 1 ? 1 : 0;
      newPoints.push({ x, y, label });
    }
    setPoints(newPoints);
    setPredictions([]);
  };

  const addPoint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    if (x < 0.1 || x > 0.9 || y < 0.1 || y > 0.9) return;

    const newPoint: Point = { x, y, label: -1 }; // -1 for unlabeled
    setPoints(prev => [...prev, newPoint]);
  };

  const trainModel = () => {
    if (points.filter(p => p.label !== -1).length < 2) {
      alert('Add at least 2 labeled points to train the model!');
      return;
    }

    setIsTraining(true);
    
    // Simulate training delay
    setTimeout(() => {
      const labeledPoints = points.filter(p => p.label !== -1);
      const unlabeledPoints = points.filter(p => p.label === -1);
      
      const newPredictions = unlabeledPoints.map(point => {
        let predictedLabel = 0;
        
        switch (selectedModel) {
          case 'decision-tree':
            // Simple decision tree: split on x + y > 1
            predictedLabel = point.x + point.y > 1 ? 1 : 0;
            break;
          case 'knn':
            // KNN with k=3
            const distances = labeledPoints.map(p => ({
              point: p,
              distance: Math.sqrt((point.x - p.x) ** 2 + (point.y - p.y) ** 2)
            }));
            distances.sort((a, b) => a.distance - b.distance);
            const k = 3;
            const nearest = distances.slice(0, k);
            const labelCounts = { 0: 0, 1: 0 };
            nearest.forEach(n => labelCounts[n.point.label as keyof typeof labelCounts]++);
            predictedLabel = labelCounts[1] > labelCounts[0] ? 1 : 0;
            break;
          case 'perceptron':
            // Simple perceptron: w1*x + w2*y + b > 0
            const w1 = 1, w2 = 1, b = -1;
            predictedLabel = w1 * point.x + w2 * point.y + b > 0 ? 1 : 0;
            break;
          case 'logistic-regression':
            // Simple logistic regression
            const z = 2 * point.x + 2 * point.y - 2;
            const prob = 1 / (1 + Math.exp(-z));
            predictedLabel = prob > 0.5 ? 1 : 0;
            break;
          case 'kmeans':
            // K-means clustering
            const centers = [
              { x: 0.3, y: 0.3 },
              { x: 0.7, y: 0.7 }
            ];
            const dist1 = Math.sqrt((point.x - centers[0].x) ** 2 + (point.y - centers[0].y) ** 2);
            const dist2 = Math.sqrt((point.x - centers[1].x) ** 2 + (point.y - centers[1].y) ** 2);
            predictedLabel = dist1 < dist2 ? 0 : 1;
            break;
        }
        
        return { ...point, label: predictedLabel };
      });
      
      setPredictions(newPredictions);
      setIsTraining(false);
    }, 1000);
  };

  const clearCanvas = () => {
    setPoints([]);
    setPredictions([]);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const pos = (i / 10) * canvasSize.width;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasSize.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasSize.width, pos);
      ctx.stroke();
    }

    // Draw all points
    [...points, ...predictions].forEach(point => {
      const x = point.x * canvasSize.width;
      const y = point.y * canvasSize.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      
      if (point.label === 0) {
        ctx.fillStyle = '#3b82f6';
      } else if (point.label === 1) {
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.fillStyle = '#9ca3af';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [points, predictions, canvasSize]);

  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">ML Playground</h1>
          <p className="text-gray-300 text-lg">
            Interactive Machine Learning Models from CMU 10601
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Choose a Model</h2>
              <div className="space-y-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{model.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-white">{model.name}</div>
                        <div className="text-sm text-gray-400">{model.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={generateRandomPoints}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FiRefreshCw className="inline mr-2" />
                  Generate Random Points
                </button>
                <button
                  onClick={trainModel}
                  disabled={isTraining}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FiPlay className="inline mr-2" />
                  {isTraining ? 'Training...' : 'Train Model'}
                </button>
                <button
                  onClick={clearCanvas}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FiX className="inline mr-2" />
                  Clear Canvas
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">How to Play</h2>
              <div className="text-gray-300 space-y-2 text-sm">
                <p>1. Choose a machine learning model</p>
                <p>2. Generate random points or click to add points</p>
                <p>3. Label points by clicking on them (blue = class 0, red = class 1)</p>
                <p>4. Train the model to see predictions</p>
                <p>5. Try different models to see how they work!</p>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {currentModel?.name} Playground
                </h2>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <FiInfo className="w-5 h-5" />
                </button>
              </div>

              {showInfo && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">About {currentModel?.name}</h3>
                  <p className="text-gray-300 text-sm">{currentModel?.description}</p>
                </div>
              )}

              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onClick={addPoint}
                  className="w-full h-96 bg-white rounded-lg cursor-crosshair border-2 border-gray-600"
                />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                  Click to add points
                </div>
              </div>

              <div className="mt-4 flex justify-center space-x-8 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Class 0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Class 1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span>Unlabeled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 