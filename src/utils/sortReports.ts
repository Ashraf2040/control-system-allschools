export const sortReports = (reports) => {
    const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
    return reports.sort((a, b) => {
      const isAArabic = arabicSubjects.includes(a.subject?.name);
      const isBArabic = arabicSubjects.includes(b.subject?.name);
      return isAArabic === isBArabic ? 0 : isAArabic ? 1 : -1;
    });
  };