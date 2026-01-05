import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Caption } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { PRIMARY_COLOR } from './styles';
const AddLesson = ({ route, navigation }) => {
    const { courseId, courseName, lesson: existingLesson } = route.params;
    const [lesson, setLesson] = useState({ subject: '', content: '', video: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingLesson) {
            setLesson({
                subject: existingLesson.subject ?? '',
                content: existingLesson.content ?? '',
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
            const payload = { ...lesson, course: courseId };

            if (existingLesson) {
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
                <TextInput label="Nội dung" value={lesson.content} mode="outlined" multiline numberOfLines={8} onChangeText={t => setLesson({ ...lesson, content: t })} style={styles.input} />
                <Button mode="contained" onPress={handleSaveLesson} loading={loading} buttonColor={PRIMARY_COLOR}>Lưu</Button>
            </View>
        </ScrollView>
    );
};
export default AddLesson;