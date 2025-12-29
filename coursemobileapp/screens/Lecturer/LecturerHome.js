import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Icon, ActivityIndicator } from 'react-native-paper';
import { MyUserContext } from '../../utils/contexts/MyContext';
import { authApis, endpoints } from '../../utils/Apis';
import MyStyles from '../../styles/MyStyles';

const LecturerHome = ({ navigation }) => {
    const [user] = useContext(MyUserContext);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            let res = await authApis(user.token).get(endpoints['course-stats']);
            setStats(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStats(); }, []);

    const renderItem = ({ item }) => (
        <Card style={{ margin: 10 }}>
            <Card.Content>
                <Title>{item.subject}</Title>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Paragraph>Học viên: {item.student_count}</Paragraph>
                    <Paragraph>Doanh thu: {item.total_revenue} VNĐ</Paragraph>
                </View>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => navigation.navigate("StudentProgress", { courseId: item.id })}>
                    Tiến độ SV
                </Button>
                <Button onPress={() => navigation.navigate("AddLesson", { courseId: item.id })}>
                    Thêm Bài Học
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={{ flex: 1 }}>
            <Button mode="contained" icon="plus" style={{ margin: 10 }} 
                    onPress={() => navigation.navigate("AddCourse")}>
                Tạo khóa học mới
            </Button>
            {loading ? <ActivityIndicator animating={true} /> :
                <FlatList data={stats} keyExtractor={i => i.id.toString()} renderItem={renderItem} />
            }
        </View>
    );
};

export default LecturerHome;