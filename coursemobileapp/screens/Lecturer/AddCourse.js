import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, Title, ActivityIndicator } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import styles, { PRIMARY_COLOR } from './styles';
import { useAlert } from '../../utils/contexts/AlertContext';

const AddCourse = ({ route, navigation }) => {
    const courseEditId = route.params?.courseEdit?.id;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({ subject: '', description: '', price: '', category: '' });
    const [image, setImage] = useState(null);
    const showAlert = useAlert();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const resCate = await authApis().get(endpoints['categories']);
                setCategories(resCate.data);

                if (courseEditId) {
                    const resDetail = await authApis().get(endpoints['course-details'](courseEditId));
                    const data = resDetail.data;

                    setCourse({
                        subject: data.subject ?? '',
                        description: data.description ?? '',
                        price: data.price !== undefined && data.price !== null ? String(data.price) : '0',
                        category: data.category ?? (resCate.data[0]?.id || '')
                    });
                    if (data.image) setImage({ uri: data.image });
                } else if (resCate.data.length > 0) {
                    setCourse(c => ({ ...c, category: resCate.data[0].id }));
                }
            } catch (ex) {
                console.error(ex);
            } finally { setLoading(false); }
        };
        loadData();
    }, [courseEditId]);
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
            console.error("Lỗi upload ảnh AddCourse:", error);
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

    const handleSave = async () => {
        const { subject, price, description } = course;
        if (!subject?.trim() || price === '' || !description?.trim()) {
            showAlert("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "error");
            return;
        }

        if (subject.length > 255) {
            showAlert("Lỗi", "Tên khóa học không được quá 255 ký tự.", "error");
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            showAlert("Lỗi", "Học phí phải là số nguyên dương hoặc bằng 0.", "error");
            return;
        }

        setLoading(true);
        try {
            let imageUrl = "";
            if (image) {
                imageUrl = await uploadToCloudinary(image);
                if (!imageUrl && image.uri && !image.uri.startsWith('http')) {
                    showAlert("Lỗi", "Không thể upload ảnh, vui lòng thử lại.", "error");
                    setLoading(false);
                    return;
                }
            }

            const token = await AsyncStorage.getItem("token");
            const payload = { ...course, price: priceNum, image: imageUrl };

            if (courseEditId) {
                await authApis(token).patch(endpoints['course-details'](courseEditId), payload);
                showAlert("Thành công", "Đã cập nhật khóa học!", "success");
            } else {
                await authApis(token).post(endpoints['courses'], payload);
                showAlert("Thành công", "Đã tạo khóa học mới!", "success");
            }
            navigation.goBack();
        } catch (ex) {
            let errorMsg = "Không thể lưu khóa học.";
            if (ex.response && ex.response.data) {
                const serverErrors = ex.response.data;
                if (typeof serverErrors === 'object') {
                    errorMsg = Object.keys(serverErrors)
                        .map(key => `${key}: ${serverErrors[key]}`)
                        .join("\n");
                }
            }
            console.error("Save Course Error:", ex);
            showAlert("Lỗi hệ thống", errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !categories.length) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}><Title>{courseEditId ? "Sửa khóa học" : "Tạo khóa học"}</Title></View>
            <View style={styles.form}>
                <TextInput label="Tên khóa học" value={course.subject} mode="outlined" onChangeText={t => setCourse({ ...course, subject: t })} style={styles.input} />
                <TextInput label="Mô tả" value={course.description} mode="outlined" multiline numberOfLines={4} onChangeText={t => setCourse({ ...course, description: t })} style={styles.input} />
                <TextInput label="Học phí (VNĐ)" value={course.price} mode="outlined" keyboardType="numeric" onChangeText={t => setCourse({ ...course, price: t })} style={styles.input} />
                <Text>Danh mục</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={course.category} onValueChange={v => setCourse({ ...course, category: v })}>
                        {categories.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                    </Picker>
                </View>
                <TouchableOpacity onPress={pickImage} style={styles.imageDrop}>
                    {image?.uri ? <Image source={{ uri: image.uri }} style={styles.previewImage} key={image.uri} /> : <Text>+ Chọn ảnh</Text>}
                </TouchableOpacity>
                <Button mode="contained" onPress={handleSave} loading={loading} buttonColor={PRIMARY_COLOR}>{courseEditId ? "Cập nhật" : "Tạo mới"}</Button>
            </View>
        </ScrollView>
    );
};
export default AddCourse;