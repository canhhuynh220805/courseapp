import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
// Sử dụng React Native Paper thay cho nativecn-ui
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
                    <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
                        {summary.total_revenue?.toLocaleString()}đ
                    </Title>
                </Card.Content>
            </Card>
            <Card style={styles.flex1} mode="outlined">
                <Card.Content>
                    <Caption>Sinh viên</Caption>
                    <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
                        {summary.total_students}
                    </Title>
                </Card.Content>
            </Card>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerAction}>
                <Title style={styles.title}>Bảng điều khiển</Title>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                        mode="contained"
                        buttonColor={PRIMARY_COLOR}
                        onPress={() => navigation.navigate("AddCourse")}
                    >
                        + Tạo
                    </Button>
                </View>
            </View>

            {loading ? <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 20 }} /> : (
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


export default LecturerHome;