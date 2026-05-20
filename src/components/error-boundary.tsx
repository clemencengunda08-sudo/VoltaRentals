'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Zap } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="h-20 w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center mb-8 shadow-2xl">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">System Malfunction</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-10 italic">
            "An unexpected operational barrier has occurred. Please restart the session."
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="h-14 px-10 bg-primary font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl gap-3"
          >
            <RotateCcw size={16} /> Reboot Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
