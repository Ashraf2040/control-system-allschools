import React, { useEffect, useState } from 'react';
import Countdown from './CountDown';

interface CountdownWrapperProps {
  onCountdownEnd: () => void; // Function to trigger when the countdown ends
}

const CountdownWrapper: React.FC<CountdownWrapperProps> = ({ onCountdownEnd }) => {
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetDate = async () => {
      try {
        const response = await fetch('/api/settings'); // Your API route to fetch the target date
        if (!response.ok) throw new Error('Failed to fetch target date');
        const data = await response.json();
        if (data.targetDate) {
          setTargetDate(data.targetDate); // ISO string from the database
        } else {
          setTargetDate(null); // Handle the case where no target date is set
        }
      } catch (error) {
        console.error('Error fetching target date:', error);
        setTargetDate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTargetDate();
  }, []);

  const handleCountdownEnd = () => {
    onCountdownEnd(); // Trigger the parent callback when the countdown ends
  };

  if (loading) {
    return <div>Loading...</div>; // Loading state while fetching
  }

  if (!targetDate) {
    return <div>No target date set</div>; // Fallback if no date is provided
  }

  return <Countdown targetDate={targetDate} onCountdownEnd={handleCountdownEnd} />;
};

export default CountdownWrapper;
