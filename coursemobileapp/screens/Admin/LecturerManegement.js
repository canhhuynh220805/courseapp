import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { List, Avatar, Title, Searchbar, Text, Divider } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_COLOR = '#2563eb';

const LecturerManagement = () => {
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');

    const loadLecturers = async (query = '') => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(`${endpoints['users']}?role=LECTURER&q=${query}`);
            setLecturers(res.data.results || res.data);
        } catch (ex) { console.error(ex); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadLecturers(); }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title style={{ color: PRIMARY_COLOR }}>Danh sách Giảng viên</Title>
                <Searchbar
                    placeholder="Tìm giảng viên..."
                    value={q}
                    onChangeText={setQ}
                    onSubmitEditing={() => loadLecturers(q)}
                    style={styles.searchbar}
                />
            </View>
            {loading ? <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={lecturers}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={Divider}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.username}
                            description="Giảng viên chính thức"
                            left={p => <Avatar.Icon {...p} size={40} icon="school" style={{ backgroundColor: '#e0e7ff' }} color={PRIMARY_COLOR} />}
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
    searchbar: { elevation: 0, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10 }
});

export default LecturerManagement;