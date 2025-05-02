
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFullId } from '@/utils/urlShortener';

const ShortRedirect = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // This is a simple implementation. In a real app, you would
    // fetch the mapping from a database or API instead of using
    // the in-memory map which won't persist across page reloads
    const fullId = getFullId(shortId || '');
    
    if (fullId) {
      // Redirect to the receive page with the full ID
      navigate(`/receive?connect=${fullId}`);
    } else {
      // If the short ID is not found, display an error message or redirect to home
      navigate('/');
    }
  }, [shortId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-cyan-100 to-yellow-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md chaotic-shadow">
        <div className="animate-spin text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-comic font-bold text-chaos-neon1 mb-2">Redirecting...</h1>
        <p className="text-gray-600">Hold on to your bytes! We're taking you to your files.</p>
      </div>
    </div>
  );
};

export default ShortRedirect;
