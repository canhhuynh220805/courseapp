import React, { useEffect, useState } from 'react';
import { FlatList, View, ActivityIndicator, Keyboard } from 'react-native';
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
            setStudents(res.data || []);
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
    const onSearch = () => {
        Keyboard.dismiss();
        loadStudents(searchQuery);
    };

    const renderHeader = () => (
        <View style={{ backgroundColor: '#fff' }}>
            <View style={styles.headerContainer}>
                <Title style={styles.headerTitle}>Tiến độ học tập</Title>
                <Caption style={styles.headerSubtitle}>{courseName || "Chi tiết khóa học"}</Caption>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff' }}>
                <Searchbar
                    placeholder="Tìm tên học viên..."
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    onIconPress={onSearch}
                    onSubmitEditing={onSearch}
                    style={{ elevation: 0, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
                />
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { flex: 1, backgroundColor: '#fff' }]}>
            {loading && students.length === 0 ? (
                <View style={[styles.centered, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator color={PRIMARY_COLOR} size="large" />
                </View>
            ) : (
                <FlatList
                    data={students}
                    ListHeaderComponent={renderHeader}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { textAlign: 'center', marginTop: 20 }]}>
                            {searchQuery ? "Không tìm thấy học viên phù hợp." : "Chưa có sinh viên đăng ký khóa học này."}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.studentItem, {
                            flexDirection: 'row',
                            padding: 16,
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }]}>
                            <View style={[styles.leftContent, { flexDirection: 'row', alignItems: 'center', flex: 1 }]}>
                                {item.user.avatar ? (
                                    <Avatar.Image size={48} source={{ uri: item.user.avatar }} />
                                ) : (
                                    <Avatar.Text
                                        size={48}
                                        label={item.user.username?.[0]?.toUpperCase() || "?"}
                                        style={{ backgroundColor: '#dbeafe' }}
                                        color={PRIMARY_COLOR}
                                    />
                                )}
                                <View style={[styles.info, { marginLeft: 12, flex: 1 }]}>
                                    <Text style={[styles.username, { fontWeight: 'bold', fontSize: 15 }]} numberOfLines={1}>
                                        {item.user.username}
                                    </Text>
                                    <Caption numberOfLines={1}>{item.user.email || "Không có email"}</Caption>
                                </View>
                            </View>

                            <View style={[styles.rightContent, { width: 100, marginLeft: 10 }]}>
                                <View style={[styles.progressLabelContainer, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }]}>
                                    <Text style={[styles.progressLabel, { fontSize: 12, color: '#64748b' }]}>Tiến độ</Text>
                                    <Text style={[styles.progressValue, { fontSize: 12, fontWeight: 'bold', color: PRIMARY_COLOR }]}>
                                        {item.progress}%
                                    </Text>
                                </View>
                                <ProgressBar
                                    progress={(item.progress || 0) / 100}
                                    color={PRIMARY_COLOR}
                                    style={[styles.progressBar, { height: 6, borderRadius: 3 }]}
                                />
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