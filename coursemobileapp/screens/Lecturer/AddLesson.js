import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Title, Caption } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#2563eb';

const AddLesson = ({ route, navigation }) => {
    const { courseId, courseName } = route.params;
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
            form.append('course', courseId);

            await authApis(token).post(endpoints['add-lesson'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Alert.alert("Thành công", "Đã thêm bài học mới!");
            navigation.goBack();
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể thêm bài học.");
        } finally { setLoading(false); }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <Title style={styles.headerTitle}>Thêm bài học</Title>
                <Caption>Khóa học: {courseName}</Caption>
            </View>

            <View style={styles.form}>
                <TextInput label="Tiêu đề bài học" value={lesson.subject} mode="outlined"
                    onChangeText={t => setLesson({ ...lesson, subject: t })}
                    style={styles.input} activeOutlineColor={PRIMARY_BLUE} />

                <TextInput label="Thời lượng (phút)" value={lesson.duration} mode="outlined" keyboardType="numeric"
                    onChangeText={t => setLesson({ ...lesson, duration: t })}
                    style={styles.input} activeOutlineColor={PRIMARY_BLUE} />

                <TextInput label="Nội dung văn bản" value={lesson.content} mode="outlined"
                    multiline numberOfLines={8}
                    onChangeText={t => setLesson({ ...lesson, content: t })}
                    style={styles.input} activeOutlineColor={PRIMARY_BLUE} />

                <Button mode="contained" onPress={handleAddLesson} loading={loading}
                    buttonColor={PRIMARY_BLUE} style={styles.btn}>
                    Lưu bài học
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    header: { padding: 20, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    form: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    btn: { marginTop: 10, borderRadius: 8, paddingVertical: 5 }
});

export default AddLesson;