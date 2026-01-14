import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Button, Card, Text, Title, Paragraph, Caption, ActivityIndicator } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import styles, { PRIMARY_COLOR } from './styles';

const LecturerHome = ({ navigation }) => {
    const [stats, setStats] = useState([]);
    const [summary, setSummary] = useState({ total_revenue: 0, total_students: 0 });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const [resStats, resGeneral] = await Promise.all([
                authApis(token).get(endpoints['course-stats']),
                authApis(token).get(endpoints['general-stats'])
            ]);

            setStats(resStats.data.results || resStats.data);

            const metrics = resGeneral.data.metrics || resGeneral.data;
            setSummary({
                total_revenue: metrics.total_revenue || 0,
                total_students: metrics.total_students || 0
            });

        } catch (ex) {
            console.error("Lỗi khi tải dữ liệu giảng viên:", ex);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const renderHeader = () => (
        <View>
            <View style={styles.summaryGrid}>
                <Card style={styles.flex1} mode="outlined">
                    <Card.Content>
                        <Caption>Doanh thu tổng</Caption>
                        <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
                            {Number(summary.total_revenue).toLocaleString()}đ
                        </Title>
                    </Card.Content>
                </Card>

                <Card style={styles.flex1} mode="outlined">
                    <Card.Content>
                        <Caption>Tổng học viên</Caption>
                        <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
                            {summary.total_students}
                        </Title>
                    </Card.Content>
                </Card>
            </View>

            <Button
                mode="contained"
                icon="chart-bar"
                onPress={() => navigation.navigate("Statistics")}
                style={{ marginHorizontal: 5, marginBottom: 15, marginTop: 10 }}
                buttonColor="#e0f2fe"
                textColor={PRIMARY_COLOR}
            >
                Xem biểu đồ thống kê chi tiết
            </Button>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerAction}>
                <Title style={styles.title}>Quản lý khóa học</Title>
                <Button
                    mode="contained"
                    buttonColor={PRIMARY_COLOR}
                    onPress={() => navigation.navigate("AddCourse")}
                    icon="plus"
                >
                    Tạo mới
                </Button>
            </View>

            {loading ? (
                <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 20 }} size="large" />
            ) : (
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={stats}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <Card
                            style={styles.courseCard}
                            mode="elevated"
                            onPress={() => navigation.navigate("ManageCourse", { course: item })}
                        >
                            {item.image && (
                                <Card.Cover source={{ uri: item.image }} style={styles.courseImg} />
                            )}

                            <Card.Content style={{ marginTop: 10 }}>
                                <Title style={{ fontSize: 18 }}>{item.subject}</Title>
                                <Paragraph style={{ color: 'gray' }}>
                                    {item.student_count || 0} học viên • {Number(item.total_revenue || 0).toLocaleString()}đ
                                </Paragraph>
                            </Card.Content>
                        </Card>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
                            Bạn chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                        </Text>
                    }
                />
            )}
        </View>
    );
};

export default LecturerHome;