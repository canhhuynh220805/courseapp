import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, ProgressBar, Divider, List, FAB, ActivityIndicator, IconButton, Button as PaperButton } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#2563eb';

const ManageCourse = ({ route, navigation }) => {
    const { course } = route.params;
    const [students, setStudents] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDetail = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const [resS, resL] = await Promise.all([
                authApis(token).get(endpoints['course-students'](course.id)),
                authApis(token).get(endpoints['lessons'](course.id))
            ]);
            setStudents(resS.data);
            setLessons(resL.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    const deleteLesson = (lessonId) => {
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa bài học này không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await authApis(token).delete(endpoints['lesson-details'](lessonId));
                        Alert.alert("Thành công", "Đã xóa bài học!");
                        loadDetail();
                    } catch (ex) {
                        Alert.alert("Lỗi", "Không thể xóa bài học.");
                    }
                }, style: 'destructive'
            }
        ]);
    };

    const deleteCourse = () => {
        Alert.alert("Cảnh báo", "Xóa khóa học sẽ xóa tất cả dữ liệu liên quan. Bạn chắc chắn chứ?", [
            { text: "Hủy" },
            {
                text: "Xóa khóa học", onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await authApis(token).delete(endpoints['course-details'](course.id));
                        Alert.alert("Thành công", "Đã xóa khóa học!");
                        navigation.navigate("LecturerHome");
                    } catch (ex) {
                        Alert.alert("Lỗi", "Không thể xóa khóa học.");
                    }
                }, style: 'destructive'
            }
        ]);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadDetail();
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator color={PRIMARY_BLUE} style={{ marginTop: 20 }} /> : (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionHeader}>Thông tin khóa học</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <PaperButton
                                icon="pencil"
                                mode="outlined"
                                compact
                                textColor={PRIMARY_BLUE}
                                style={{ marginRight: 5 }}
                                onPress={() => navigation.navigate("AddCourse", { courseEdit: course })}>
                                Sửa
                            </PaperButton>
                            <PaperButton
                                icon="delete"
                                mode="text"
                                compact
                                textColor="red"
                                onPress={deleteCourse}>
                                Xóa
                            </PaperButton>
                        </View>
                    </View>
                    <Divider style={{ marginVertical: 15 }} />

                    <Text style={styles.sectionHeader}>Tiến độ sinh viên ({students.length})</Text>
                    {students.length > 0 ? students.map(s => (
                        <View key={s.id} style={styles.studentItem}>
                            <View style={styles.studentRow}>
                                <Text style={{ fontWeight: '600' }}>{s.user.username}</Text>
                                <Text style={{ color: PRIMARY_BLUE }}>{s.progress}%</Text>
                            </View>
                            <ProgressBar progress={s.progress / 100} color={PRIMARY_BLUE} style={{ height: 6, borderRadius: 3 }} />
                        </View>
                    )) : <Text style={styles.emptyText}>Chưa có sinh viên đăng ký.</Text>}

                    <Divider style={{ marginVertical: 25 }} />

                    <Text style={styles.sectionHeader}>Danh sách bài học ({lessons.length})</Text>
                    {lessons.map((l, i) => (
                        <List.Item
                            key={l.id}
                            title={`${i + 1}. ${l.subject}`}
                            description={l.video ? "Video: YouTube" : "Không có video"}
                            left={props => <List.Icon {...props} icon="book-open-outline" />}
                            right={props => (
                                <View style={{ flexDirection: 'row' }}>
                                    <IconButton {...props} icon="pencil-outline"
                                        onPress={() => navigation.navigate("AddLesson", {
                                            courseId: course.id,
                                            courseName: course.subject,
                                            lesson: l
                                        })}
                                    />
                                    <IconButton {...props} icon="delete-outline" iconColor="red"
                                        onPress={() => deleteLesson(l.id)}
                                    />
                                </View>
                            )}
                            style={styles.listItem}
                        />
                    ))}
                    {lessons.length === 0 && <Text style={styles.emptyText}>Chưa có bài học nào.</Text>}
                </ScrollView>
            )}
            <FAB
                icon="plus"
                label="Thêm bài học"
                style={styles.fab}
                color="white"
                onPress={() => navigation.navigate("AddLesson", { courseId: course.id, courseName: course.subject })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    studentItem: { marginBottom: 15 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: PRIMARY_BLUE },
    listItem: { paddingLeft: 0, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    emptyText: { color: '#6b7280', fontStyle: 'italic', marginTop: 5 }
});

export default ManageCourse;