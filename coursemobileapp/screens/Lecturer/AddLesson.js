import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
                // Đổi từ 'lesson-details' thành 'lesson-detail' cho đúng Apis.js
                await authApis(token).patch(endpoints['lesson-detail'](existingLesson.id), payload);
            } else {
                await authApis(token).post(endpoints['add-lesson'], payload);
            }
            Alert.alert("Thành công", "Đã lưu bài học!");
            navigation.goBack();
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Không thể lưu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false}>
                {/* Dùng styles.container để lấy paddingHorizontal: 16 */}
                <View style={styles.container}>

                    {/* Phần tiêu đề: Thêm paddingVertical để không dính trần */}
                    <View style={{ paddingVertical: 20 }}>
                        <Title style={styles.title}>
                            {existingLesson ? "Sửa bài học" : "Thêm bài học"}
                        </Title>
                        <Caption style={{ fontSize: 14 }}>Khóa học: {courseName}</Caption>
                    </View>

                    {/* Phần Form nhập liệu */}
                    <View style={styles.form}>
                        <TextInput
                            label="Tiêu đề bài học"
                            value={lesson.subject}
                            mode="outlined"
                            onChangeText={t => setLesson({ ...lesson, subject: t })}
                            style={styles.input}
                            outlineColor="#e2e8f0"
                        />
                        <TextInput
                            label="Link YouTube"
                            value={lesson.video}
                            mode="outlined"
                            placeholder="https://www.youtube.com/watch?v=..."
                            onChangeText={t => setLesson({ ...lesson, video: t })}
                            style={styles.input}
                            outlineColor="#e2e8f0"
                        />
                        <TextInput
                            label="Nội dung"
                            value={lesson.content}
                            mode="outlined"
                            multiline
                            numberOfLines={10}
                            onChangeText={t => setLesson({ ...lesson, content: t })}
                            style={[styles.input, { minHeight: 150 }]}
                            outlineColor="#e2e8f0"
                        />

                        <Button
                            mode="contained"
                            onPress={handleSaveLesson}
                            loading={loading}
                            buttonColor={PRIMARY_COLOR}
                            style={{ marginTop: 10, paddingVertical: 6, borderRadius: 12 }}
                            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        >
                            Lưu bài học
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddLesson;