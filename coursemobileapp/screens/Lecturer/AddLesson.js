// screens/Lecturer/AddLesson.js
import React, { useState } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddLesson = ({ route, navigation }) => {
    const { courseId } = route.params; // Nhận ID khóa học để gán bài học vào
    const [lesson, setLesson] = useState({ subject: '', content: '', duration: '' });
    const [loading, setLoading] = useState(false);

    const handleAddLesson = async () => {
        if (!lesson.subject || !lesson.content) {
            Alert.alert("Lỗi", "Vui lòng điền tiêu đề và nội dung bài học!");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const form = new FormData();
            form.append('subject', lesson.subject);
            form.append('content', lesson.content);
            form.append('duration', lesson.duration || 0);
            form.append('course', courseId); // Khớp với trường 'course' trong Lesson model

            await authApis(token).post(endpoints['add-lesson'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Alert.alert("Thành công", "Đã thêm bài học mới!");
            navigation.goBack();
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể thêm bài học. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={styles.header}>THÊM BÀI HỌC CHO KHÓA {courseId}</Text>
            <TextInput label="Tiêu đề bài học" value={lesson.subject} onChangeText={t => setLesson({ ...lesson, subject: t })} mode="outlined" style={styles.input} />
            <TextInput label="Thời lượng (phút)" value={lesson.duration} keyboardType="numeric" onChangeText={t => setLesson({ ...lesson, duration: t })} mode="outlined" style={styles.input} />
            <TextInput label="Nội dung văn bản" value={lesson.content} multiline numberOfLines={10} onChangeText={t => setLesson({ ...lesson, content: t })} mode="outlined" style={styles.input} />
            <Button mode="contained" onPress={handleAddLesson} loading={loading} style={styles.btn}>Lưu bài học</Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#2563eb' },
    input: { marginBottom: 10 },
    btn: { marginTop: 10, padding: 5 }
});

export default AddLesson;