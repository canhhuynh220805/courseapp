import React, { useState, useCallback, useEffect } from 'react';
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
    DataTable,
    Searchbar
} from 'react-native-paper';
import { BarChart } from "react-native-chart-kit";
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import styles, { PRIMARY_COLOR } from './styles';
export const { width } = Dimensions.get("window");
const PAGE_SIZE = 10;
const Statistics = () => {
    const [period, setPeriod] = useState('month');
    const [revenueData, setRevenueData] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [summary, setSummary] = useState({ total_revenue: 0, total_students: 0 });
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const [resRev, resCourse, resGeneral] = await Promise.all([
                authApis(token).get(`${endpoints['revenue-stats']}?period=${period}`),
                authApis(token).get(`${endpoints['course-stats']}?q=${searchQuery}&page=${page + 1}`),
                authApis(token).get(endpoints['general-stats'])
            ]);

            setRevenueData(resRev.data);

            setCourseStats(resCourse.data.results || []);
            setTotalItems(resCourse.data.count || 0);

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
        }, [period, page])
    );

    const handleSearch = () => {
        setPage(0);
        loadData();
    };

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

            <Title style={[styles.subTitle, { marginTop: 25 }]}>Chi tiết từng khóa học</Title>

            <Searchbar
                placeholder="Tìm tên khóa học..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                onSubmitEditing={handleSearch}
                style={styles.searchbar}
                elevation={1}
            />

            <Card style={styles.tableCard} mode="outlined">
                {loading ? (
                    <ActivityIndicator color={PRIMARY_COLOR} style={{ margin: 20 }} />
                ) : (
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Khóa học</DataTable.Title>
                            <DataTable.Title numeric>Học viên</DataTable.Title>
                            <DataTable.Title numeric>Doanh thu</DataTable.Title>
                        </DataTable.Header>

                        {courseStats.length > 0 ? courseStats.map((item) => (
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
                        )) : (
                            <DataTable.Row>
                                <DataTable.Cell style={{ justifyContent: 'center' }}>
                                    <Text>Không tìm thấy kết quả</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )}

                        <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(totalItems / PAGE_SIZE)}
                            onPageChange={(p) => setPage(p)}
                            label={`${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalItems)} của ${totalItems}`}
                            showFastPaginationControls
                        />
                    </DataTable>
                )}
            </Card>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

export default Statistics;