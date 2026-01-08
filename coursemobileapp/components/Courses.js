import {useCallback, useEffect, useState} from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {FlatList} from "react-native";
import Apis, {authApis, endpoints} from "../utils/Apis";
import {List, Searchbar} from "react-native-paper";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import styles, {COLORS} from "../screens/Home/styles";
import {Ionicons} from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import PaymentModal from "../screens/PaymentModal/PaymentModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Courses = ({cate}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState([]);
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

      if (priceRange[0] > 0) {
        url = `${url}&min_price=${priceRange[0]}`;
      }

      if (priceRange[1] > 0) {
        url = `${url}&max_price=${priceRange[1]}`;
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

  const handleChangeMin = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPriceRange([numericValue ? parseInt(numericValue) : 0, priceRange[1]]);
  };

  const handleChangeMax = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPriceRange([priceRange[0], numericValue ? parseInt(numericValue) : 0]);
  };

  const handleReset = () => {
    setPriceRange([0, 100000000]);
  };

  const checkIsEnrolled = async (courseId) => {
    try {
      setEnrolledIds([]);
      let token = await AsyncStorage.getItem("token");
      if (!token) return;
      let res = await authApis(token).get(endpoints["my-courses"]);
      const ids = res.data.map((c) => c.course.id);
      setEnrolledIds(ids);
    } catch (ex) {
      if (ex.response && ex.response.status == 401) {
        console.log("Token bị Server từ chối -> Logout");
        await AsyncStorage.removeItem("token");
      } else {
        console.error(ex);
      }
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      if (page > 0) loadCourses();
    }, 500);

    return () => clearTimeout(timer);
  }, [q, page, cate, priceRange]);

  useEffect(() => {
    setPage(1);
  }, [q, cate, priceRange]);
  const loadMore = () => {
    if (page > 0 && !loading && courses.length > 0) setPage(page + 1);
  };

  useFocusEffect(
    useCallback(() => {
      checkIsEnrolled();
    }, [])
  );
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
          <View style={styles.headerRow}>
            <Text style={styles.priceFilterLabel}>Khoảng giá (VNĐ)</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            {/* Ô INPUT MIN */}
            <View style={styles.inputWrapper}>
              <Text style={styles.subLabel}>Từ</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(priceRange[0])}
                onChangeText={handleChangeMin}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Dấu gạch ngang ở giữa */}
            <Text style={styles.dash}>-</Text>

            {/* Ô INPUT MAX */}
            <View style={styles.inputWrapper}>
              <Text style={styles.subLabel}>Đến</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(priceRange[1])}
                onChangeText={handleChangeMax}
                placeholder="Max"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          {/* Dòng hiển thị kết quả format */}
          <Text style={styles.previewText}>
            {priceRange[0].toLocaleString("vi-VN")} đ —{" "}
            {priceRange[1].toLocaleString("vi-VN")} đ
          </Text>
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
              item.is_free || enrolledIds.includes(item.id)
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
                  {item.is_free ? "Miễn phí" : `${item.price} VNĐ`}
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
