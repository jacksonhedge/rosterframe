'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function EbayDebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebugTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ebay/debug-enhanced');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDebugTest();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => 
    success ? (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">eBay API Debug Panel</h1>
      
      <Button onClick={runDebugTest} disabled={loading} className="mb-6">
        {loading ? 'Running Tests...' : 'Run Debug Test'}
      </Button>

      {error && (
        <Card className="mb-6 border-red-200">
          <p className="text-red-600">Error: {error}</p>
        </Card>
      )}

      {debugData && (
        <div className="space-y-6">
          {/* Configuration Status */}
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Configuration Status
                <StatusIcon success={debugData.diagnostics?.allCredentialsPresent} />
              </h2>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Environment:</p>
                  <p className={`${debugData.config.environment === 'production' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {debugData.config.environment}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Timestamp:</p>
                  <p className="text-sm text-gray-600">{new Date(debugData.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugData.validation?.appId?.exists && debugData.validation?.appId?.format} />
                  <span>App ID: {debugData.config.appId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugData.validation?.certId?.exists && debugData.validation?.certId?.format} />
                  <span>Cert ID: {debugData.config.certId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon success={debugData.validation?.devId?.exists && debugData.validation?.devId?.format} />
                  <span>Dev ID: {debugData.config.devId}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* OAuth Test Results */}
          <Card className={debugData.oauthTest?.success ? 'border-green-200' : 'border-red-200'}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                OAuth Authentication Test
                <StatusIcon success={debugData.oauthTest?.success} />
              </h2>
            </div>
            <div className="space-y-3">
              <p><strong>Endpoint:</strong> {debugData.oauthTest?.endpoint}</p>
              <p><strong>Status:</strong> {debugData.oauthTest?.message}</p>
              
              {debugData.oauthTest?.responseDetails?.error && (
                <div className="mt-4 p-4 bg-red-50 rounded">
                  <p className="font-semibold text-red-700">Error Details:</p>
                  <pre className="mt-2 text-sm overflow-x-auto">
                    {JSON.stringify(debugData.oauthTest.responseDetails.error, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugData.oauthTest?.responseDetails?.tokenInfo && (
                <div className="mt-4 p-4 bg-green-50 rounded">
                  <p className="font-semibold text-green-700">Token Info:</p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>Token Type: {debugData.oauthTest.responseDetails.tokenInfo.tokenType}</li>
                    <li>Expires In: {debugData.oauthTest.responseDetails.tokenInfo.expiresIn} seconds</li>
                    <li>Scopes: {debugData.oauthTest.responseDetails.tokenInfo.scopes}</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* API Test Results */}
          {debugData.apiTest && (
            <Card className={debugData.apiTest?.success ? 'border-green-200' : 'border-red-200'}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Browse API Test
                  <StatusIcon success={debugData.apiTest?.success} />
                </h2>
              </div>
              <p><strong>Status:</strong> {debugData.apiTest?.message}</p>
              {debugData.apiTest?.endpoint && (
                <p className="text-sm text-gray-600 mt-2">Endpoint: {debugData.apiTest.endpoint}</p>
              )}
            </Card>
          )}

          {/* Diagnostics */}
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Diagnostics</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusIcon success={debugData.diagnostics?.credentialPrefixMatch} />
                <span>App ID and Cert ID prefix match</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon success={debugData.diagnostics?.environmentMatch} />
                <span>Environment matches credential type</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon success={debugData.diagnostics?.formatValidation} />
                <span>All credentials have valid format</span>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Recommendations
              </h2>
            </div>
            <ul className="list-disc list-inside space-y-2">
              {debugData.recommendations?.map((rec: string, idx: number) => (
                <li key={idx} className="text-sm">{rec}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}