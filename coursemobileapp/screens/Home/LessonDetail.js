import React, {use, useContext, useEffect, useState} from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native";
import styles from "./styles";
import Apis, {authApis, endpoints} from "../../utils/Apis";
import {MyUserContext} from "../../utils/contexts/MyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useNavigation} from "@react-navigation/native";
import moment from "moment";
import "moment/locale/vi";

function LessonDetail({route, navigation}) {
  const lessonId = route.params?.lessonId;
  const courseId = route.params?.courseId;
  const [lesson, setLesson] = useState();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user] = useContext(MyUserContext);
  const nav = useNavigation();

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setIsLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const loadLesson = async () => {
    try {
      setLoading(true);
      let res = await Apis.get(endpoints["lesson-detail"](lessonId));
      setLesson(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    try {
      let token = await AsyncStorage.getItem("token");
      let res = await authApis(token).get(endpoints["my-courses"]);
      let enrolled = res.data.some((c) => c.course.id == courseId);
      setIsEnrolled(enrolled);
    } catch (ex) {
      console.error(ex);
    } finally {
    }
  };

  const registerCourse = async () => {
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem("token");
      let res = await authApis(token).post(
        endpoints["enroll-course"](courseId),
        null
      );
      if (res.status === 201) {
        setIsEnrolled(true);
      }
    } catch (ex) {
      console.error(ex);
      setIsEnrolled(false);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      let res = await Apis.get(endpoints["comments"](lessonId));
      setComments(res.data);
    } catch (ex) {
      console.error(ex);
    }
  };

  const addComment = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      let res = await authApis(token).post(endpoints["add-comment"](lessonId), {
        content: content,
      });
      setComments([res.data, ...comments]);
      setContent("");
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [lessonId, courseId]);

  useEffect(() => {
    checkEnrollment();
  }, [user]);

  useEffect(() => {
    loadComments();
  }, [comments]);
  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator size="large" color="blue" />}

      {lesson && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Lesson Title and Info */}
            <View style={styles.contentContainer}>
              <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                  <View style={styles.titleContent}>
                    <Text style={styles.subject}>{lesson.subject}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.likeButton,
                      isLiked && styles.likeButtonActive,
                    ]}
                    onPress={handleLike}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={28}
                      color={isLiked ? "#ef4444" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Lesson Meta Info */}
                <View style={styles.metaInfo}>
                  {/* <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{LESSON_DATA.instructor}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{LESSON_DATA.duration}</Text>
                </View> */}
                  <View style={styles.metaItem}>
                    <Ionicons name="heart" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>{likeCount} likes</Text>
                  </View>
                </View>
              </View>

              {/* Video Section */}
              {user === null || !isEnrolled ? (
                <View style={styles.videoSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="play-circle" size={24} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Lesson Video Proxy</Text>
                  </View>
                  {lesson.video ? (
                    <View style={styles.videoPlayer}>
                      <View style={styles.videoPlaceholder}>
                        <TouchableOpacity style={styles.playButton}>
                          <Ionicons name="play" size={40} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.videoUrl} numberOfLines={1}>
                          {lesson.video}
                        </Text>
                      </View>
                      <Text style={styles.videoNote}>
                        Tap to play video (Video player integration required)
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.noVideoContainer}>
                      <Ionicons
                        name="videocam-off-outline"
                        size={48}
                        color="#d1d5db"
                      />
                      <Text style={styles.noVideoText}>
                        No video available for this lesson
                      </Text>
                    </View>
                  )}
                  <View style={styles.registerSection}>
                    <Text style={styles.registerHint}>
                      Bạn cần đăng ký khóa học để xem nội dung này
                    </Text>

                    <TouchableOpacity
                      style={styles.registerButton}
                      activeOpacity={0.8}
                      onPress={() =>
                        user === null
                          ? nav.navigate("Login", {next: "LessonDetail"})
                          : registerCourse()
                      }
                    >
                      <Ionicons
                        name="log-in-outline"
                        size={24}
                        color="#FFF"
                        style={{marginRight: 8}}
                      />
                      <Text style={styles.registerButtonText}>
                        ĐĂNG KÝ HỌC NGAY
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.videoSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="play-circle" size={24} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Lesson Video</Text>
                  </View>
                  {lesson.video ? (
                    <View style={styles.videoPlayer}>
                      <View style={styles.videoPlaceholder}>
                        <TouchableOpacity style={styles.playButton}>
                          <Ionicons name="play" size={40} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.videoUrl} numberOfLines={1}>
                          {lesson.video}
                        </Text>
                      </View>
                      <Text style={styles.videoNote}>
                        Tap to play video (Video player integration required)
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.noVideoContainer}>
                      <Ionicons
                        name="videocam-off-outline"
                        size={48}
                        color="#d1d5db"
                      />
                      <Text style={styles.noVideoText}>
                        No video available for this lesson
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Comment Section */}
              <View style={styles.commentSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="chatbubbles" size={24} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Comments 10</Text>
                </View>

                {/* Add Comment Input */}
                {user === null ? (
                  <TouchableOpacity style={styles.loginPrompt}>
                    <Text
                      style={styles.loginPromptText}
                      onPress={() =>
                        nav.navigate("Login", {next: "LessonDetail"})
                      }
                    >
                      Đăng nhập để bình luận
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.addCommentContainer}>
                    <Image
                      source={{
                        uri:
                          user?.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
                      }}
                      style={styles.userAvatar}
                    />
                    <View style={styles.commentInputContainer}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Write a comment..."
                        placeholderTextColor="#9ca3af"
                        value={content}
                        onChangeText={setContent}
                        multiline
                      />
                      <TouchableOpacity style={[styles.postButton]}>
                        <Ionicons name="send" size={20} onPress={addComment} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image
                      source={{uri: comment.user.image}}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUsername}>
                          {/* {comment.user} */}test
                        </Text>
                        <Text style={styles.commentTimestamp}>
                          {moment(comment.created_date).fromNow()}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  </View>
                ))}

                {/* Show More/Less Button */}
                {/* {comments.length > 3 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAllComments(!showAllComments)}
                    >
                      <Text style={styles.showMoreText}>
                        {showAllComments
                          ? "Show Less"
                          : `View ${comments.length - 3} More Comments`}
                      </Text>
                      <Ionicons
                        name={showAllComments ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#3b82f6"
                      />
                    </TouchableOpacity>
                  )} */}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default LessonDetail;
