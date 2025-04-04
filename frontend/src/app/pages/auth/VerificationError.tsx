import { useSearchParams, Link } from 'react-router-dom';

const VerificationError = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'unknown_error';

  const errorMessageMap: Record<string, string> = {
    invalid_token: 'Invalid or missing token.',
    verification_failed: 'Token expired or invalid.',
    unknown_error: 'Unknown error occurred.',
  };

  const errorMessage = errorMessageMap[error] || errorMessageMap['unknown_error'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
          ❌ Verification Failed
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {errorMessage}
        </p>
        <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Register Again
        </Link>
      </div>
    </div>
  );
};

export default VerificationError;
