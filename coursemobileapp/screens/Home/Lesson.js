import {useEffect, useEffectEvent, useState} from "react";
import Apis, {endpoints} from "../../utils/Apis";
import {
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import styles from "../Home/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useNavigation} from "@react-navigation/native";

const Lesson = ({route}) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const courseId = route.params?.courseId;
  const nav = useNavigation();
  const loadLessons = async () => {
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem("token");
      let res = await Apis.get(endpoints["lessons"](courseId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLessons(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  return (
    <View style={MyStyles.padding}>
      <FlatList
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        data={lessons}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() =>
              nav.navigate("LessonDetail", {
                lessonId: item.id,
                courseId: courseId,
              })
            }
            activeOpacity={0.9}
          >
            {/* Hình ảnh chiếm trọn phía trên Card */}
            <Image source={{uri: item.image}} style={styles.courseImage} />

            {/* Phần nội dung bên dưới ảnh */}
            <View style={styles.courseContent}>
              <Text style={styles.courseTitle} numberOfLines={1}>
                {item.subject}
              </Text>

              <Text style={styles.courseDescription} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Lesson;
