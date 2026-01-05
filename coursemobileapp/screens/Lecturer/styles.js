import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get("window");
export const PRIMARY_COLOR = '#2563eb';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    grayContainer: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
    header: { padding: 20, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerAction: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
    subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#374151' },
    form: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15 },
    imageDrop: { height: 180, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: PRIMARY_COLOR, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    previewImage: { width: '100%', height: '100%', borderRadius: 10 },
    summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    flex1: { flex: 1, backgroundColor: '#fff' },
    courseCard: { marginBottom: 20, backgroundColor: '#fff' },
    courseImg: { height: 160 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: PRIMARY_COLOR },
    listItem: { paddingHorizontal: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#9ca3af', fontStyle: 'italic' },
    segment: { marginBottom: 20, backgroundColor: '#fff' },
    chartCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
    chart: { marginVertical: 8, borderRadius: 16 },
    tableCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
    searchbar: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 8 },
    studentItem: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
    info: { marginLeft: 12 },
    progressLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressBar: { height: 6, borderRadius: 3 }
});