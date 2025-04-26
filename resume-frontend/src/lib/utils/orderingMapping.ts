// src/utils/orderingMapping.ts
export const defaultOrderingMapping: Record<string, string> = {
    "Newest": "-created_at",
    "Oldest": "created_at",
    "Title (A-Z)": "title",
    "Title (Z-A)": "-title",
    "Updated (Recent First)": "-updated_at",
    "By Username (A-Z)": "user__username",
  };
  
  export const getDefaultOrderingValue = (option: string): string => {
    return defaultOrderingMapping[option] || "";
  };
  