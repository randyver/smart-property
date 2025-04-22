// Utils for formatting numbers, currency, and percentages

export const formatter = {
    // Format number with thousands separators
    formatNumber: (value: number): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
      }
      
      // For large numbers, use abbreviations (K, M, B)
      if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
      }
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      }
      if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      
      // For smaller numbers, use normal formatting
      return new Intl.NumberFormat('en-US').format(value);
    },
    
    // Format as currency (IDR by default)
    formatCurrency: (value: number, currency: string = 'IDR'): string => {
      if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
      }
      
      // For IDR, use billions and millions
      if (currency === 'IDR') {
        if (value >= 1000000000) {
          return 'Rp ' + (value / 1000000000).toFixed(1) + 'B';
        }
        if (value >= 1000000) {
          return 'Rp ' + (value / 1000000).toFixed(1) + 'M';
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
      
      if (numScore >= 80) return 'Excellent';
      if (numScore >= 60) return 'Good';
      if (numScore >= 40) return 'Moderate';
      if (numScore >= 20) return 'Poor';
      return 'Very Poor';
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