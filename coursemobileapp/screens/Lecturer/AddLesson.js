import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Caption } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#2563eb';

const AddLesson = ({ route, navigation }) => {
    const { courseId, courseName, lesson: existingLesson } = route.params; //
    const [lesson, setLesson] = useState({ subject: '', content: '', duration: '', video: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingLesson) {
            setLesson({
                subject: existingLesson.subject ?? '',
                content: existingLesson.content ?? '',
                // FIX: Tránh hiện "undefined" bằng cách kiểm tra giá trị
                duration: existingLesson.duration !== undefined && existingLesson.duration !== null ? String(existingLesson.duration) : '0',
                video: existingLesson.video ?? ''
            });
        }
    }, [existingLesson]);

    const handleSaveLesson = async () => {
        if (!lesson.subject?.trim() || !lesson.content?.trim()) {
            Alert.alert("Lỗi", "Vui lòng điền đủ tiêu đề và nội dung!");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const payload = { ...lesson, course: courseId, duration: parseInt(lesson.duration) || 0 };

            if (existingLesson) {
                // Cập nhật bài học hiện tại
                await authApis(token).patch(endpoints['lesson-details'](existingLesson.id), payload);
            } else {
                await authApis(token).post(endpoints['add-lesson'], payload);
            }
            Alert.alert("Thành công", "Đã lưu bài học!");
            navigation.goBack();
        } catch (ex) { Alert.alert("Lỗi", "Không thể lưu."); } finally { setLoading(false); }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <Title>{existingLesson ? "Sửa bài học" : "Thêm bài học"}</Title>
                <Caption>Khóa học: {courseName}</Caption>
            </View>
            <View style={styles.form}>
                <TextInput label="Tiêu đề bài học" value={lesson.subject} mode="outlined" onChangeText={t => setLesson({ ...lesson, subject: t })} style={styles.input} />
                <TextInput label="Link YouTube" value={lesson.video} mode="outlined" placeholder="https://..." onChangeText={t => setLesson({ ...lesson, video: t })} style={styles.input} />
                <TextInput label="Thời lượng (phút)" value={lesson.duration} mode="outlined" keyboardType="numeric" onChangeText={t => setLesson({ ...lesson, duration: t })} style={styles.input} />
                <TextInput label="Nội dung" value={lesson.content} mode="outlined" multiline numberOfLines={8} onChangeText={t => setLesson({ ...lesson, content: t })} style={styles.input} />
                <Button mode="contained" onPress={handleSaveLesson} loading={loading} buttonColor={PRIMARY_BLUE}>Lưu</Button>
            </View>
        </ScrollView>
    );
};
// ... Styles giữ nguyên
const styles = StyleSheet.create({
    header: { padding: 20, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    form: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: '#fff' }
});
export default AddLesson;