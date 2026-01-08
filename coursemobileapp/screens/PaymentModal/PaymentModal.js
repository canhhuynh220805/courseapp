import React, {useContext, useState} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Linking from "expo-linking";
import {Ionicons} from "@expo/vector-icons";
import styles from "./styles";
import Apis, {authApis, endpoints} from "../../utils/Apis";
import {MyUserContext} from "../../utils/contexts/MyContext";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {MoMoStrategy, VNPayStrategy, ZaloPayStrategy} from "./PaymentStrategy";

function PaymentModal({visible, onClose, course}) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user] = useContext(MyUserContext);
  const nav = useNavigation();
  const PAYMENT_STRATEGIES = {
    momo: MoMoStrategy,
    zalopay: ZaloPayStrategy, // Gán tạm vào bảo trì
    vnpay: VNPayStrategy, // Gán tạm vào bảo trì
  };
  const paymentMethods = [
    {id: "momo", name: "MoMo", icon: "wallet"},
    {id: "zalopay", name: "ZaloPay", icon: "card"},
    {id: "vnpay", name: "VNPay", icon: "qr-code"},
  ];

  const handlePayment = async (PaymentStrategy) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      let resEnroll = await authApis(token).post(
        endpoints["enroll-course"](course.id)
      );
      if (resEnroll.data.status === "PENDING") {
        if (PaymentStrategy && typeof PaymentStrategy.pay === "function") {
          await PaymentStrategy.pay(
            authApis,
            endpoints,
            token,
            resEnroll.data.id
          );
        } else {
          console.warn("Không tìm thấy chiến lược thanh toán phù hợp");
        }
      } else {
        Alert.alert("Thông báo", "Bạn đã sở hữu khóa học này rồi!");
      }
    } catch (ex) {
      if (ex.response) {
        console.error(
          "❌ LỖI TỪ SERVER:",
          JSON.stringify(ex.response.data, null, 2)
        );
      } else {
        console.error("❌ LỖI KHÁC:", ex);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPayment) {
      setLoading(true);
      const strategy = PAYMENT_STRATEGIES[selectedPayment];
      handlePayment(strategy);
    }
  };

  const handleCancel = () => {
    if (loading) {
      Alert.alert("Thông báo", "Giao dịch đang xử lý, không thể hủy lúc này.");
      return;
    }
    onClose();
    setSelectedPayment(null);
  };

  if (!course) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent // Giúp modal đè lên cả thanh trạng thái Android
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Handle Bar - Thanh gạch ngang trang trí */}
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Checkout</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Course Info Card - Giao diện thẻ bài */}
          <View style={styles.courseInfoCard}>
            {/* Nếu có ảnh thì hiện, không thì hiện icon mặc định */}
            {course.image ? (
              <Image source={{uri: course.image}} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Ionicons name="book" size={32} color="#FFF" />
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Payment for Course</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {course.subject}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.cardPrice}>
                  {course.price == 0 ? "Free" : `${course.price} VNĐ`}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => {
              const isActive = selectedPayment === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  activeOpacity={0.7}
                  style={[
                    styles.paymentOption,
                    isActive && styles.paymentOptionActive,
                  ]}
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <View
                    style={[
                      styles.paymentIconContainer,
                      isActive && styles.paymentIconActive,
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={24}
                      color={isActive ? "#FFFFFF" : "#6B7280"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentName,
                      isActive && styles.paymentNameActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                  <View style={styles.radioButton}>
                    {isActive && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            {user === null ? (
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!selectedPayment || loading) && styles.confirmButtonDisabled,
                ]}
                onPress={() => nav.navigate("Auth", {screen: "Login"})}
              >
                <Text style={[styles.confirmButtonText, {textAlign: "center"}]}>
                  Đăng nhập để thanh toán
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!selectedPayment || loading) && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedPayment || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.confirmButtonText}>
                      Thanh toán ngay
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="#FFF"
                      style={{marginLeft: 8}}
                    />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default PaymentModal;
