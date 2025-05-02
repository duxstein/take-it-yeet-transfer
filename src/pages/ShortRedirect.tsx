
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFullId } from '@/utils/urlShortener';
import { Zap } from 'lucide-react';

const ShortRedirect = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // This is a simple implementation. In a real app, you would
    // fetch the mapping from a database or API instead of using
    // the in-memory map which won't persist across page reloads
    const fullId = getFullId(shortId || '');
    
    if (fullId) {
      // Redirect to the receive page with the full ID - do it faster (50ms timeout instead of default)
      setTimeout(() => {
        navigate(`/receive?connect=${fullId}`);
      }, 50);
    } else {
      // If the short ID is not found, display an error message or redirect to home
      setTimeout(() => {
        navigate('/');
      }, 50);
    }
  }, [shortId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-emerald-100 to-amber-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-neon max-w-md">
        <div className="flex justify-center items-center mb-4">
          <Zap className="h-16 w-16 text-indigo-600 animate-pulse" />
        </div>
        <h1 className="text-2xl font-comic font-bold text-indigo-600 mb-2">Lightning Fast Redirect...</h1>
        <p className="text-gray-600">Hold on to your bytes! We're teleporting you at HYPER-SPEED!</p>
      </div>
    </div>
  );
};

export default ShortRedirect;
