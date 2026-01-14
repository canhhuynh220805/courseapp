import React, { useState, useCallback, useContext } from 'react';
import { View, ScrollView, Dimensions, RefreshControl } from 'react-native';
import {
    Card,
    Text,
    Title,
    Caption,
    ActivityIndicator,
    SegmentedButtons,
    DataTable,
    Searchbar
} from 'react-native-paper';
import { BarChart, LineChart } from "react-native-chart-kit";
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MyUserContext } from '../../utils/contexts/MyContext';
import styles, { PRIMARY_COLOR } from './styles';

export const { width } = Dimensions.get("window");
const PAGE_SIZE = 5;

const Statistics = () => {
    const [user] = useContext(MyUserContext);
    const [period, setPeriod] = useState('month');

    const [revenueData, setRevenueData] = useState([]);
    const [enrollmentData, setEnrollmentData] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [summary, setSummary] = useState({ total_revenue: 0, total_students: 0, total_courses: 0 });

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const promises = [
                authApis(token).get(`${endpoints['revenue-stats']}?period=${period}`),
                authApis(token).get(`${endpoints['course-stats']}?q=${searchQuery}`),
                authApis(token).get(endpoints['general-stats'])
            ];

            if (user && user.role === "ADMIN") {
                promises.push(authApis(token).get(`${endpoints['enrollment-stats']}?period=${period === 'year' ? 'month' : 'day'}`));
            }

            const results = await Promise.all(promises);

            const resRev = results[0];
            const resCourse = results[1];
            const resGeneral = results[2];

            setRevenueData(resRev.data);

            const courses = resCourse.data || [];
            setAllCourses(courses);
            setTotalItems(courses.length);
            updatePageData(courses, 0);

            if (resGeneral.data && resGeneral.data.metrics) {
                setSummary(resGeneral.data.metrics);
            }

            if (user && user.role === "ADMIN" && results[3]) {
                setEnrollmentData(results[3].data);
            }

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    const updatePageData = (dataList, pageNumber) => {
        const start = pageNumber * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setCourseStats(dataList.slice(start, end));
        setPage(pageNumber);
    };

    const handlePageChange = (newPage) => {
        updatePageData(allCourses, newPage);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [period])
    );

    const handleSearch = () => {
        loadData();
        setPage(0);
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
        propsForLabels: { fontSize: 10 }
    };

    const revenueChartData = {
        labels: revenueData.length > 0 ? revenueData.map(d => d.period) : ["Trống"],
        datasets: [{ data: revenueData.length > 0 ? revenueData.map(d => d.value) : [0] }]
    };

    const enrollmentChartData = {
        labels: enrollmentData.length > 0 ? enrollmentData.map(d => d.period) : ["Trống"],
        datasets: [{
            data: enrollmentData.length > 0 ? enrollmentData.map(d => d.value) : [0],
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            strokeWidth: 2
        }]
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        >
            <View style={styles.headerAction}>
                <Title style={styles.title}>Báo cáo & Thống kê</Title>
            </View>

            <View style={styles.summaryGrid}>
                <Card style={styles.flex1} mode="elevated">
                    <Card.Content>
                        <Caption>Tổng doanh thu</Caption>
                        <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold', fontSize: 16 }}>
                            {summary.total_revenue ? parseInt(summary.total_revenue).toLocaleString('vi-VN') : 0}đ
                        </Title>
                    </Card.Content>
                </Card>
                <Card style={styles.flex1} mode="elevated">
                    <Card.Content>
                        <Caption>Tổng sinh viên</Caption>
                        <Title style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 16 }}>
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
                density="small"
            />

            <Card style={styles.chartCard} mode="outlined">
                <Card.Content>
                    <Title style={styles.subTitle}>Biểu đồ doanh thu</Title>
                    {loading ? <ActivityIndicator style={{ height: 220 }} color={PRIMARY_COLOR} /> : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <BarChart
                                data={revenueChartData}
                                width={Math.max(width - 64, revenueData.length * 60)}
                                height={220}
                                yAxisSuffix=""
                                chartConfig={chartConfig}
                                style={styles.chart}
                                fromZero
                                showValuesOnTopOfBars
                            />
                        </ScrollView>
                    )}
                </Card.Content>
            </Card>

            {user && user.role === "ADMIN" && (
                <Card style={[styles.chartCard, { marginTop: 15 }]} mode="outlined">
                    <Card.Content>
                        <Title style={styles.subTitle}>Xu hướng đăng ký mới</Title>
                        {loading ? <ActivityIndicator style={{ height: 220 }} color="#F59E0B" /> : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <LineChart
                                    data={enrollmentChartData}
                                    width={Math.max(width - 64, enrollmentData.length * 50)}
                                    height={220}
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                                    }}
                                    style={styles.chart}
                                    bezier
                                    fromZero
                                />
                            </ScrollView>
                        )}
                    </Card.Content>
                </Card>
            )}

            <Title style={[styles.subTitle, { marginTop: 20, marginLeft: 16 }]}>Chi tiết khóa học</Title>
            <Searchbar
                placeholder="Tìm khóa học..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                onSubmitEditing={handleSearch}
                onIconPress={handleSearch}
                style={styles.searchbar}
                elevation={0}
                mode="bar"
            />

            <Card style={[styles.tableCard, { marginBottom: 30 }]} mode="outlined">
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={{ flex: 2 }}>Tên khóa</DataTable.Title>
                        <DataTable.Title numeric style={{ flex: 1 }}>HV</DataTable.Title>
                        <DataTable.Title numeric style={{ flex: 2 }}>Doanh thu</DataTable.Title>
                    </DataTable.Header>

                    {courseStats.length > 0 ? courseStats.map((item) => (
                        <DataTable.Row key={item.id}>
                            <DataTable.Cell style={{ flex: 2 }}>
                                <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '500' }}>
                                    {item.subject}
                                </Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric style={{ flex: 1 }}>
                                {item.student_count}
                            </DataTable.Cell>
                            <DataTable.Cell numeric style={{ flex: 2 }}>
                                <Text style={{ color: PRIMARY_COLOR, fontWeight: 'bold', fontSize: 12 }}>
                                    {item.total_revenue ? parseInt(item.total_revenue).toLocaleString('vi-VN') : 0}
                                </Text>
                            </DataTable.Cell>
                        </DataTable.Row>
                    )) : (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text>Không có dữ liệu</Text>
                        </View>
                    )}

                    <DataTable.Pagination
                        page={page}
                        numberOfPages={Math.ceil(totalItems / PAGE_SIZE)}
                        onPageChange={handlePageChange}
                        label={`${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalItems)} của ${totalItems}`}
                        showFastPaginationControls
                    />
                </DataTable>
            </Card>
        </ScrollView>
    );
};

export default Statistics;