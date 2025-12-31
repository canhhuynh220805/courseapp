// screens/Lecturer/StudentProgress.js
import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { List, ProgressBar, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentProgress = ({ route }) => {
    const { courseId } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStudents = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            let res = await authApis(token).get(endpoints['course-students'](courseId)); // Dùng endpoint động
            setStudents(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, [courseId]);

    return (
        <View style={{ flex: 1 }}>
            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> :
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có sinh viên đăng ký.</Text>}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.user.username}
                            description={`Tiến độ: ${item.progress}%`}
                            left={props => <Avatar.Text {...props} size={40} label={item.user.username[0].toUpperCase()} />}
                            right={() => (
                                <View style={styles.progressContainer}>
                                    <ProgressBar progress={item.progress / 100} color="#2563eb" />
                                </View>
                            )}
                            style={styles.listItem}
                        />
                    )}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: { width: 100, justifyContent: 'center' },
    listItem: { borderBottomWidth: 1, borderBottomColor: '#eee' }
});

export default StudentProgress;