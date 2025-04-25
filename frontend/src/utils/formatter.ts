// Utils for formatting numbers, currency, and percentages

export const formatter = {
    // Format number with thousands separators
    formatNumber: (value: number): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
      }
      
      // For large numbers, use abbreviations (K, M, B)
      if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'M';
      }
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'Jt';
      }
      if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'Rb';
      }
      
      // For smaller numbers, use normal formatting
      return new Intl.NumberFormat('en-US').format(value);
    },
    
    // Format as currency (IDR by default)
    formatCurrency: (value: number, currency: string = 'Rp'): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
      }
      
      // For IDR, use billions and millions
      if (currency === 'Rp') {
        if (value >= 1000000000) {
          return 'Rp ' + (value / 1000000000).toFixed(1) + 'M';
        }
        if (value >= 1000000) {
          return 'Rp ' + (value / 1000000).toFixed(1) + 'Jt';
        }
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
      }
      
      // For other currencies, use the Intl formatter
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: currency,
        maximumFractionDigits: 0 
      }).format(value);
    },
    
    // Format as percentage
    formatPercentage: (value: number, decimals: number = 1): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
      }
      
      return value.toFixed(decimals) + '%';
    },
    
    // Format date string
    formatDate: (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return 'Invalid date';
      }
    },
    
    // Format climate scores (specific to this application)
    formatClimateScore: (score: number | null | undefined): string => {
      if (score === null || score === undefined || isNaN(Number(score))) {
        return 'N/A';
      }
      
      const numScore = Number(score);
      
      if (numScore >= 80) return 'Sangat Baik';
      if (numScore >= 60) return 'Baik';
      if (numScore >= 40) return 'Cukup';
      if (numScore >= 20) return 'Buruk';
      return 'Sangat Buruk';
    },
    
    // Get color class for climate scores (for styling)
    getClimateScoreColor: (score: number | null | undefined): string => {
      if (score === null || score === undefined || isNaN(Number(score))) {
        return 'bg-gray-400';
      }
      
      const numScore = Number(score);
      
      if (numScore >= 80) return 'bg-green-600'; 
      if (numScore >= 60) return 'bg-green-500';
      if (numScore >= 40) return 'bg-yellow-500';
      if (numScore >= 20) return 'bg-orange-500';
      return 'bg-red-600';
    }
  };
  
  export default formatter;