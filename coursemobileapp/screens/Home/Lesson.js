import { useEffect, useEffectEvent, useState } from "react";
import Apis, { authApis, endpoints } from "../../utils/Apis";
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
import { useNavigation } from "@react-navigation/native";

const Lesson = ({ route }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const courseId = route.params?.courseId;
  const nav = useNavigation();
  const loadLessons = async () => {
    try {
      setLoading(true);
      let res = await Apis.get(endpoints["lessons"](courseId));
      setLessons(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const loadCourse = async () => {
    try {
      setLoading(true);
      let res = await Apis.get(endpoints["course-details"](courseId));
      setCourse(res.data);
    } catch (ex) { }
  };

  useEffect(() => {
    loadLessons();
    loadCourse();
  }, [courseId]);

  return (
    <View style={MyStyles.padding}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.subjectLabel}>DANH SÁCH BÀI HỌC</Text>
                <Text style={styles.cardTitle}>{course?.subject}</Text>
              </View>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 24 }}>📚</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.metaRow}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>
                  Thời lượng học: ⏱ {course?.duration} phút / {lessons.length}{" "}
                  bài học
                </Text>
              </View>
            </View>
            {course?.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {course?.description}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        data={lessons}
        renderItem={({ item }) => (
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
            <Image
              source={{ uri: item.image || "https://via.placeholder.com/300" }}
              style={styles.courseImage}
            />

            <View style={styles.courseContent}>
              <Text style={styles.courseTitle} numberOfLines={1}>
                {item.subject}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Lesson;
