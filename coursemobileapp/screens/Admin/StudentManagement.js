import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { List, Avatar, Button, Divider, Title, Searchbar, Text } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_COLOR = '#2563eb';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');

    const loadStudents = async (query = '') => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            // Gửi tham số role=STUDENT để backend chỉ trả về học viên
            const res = await authApis(token).get(`${endpoints['users']}?role=STUDENT&q=${query}`);
            setStudents(res.data.results || res.data);
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể tải danh sách học viên.");
        } finally { setLoading(false); }
    };

    const handleUpgrade = async (userId, username) => {
        Alert.alert("Xác nhận", `Nâng cấp ${username} thành Giảng viên?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đồng ý", onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await authApis(token).patch(endpoints['grant-lecturer'](userId));
                        Alert.alert("Thành công", "Đã nâng cấp tài khoản.");
                        loadStudents(q); // Tải lại danh sách
                    } catch (ex) { Alert.alert("Lỗi", "Thao tác thất bại."); }
                }
            }
        ]);
    };

    useEffect(() => { loadStudents(); }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title style={{ color: PRIMARY_COLOR }}>Quản lý Học viên</Title>
                <Searchbar
                    placeholder="Tìm tên học viên..."
                    value={q}
                    onChangeText={setQ}
                    onSubmitEditing={() => loadStudents(q)}
                    onIconPress={() => loadStudents(q)}
                    style={styles.searchbar}
                />
            </View>
            {loading ? <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={Divider}
                    ListEmptyComponent={<Text style={styles.empty}>Không có học viên nào.</Text>}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.username}
                            description={item.email || "Chưa có email"}
                            left={p => <Avatar.Text {...p} size={40} label={item.username[0].toUpperCase()} style={{ backgroundColor: '#dbeafe' }} color={PRIMARY_COLOR} />}
                            right={() => (
                                <Button mode="contained" buttonColor={PRIMARY_COLOR} onPress={() => handleUpgrade(item.id, item.username)} style={{ alignSelf: 'center' }}>
                                    Nâng cấp
                                </Button>
                            )}
                        />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 15, backgroundColor: '#f8fafc' },
    searchbar: { elevation: 0, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10, backgroundColor: '#fff' },
    empty: { textAlign: 'center', marginTop: 50, color: 'gray' }
});

export default StudentManagement;