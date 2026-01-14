import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Text, Button, Title, List } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import styles, { PRIMARY_COLOR } from './styles';

const AdminHome = ({ navigation }) => {
    const [summary, setSummary] = useState({ total_courses: 0, total_students: 0, total_lecturers: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(endpoints['general-stats']);
            setSummary(res.data.metrics || { total_courses: 0, total_students: 0, total_lecturers: 0 });
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadStats(); }, []));

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={PRIMARY_COLOR} />;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Quản trị hệ thống</Title>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{summary.total_students}</Text>
                    <Text style={styles.statLabel}>Học viên</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{summary.total_lecturers}</Text>
                    <Text style={styles.statLabel}>Giảng viên</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{summary.total_courses}</Text>
                    <Text style={styles.statLabel}>Khóa học</Text>
                </View>
            </View>

            <View style={styles.menu}>
                <Button
                    mode="contained"
                    icon="account-group"
                    onPress={() => navigation.navigate("StudentManagement")}
                    style={[styles.button, { backgroundColor: PRIMARY_COLOR }]}
                >
                    Quản lý học viên
                </Button>

                <Button
                    mode="contained"
                    icon="school"
                    onPress={() => navigation.navigate("LecturerManagement")}
                    style={[styles.button, { backgroundColor: '#475569' }]}
                >
                    Quản lý giảng viên
                </Button>

                <Button
                    mode="outlined"
                    icon="chart-areaspline"
                    onPress={() => navigation.navigate("Statistics")}
                    style={styles.button}
                    textColor={PRIMARY_COLOR}
                >
                    Xem báo cáo doanh thu
                </Button>
            </View>
        </ScrollView>
    );
};

export default AdminHome;
