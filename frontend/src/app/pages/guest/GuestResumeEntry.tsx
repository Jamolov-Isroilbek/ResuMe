import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GuestResumeEntry = () => {
  const navigate = useNavigate();
  const guestData = localStorage.getItem("guest_resume");

  // If no guest resume exists, redirect immediately
  useEffect(() => {
    if (!guestData || guestData === "null" || guestData.trim() === "") {
      navigate("/guest-resume");
    }
  }, [guestData, navigate]);

  // Render options only if guestData exists
  if (!guestData || guestData === "null" || guestData.trim() === "") return null;

  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        You already have a temporary resume.
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You can only have one guest resume at a time. What would you like to do?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/guest-resume")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue Editing
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("guest_resume");
            navigate("/guest-resume");
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Start New
        </button>
      </div>
    </div>
  );
};

export default GuestResumeEntry;
