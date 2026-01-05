import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { Text, Divider, List, FAB, ActivityIndicator, IconButton, Button as PaperButton } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#2563eb';

const ManageCourse = ({ route, navigation }) => {
    const { course } = route.params;
    const [studentsCount, setStudentsCount] = useState(0);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDetail = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const [resS, resL] = await Promise.all([
                authApis(token).get(endpoints['course-students'](course.id)),
                authApis(token).get(endpoints['lessons'](course.id))
            ]);
            setStudentsCount(resS.data.length);
            setLessons(resL.data);
        } catch (ex) {
            console.error("Lỗi tải dữ liệu:", ex);
            Alert.alert("Lỗi", "Không thể tải thông tin bài học.");
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
                        let errorMsg = "Không thể xóa bài học.";
                        if (ex.response && ex.response.data) {
                            errorMsg = JSON.stringify(ex.response.data);
                        }
                        Alert.alert("Lỗi", errorMsg);
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

    const renderHeader = () => (
        <View style={{ padding: 20 }}>
            <View style={styles.rowBetween}>
                <Text style={styles.sectionHeader}>Thông tin khóa học</Text>
                <View style={{ flexDirection: 'row' }}>
                    <PaperButton
                        icon="pencil"
                        mode="outlined"
                        compact
                        textColor={PRIMARY_BLUE}
                        style={{ marginRight: 5 }}
                        onPress={() => navigation.navigate("AddCourse", { courseEdit: course })}
                    >
                        Sửa
                    </PaperButton>
                    <PaperButton icon="delete" mode="text" compact textColor="red" onPress={deleteCourse}>
                        Xóa
                    </PaperButton>
                </View>
            </View>

            <Divider style={{ marginVertical: 15 }} />

            <View style={styles.rowBetween}>
                <View>
                    <Text style={styles.sectionHeader}>Tiến độ sinh viên</Text>
                    <Text style={styles.subText}>Đang có {studentsCount} học viên đăng ký</Text>
                </View>
                <PaperButton
                    mode="contained-tonal"
                    onPress={() => navigation.navigate("StudentProgress", {
                        courseId: course.id,
                        courseName: course.subject
                    })}
                >
                    Xem chi tiết
                </PaperButton>
            </View>

            <Divider style={{ marginTop: 20, marginBottom: 10 }} />
            <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Danh sách bài học ({lessons.length})</Text>
        </View>
    );

    const renderLessonItem = ({ item, index }) => (
        <List.Item
            title={`${index + 1}. ${item.subject}`}
            description={item.video ? "Video: YouTube" : "Bài học văn bản"}
            left={props => <List.Icon {...props} icon="book-open-variant" />}
            right={props => (
                <View style={{ flexDirection: 'row' }}>
                    <IconButton
                        {...props}
                        icon="pencil-outline"
                        onPress={() => navigation.navigate("AddLesson", {
                            courseId: course.id,
                            lesson: item
                        })}
                    />
                    <IconButton
                        {...props}
                        icon="delete-outline"
                        iconColor="red"
                        onPress={() => deleteLesson(item.id)}
                    />
                </View>
            )}
            style={styles.listItem}
        />
    );

    return (
        <View style={styles.container}>
            {loading && lessons.length === 0 ? (
                <ActivityIndicator color={PRIMARY_BLUE} style={{ marginTop: 40 }} size="large" />
            ) : (
                <FlatList
                    data={lessons}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderLessonItem}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { textAlign: 'center', marginTop: 20 }]}>
                            Chưa có bài học nào trong khóa học này.
                        </Text>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            <FAB
                icon="plus"
                label="Thêm bài học"
                style={styles.fab}
                color="white"
                onPress={() => navigation.navigate("AddLesson", {
                    courseId: course.id,
                    courseName: course.subject
                })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    subText: { color: '#6b7280', fontSize: 14 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: PRIMARY_BLUE },
    listItem: { paddingHorizontal: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    emptyText: { color: '#6b7280', fontStyle: 'italic' }
});

export default ManageCourse;