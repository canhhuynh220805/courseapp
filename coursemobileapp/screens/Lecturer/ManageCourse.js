import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, StyleSheet } from 'react-native';
import { List, ProgressBar, Text, FAB, Divider, ActivityIndicator } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageCourse = ({ route, navigation }) => {
    const { course } = route.params;
    const [students, setStudents] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDetail = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const [resStudents, resLessons] = await Promise.all([
                authApis(token).get(endpoints['course-students'](course.id)),
                authApis(token).get(endpoints['lessons'](course.id))
            ]);
            setStudents(resStudents.data);
            setLessons(resLessons.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDetail(); }, [course.id]);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <Text style={styles.sectionTitle}>TIẾN ĐỘ SINH VIÊN ({students.length})</Text>
                {students.map(s => (
                    <List.Item key={s.id} title={s.user.username} description={`${s.progress}% hoàn thành`}
                        right={() => <View style={{ width: 100, justifyContent: 'center' }}><ProgressBar progress={s.progress / 100} /></View>} />
                ))}

                <Divider style={{ marginVertical: 15 }} />

                <Text style={styles.sectionTitle}>DANH SÁCH BÀI HỌC ({lessons.length})</Text>
                {lessons.map(l => (
                    <List.Item key={l.id} title={l.subject} left={props => <List.Icon {...props} icon="book-open" />} />
                ))}
            </ScrollView>

            <FAB style={styles.fab} icon="plus" label="Thêm bài học"
                onPress={() => navigation.navigate("AddLesson", { courseId: course.id })} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#2563eb' }
});

export default ManageCourse;