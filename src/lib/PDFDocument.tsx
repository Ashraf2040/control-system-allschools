import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    border: '4px solid #CFCEFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#EDF9FD',
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  schoolLogo: {
    width: 80,
    height: 80,
    position: 'absolute',
    left: 16,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  studentDetails: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 8,
  },
  noteToParents: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  reportContainer: {
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F1F0FF', // Default background color
  },
  evenReportContainer: {
    backgroundColor: '#FEFCE8', // Background color for even-indexed reports
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teacher: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
  },
  recommendations: {
    fontSize: 12,
    marginBottom: 8,
  },
  comment: {
    fontSize: 12,
    marginBottom: 8,
  },
  scores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
  },
  signature: {
    width: 100,
    height: 50,
  },
});

const PDFDocument = ({ reports, student, noteToParents, date }) => {
  const arabicStauts = {
    Excellent: 'ممتاز',
    Good: 'جيد',
    Average: 'متوسط',
    BelowAverage: 'اقل من المتوسط',
  };

  const getTerms = (subjectName) => {
    const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
    if (arabicSubjects.includes(subjectName)) {
      return {
        subject: 'المادة',
        teacher: 'المعلم',
        status: 'مستوي الطالب',
        recommendations: 'بعض التوصيات',
        comment: 'تعليق',
        signature: 'التوقيع',
        project: 'المشروع',
        quiz: 'الاختبار الفتري',
      };
    } else {
      return {
        subject: 'Subject',
        teacher: 'Teacher',
        status: 'Status',
        recommendations: 'Recommendations',
        comment: 'Comment',
        signature: 'Signature',
        project: 'Project',
        quiz: 'Quiz',
      };
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.schoolHeader}>
            <Image src="/forqan1.png" style={styles.schoolLogo} />
            <View>
              <Text style={styles.schoolName}>AL FORQAN PRIVATE SCHOOL</Text>
              <Text style={styles.schoolName}>AMERICAN DIVISION</Text>
            </View>
          </View>

          <View style={styles.studentDetails}>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>STUDENT'S NAME:</Text> {student?.name}
            </Text>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>GRADE:</Text> {student?.class?.name}
            </Text>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>DATE:</Text> {date}
            </Text>
          </View>

          <Text style={styles.noteToParents}>
            <Text style={{ fontWeight: 'bold' }}>NOTE TO PARENTS:</Text> {noteToParents}
          </Text>
        </View>

        {/* Report Cards */}
        {reports.map((report, index) => {
          const isArabicSubject = ['Arabic', 'Social Arabic', 'Islamic'].includes(report.subject?.name);
          const direction = isArabicSubject ? 'rtl' : 'ltr';
          const terms = getTerms(report.subject?.name);
          const backgroundColor = index % 2 === 0 ? styles.reportContainer : { ...styles.reportContainer, ...styles.evenReportContainer };

          return (
            <View key={index} style={[backgroundColor, { direction }]}>
              {/* Report Header */}
              <View style={styles.reportHeader}>
                <Text style={styles.subject}>
                  {terms.subject}: {isArabicSubject ? report.subject?.arabicName : report.subject?.name}
                </Text>
                <Text style={styles.teacher}>
                  {terms.teacher}: {isArabicSubject ? report.teacher?.arabicName : report.teacher?.name}
                </Text>
              </View>

              {/* Status */}
              <Text style={styles.status}>
                <Text>{terms.status}: </Text>
                <Text style={{ textDecoration: 'underline', fontWeight: 'bold' }}>
                  {isArabicSubject ? arabicStauts[report.status] : report.status}
                </Text>
              </Text>

              {/* Recommendations */}
              <View style={styles.recommendations}>
                <Text style={{ textDecoration: 'underline' }}>{terms.recommendations}:</Text>
                {report.recommendations?.map((rec, idx) => (
                  <Text key={idx}>- {rec}</Text>
                )) || <Text>No Recommendations</Text>}
              </View>

              {/* Comment */}
              <Text style={styles.comment}>
                <Text style={{ textDecoration: 'underline' }}>{terms.comment}:</Text> {report.comment || 'No Comment Provided'}
              </Text>

              {/* Scores and Signature */}
              <View style={styles.scores}>
                <Text>
                  <Text>{terms.quiz}: </Text>
                  <Text style={{ fontWeight: 'bold' }}>{report.quizScore || 'N/A'}</Text>
                </Text>
                <Text>
                  <Text>{terms.project}: </Text>
                  <Text style={{ fontWeight: 'bold' }}>{report.projectScore || 'N/A'}</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text>{terms.signature}: </Text>
                  {report.teacher?.signature && (
                    <Image src={report.teacher.signature} style={styles.signature} />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default PDFDocument;