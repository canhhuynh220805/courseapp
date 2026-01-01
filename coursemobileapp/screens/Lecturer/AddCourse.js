import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Title, Caption, ActivityIndicator } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const PRIMARY_BLUE = '#2563eb';

const AddCourse = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({ subject: '', description: '', price: '', duration: '', category: '' });
    const [image, setImage] = useState(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await authApis().get(endpoints['categories']);
                setCategories(res.data);
                if (res.data.length > 0) setCourse(c => ({ ...c, category: res.data[0].id }));
            } catch (ex) { console.error(ex); }
        };
        loadCategories();
    }, []);

    // Hàm upload ảnh lên Cloudinary
    const uploadToCloudinary = async (file) => {
        if (!file) return null;
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
            console.error("Lỗi upload ảnh:", error);
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
        if (!result.canceled) setImage(result.assets[0]);
    };

    const handleAddCourse = async () => {
        if (!course.subject || !course.price || !course.description) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên, mô tả và học phí!");
            return;
        }

        setLoading(true);
        try {
            let imageUrl = "";
            if (image) {
                imageUrl = await uploadToCloudinary(image);
                if (!imageUrl) {
                    Alert.alert("Lỗi", "Không thể upload ảnh lên Cloudinary!");
                    setLoading(false);
                    return;
                }
            }

            const token = await AsyncStorage.getItem("token");
            const payload = { ...course, image: imageUrl };

            await authApis(token).post(endpoints['courses'], payload);

            Alert.alert("Thành công", "Đã tạo khóa học mới!");
            navigation.goBack();
        } catch (ex) {
            console.error(ex.response?.data || ex);
            Alert.alert("Lỗi", "Không thể tạo khóa học. Kiểm tra lại dữ liệu!");
        } finally { setLoading(false); }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Tạo khóa học</Title>
            </View>

            <View style={styles.form}>
                <TextInput label="Tên khóa học" value={course.subject} mode="outlined"
                    onChangeText={t => setCourse({ ...course, subject: t })}
                    style={styles.input} activeOutlineColor={PRIMARY_BLUE} />

                <TextInput label="Mô tả chi tiết" value={course.description} mode="outlined" multiline numberOfLines={4}
                    onChangeText={t => setCourse({ ...course, description: t })}
                    style={styles.input} activeOutlineColor={PRIMARY_BLUE} />

                <TextInput label="Học phí (VNĐ)" value={course.price} mode="outlined" keyboardType="numeric"
                    onChangeText={t => setCourse({ ...course, price: t })}
                    style={styles.input} activeOutlineColor={PRIMARY_BLUE} />

                <Text style={styles.label}>Danh mục</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={course.category} onValueChange={(v) => setCourse({ ...course, category: v })}>
                        {categories.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                    </Picker>
                </View>

                <TouchableOpacity onPress={pickImage} style={styles.imageDrop}>
                    {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        : <Text style={{ color: PRIMARY_BLUE }}>+ Chọn ảnh minh họa</Text>}
                </TouchableOpacity>

                <Button mode="contained" onPress={handleAddCourse} loading={loading}
                    buttonColor={PRIMARY_BLUE} style={styles.submitBtn}>
                    Tạo khóa học
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 20, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    form: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    label: { marginBottom: 5, fontWeight: '500', color: '#374151' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15 },
    imageDrop: { height: 180, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: PRIMARY_BLUE, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    previewImage: { width: '100%', height: '100%', borderRadius: 10 },
    submitBtn: { marginTop: 10, borderRadius: 8, paddingVertical: 5 }
});

export default AddCourse;