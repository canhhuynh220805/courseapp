import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
// Sử dụng React Native Paper thay cho nativecn-ui
import { Button, Card, Text, Title, Paragraph, Caption, ActivityIndicator } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY_BLUE = '#2563eb';

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
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const renderHeader = () => (
        <View style={styles.summaryGrid}>
            <Card style={styles.flex1} mode="outlined">
                <Card.Content>
                    <Caption>Doanh thu</Caption>
                    <Title style={{ color: PRIMARY_BLUE, fontWeight: 'bold' }}>
                        {summary.total_revenue?.toLocaleString()}đ
                    </Title>
                </Card.Content>
            </Card>
            <Card style={styles.flex1} mode="outlined">
                <Card.Content>
                    <Caption>Sinh viên</Caption>
                    <Title style={{ color: PRIMARY_BLUE, fontWeight: 'bold' }}>
                        {summary.total_students}
                    </Title>
                </Card.Content>
            </Card>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerAction}>
                <Text style={styles.title}>Quản lý giảng dạy</Text>
                <Button
                    mode="contained"
                    buttonColor={PRIMARY_BLUE}
                    onPress={() => navigation.navigate("AddCourse")}
                >
                    + Tạo khóa học
                </Button>
            </View>

            {loading ? <ActivityIndicator color={PRIMARY_BLUE} style={{ marginTop: 20 }} /> : (
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={stats}
                    keyExtractor={i => i.id.toString()}
                    renderItem={({ item }) => (
                        <Card
                            style={styles.courseCard}
                            mode="elevated"
                            onPress={() => navigation.navigate("ManageCourse", { course: item })}
                        >
                            <Card.Cover source={{ uri: item.image }} style={styles.courseImg} />
                            <Card.Content style={{ marginTop: 10 }}>
                                <Title style={{ fontSize: 18 }}>{item.subject}</Title>
                                <Paragraph style={{ color: 'gray' }}>
                                    {item.student_count} học viên • {item.total_revenue?.toLocaleString()}đ
                                </Paragraph>
                            </Card.Content>
                        </Card>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    flex1: { flex: 1 },
    headerAction: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
    courseCard: { marginBottom: 20, backgroundColor: '#fff' },
    courseImg: { height: 160 }
});

export default LecturerHome;