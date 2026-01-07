import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { Title, Searchbar, Divider } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { PRIMARY_COLOR } from './styles';
import UserManagementItem from '../../components/UserManagementItem';

const LecturerManagement = () => {
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');

    const loadLecturers = async (query = '') => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(`${endpoints['users']}?role=LECTURER&q=${query}`);

            const data = res.data.results || res.data;
            setLecturers(data);
        } catch (ex) {
            console.error("Lỗi tải giảng viên:", ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLecturers();
    }, []);

    const onSearch = () => {
        Keyboard.dismiss();
        loadLecturers(q);
    };

    return (
        <View style={[styles.container, { flex: 1, backgroundColor: '#fff' }]}>
            <View style={[styles.header, { padding: 16 }]}>
                <Title style={{ color: PRIMARY_COLOR, marginBottom: 10, fontWeight: 'bold' }}>
                    Quản lý Giảng viên
                </Title>
                <Searchbar
                    placeholder="Tìm giảng viên..."
                    value={q}
                    onChangeText={setQ}
                    onSubmitEditing={onSearch}
                    onIconPress={onSearch}
                    style={[styles.searchbar, { elevation: 1, backgroundColor: '#f9fafb' }]}
                />
            </View>

            {loading ? (
                <ActivityIndicator color={PRIMARY_COLOR} size="large" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={lecturers}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                        <UserManagementItem
                            user={item}
                            primaryColor={PRIMARY_COLOR}
                            icon="school"
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Title style={{ color: '#94a3b8', fontSize: 16 }}>
                                Không tìm thấy giảng viên nào.
                            </Title>
                        </View>
                    }
                    onRefresh={loadLecturers}
                    refreshing={loading}
                />
            )}
        </View>
    );
};

export default LecturerManagement;