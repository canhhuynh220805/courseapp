import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Avatar, ProgressBar, Text, Divider, Title, Caption } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#2563eb';

const StudentProgress = ({ route }) => {
    const { courseId, courseName } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            let res = await authApis(token).get(endpoints['course-students'](courseId));
            setStudents(res.data);
        } catch (ex) {
            console.error("Lỗi tải tiến độ sinh viên:", ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, [courseId]);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Title style={styles.headerTitle}>Tiến độ học tập</Title>
            <Caption style={styles.headerSubtitle}>{courseName || "Chi tiết khóa học"}</Caption>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={PRIMARY_BLUE} size="large" />
                </View>
            ) : (
                <FlatList
                    data={students}
                    ListHeaderComponent={renderHeader}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có sinh viên đăng ký khóa học này.</Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.studentItem}>
                            <View style={styles.leftContent}>
                                {item.user.avatar ? (
                                    <Avatar.Image size={48} source={{ uri: item.user.avatar }} />
                                ) : (
                                    <Avatar.Text size={48} label={item.user.username?.[0]?.toUpperCase()}
                                        style={{ backgroundColor: '#dbeafe' }} color={PRIMARY_BLUE} />
                                )}
                                <View style={styles.info}>
                                    <Text style={styles.username}>{item.user.username}</Text>
                                    <Caption>{item.user.email || "Không có email"}</Caption>
                                </View>
                            </View>

                            <View style={styles.rightContent}>
                                <View style={styles.progressLabelContainer}>
                                    <Text style={styles.progressLabel}>Tiến độ</Text>
                                    <Text style={styles.progressValue}>{item.progress}%</Text>
                                </View>
                                <ProgressBar progress={item.progress / 100} color={PRIMARY_BLUE} style={styles.progressBar} />
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: { padding: 20, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 30 },
    studentItem: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
    leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    info: { marginLeft: 12 },
    username: { fontSize: 16, fontWeight: '600' },
    rightContent: { width: 110, marginLeft: 10 },
    progressLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { fontSize: 11, color: '#9ca3af' },
    progressValue: { fontSize: 11, fontWeight: '700', color: PRIMARY_BLUE },
    progressBar: { height: 6, borderRadius: 3 },
    divider: { marginHorizontal: 16 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9ca3af' }
});

export default StudentProgress;