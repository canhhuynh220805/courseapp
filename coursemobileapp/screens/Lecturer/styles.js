import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get("window");
export const PRIMARY_COLOR = '#2563eb';
const SPACING = 16;

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: SPACING
    },

    grayContainer: {
        flex: 1,
        padding: SPACING,
        backgroundColor: '#f8fafc'
    },

    headerAction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'transparent'
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b'
    },

    subTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#475569',
        marginTop: 8
    },

    form: {
        paddingVertical: SPACING
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff'
    },

    summaryGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        paddingTop: 4
    },

    flex1: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },

    courseCard: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3
    },

    courseImg: {
        height: 180,
    },

    listItem: {
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },

    searchbar: {
        marginBottom: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        elevation: 0
    },

    studentItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1
    },

    info: {
        flex: 1,
        marginLeft: 16
    },

    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    progressBar: {
        height: 8,
        borderRadius: 4
    },

    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 16
    }
});