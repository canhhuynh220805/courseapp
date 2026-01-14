import {useCallback, useEffect, useState} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Apis, {authApis, endpoints} from "../../utils/Apis";
import UserCourseStyle from "./UserCourseStyle";
import {TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {set} from "ramda";
function UserCourse() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [page, setPage] = useState(1);
  const nav = useNavigation();
  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["my-courses"]}?page=${page}`;
      if (q) url = `${url}&q=${q}`;
      let token = await AsyncStorage.getItem("token");
      if (!token) return;
      let res = await authApis(token).get(url);
      setCount(res.data.count);
      if (page === 1) setEnrolledCourses(res.data.results);
      else if (page > 1)
        setEnrolledCourses([...enrolledCourses, ...res.data.results]);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        setNextPage(null);
      } else {
        console.error("lỗi", ex);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let timer = setTimeout(() => {
        if (page > 0) loadEnrolledCourses();
      }, 500);
      return () => clearTimeout(timer);
    }, [q, page])
  );

  useEffect(() => {
    setPage(1);
    setNextPage(null);
    setEnrolledCourses([]);
  }, [q]);

  const loadMore = () => {
    if (page > 0 && !loading && enrolledCourses.length > 0 && nextPage)
      setPage(page + 1);
  };

  return (
    <View style={UserCourseStyle.container}>
      <View style={UserCourseStyle.header}>
        <View style={UserCourseStyle.headerTop}>
          <Text style={UserCourseStyle.headerTitle}>My Courses</Text>
        </View>
        <Text style={UserCourseStyle.headerSubtitle}>
          {count} {count === 1 ? "course" : "courses"} enrolled
        </Text>
      </View>
      <View style={UserCourseStyle.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9ca3af"
          style={UserCourseStyle.searchIcon}
        />
        <TextInput
          style={UserCourseStyle.searchInput}
          value={q}
          onChangeText={setQ}
          placeholder="Search your courses..."
          placeholderTextColor="#9ca3af"
        />
      </View>
      {loading && enrolledCourses.length === 0 && (
        <View style={{position: "absolute", top: "50%", left: 0, right: 0}}>
          <ActivityIndicator size="large" color="blue" />
        </View>
      )}
      <FlatList
        style={[UserCourseStyle.scrollView, UserCourseStyle.container]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={UserCourseStyle.scrollContent}
        keyExtractor={(item) => item.id.toString()}
        data={enrolledCourses}
        renderItem={({item}) => (
          <View key={item.id} style={UserCourseStyle.courseCard}>
            {/* Course Thumbnail */}
            <Image
              source={{uri: item.course.image}}
              style={UserCourseStyle.courseThumbnail}
            />

            {/* Course Info */}
            <View style={UserCourseStyle.courseInfo}>
              <Text style={UserCourseStyle.courseTitle} numberOfLines={2}>
                {item.course.subject}
              </Text>
              <Text style={UserCourseStyle.courseDescription} numberOfLines={2}>
                {item.course.description}
              </Text>

              {/* Progress Section */}
              <View style={UserCourseStyle.progressSection}>
                <View style={UserCourseStyle.progressHeader}>
                  <Text style={UserCourseStyle.progressText}>
                    {item.progress}% completed
                  </Text>
                </View>
                <View style={UserCourseStyle.progressBarContainer}>
                  <View
                    style={[
                      UserCourseStyle.progressBar,
                      {width: `${item.progress}%`},
                    ]}
                  />
                </View>
              </View>
              <TouchableOpacity
                disabled={loading}
                style={UserCourseStyle.continueButton}
                onPress={() =>
                  nav.navigate("Lesson", {courseId: item.course.id})
                }
              >
                <Text style={UserCourseStyle.continueButtonText}>
                  Continue Learning
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={UserCourseStyle.noResults}>
              <Ionicons name="search-outline" size={64} color="#d1d5db" />
              <Text style={UserCourseStyle.noResultsText}>
                No courses found
              </Text>
              <Text style={UserCourseStyle.noResultsSubtext}>
                Try searching with different keywords
              </Text>
            </View>
          )
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="small"
              color="blue"
              style={{marginVertical: 20}}
            />
          ) : null
        }
      />
    </View>
  );
}

export default UserCourse;
