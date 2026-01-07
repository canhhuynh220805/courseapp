import React, { useState } from "react";
import Categories from "../../components/Categories";
import Courses from "../../components/Courses";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../utils/Apis";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";
import { Button } from "react-native-paper";
import { useAlert } from "../../utils/contexts/AlertContext";
const Home = () => {
  const [cate, setCate] = useState();
  const showAlert = useAlert();
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        return false;
      }
      return true;
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
          (c) => String(c.id) === String(pendingEnrollId)
        );
        if (isSuccess && isSuccess.status === "ACTIVE") {
          Alert.alert("Thanh toán thành công!", "Khóa học đã được kích hoạt.");
          await AsyncStorage.removeItem("current_payment_id");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log("Không có giao dịch treo cần kiểm tra.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      checkPaymentStatus();
    }, [])
  );

  return (
    <>
      <Categories setCate={setCate} activeCate={cate} />
      <Courses cate={cate} />
    </>
  );
};

export default Home;
