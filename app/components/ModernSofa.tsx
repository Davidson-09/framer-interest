'use client'

import React from 'react';
import Image from 'next/image'; // import Image component from Next.js ap

const SofaCard = () => {
  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-md bg-white">
      <Image
        src={'/sofa.png'}
        alt="Modern green sofa"
        className="w-full rounded-xl"
        width={400}
        height={400}
      />
      <div className="px-4 py-2 flex items-center space-x-2 text-gray-500 text-sm border-t mt-2">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3C7.03 3 3 7.03 3 12c0 5.25 7.25 10.5 9 11.5 1.75-1 9-6.25 9-11.5 0-4.97-4.03-9-9-9zm0 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 9 12 9s2.5 1.12 2.5 2.5S13.38 14.5 12 14.5z" />
        </svg>
        <span>Added from Pinterest</span>
      </div>
    </div>
  );
};

export default SofaCard;
