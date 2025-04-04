import { Link } from 'react-router-dom';

const VerificationSuccess = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <h1 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">
        🎉 Email Verified Successfully!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Your account is active. Please login to continue.
      </p>
      <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Login
      </Link>
    </div>
  </div>
);

export default VerificationSuccess;
