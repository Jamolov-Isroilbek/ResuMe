import { useLocation } from 'react-router-dom';

const EmailVerification = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Verify Your Email</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We sent a verification link to <strong>{email}</strong>.
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Please check your inbox and click the link to verify your account.
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
