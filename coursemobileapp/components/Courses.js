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
import {Ionicons} from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import PaymentModal from "../screens/PaymentModal/PaymentModal";

const Courses = ({cate}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const nav = useNavigation();

  const handleRegisterCourse = (course) => {
    setSelectedCourse(course);
    setPaymentModalVisible(true);
  };
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
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowPriceFilter(!showPriceFilter)}
          >
            <Ionicons name="options" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>
      {showPriceFilter && (
        <View style={styles.priceFilterContainer}>
          <Text style={styles.priceFilterLabel}>
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>$0</Text>
            <Slider
              style={[styles.slider, {width: 100}]}
              minimumValue={0}
              maximumValue={100000000}
              value={priceRange[1]}
              onValueChange={(value) => setPriceRange([0, Math.round(value)])}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#3b82f6"
            />
            <Text style={styles.sliderValue}>$100000000</Text>
          </View>
        </View>
      )}
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
            // onPress={() => nav.navigate("Lesson", {courseId: item.id})}
            onPress={() =>
              item.is_free
                ? nav.navigate("Lesson", {courseId: item.id})
                : handleRegisterCourse(item)
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
                {item.description || "Chưa có mô tả cho khóa học này."}
              </Text>

              <View style={styles.courseFooter}>
                <View style={styles.levelBadge}>
                  {item.is_free ? (
                    <Text style={styles.levelBadgeText}>
                      Giảng viên: {item.lecturer?.last_name}
                      {item.lecturer?.first_name}
                    </Text>
                  ) : (
                    <Text style={styles.levelBadgeText}>
                      Giảng viên: {item.lecturer?.last_name}
                      {item.lecturer?.first_name}
                    </Text>
                  )}
                </View>
                <Text style={styles.coursePrice}>
                  {item.price == 0 ? "Miễn phí" : `${item.price} VNĐ`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        course={selectedCourse}
      />
    </View>
  );
};

export default Courses;
