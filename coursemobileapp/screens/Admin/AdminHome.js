import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, Button, Divider } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY_COLOR = '#2563eb';

const AdminHome = ({ navigation }) => {
    const [summary, setSummary] = useState({ total_courses: 0, total_students: 0, total_revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            const res = await authApis(token).get(endpoints['general-stats']);
            setSummary(res.data);
        } catch (ex) {
            console.error("Lỗi Admin Stats:", ex);
            // Không Alert liên tục để tránh phiền người dùng
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadStats} colors={[PRIMARY_COLOR]} />
            }
        >
            {/* Header đơn giản */}
            <View style={styles.header}>
                <Title style={styles.title}>Quản trị hệ thống</Title>
                <Text style={styles.subtitle}>Tổng quan dữ liệu</Text>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator color={PRIMARY_COLOR} size="large" style={{ marginTop: 50 }} />
            ) : (
                <View style={styles.content}>
                    {/* Thẻ thống kê nhanh */}
                    <Card style={styles.card} mode="contained">
                        <Card.Content>
                            <Text style={styles.label}>Tổng doanh thu</Text>
                            <Text style={styles.revenueValue}>
                                {summary.total_revenue?.toLocaleString('vi-VN')}đ
                            </Text>
                        </Card.Content>
                    </Card>

                    <View style={styles.row}>
                        <Card style={[styles.card, { flex: 1, marginRight: 10 }]} mode="outlined">
                            <Card.Content>
                                <Text style={styles.label}>Học viên</Text>
                                <Text style={styles.statValue}>{summary.total_students}</Text>
                            </Card.Content>
                        </Card>
                        <Card style={[styles.card, { flex: 1 }]} mode="outlined">
                            <Card.Content>
                                <Text style={styles.label}>Khóa học</Text>
                                <Text style={styles.statValue}>{summary.total_courses}</Text>
                            </Card.Content>
                        </Card>
                    </View>

                    <Divider style={{ marginVertical: 20 }} />

                    {/* Nút điều hướng chính */}
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate("StudentManagement")}
                        style={styles.btn}
                        buttonColor={PRIMARY_COLOR}
                        icon="account-cog"
                    >
                        Quản lý học viên
                    </Button>

                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate("LecturerManagement")}
                        style={styles.btn}
                        buttonColor="#475569"
                        icon="school"
                    >
                        Danh sách giảng viên
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate("Statistics")}
                        style={[styles.btn, { borderColor: PRIMARY_COLOR }]}
                        textColor={PRIMARY_COLOR}
                        icon="chart-bar"
                    >
                        Báo cáo thống kê
                    </Button>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 20, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, fontWeight: 'bold', color: PRIMARY_COLOR },
    subtitle: { color: 'gray' },
    content: { padding: 15 },
    card: { marginBottom: 15, backgroundColor: '#fff' },
    label: { fontSize: 14, color: '#64748b' },
    revenueValue: { fontSize: 24, fontWeight: 'bold', color: PRIMARY_COLOR, marginTop: 5 },
    statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
    row: { flexDirection: 'row' },
    btn: { marginBottom: 12, paddingVertical: 5, borderRadius: 8 },
});

export default AdminHome;