import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";

interface University {
  name: string;
  country: string;
  domains: string[];
  web_pages: string[];
}

interface UniversitiesDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const UniversitiesDropdown: React.FC<UniversitiesDropdownProps> = ({
  value,
  onChange,
}) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // List of common universities as fallback
  const commonUniversities = [
    "Harvard University",
    "Stanford University",
    "Massachusetts Institute of Technology",
    "University of California, Berkeley",
    "University of Michigan",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "New York University",
    "University of Pennsylvania",
    "Cornell University",
    "University of Chicago",
    "Duke University",
    "Johns Hopkins University",
    "University of Texas at Austin",
    "University of Washington",
    "Georgia Institute of Technology",
    "University of Illinois Urbana-Champaign",
    "University of Wisconsin-Madison",
    "Purdue University",
    "University of California, Los Angeles",
    "Ohio State University",
    "University of Florida",
    "University of Minnesota"
  ];

  // Fetch universities based on search query
  const fetchUniversities = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() && !open) return;
      
      setLoading(true);
      setError("");
      
      try {
        const endpoint = searchQuery.trim() 
          ? `https://universities.hipolabs.com/search?country=United+States&name=${encodeURIComponent(searchQuery)}`
          : "https://universities.hipolabs.com/search?country=United+States";
          
        const response = await axios.get<University[]>(endpoint, {
          headers: {
            "Accept-Encoding": "identity",
          },
          timeout: 5000 // Add timeout to prevent hanging requests
        });
        
        setUniversities(response.data.slice(0, 50)); // Limit to 50 results for performance
      } catch (err: any) {
        console.error("Failed to fetch universities:", err);
        setError("Using local university list instead. " + (err.message || ""));
        
        // Filter local universities based on query
        if (searchQuery.trim()) {
          const filteredUniversities = commonUniversities
            .filter(uni => uni.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(name => ({ name, country: "United States", domains: [], web_pages: [] }));
          setUniversities(filteredUniversities);
        } else {
          setUniversities(
            commonUniversities.map(name => ({ name, country: "United States", domains: [], web_pages: [] }))
          );
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    [open]
  );

  // Effect to fetch universities on initial load or when search query changes
  useEffect(() => {
    fetchUniversities(query);
  }, [query, fetchUniversities]);

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!open) setOpen(true);
  };

  // Handle selection from dropdown
  const handleSelect = (universityName: string) => {
    onChange(universityName);
    setQuery(universityName);
    setOpen(false);
  };

  // Allow user to add custom university if not found
  const handleCustomUniversity = () => {
    if (!query.trim()) return;
    onChange(query);
    setOpen(false);
  };

  const filteredUniversities = query 
    ? universities.filter(uni => 
        uni.name.toLowerCase().includes(query.toLowerCase())
      )
    : universities;

  return (
    <div className="relative">
      <input
        type="text"
        value={query || value}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search or enter university name"
        className="w-full border rounded-md p-2 dark:bg-gray-800 dark:text-white"
      />
      
      {open && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border rounded-md shadow-lg">
          {loading && <div className="p-2 text-blue-500">Loading universities...</div>}
          
          {error && <div className="p-2 text-amber-500 text-sm">{error}</div>}
          
          {query.trim() && (
            <div
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-blue-600 dark:text-blue-400"
              onClick={handleCustomUniversity}
            >
              Add "{query}" as university
            </div>
          )}
          
          {!loading && filteredUniversities.length === 0 && (
            <div className="p-2 text-gray-500">No universities found</div>
          )}
          
          {!loading && filteredUniversities.map((uni: University) => (
            <div
              key={uni.name}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelect(uni.name)}
            >
              {uni.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversitiesDropdown;