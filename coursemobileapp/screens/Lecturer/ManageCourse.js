import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Divider, List, FAB, ActivityIndicator, IconButton, Button as PaperButton } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { PRIMARY_COLOR } from './styles';
import { useAlert } from '../../utils/contexts/AlertContext';

const ManageCourse = ({ route, navigation }) => {
    const { course } = route.params;
    const [studentsCount, setStudentsCount] = useState(0);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const showAlert = useAlert();

    const loadDetail = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const [resS, resL] = await Promise.all([
                authApis(token).get(endpoints['course-students'](course.id)),
                authApis(token).get(endpoints['lessons'](course.id))
            ]);

            const lessonData = resL.data.results || resL.data;
            const studentData = resS.data.results || resS.data;

            setLessons(lessonData || []);
            setStudentsCount(studentData.length || 0);
        } catch (ex) {
            console.error("Lỗi tải dữ liệu:", ex);
            showAlert("Lỗi", "Không thể nạp danh sách bài học.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadDetail();
        });
        return unsubscribe;
    }, [navigation]);

    const handleDeleteCourse = () => {
        showAlert(
            "Xác nhận xóa",
            "Bạn có chắc muốn xóa khóa học này không? Mọi dữ liệu liên quan sẽ bị mất.",
            "error",
            async () => {
                try {
                    const token = await AsyncStorage.getItem("token");
                    await authApis(token).delete(endpoints['course-details'](course.id));
                    showAlert("Thành công", "Đã xóa khóa học.", "success", () => {
                        navigation.navigate("LecturerHome");
                    });
                } catch (e) {
                    showAlert("Lỗi", "Không thể xóa khóa học này.", "error");
                }
            }
        );
    };

    const handleDeleteLesson = (lessonId, lessonSubject) => {
        showAlert(
            "Xác nhận xóa",
            `Bạn có muốn xóa bài học "${lessonSubject}" không?`,
            "error",
            async () => {
                try {
                    const token = await AsyncStorage.getItem("token");
                    await authApis(token).delete(endpoints['lesson-detail'](lessonId));
                    showAlert("Thành công", "Đã xóa bài học.", "success");
                    loadDetail();
                } catch (e) {
                    showAlert("Lỗi", "Xóa bài học thất bại.", "error");
                }
            }
        );
    };

    const renderHeader = () => (
        <View style={{ padding: 20 }}>
            <View style={styles.rowBetween}>
                <Text style={styles.sectionHeader}>Thông tin khóa học</Text>
                <View style={{ flexDirection: 'row' }}>
                    <PaperButton
                        icon="pencil"
                        mode="outlined"
                        compact
                        textColor={PRIMARY_COLOR}
                        onPress={() => navigation.navigate("AddCourse", { courseEdit: course })}
                    > Sửa </PaperButton>
                    <PaperButton
                        icon="delete"
                        mode="text"
                        compact
                        textColor="red"
                        onPress={handleDeleteCourse}
                    > Xóa </PaperButton>
                </View>
            </View>
            <Divider style={{ marginVertical: 15 }} />
            <View style={styles.rowBetween}>
                <View>
                    <Text style={styles.sectionHeader}>Học viên</Text>
                    <Text style={styles.subText}>{studentsCount} người đã đăng ký</Text>
                </View>
                <PaperButton mode="contained-tonal"
                    onPress={() => navigation.navigate("StudentProgress", { courseId: course.id, courseName: course.subject })}>
                    Xem tiến độ
                </PaperButton>
            </View>
            <Divider style={{ marginTop: 20, marginBottom: 10 }} />
            <Text style={styles.sectionHeader}>Danh sách bài học ({lessons.length})</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && lessons.length === 0 ? (
                <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 40 }} size="large" />
            ) : (
                <FlatList
                    data={lessons}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item, index }) => (
                        <List.Item
                            title={`${index + 1}. ${item.subject}`}
                            description={item.active ? "Đang hiển thị" : "Đang ẩn"}
                            left={p => <List.Icon {...p} icon="book-open-variant" />}
                            right={p => (
                                <View style={{ flexDirection: 'row' }}>
                                    <IconButton icon="pencil-outline" onPress={() => navigation.navigate("AddLesson", { courseId: course.id, lesson: item })} />
                                    <IconButton
                                        icon="delete-outline"
                                        iconColor="red"
                                        onPress={() => handleDeleteLesson(item.id, item.subject)}
                                    />
                                </View>
                            )}
                            style={styles.listItem}
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có bài học nào.</Text>}
                />
            )}
            <FAB icon="plus" label="Thêm bài học" style={styles.fab} color="white"
                onPress={() => navigation.navigate("AddLesson", { courseId: course.id, courseName: course.subject })} />
        </View>
    );
};

export default ManageCourse;