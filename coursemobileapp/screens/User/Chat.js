import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
    List,
    Avatar,
    ActivityIndicator,
    Searchbar,
    Title,
    Divider,
    Text
} from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PRIMARY_COLOR = '#2563eb';

const Chat = ({ navigation }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState(""); // Để tìm kiếm học viên/giảng viên

    const loadContacts = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            // API này tự động trả về đúng đối tượng dựa trên vai trò của bạn
            const res = await authApis(token).get(endpoints['chat-contacts']);
            setContacts(res.data);
        } catch (ex) {
            console.error("Lỗi tải danh sách liên hệ:", ex);
        } finally {
            setLoading(false);
        }
    };

    // Sử dụng useFocusEffect theo phong cách của bạn để cập nhật danh sách khi quay lại tab
    useFocusEffect(
        useCallback(() => {
            loadContacts();
        }, [])
    );

    // Logic tìm kiếm
    const filteredContacts = contacts.filter(c =>
        c.username.toLowerCase().includes(q.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Header đồng bộ với phong cách LecturerHome */}
            <View style={styles.headerAction}>
                <Title style={styles.title}>Tin nhắn</Title>
            </View>

            <Searchbar
                placeholder="Tìm kiếm người dùng..."
                onChangeText={setQ}
                value={q}
                style={styles.searchBar}
                iconColor={PRIMARY_COLOR}
            />

            {loading ? (
                <ActivityIndicator color={PRIMARY_COLOR} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredContacts}
                    keyExtractor={item => item.id.toString()}
                    ItemSeparatorComponent={Divider}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.username}
                            titleStyle={styles.contactName}
                            description={item.email || "Thành viên lớp học"}
                            descriptionStyle={styles.contactDesc}
                            left={() => (
                                <Avatar.Image
                                    size={50}
                                    source={item.avatar ? { uri: item.avatar } : require('../../assets/favicon.png')}
                                    style={styles.avatar}
                                />
                            )}
                            onPress={() => navigation.navigate("ChatDetail", { receiver: item })}
                            right={props => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có ai trong danh sách liên hệ.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16
    },
    headerAction: {
        marginBottom: 15
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827'
    },
    searchBar: {
        marginBottom: 15,
        elevation: 0,
        backgroundColor: '#f3f4f6',
        borderRadius: 10
    },
    contactName: {
        fontWeight: '600',
        fontSize: 16,
        color: '#1f2937'
    },
    contactDesc: {
        color: '#6b7280',
        fontSize: 13
    },
    avatar: {
        backgroundColor: '#f3f4f6'
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center'
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 14
    }
});

export default Chat;