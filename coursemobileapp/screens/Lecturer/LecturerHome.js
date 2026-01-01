import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Text } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
            setStats(resStats.data);
            setSummary(resGeneral.data);
        } catch (ex) {
            console.error("Lỗi tải dữ liệu:", ex);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const renderHeader = () => (
        <View style={styles.summaryBox}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>TỔNG DOANH THU</Text>
                <Text style={styles.statValue}>{summary.total_revenue?.toLocaleString()} VNĐ</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>TỔNG SINH VIÊN</Text>
                <Text style={styles.statValue}>{summary.total_students}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Button mode="contained" icon="plus" style={styles.addBtn} onPress={() => navigation.navigate("AddCourse")}>
                Tạo khóa học mới
            </Button>
            {loading ? <ActivityIndicator animating={true} style={{ marginTop: 20 }} /> :
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={stats}
                    keyExtractor={i => i.id.toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.card} onPress={() => navigation.navigate("ManageCourse", { course: item })}>
                            <Card.Cover source={{ uri: item.image }} />
                            <Card.Content>
                                <Title>{item.subject}</Title>
                                <Paragraph>Học viên: {item.student_count} | Doanh thu: {item.total_revenue?.toLocaleString()} VNĐ</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button mode="outlined">Quản lý chi tiết</Button>
                            </Card.Actions>
                        </Card>
                    )}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    summaryBox: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 20, margin: 10, borderRadius: 10 },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { color: '#fff', fontSize: 12, opacity: 0.8 },
    statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    addBtn: { margin: 10 },
    card: { margin: 10, elevation: 4 }
});

export default LecturerHome;