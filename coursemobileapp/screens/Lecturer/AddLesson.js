import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Caption, Text } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import styles, { PRIMARY_COLOR } from './styles';
import { useAlert } from '../../utils/contexts/AlertContext';

const AddLesson = ({ route, navigation }) => {
    const { courseId, courseName, lesson: existingLesson } = route.params;
    const [lesson, setLesson] = useState({ subject: '', content: '', video: '' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const showAlert = useAlert();

    useEffect(() => {
        if (existingLesson) {
            setLesson({
                subject: existingLesson.subject ?? '',
                content: existingLesson.content ?? '',
                video: existingLesson.video ?? '',
            });
            if (existingLesson.image) {
                setImage({ uri: existingLesson.image });
            }
        }
    }, [existingLesson]);

    const uploadToCloudinary = async (file) => {
        if (!file) return null;
        if (file.uri && file.uri.startsWith('http')) return file.uri;

        const data = new FormData();
        data.append("file", {
            uri: file.uri,
            type: file.mimeType || "image/jpeg",
            name: file.fileName || "upload.jpg",
        });
        data.append("upload_preset", "courseapp_preset");
        data.append("cloud_name", "dpl8syyb9");

        try {
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/dpl8syyb9/image/upload",
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.secure_url;
        } catch (error) {
            console.error("Lỗi upload ảnh AddLesson:", error);
            return null;
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSaveLesson = async () => {
        if (!lesson.subject?.trim() || !lesson.content?.trim()) {
            showAlert("Lỗi", "Vui lòng điền đủ tiêu đề và nội dung!", "error");
            return;
        }

        setLoading(true);
        try {
            let imageUrl = "";
            if (image) {
                imageUrl = await uploadToCloudinary(image);
                if (!imageUrl && image.uri && !image.uri.startsWith('http')) {
                    showAlert("Lỗi", "Upload ảnh thất bại. Vui lòng thử lại.", "error");
                    setLoading(false);
                    return;
                }
            }

            const token = await AsyncStorage.getItem("token");
            const payload = {
                ...lesson,
                course: courseId,
                image: imageUrl
            };

            if (existingLesson) {
                await authApis(token).patch(endpoints['lesson-detail'](existingLesson.id), payload);
            } else {
                await authApis(token).post(endpoints['add-lesson'], payload);
            }

            showAlert("Thành công", "Đã lưu bài học!", "success");
            navigation.goBack();
        } catch (ex) {
            console.error(ex);
            showAlert("Lỗi", "Không thể lưu bài học.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <View style={{ marginBottom: 20 }}>
                        <Title style={styles.title}>
                            {existingLesson ? "Sửa bài học" : "Thêm bài học"}
                        </Title>
                        <Caption style={{ fontSize: 14 }}>Khóa học: {courseName}</Caption>
                    </View>

                    <TextInput
                        label="Tiêu đề bài học"
                        value={lesson.subject}
                        mode="outlined"
                        onChangeText={t => setLesson({ ...lesson, subject: t })}
                        style={styles.input}
                    />

                    <TextInput
                        label="Link YouTube"
                        value={lesson.video}
                        mode="outlined"
                        placeholder="https://www.youtube.com/watch?v=..."
                        onChangeText={t => setLesson({ ...lesson, video: t })}
                        style={styles.input}
                    />

                    <Text style={{ marginBottom: 8, color: '#475569' }}>Ảnh bài học</Text>
                    <TouchableOpacity onPress={pickImage} style={styles.imageDrop}>
                        {image?.uri ? (
                            <Image
                                source={{ uri: image.uri }}
                                style={styles.previewImage}
                                key={image.uri}
                            />
                        ) : (
                            <Text style={{ color: '#64748b' }}>+ Chọn ảnh minh họa</Text>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        label="Nội dung"
                        value={lesson.content}
                        mode="outlined"
                        multiline
                        numberOfLines={10}
                        onChangeText={t => setLesson({ ...lesson, content: t })}
                        style={[styles.input, { minHeight: 150 }]}
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddLesson;