import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Avatar, ProgressBar, Text, Divider, Title, Caption, Searchbar } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { PRIMARY_COLOR } from './styles';

const StudentProgress = ({ route }) => {
    const { courseId, courseName } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadStudents = async (q = '') => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            let url = endpoints['course-students'](courseId);
            if (q) {
                url = `${url}?q=${q}`;
            }

            let res = await authApis(token).get(url);
            setStudents(res.data);
        } catch (ex) {
            console.error("Lỗi tải tiến độ sinh viên:", ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, [courseId]);

    const onChangeSearch = query => setSearchQuery(query);
    const onSearch = () => loadStudents(searchQuery);

    const renderHeader = () => (
        <View>
            <View style={styles.headerContainer}>
                <Title style={styles.headerTitle}>Tiến độ học tập</Title>
                <Caption style={styles.headerSubtitle}>{courseName || "Chi tiết khóa học"}</Caption>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#f9fafb' }}>
                <Searchbar
                    placeholder="Tìm tên học viên..."
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    onIconPress={onSearch}
                    onSubmitEditing={onSearch}
                    style={{ elevation: 0, borderWidth: 1, borderColor: '#e5e7eb' }}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && students.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={PRIMARY_COLOR} size="large" />
                </View>
            ) : (
                <FlatList
                    data={students}
                    ListHeaderComponent={renderHeader}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {searchQuery ? "Không tìm thấy học viên phù hợp." : "Chưa có sinh viên đăng ký khóa học này."}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.studentItem}>
                            <View style={styles.leftContent}>
                                {item.user.avatar ? (
                                    <Avatar.Image size={48} source={{ uri: item.user.avatar }} />
                                ) : (
                                    <Avatar.Text size={48} label={item.user.username?.[0]?.toUpperCase()}
                                        style={{ backgroundColor: '#dbeafe' }} color={PRIMARY_COLOR} />
                                )}
                                <View style={styles.info}>
                                    <Text style={styles.username}>{item.user.username}</Text>
                                    <Caption>{item.user.email || "Không có email"}</Caption>
                                </View>
                            </View>

                            <View style={styles.rightContent}>
                                <View style={styles.progressLabelContainer}>
                                    <Text style={styles.progressLabel}>Tiến độ</Text>
                                    <Text style={styles.progressValue}>{item.progress}%</Text>
                                </View>
                                <ProgressBar progress={item.progress / 100} color={PRIMARY_COLOR} style={styles.progressBar} />
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshing={loading}
                    onRefresh={() => loadStudents(searchQuery)}
                />
            )}
        </View>
    );
};

export default StudentProgress;