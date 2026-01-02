import {useEffect, useState} from "react";
import {Image, ScrollView, Text, TextInput, View} from "react-native";
import Apis, {endpoints} from "../../utils/Apis";
import UserCourseStyle from "./UserCourseStyle";
import {TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
function UserCourse() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem("token");
      let res = await Apis.get(endpoints["my-courses"], {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.info(res.data);
      setEnrolledCourses(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrolledCourses();
  }, []);
  return (
    <View style={UserCourseStyle.container}>
      <View style={UserCourseStyle.header}>
        <View style={UserCourseStyle.headerTop}>
          <Text style={UserCourseStyle.headerTitle}>My Courses</Text>
          <TouchableOpacity style={UserCourseStyle.filterButton}>
            <Ionicons name="options-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <Text style={UserCourseStyle.headerSubtitle}>
          {enrolledCourses.length}{" "}
          {enrolledCourses.length === 1 ? "course" : "courses"} enrolled
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
          placeholder="Search your courses..."
          placeholderTextColor="#9ca3af"
        />
      </View>
      <ScrollView
        style={[UserCourseStyle.scrollView, UserCourseStyle.container]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={UserCourseStyle.scrollContent}
      >
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((item) => (
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
                <Text
                  style={UserCourseStyle.courseDescription}
                  numberOfLines={2}
                >
                  {item.course.description}
                </Text>

                {/* Progress Section */}
                <View style={UserCourseStyle.progressSection}>
                  <View style={UserCourseStyle.progressHeader}>
                    <Text style={UserCourseStyle.progressText}>
                      {item.progress}% completed
                    </Text>
                    <Text style={UserCourseStyle.lessonCount}>
                      {/* {item.completedLessons}/{item.totalLessons} lessons */}
                      0 lessons
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

                {/* Continue Button */}
                <TouchableOpacity style={UserCourseStyle.continueButton}>
                  <Text style={UserCourseStyle.continueButtonText}>
                    Continue Learning
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={UserCourseStyle.noResults}>
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
            <Text style={UserCourseStyle.noResultsText}>No courses found</Text>
            <Text style={UserCourseStyle.noResultsSubtext}>
              Try searching with different keywords
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default UserCourse;
