import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { Title, Searchbar, Divider, Text, Button } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { PRIMARY_COLOR } from './styles';
import UserManagementItem from '../../components/UserManagementItem';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');

    const loadStudents = async (query = '') => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(`${endpoints['users']}?role=STUDENT&q=${query}`);
            setStudents(res.data.results || res.data);
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể tải danh sách học viên.");
        } finally { setLoading(false); }
    };

    const handleUpgrade = (userId, username) => {
        Alert.alert("Xác nhận", `Nâng cấp ${username} thành Giảng viên?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đồng ý", onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await authApis(token).patch(endpoints['grant-lecturer'](userId));
                        Alert.alert("Thành công", "Đã nâng cấp tài khoản.");
                        loadStudents(q);
                    } catch (ex) { Alert.alert("Lỗi", "Thao tác thất bại."); }
                }
            }
        ]);
    };

    useEffect(() => { loadStudents(); }, []);

    const onSearch = () => {
        Keyboard.dismiss();
        loadStudents(q);
    };

    return (
        <View style={[styles.container, { flex: 1, backgroundColor: '#fff' }]}>
            <View style={{ padding: 16 }}>
                <Title style={{ color: PRIMARY_COLOR, fontWeight: 'bold', marginBottom: 10 }}>
                    Quản lý Học viên
                </Title>
                <Searchbar
                    placeholder="Tìm tên học viên..."
                    value={q}
                    onChangeText={setQ}
                    onSubmitEditing={onSearch}
                    onIconPress={onSearch}
                    style={{ elevation: 1, backgroundColor: '#f9fafb' }}
                />
            </View>

            {loading ? (
                <ActivityIndicator color={PRIMARY_COLOR} size="large" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                        <UserManagementItem
                            user={item}
                            primaryColor={PRIMARY_COLOR}
                            rightAction={
                                <Button
                                    mode="contained"
                                    buttonColor={PRIMARY_COLOR}
                                    onPress={() => handleUpgrade(item.id, item.username)}
                                    labelStyle={{ fontSize: 12 }}
                                    style={{ borderRadius: 8 }}
                                >
                                    Nâng cấp
                                </Button>
                            }
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 50, color: '#94a3b8' }}>
                            Không có học viên nào.
                        </Text>
                    }
                    onRefresh={loadStudents}
                    refreshing={loading}
                />
            )}
        </View>
    );
};

export default StudentManagement;