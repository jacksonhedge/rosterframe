'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
    success ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">eBay API Debug Panel</h1>
      
      <Button onClick={runDebugTest} disabled={loading} className="mb-6">
        {loading ? 'Running Tests...' : 'Run Debug Test'}
      </Button>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {debugData && (
        <div className="space-y-6">
          {/* Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Configuration Status
                <StatusIcon success={debugData.diagnostics?.allCredentialsPresent} />
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* OAuth Test Results */}
          <Card className={debugData.oauthTest?.success ? 'border-green-200' : 'border-red-200'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                OAuth Authentication Test
                <StatusIcon success={debugData.oauthTest?.success} />
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* API Test Results */}
          {debugData.apiTest && (
            <Card className={debugData.apiTest?.success ? 'border-green-200' : 'border-red-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Browse API Test
                  <StatusIcon success={debugData.apiTest?.success} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Status:</strong> {debugData.apiTest?.message}</p>
                {debugData.apiTest?.endpoint && (
                  <p className="text-sm text-gray-600 mt-2">Endpoint: {debugData.apiTest.endpoint}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Diagnostics */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-yellow-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {debugData.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm">{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}