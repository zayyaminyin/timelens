import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Globe, Database, Server } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Check environment variables
    results.push({
      name: 'Environment Variables',
      status: projectId && publicAnonKey ? 'success' : 'error',
      message: projectId && publicAnonKey ? 'Supabase credentials configured' : 'Missing Supabase credentials',
      details: `Project ID: ${projectId || 'MISSING'}, Anon Key: ${publicAnonKey ? 'SET' : 'MISSING'}`
    });

    // Test 2: Check Supabase URL accessibility
    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(supabaseUrl, { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      results.push({
        name: 'Supabase URL Accessibility',
        status: 'success',
        message: 'Supabase URL is accessible',
        details: supabaseUrl
      });
    } catch (error) {
      results.push({
        name: 'Supabase URL Accessibility',
        status: 'error',
        message: 'Cannot reach Supabase URL',
        details: `Error: ${error?.message}`
      });
    }

    // Test 3: Check backend health endpoint
    try {
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-14bee57a/health`;
      console.log('Testing health endpoint:', healthUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          name: 'Backend Health Check',
          status: 'success',
          message: 'Backend server is running',
          details: `Features: ${data.features?.join(', ') || 'Unknown'}`
        });
      } else {
        const errorText = await response.text();
        results.push({
          name: 'Backend Health Check',
          status: 'error',
          message: `Backend server error (${response.status})`,
          details: errorText || 'No error details'
        });
      }
    } catch (error) {
      results.push({
        name: 'Backend Health Check',
        status: 'error',
        message: 'Cannot reach backend server',
        details: `Error: ${error?.message}`
      });
    }

    // Test 4: Check Supabase Auth
    try {
      // Import the supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        results.push({
          name: 'Supabase Auth Service',
          status: 'error',
          message: 'Auth service error',
          details: error.message
        });
      } else {
        results.push({
          name: 'Supabase Auth Service',
          status: 'success',
          message: 'Auth service accessible',
          details: data.session ? 'Active session found' : 'No active session'
        });
      }
    } catch (error) {
      results.push({
        name: 'Supabase Auth Service',
        status: 'error',
        message: 'Auth service connection failed',
        details: `Error: ${error?.message}`
      });
    }

    // Test 5: Check network connectivity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://httpbin.org/get', { 
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        results.push({
          name: 'Network Connectivity',
          status: 'success',
          message: 'Internet connection working',
          details: 'External API accessible'
        });
      } else {
        results.push({
          name: 'Network Connectivity',
          status: 'warning',
          message: 'Limited connectivity detected',
          details: 'Some network requests may fail'
        });
      }
    } catch (error) {
      results.push({
        name: 'Network Connectivity',
        status: 'warning',
        message: 'Network connectivity issues',
        details: `Error: ${error?.message}`
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">OK</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">ERROR</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">WARNING</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">TESTING</Badge>;
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const hasWarnings = diagnostics.some(d => d.status === 'warning');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>TimeLens Connection Diagnostics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Check your authentication and backend connectivity
              </p>
            </div>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRunning ? 'Testing...' : 'Retest'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasErrors && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Connection Issues Detected:</strong> Your TimeLens app cannot connect to the backend. 
              This will limit functionality to offline/guest mode only.
            </AlertDescription>
          </Alert>
        )}

        {hasWarnings && !hasErrors && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Performance Warning:</strong> Some network issues detected. 
              You may experience slower loading times.
            </AlertDescription>
          </Alert>
        )}

        {!hasErrors && !hasWarnings && diagnostics.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>All Systems Operational:</strong> Your TimeLens app is fully connected and ready to use!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-card">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(diagnostic.status)}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{diagnostic.name}</h4>
                  {getStatusBadge(diagnostic.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{diagnostic.message}</p>
                {diagnostic.details && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {diagnostic.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Quick Fix Suggestions
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• If you see auth errors, check your Supabase project is active and not paused</li>
            <li>• For network errors, try refreshing the page or checking your internet connection</li>
            <li>• Backend errors may indicate your Supabase Edge Functions are not deployed</li>
            <li>• Guest mode will work offline if you can't connect to the backend</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}