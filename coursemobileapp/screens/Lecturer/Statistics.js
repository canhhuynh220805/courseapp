import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import {
    Button,
    Card,
    Text,
    Title,
    Paragraph,
    Caption,
    ActivityIndicator,
    SegmentedButtons,
    DataTable
} from 'react-native-paper';
import { BarChart } from "react-native-chart-kit";
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY_COLOR = '#2563eb';
const { width } = Dimensions.get("window");

const Statistics = () => {
    const [period, setPeriod] = useState('month');
    const [revenueData, setRevenueData] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [summary, setSummary] = useState({ total_revenue: 0, total_students: 0 });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const [resRev, resCourse, resGeneral] = await Promise.all([
                authApis(token).get(`${endpoints['revenue-stats']}?period=${period}`),
                authApis(token).get(endpoints['course-stats']),
                authApis(token).get(endpoints['general-stats'])
            ]);

            setRevenueData(resRev.data);
            setCourseStats(resCourse.data);
            setSummary(resGeneral.data);
        } catch (ex) {
            console.error("Lỗi tải thống kê:", ex);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [period])
    );

    const chartConfig = {
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        labelColor: (opacity = 1) => `#6b7280`,
        style: { borderRadius: 16 },
        barPercentage: 0.6,
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerAction}>
                <Title style={styles.title}>Báo cáo & Thống kê</Title>
            </View>

            <View style={styles.summaryGrid}>
                <Card style={styles.flex1} mode="outlined">
                    <Card.Content>
                        <Caption>Tổng doanh thu</Caption>
                        <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
                            {summary.total_revenue?.toLocaleString()}đ
                        </Title>
                    </Card.Content>
                </Card>
                <Card style={styles.flex1} mode="outlined">
                    <Card.Content>
                        <Caption>Tổng sinh viên</Caption>
                        <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}>
                            {summary.total_students}
                        </Title>
                    </Card.Content>
                </Card>
            </View>

            {loading ? (
                <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 40 }} />
            ) : (
                <View style={{ paddingBottom: 30 }}>
                    <SegmentedButtons
                        value={period}
                        onValueChange={setPeriod}
                        buttons={[
                            { value: 'month', label: 'Tháng' },
                            { value: 'quarter', label: 'Quý' },
                            { value: 'year', label: 'Năm' },
                        ]}
                        style={styles.segment}
                    />
                    <Card style={styles.chartCard} mode="elevated">
                        <Card.Content>
                            <Title style={styles.subTitle}>Biểu đồ tăng trưởng</Title>
                            {revenueData.length > 0 ? (
                                <BarChart
                                    data={{
                                        labels: revenueData.map(d => d.period),
                                        datasets: [{ data: revenueData.map(d => d.total_revenue) }]
                                    }}
                                    width={width - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    fromZero
                                    showValuesOnTopOfBars
                                />
                            ) : (
                                <Paragraph style={styles.emptyText}>Chưa có dữ liệu doanh thu</Paragraph>
                            )}
                        </Card.Content>
                    </Card>

                    <Title style={[styles.subTitle, { marginTop: 25 }]}>Từng khóa học</Title>
                    <Card style={styles.tableCard} mode="outlined">
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>Khóa học</DataTable.Title>
                                <DataTable.Title numeric>Học viên</DataTable.Title>
                                <DataTable.Title numeric>Doanh thu</DataTable.Title>
                            </DataTable.Header>

                            {courseStats.map((item) => (
                                <DataTable.Row key={item.id}>
                                    <DataTable.Cell>
                                        <Text numberOfLines={1} style={{ fontSize: 12 }}>{item.subject}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric>{item.student_count}</DataTable.Cell>
                                    <DataTable.Cell numeric>
                                        <Text style={{ color: PRIMARY_COLOR, fontWeight: '500' }}>
                                            {item.total_revenue.toLocaleString()}
                                        </Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </Card>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20
    },
    flex1: {
        flex: 1
    },
    headerAction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827'
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#374151'
    },
    segment: {
        marginBottom: 20
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 10
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden'
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#9ca3af'
    }
});

export default Statistics;