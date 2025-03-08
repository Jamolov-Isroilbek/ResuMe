export const parseDateToMonthYear = (isoDate: string | null) => {
    if (!isoDate) return { month: '', year: '' };
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return {
      month: months[date.getMonth()],
      year: date.getFullYear().toString()
    };
  } catch (error) {
    console.error('Invalid date:', isoDate);
    return { month: '', year: '' };
  }
};
  
  export const monthYearToISO = (month: string, year: string): string => {
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1 || !year) return '';
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
  };
  
  export const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  export const years = Array.from(
    { length: 50 },
    (_, i) => `${new Date().getFullYear() - i}`
  );