
"use client";

import { useLocale } from 'next-intl'
import Image from 'next/image'
import React from 'react'

const ReportCard = ({ report, index, direction, terms, isArabicSubject, arabicStauts }) => {
 

  const locale = useLocale();

  return (
    <div
                  key={index}
                  className={`border border-gray-300 rounded-lg p-2 px-4 shadow-lg even:bg-[#F1F0FF] odd:bg-[#FEFCE8] ${
                    index === 3 ? 'print:page-break-after' : ''
                  }`}
                  style={{ direction }}
                >
                  <div className="mb-2 flex items-center justify-around mx-auto relative">
                    <h3 className="text-lg font-semibold mb-2">
                      {terms.subject} : {isArabicSubject ? report.subject.arabicName : report.subject.name}
                    </h3>
                    <p className="text-lg mb-1 font-bold">
                      <strong>{terms.teacher} : </strong> {isArabicSubject ? report.teacher.arabicName : report.teacher.name}
                    </p>
                  </div>
                  <p className="text-xl mb-2">
                    <strong>{terms.status}: </strong>{' '}
                    <span className="font-bold underline">{isArabicSubject ? arabicStauts[report.status] : report.status || ''}</span>
                  </p>
                  <p className="text-md ">
                    <strong className="underline">{terms.recommendations}:</strong>
                    {report.recommendations?.map((rec, idx) => (
                      <li key={idx} className={`${locale === 'ar' ? 'rtl' : 'ltr'}`}>{rec}</li>
                    )) || 'No Recommendations'}{' '}
                  </p>
                  <p className="text-md my-1">
                    <strong className='underline px-4 '>{terms.comment}:</strong> {report.comment || 'No Comment Provided'}
                  </p>
                  <div className="flex items-center justify-between ">
                    <p className="text-md">
                      <strong>{terms.quiz}: </strong>
                      <span className="font-bold">{report.quizScore || 'N/A'}</span>{' '}
                    </p>
                    <p className="text-md">
                      <strong>{terms.project}: </strong> <span className="font-bold">{report.projectScore || 'N/A'}</span>
                    </p>
                    <p className="flex items-center justify-center">
                      <span>
                        <strong>{terms.signature}: </strong>
                      </span>
                      <Image src={report.teacher.signature || ''} alt="signature" width={100} height={100} className="h-12 w-32" />
                    </p>
                  </div>
                </div>
  )
}

export default ReportCard