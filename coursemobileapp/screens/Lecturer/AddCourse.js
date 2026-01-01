import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_COLOR = '#2563eb';

const AddCourse = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({
        subject: '',
        description: '',
        price: '',
        duration: '',
        category: ''
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await authApis().get(endpoints['categories']);
                setCategories(res.data);
                if (res.data.length > 0) setCourse(c => ({ ...c, category: res.data[0].id }));
            } catch (ex) {
                console.error("Lỗi tải danh mục:", ex);
            }
        };
        loadCategories();
    }, []);

    // 2. Hàm chọn ảnh minh họa
    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Thông báo", "Ứng dụng cần quyền truy cập ảnh!");
            return;
        }

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

    // 3. Hàm gửi dữ liệu lên Backend
    const handleAddCourse = async () => {
        if (!course.subject || !course.price) {
            Alert.alert("Lỗi", "Vui lòng nhập tên và học phí!");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const formData = new FormData();

            // Gắn các trường text
            formData.append('subject', course.subject);
            formData.append('description', course.description);
            formData.append('price', course.price);
            formData.append('duration', course.duration);
            formData.append('category', course.category);

            // Gắn file ảnh nếu có
            if (image) {
                formData.append('image', {
                    uri: image.uri,
                    name: 'course.jpg',
                    type: 'image/jpeg'
                });
            }

            // Gọi API POST /courses/
            await authApis(token).post(endpoints['courses'], formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Alert.alert("Thành công", "Đã tạo khóa học mới!");
            navigation.goBack(); // Quay lại trang quản lý
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Không thể tạo khóa học. Kiểm tra lại quyền Giảng viên!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>TẠO KHÓA HỌC MỚI</Text>

            <TextInput label="Tên khóa học" value={course.subject}
                onChangeText={t => setCourse({ ...course, subject: t })} mode="outlined" style={styles.input} />

            <TextInput label="Mô tả chi tiết" value={course.description} multiline numberOfLines={4}
                onChangeText={t => setCourse({ ...course, description: t })} mode="outlined" style={styles.input} />

            <TextInput label="Học phí (VNĐ)" value={course.price} keyboardType="numeric"
                onChangeText={t => setCourse({ ...course, price: t })} mode="outlined" style={styles.input} />

            <TextInput label="Thời lượng (giờ)" value={course.duration} keyboardType="numeric"
                onChangeText={t => setCourse({ ...course, duration: t })} mode="outlined" style={styles.input} />

            <Text style={{ marginTop: 10 }}>Chọn danh mục:</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={course.category}
                    onValueChange={(val) => setCourse({ ...course, category: val })}>
                    {categories.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                </Picker>
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    : <Button icon="camera" mode="outlined">Chọn ảnh minh họa</Button>}
            </TouchableOpacity>

            <Button mode="contained" onPress={handleAddCourse} loading={loading} disabled={loading} style={styles.btn}>
                Tạo khóa học
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: PRIMARY_COLOR },
    label: { marginTop: 10, fontWeight: 'bold', color: PRIMARY_COLOR },
    input: { marginBottom: 15 },
    pickerContainer: { borderWidth: 1, borderColor: PRIMARY_COLOR, borderRadius: 5, marginTop: 5, marginBottom: 15 },
    imagePicker: { alignItems: 'center', marginVertical: 15 },
    previewImage: { width: '100%', height: 200, borderRadius: 10 },
    btn: { paddingVertical: 5, marginBottom: 40 }
});

export default AddCourse; 