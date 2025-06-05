import React, { useState } from 'react';
import { Leaf, BarChart3, RefreshCw, List, PanelLeft } from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-green-700 text-white transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-green-600">
          <Leaf className="h-8 w-8" />
          {sidebarOpen && <span className="ml-2 text-xl font-semibold">EcoTracker</span>}
        </div>
        
        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="mt-6">
            <li className="px-4 py-3 hover:bg-green-600 transition-colors">
              <a href="#" className="flex items-center">
                <RefreshCw className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Actions</span>}
              </a>
            </li>
            <li className="px-4 py-3 hover:bg-green-600 transition-colors">
              <a href="#" className="flex items-center">
                <BarChart3 className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Analytics</span>}
              </a>
            </li>
          </ul>
        </nav>
        
        {/* Toggle button */}
        <button 
          className="p-4 border-t border-green-600 hover:bg-green-600 transition-colors flex justify-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold">Sustainability Action Tracker</h1>
            <p className="text-sm text-gray-500">Track and analyze your sustainability efforts</p>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Server Status</h2>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <p>Apollo GraphQL server is setting up...</p>
              </div>
              <p className="text-sm text-gray-500">
                This React frontend is a placeholder. The main functionality is in the GraphQL Apollo Express Microservice.
                You can test the API using the Apollo Playground once the server is running.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <ol className="list-decimal list-inside space-y-2 mb-4">
                <li>Start the server with <code className="bg-gray-100 px-2 py-1 rounded">npm run dev:server</code></li>
                <li>Open Apollo Playground at <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:4000/graphql</code></li>
                <li>Try running queries and mutations to interact with the API</li>
              </ol>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">Example Query</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`query GetSustainabilityActions {
  sustainabilityActions {
    id
    actionType
    description
    impactScore
    performedAt
  }
}`}
              </pre>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">Example Mutation</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`mutation CreateSustainabilityAction {
  createSustainabilityAction(
    input: {
      actionType: REUSABLE_BOTTLE
      description: "Used my reusable water bottle today"
      performedAt: "${new Date().toISOString()}"
    }
  ) {
    id
    actionType
    impactScore
    performedAt
  }
}`}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;