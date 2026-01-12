import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
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
  FlatList,
  Alert,
  useWindowDimensions,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import styles, {COLORS} from "./styles";
import Apis, {authApis, endpoints} from "../../utils/Apis";
import {MyUserContext} from "../../utils/contexts/MyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import moment from "moment";
import "moment/locale/vi";
import {useAlert} from "../../utils/contexts/AlertContext";
import RenderHTML from "react-native-render-html";
function LessonDetail({route}) {
  const lessonId = route.params?.lessonId;
  const courseId = route.params?.courseId;
  const [lesson, setLesson] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [isMarked, setIsMarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [user] = useContext(MyUserContext);
  const [page, setPage] = useState(1);
  const showAlert = useAlert();
  const {width} = useWindowDimensions();
  const nav = useNavigation();
  const contentWidth = width - 64;

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2]?.length === 11 ? match[2] : null;
  };

  const onStateChange = useCallback(
    (state) => {
      if (state === "ended") {
        setPlaying(false);
        markLessonComplete();
      }
    },
    [lessonId]
  );

  const markLessonComplete = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      let res = await authApis(token).post(
        endpoints["mark-lesson-complete"](lessonId)
      );
      console.info("Mark complete response:", res.data);
      if (res.status === 200) {
        showAlert("Thông báo", "Bạn đã hoàn thành bài học này!", "success");
      }
    } catch (ex) {
      console.error(ex);
      if (ex.response && ex.response.data && ex.response.data.error) {
        Alert.alert("Thông báo", ex.response.data.error);
      }
    }
  };

  const hasEndReached = () => {
    if (hasNext) {
      console.log("Load thêm comment...");
      loadMore();
    }

    if (!lesson?.video && !isMarked) {
      console.log("Đã cuộn tới cuối, đánh dấu học xong!");
      markLessonComplete();
      setIsMarked(true);
    }
  };

  const handleLike = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      let res = await authApis(token).post(endpoints["like-lesson"](lessonId));
      setLikeCount(res.data.like_counts);
      setIsLiked(res.data.liked);
    } catch (ex) {
      console.error(ex);
    }
  };

  const loadLesson = async () => {
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem("token");
      let res = null;
      if (token)
        res = await authApis(token).get(endpoints["lesson-detail"](lessonId));
      else res = await Apis.get(endpoints["lesson-detail"](lessonId));
      setLesson(res.data);
      setLikeCount(res.data.like_counts);
      setIsLiked(res.data.liked);
      if (!res.data.video && !isMarked) {
        if (token) {
          console.log("Đã cuộn tới cuối, đánh dấu học xong!");
          markLessonComplete();
          setIsMarked(true);
        }
      }
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
      let url = `${endpoints["comments"](lessonId)}?page=${page}`;
      let res = await Apis.get(url);
      // if (res.data.next === null) setPage(0);
      if (!res.data.next) {
        setHasNext(false); // Backend bảo hết trang rồi -> Khóa lại
      } else {
        setHasNext(true); // Vẫn còn trang sau -> Mở khóa
      }
      if (page === 1) setComments(res.data.results);
      else if (page > 1) setComments((prev) => [...prev, ...res.data.results]);
    } catch (ex) {
      if (ex.response && ex.response.status === 404 && page > 1) {
        setHasNext(false); // Khóa lại để không gọi nữa
        console.log("Đã tải hết comment (End of list)."); // Log nhẹ nhàng thôi
      } else {
        // Những lỗi khác (500, mất mạng...) thì mới in đỏ
        console.error("Lỗi tải comment:", ex);
      }
    }
  };

  const addComment = async () => {
    if (!content.trim()) return;
    try {
      if (!content) {
        showAlert("Lỗi", "Nội dung bình luận không được để trống.", "error");
        return;
      }
      let token = await AsyncStorage.getItem("token");
      let res = await authApis(token).post(endpoints["add-comment"](lessonId), {
        content: content,
      });
      setComments((prev) => [...prev, ...res.data.results]);
      setContent("");
    } catch (ex) {
      console.error(ex);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setPage(1);
      setComments([]);
      setHasNext(true);
      loadComments();
    }, [lessonId])
  );

  useEffect(() => {
    checkEnrollment();
    loadLesson();
  }, [user, courseId]);

  useEffect(() => {
    let timer = setTimeout(() => {
      if (page > 0) loadComments();
    }, 500);

    return () => clearTimeout(timer);
  }, [lessonId, page]);
  const loadMore = () => {
    if (page > 0 && !loading && hasNext) setPage(page + 1);
  };
  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator size="large" color="blue" />}

      {lesson && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            // 1. Header chứa Video + Input
            ListHeaderComponent={
              <View>
                <View style={styles.titleSection}>
                  <View style={styles.infoCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={{flex: 1}}>
                        <Text style={styles.subjectLabel}>BÀI HỌC</Text>
                        <Text style={styles.cardTitle}>{lesson?.subject}</Text>
                      </View>
                      <View style={styles.iconCircle}>
                        <Text style={{fontSize: 24}}>📚</Text>
                      </View>
                    </View>
                    <View style={styles.cardDivider} />
                    <View style={styles.metaRow}>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>
                          Thời lượng học: ⏱ {lesson?.duration} phút
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.videoSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="play-circle" size={24} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Video bài học</Text>
                  </View>

                  {/* Logic: Nếu chưa đăng nhập HOẶC chưa đăng ký thì hiện khóa */}
                  {user === null || !isEnrolled ? (
                    <View>
                      <View style={styles.videoPlayer}>
                        <View style={styles.videoPlaceholder}>
                          <Ionicons
                            name="lock-closed"
                            size={40}
                            color="#ffffff"
                          />
                          <Text
                            style={[
                              styles.videoNote,
                              {color: "white", marginTop: 10},
                            ]}
                          >
                            Nội dung bị khóa
                          </Text>
                        </View>
                      </View>

                      <View style={styles.registerSection}>
                        <Text style={styles.registerHint}>
                          Bạn cần đăng ký khóa học để xem nội dung này
                        </Text>

                        <TouchableOpacity
                          style={styles.registerButton}
                          activeOpacity={0.8}
                          onPress={() =>
                            user === null
                              ? nav.navigate("Auth", {
                                  screen: "Login",
                                  params: {
                                    next: "Main",

                                    nextParams: {
                                      screen: "LessonDetail",
                                      params: {
                                        lessonId: lessonId,
                                        courseId: courseId,
                                      },
                                    },
                                  },
                                })
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
                            {user === null
                              ? "ĐĂNG NHẬP NGAY"
                              : "ĐĂNG KÝ HỌC NGAY"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    /* Logic: Đã đăng ký thì hiện Video */
                    <View style={styles.videoPlayerContainer}>
                      {lesson.video && getYouTubeId(lesson.video) ? (
                        <YoutubePlayer
                          height={220}
                          play={playing}
                          videoId={getYouTubeId(lesson.video)}
                          onChangeState={onStateChange}
                        />
                      ) : (
                        <View style={styles.noVideoContainer}>
                          <Ionicons
                            name="videocam-off-outline"
                            size={48}
                            color="#d1d5db"
                          />
                          <Text style={styles.noVideoText}>
                            Bài học này không có video
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.infoCard}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.subjectLabel}>NỘI DUNG BÀI HỌC</Text>
                      <Text style={[styles.cardTitle, {fontSize: 18}]}>
                        Lý thuyết
                      </Text>
                    </View>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name="book-outline"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                  </View>
                  <View style={styles.cardDivider} />
                  <RenderHTML
                    contentWidth={contentWidth}
                    source={{html: lesson.content}}
                    tagsStyles={styles}
                    systemFonts={["System", "Roboto", "Arial"]}
                  />
                </View>
                <View style={styles.commentSection}>
                  <View
                    style={[
                      styles.sectionHeader,
                      {justifyContent: "space-between"},
                    ]}
                  >
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Ionicons name="chatbubbles" size={24} color="#3b82f6" />
                      <Text style={styles.sectionTitle}>
                        Bình luận ({comments.length})
                      </Text>
                    </View>
                    <View style={styles.interactionContainer}>
                      <TouchableOpacity
                        style={[
                          styles.likeButton,
                          isLiked && styles.likeButtonActive,
                        ]}
                        onPress={() =>
                          user == null
                            ? nav.navigate("Auth", {screen: "Login"})
                            : handleLike()
                        }
                      >
                        <Ionicons
                          name={isLiked ? "heart" : "heart-outline"}
                          size={24} // Giảm size chút cho vừa vặn
                          color={isLiked ? "#ef4444" : "#6b7280"}
                        />
                      </TouchableOpacity>
                      <View style={styles.likeCountContainer}>
                        <Text style={styles.likeCountText}>
                          {likeCount} yêu thích
                        </Text>
                      </View>
                    </View>
                  </View>

                  {user === null ? (
                    <TouchableOpacity
                      style={[styles.registerButton, {marginBottom: 16}]}
                      activeOpacity={0.8}
                      onPress={() =>
                        nav.navigate("Auth", {
                          screen: "Login",
                          params: {
                            next: "Main",

                            nextParams: {
                              screen: "LessonDetail",
                              params: {
                                lessonId: lessonId,
                                courseId: courseId,
                              },
                            },
                          },
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.loginPromptText,
                          {textAlign: "center", color: "#FFF"},
                        ]}
                      >
                        Đăng nhập để bình luận
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.addCommentContainer}>
                      <Image
                        source={{
                          uri:
                            user?.avatar || "https://via.placeholder.com/100",
                        }}
                        style={styles.userAvatar}
                      />
                      <View style={styles.commentInputContainer}>
                        <TextInput
                          style={styles.commentInput}
                          placeholder="Viết bình luận..."
                          placeholderTextColor="#9ca3af"
                          value={content}
                          onChangeText={setContent}
                          multiline
                        />
                        <TouchableOpacity
                          style={styles.postButton}
                          onPress={addComment}
                        >
                          <Ionicons name="send" size={20} color="#3b82f6" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            }
            // 2. Render từng comment
            renderItem={({item}) => (
              <View style={styles.commentItem}>
                <Image
                  source={{
                    uri: item.user.image || "https://via.placeholder.com/100",
                  }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>
                      {item.user.username}
                    </Text>
                    <Text style={styles.commentTimestamp}>
                      {moment(item.created_date).fromNow()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{item.content}</Text>
                </View>
              </View>
            )}
            // 3. Logic Load More
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            // 4. Footer Loading (khi cuộn xuống dưới)
            ListFooterComponent={
              loading && page > 1 ? (
                <ActivityIndicator
                  size="small"
                  color="blue"
                  style={{margin: 10}}
                />
              ) : null
            }
            // 5. Empty State (Nếu chưa có cmt)
            ListEmptyComponent={
              !loading && (
                <Text
                  style={{
                    textAlign: "center",
                    color: "gray",
                    marginTop: 20,
                    marginBottom: 50,
                  }}
                >
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </Text>
              )
            }
            // 6. Style cho list
            contentContainerStyle={{paddingBottom: 20}}
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default LessonDetail;
