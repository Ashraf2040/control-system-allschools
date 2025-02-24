'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Subject } from '@prisma/client';
import { toast } from 'react-toastify';

interface MarkHeaderConfigFormProps {
  subjects: Subject[];
}

interface Grade {
  id: string;
  name: string;
}

const availableHeaders = [
  'Participation',
  'Homework', 
  'Quiz',
  'Project',
  'Exam',
  'Reading',
  'Memorizing',
  'Oral',
  'Class Activities',
];

const MarkHeaderConfigForm: React.FC<MarkHeaderConfigFormProps> = ({ subjects }) => {
  const t = useTranslations('headers');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [maxValues, setMaxValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const handleHeaderToggle = (header: string) => {
    setHeaders((prev) =>
      prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header]
    );
    if (!maxValues[header]) {
      setMaxValues((prev) => ({ ...prev, [header]: 0 }));
    }
  };

  const handleMaxValueChange = (header: string, value: string) => {
    const numValue = Number(value) || 0;
    setMaxValues((prev) => ({ ...prev, [header]: numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedGradeId || headers.length === 0) {
      toast.error('Please select a subject, a grade, and at least one header.');
      return;
    }

    setLoading(true);
    try {
      const grade = grades.find((g) => g.id === selectedGradeId) || '';
      const response = await fetch('/api/mark-header-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          grade:selectedGradeId,
          headers,
          maxValues,
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      toast.success('Header configuration saved successfully!');
      setHeaders([]);
      setMaxValues({});
      setSelectedGradeId('');
      setSelectedSubjectId('');
    } catch (error) {
      console.error(error);
      toast.error('Error saving configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch('/api/grades');
        if (!response.ok) throw new Error('Failed to fetch grades');
        const data = await response.json();
        setGrades(data); // Expecting an array of { id: string, name: string }
      } catch (error) {
        console.error('Error fetching grades:', error);
        toast.error('Failed to load grades');
      }
    };
    fetchGrades();
  }, []);
  console.log(grades)
  console.log(selectedGradeId)
  return (
    <div className="p-6 mt-6 bg-second rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">{t('configureMarkHeaders')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-lg font-medium">{t('Subject')}</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">{t('selectSubject')}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium">{t('grade')}</label>
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">{t('selectGrade')}</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium">{t('selectHeaders')}</label>
          <div className="grid grid-cols-2 gap-2">
            {availableHeaders.map((header) => (
              <div key={header} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={headers.includes(header)}
                  onChange={() => handleHeaderToggle(header)}
                />
                <span>{t(header)}</span>
                {headers.includes(header) && (
                  <input
                    type="number"
                    min="0"
                    value={maxValues[header] || 0}
                    onChange={(e) => handleMaxValueChange(header, e.target.value)}
                    className="border rounded p-1 w-16"
                    placeholder="Max"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-main text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          {loading ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  );
};

export default MarkHeaderConfigForm;