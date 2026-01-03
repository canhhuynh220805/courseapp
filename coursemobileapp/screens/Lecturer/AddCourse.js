import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Title, ActivityIndicator } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const PRIMARY_BLUE = '#2563eb';

const AddCourse = ({ route, navigation }) => {
    const courseEditId = route.params?.courseEdit?.id;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({ subject: '', description: '', price: '', category: '' });
    const [image, setImage] = useState(null);

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
        if (!file || file.uri.startsWith('http')) return file.uri;
        const data = new FormData();
        data.append("file", { uri: file.uri, type: "image/jpeg", name: "upload.jpg" });
        data.append("upload_preset", "courseapp_preset");
        data.append("cloud_name", "dpl8syyb9");
        try {
            const res = await axios.post("https://api.cloudinary.com/v1_1/dpl8syyb9/image/upload", data);
            return res.data.secure_url;
        } catch (error) { return null; }
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
        if (!course.subject?.trim() || course.price === '' || !course.description?.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        setLoading(true);
        try {
            let imageUrl = image?.uri || "";
            if (image && !image.uri.startsWith('http')) {
                imageUrl = await uploadToCloudinary(image);
            }

            const token = await AsyncStorage.getItem("token");
            const payload = { ...course, image: imageUrl };

            if (courseEditId) {
                await authApis(token).patch(endpoints['course-details'](courseEditId), payload);
                Alert.alert("Thành công", "Đã cập nhật khóa học!");
            } else {
                await authApis(token).post(endpoints['courses'], payload);
                Alert.alert("Thành công", "Đã tạo khóa học mới!");
            }
            navigation.goBack();
        } catch (ex) { Alert.alert("Lỗi", "Không thể lưu."); } finally { setLoading(false); }
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
                <Button mode="contained" onPress={handleSave} loading={loading} buttonColor={PRIMARY_BLUE}>{courseEditId ? "Cập nhật" : "Tạo mới"}</Button>
            </View>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 20, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    form: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15 },
    imageDrop: { height: 180, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: PRIMARY_BLUE, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    previewImage: { width: '100%', height: '100%', borderRadius: 10 }
});
export default AddCourse;