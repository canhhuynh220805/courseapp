import {useEffect, useState} from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {FlatList} from "react-native";
import Apis, {endpoints} from "../utils/Apis";
import {List, Searchbar} from "react-native-paper";
import {useNavigation} from "@react-navigation/native";
import styles from "../screens/Home/styles";

const Courses = ({cate}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const nav = useNavigation();

  const loadCourses = async () => {
    try {
      setLoading(true);

      let url = `${endpoints["courses"]}?page=${page}`;

      if (q) {
        url = `${url}&q=${q}`;
      }

      if (cate) {
        url = `${url}&category_id=${cate}`;
      }

      console.info(url);

      let res = await Apis.get(url);

      if (res.data.next === null) setPage(0);

      if (page === 1) setCourses(res.data.results);
      else if (page > 1) setCourses([...courses, ...res.data.results]);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      if (page > 0) loadCourses();
    }, 500);

    return () => clearTimeout(timer);
  }, [q, page, cate]);

  useEffect(() => {
    setPage(1);
  }, [q, cate]);

  const loadMore = () => {
    if (page > 0 && !loading) setPage(page + 1);
  };

  return (
    <View style={[styles.container, {flex: 1}]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Tìm khóa học..."
            value={q}
            onChangeText={setQ}
            style={{elevation: 0, backgroundColor: "transparent", flex: 1}}
            inputStyle={styles.searchInput}
            iconColor="#6b7280"
          />
        </View>
      </View>
      <FlatList
        style={{flex: 1}}
        contentContainerStyle={styles.courseList}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          loading && (
            <ActivityIndicator
              size="large"
              color="#2563eb"
              style={{margin: 16}}
            />
          )
        }
        onEndReached={loadMore}
        data={courses}
        renderItem={({item}) => (
          /* KHÔNG dùng List.Item ở đây nữa */
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => nav.navigate("Lesson", {courseId: item.id})}
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
                {item.description || "Chưa có mô tả cho khóa học này."}
              </Text>

              <View style={styles.courseFooter}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Cơ bản</Text>
                </View>
                <Text style={styles.coursePrice}>
                  {item.price == 0 ? "Miễn phí" : `${item.price} VNĐ`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Courses;
