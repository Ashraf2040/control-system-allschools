// PrintButton.tsx
"use client";

import Image from 'next/image';

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button onClick={handlePrint} aria-label="Print report">
      <Image src="/print.svg" alt="Print Icon" width={30} height={30} />
    </button>
  );
}
