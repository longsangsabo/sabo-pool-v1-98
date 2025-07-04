
// Legacy component - redirects to enhanced version
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to enhanced login page
    navigate('/auth/login', { replace: true });
  }, [navigate]);

  return null; // Component just redirects
};

export default LoginPage;
