import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';

interface CountdownProps {
  targetDate: string; // ISO 8601 string format, like '2024-12-31T23:59:59Z'
  onCountdownEnd: () => void; // Callback when the countdown ends
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onCountdownEnd }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const target = new Date(targetDate).getTime();
    const current = new Date().getTime();
    return target - current;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const current = new Date().getTime();
      const remainingTime = target - current;

      console.log('Remaining Time:', remainingTime); // Debugging output

      setTimeLeft(remainingTime);

      // If the countdown is over, notify the parent and clear the interval
      if (remainingTime <= 0) {
        clearInterval(interval);
        onCountdownEnd();
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [targetDate, onCountdownEnd]);
const locale =useLocale();
  const formatTime = (time: number) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = formatTime(timeLeft);

  console.log(`Formatted Time - Days: ${days}, Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`); // Debugging formatted time

  return (
    <div className="text-md md:text-2xl md:font-semibold gap-2 text-red-500 flex items-center">
      <h1 className="md:text-xl font-bold text-main">{`${locale === 'en' ? 'Time Left' : 'ينتهي إدخال الدرجات في :'}`}</h1>
      <div>
        {days < 10 ? `0${days}` : days}:
        {hours < 10 ? `0${hours}` : hours}:
        {minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </div>
    </div>
  );
};

export default Countdown;
