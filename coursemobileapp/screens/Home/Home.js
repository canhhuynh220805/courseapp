import React, { useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Chip } from "react-native-paper";
import Categories from "../../components/Categories";
import Courses from "../../components/Courses";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";
import styles from "./styles";

const Home = () => {
  const [cate, setCate] = useState(null);
  const [ordering, setOrdering] = useState("newest");

  const sortOptions = [
    { label: "Mới nhất", value: "newest" },
    { label: "Phổ biến", value: "popular" },
    { label: "Giá thấp", value: "price_asc" },
    { label: "Giá cao", value: "price_desc" },
  ];

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp >= Date.now() / 1000;
    } catch (error) {
      return false;
    }
  };

  const checkPaymentStatus = async () => {
    const pendingEnrollId = await AsyncStorage.getItem("current_payment_id");
    if (pendingEnrollId) {
      console.log("Tìm thấy giao dịch treo, đang kiểm tra...", pendingEnrollId);
      try {
        let token = await AsyncStorage.getItem("token");
        if (!isTokenValid(token)) {
          await AsyncStorage.removeItem("token");
          return;
        }
        let res = await authApis(token).get(endpoints["my-courses"]);
        let isSuccess = res.data.find(
          (c) => String(c.course.id) === String(pendingEnrollId)
        );
        if (isSuccess && isSuccess.status === "ACTIVE") {
          Alert.alert("Thanh toán thành công!", "Khóa học đã được kích hoạt.");
          await AsyncStorage.removeItem("current_payment_id");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkPaymentStatus();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Categories setCate={setCate} activeCate={cate} />

      <View style={{ backgroundColor: "#fff" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            alignItems: 'center'
          }}
        >
          {sortOptions.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setOrdering(item.value)}
              activeOpacity={0.8}
            >
              <Chip
                mode="flat"
                selected={ordering === item.value}
                style={{
                  marginRight: 10,
                  backgroundColor: ordering === item.value ? "#2563eb" : "#f0f0f0",
                  height: 36,
                }}
                textStyle={{
                  color: ordering === item.value ? "#fff" : "#333",
                  fontSize: 13,
                }}
              >
                {item.label}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Courses cate={cate} ordering={ordering} />
    </View>
  );
};

export default Home;