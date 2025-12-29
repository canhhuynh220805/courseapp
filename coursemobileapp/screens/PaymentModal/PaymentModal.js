import React, {useState} from "react";
import {Modal, View, Text, TouchableOpacity, Image} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import styles from "./styles";

function PaymentModal({visible, onClose, course}) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const paymentMethods = [
    {id: "momo", name: "MoMo", icon: "wallet"},
    {id: "zalopay", name: "ZaloPay", icon: "card"},
    {id: "paypal", name: "PayPal", icon: "logo-paypal"},
  ];

  const handleConfirm = () => {
    if (selectedPayment) {
      console.log("Payment confirmed:", {course, method: selectedPayment});
      onClose();
      setSelectedPayment(null);
    }
  };

  const handleCancel = () => {
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
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedPayment && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedPayment}
            >
              <Text style={styles.confirmButtonText}>Pay Now</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFF"
                style={{marginLeft: 8}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default PaymentModal;
