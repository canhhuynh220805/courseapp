// screens/Lecturer/LecturerHome.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const LecturerHome = ({ navigation }) => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token"); // Lấy token từ bộ nhớ máy
            let res = await authApis(token).get(endpoints['course-stats']);
            setStats(res.data);
        } catch (ex) {
            console.error("Lỗi tải thống kê:", ex);
        } finally {
            setLoading(false);
        }
    };

    // Tự động tải lại dữ liệu khi quay về trang này (sau khi thêm khóa học mới)
    useFocusEffect(useCallback(() => { loadStats(); }, []));

    const renderItem = ({ item }) => (
        <Card style={{ margin: 10, elevation: 4 }}>
            <Card.Cover source={{ uri: item.image }} />
            <Card.Content>
                <Title>{item.subject}</Title>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Paragraph style={{ fontWeight: 'bold' }}>Học viên: {item.student_count}</Paragraph>
                    <Paragraph style={{ color: 'green' }}>Doanh thu: {item.total_revenue} VNĐ</Paragraph>
                </View>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => navigation.navigate("StudentProgress", { courseId: item.id })}>Tiến độ SV</Button>
                <Button onPress={() => navigation.navigate("AddLesson", { courseId: item.id })}>Thêm Bài</Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <Button mode="contained" icon="plus" style={{ margin: 10, padding: 5 }}
                onPress={() => navigation.navigate("AddCourse")}>Tạo khóa học mới</Button>
            {loading ? <ActivityIndicator animating={true} style={{ marginTop: 20 }} /> :
                <FlatList data={stats} keyExtractor={i => i.id.toString()} renderItem={renderItem} />
            }
        </View>
    );
};

export default LecturerHome;