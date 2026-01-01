import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ProgressBar, Divider, List, FAB, ActivityIndicator } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#2563eb';

const ManageCourse = ({ route, navigation }) => {
    const { course } = route.params;
    const [students, setStudents] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDetail = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const [resS, resL] = await Promise.all([
                authApis(token).get(endpoints['course-students'](course.id)),
                authApis(token).get(endpoints['lessons'](course.id))
            ]);
            setStudents(resS.data);
            setLessons(resL.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDetail(); }, [course.id]);

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator color={PRIMARY_BLUE} style={{ marginTop: 20 }} /> : (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={styles.sectionHeader}>Tiến độ sinh viên ({students.length})</Text>
                    {students.map(s => (
                        <View key={s.id} style={styles.studentItem}>
                            <View style={styles.studentRow}>
                                <Text style={{ fontWeight: '600' }}>{s.user.username}</Text>
                                <Text style={{ color: PRIMARY_BLUE }}>{s.progress}%</Text>
                            </View>
                            <ProgressBar progress={s.progress / 100} color={PRIMARY_BLUE} style={{ height: 6, borderRadius: 3 }} />
                        </View>
                    ))}

                    <Divider style={{ marginVertical: 25 }} />

                    <Text style={styles.sectionHeader}>Danh sách bài học ({lessons.length})</Text>
                    {lessons.map((l, i) => (
                        <List.Item
                            key={l.id}
                            title={`${i + 1}. ${l.subject}`}
                            left={props => <List.Icon {...props} icon="book-open-outline" />}
                            style={{ paddingLeft: 0 }}
                        />
                    ))}
                </ScrollView>
            )}

            <FAB
                icon="plus"
                label="Thêm bài học"
                style={styles.fab}
                color="white"
                onPress={() => navigation.navigate("AddLesson", { courseId: course.id, courseName: course.subject })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#111827' },
    studentItem: { marginBottom: 15 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: PRIMARY_BLUE }
});

export default ManageCourse;