// screens/Lecturer/AddLesson.js
import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddLesson = ({ route, navigation }) => {
    const { courseId } = route.params; // Nhận ID khóa học từ nút bấm ở LecturerHome
    const [lesson, setLesson] = useState({ subject: '', content: '', duration: '' });
    const [loading, setLoading] = useState(false);

    const handleAddLesson = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            // Tạo FormData để gửi dữ liệu
            const form = new FormData();
            form.append('subject', lesson.subject);
            form.append('content', lesson.content);
            form.append('duration', lesson.duration);
            form.append('course', courseId); // Gắn bài học vào khóa học tương ứng

            await authApis(token).post(endpoints['lessons'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Alert.alert("Thành công", "Đã thêm bài học mới!");
            navigation.goBack();
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể thêm bài học.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ marginBottom: 20, fontWeight: 'bold' }}>THÊM BÀI HỌC CHO KHÓA {courseId}</Text>
            <TextInput label="Tiêu đề bài học" value={lesson.subject} onChangeText={t => setLesson({ ...lesson, subject: t })} mode="outlined" style={{ marginBottom: 10 }} />
            <TextInput label="Thời lượng (phút)" value={lesson.duration} keyboardType="numeric" onChangeText={t => setLesson({ ...lesson, duration: t })} mode="outlined" style={{ marginBottom: 10 }} />
            <TextInput label="Nội dung văn bản" value={lesson.content} multiline numberOfLines={10} onChangeText={t => setLesson({ ...lesson, content: t })} mode="outlined" />
            <Button mode="contained" onPress={handleAddLesson} loading={loading} style={{ marginTop: 20 }}>Lưu bài học</Button>
        </ScrollView>
    );
};

export default AddLesson;