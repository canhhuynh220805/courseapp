import { StyleSheet } from 'react-native';

export const PRIMARY_COLOR = '#2563eb';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    whiteContainer: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 15, backgroundColor: '#f8fafc', alignItems: 'center' },
    title: { fontWeight: 'bold', color: PRIMARY_COLOR, fontSize: 22 },
    searchbar: { elevation: 0, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10, backgroundColor: '#fff' },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        borderRadius: 12,
        elevation: 3
    },
    statBox: { alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    statLabel: { fontSize: 12, color: '#64748b' },
    menu: { padding: 20, marginTop: 10 },
    button: { marginBottom: 15, borderRadius: 8, paddingVertical: 4 },
    empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
    listItem: { paddingHorizontal: 10 }
});