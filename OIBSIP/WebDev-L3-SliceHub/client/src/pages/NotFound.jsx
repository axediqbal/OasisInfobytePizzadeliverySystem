import React from 'react';
import { Link } from 'react-router-dom';
import { Pizza, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="glass-card rounded-modal p-8 sm:p-12 shadow-warm border border-border space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto shadow-warm animate-bounce">
            <Pizza className="w-10 h-10 transform -rotate-12" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-5xl font-extrabold text-primary-text">
              4<span className="text-accent">0</span>4
            </h1>
            <h2 className="font-display text-xl font-bold text-primary-text">
              This Slice Got Lost in the Oven
            </h2>
            <p className="text-xs sm:text-sm text-primary-muted leading-relaxed">
              The page you're looking for doesn't exist or was moved to another table.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-primary text-xs py-2.5 px-5 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link to="/builder" className="btn-secondary text-xs py-2.5 px-5 w-full sm:w-auto">
              <span>Build a Pizza</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotFound;
