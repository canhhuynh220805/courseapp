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
import Apis, {endpoints} from "../../utils/Apis";
import {MyUserContext} from "../../utils/contexts/MyContext";
import {useNavigation} from "@react-navigation/native";

function LessonDetail({route, navigation}) {
  const lessonId = route.params?.lessonId;
  const [lesson, setLesson] = useState();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState(100);
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
      console.info(res.data);
      setLesson(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [lessonId]);
  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator size="large" color="blue" />}

      {lesson && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lesson Details</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Lesson Image */}
            {/* <View style={styles.imageContainer}>
            <Image source={{uri: lesson.image}} style={styles.lessonImage} />
          </View> */}

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
                        nav.navigate("Login", {next: "LessonDetails"})
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
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                      />
                      <TouchableOpacity
                        style={[
                          styles.postButton,
                          !newComment.trim() && styles.postButtonDisabled,
                        ]}
                        disabled={!newComment.trim()}
                      >
                        <Ionicons
                          name="send"
                          size={20}
                          color={newComment.trim() ? "#3b82f6" : "#d1d5db"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Comments List */}
                <View style={styles.commentsList}>
                  {/* {displayedComments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Image
                        source={{uri: comment.avatar}}
                        style={styles.commentAvatar}
                      />
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentUsername}>
                            {comment.username}
                          </Text>
                          <Text style={styles.commentTimestamp}>
                            {comment.timestamp}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{comment.text}</Text>
                        <View style={styles.commentActions}>
                          <TouchableOpacity style={styles.commentAction}>
                            <Ionicons
                              name="heart-outline"
                              size={16}
                              color="#6b7280"
                            />
                            <Text style={styles.commentActionText}>Like</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.commentAction}>
                            <Ionicons
                              name="chatbubble-outline"
                              size={16}
                              color="#6b7280"
                            />
                            <Text style={styles.commentActionText}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))} */}

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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default LessonDetail;
