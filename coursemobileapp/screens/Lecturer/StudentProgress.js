import React, { useEffect, useState, useContext } from 'react';
import { FlatList, View } from 'react-native';
import { List, ProgressBar, Text, Avatar } from 'react-native-paper';
import { authApis, endpoints } from '../../utils/Apis';
import { MyUserContext } from '../../utils/contexts/MyContext';

const StudentProgress = ({ route }) => {
    const { courseId } = route.params;
    const [user] = useContext(MyUserContext);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const loadStudents = async () => {
            let res = await authApis(user.token).get(endpoints['course-students'](courseId));
            setStudents(res.data); 
        };
        loadStudents();
    }, [courseId]);

    return (
        <FlatList
            data={students}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
                <List.Item
                    title={item.user.username}
                    description={`Tiến độ: ${item.progress}%`}
                    left={props => <Avatar.Text {...props} size={40} label={item.user.username[0]} />}
                    right={() => (
                        <View style={{ width: 100, justifyContent: 'center' }}>
                            <ProgressBar progress={item.progress / 100} color="blue" />
                        </View>
                    )}
                />
            )}
        />
    );
};

export default StudentProgress;