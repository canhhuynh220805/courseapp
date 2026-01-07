import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import {Alert} from "react-native";
export const MoMoStrategy = {
  async pay(authApis, endpoints, token, enrollmentId) {
    console.info("--> Đang xử lý thanh toán MoMo...");
    let resEnroll = await authApis(token).post(endpoints["momo-payment"], {
      enrollment_id: enrollmentId,
    });
    console.log(resEnroll.data);
    if (resEnroll.data) {
      // let enrollId = resEnroll.data.id;
      let resMOMO = await authApis(token).post(endpoints["momo-payment"], {
        enrollment_id: enrollmentId,
      });
      if (resMOMO.data.payUrl) {
        await AsyncStorage.setItem("current_payment_id", String(enrollmentId));
        Linking.openURL(resMOMO.data.payUrl);
      } else {
        Alert.alert("Thành công", "Bạn đã vào học được rồi!");
      }
    } else {
      Alert.alert("Lỗi", "Không lấy được link thanh toán MoMo");
    }
  },
};

// 2. Chiến lược thanh toán ZaloPay (Ví dụ để bạn thấy sự linh hoạt)
export const ZaloPayStrategy = {
  async pay(authApis, endpoints, token, enrollmentId) {
    console.info("--> Đang xử lý thanh toán ZaloPay...");
    let resEnroll = await authApis(token).post(endpoints["zalo-payment"], {
      enrollment_id: enrollmentId,
    });
    if (resEnroll.data.return_code === 1) {
      const payUrl = resEnroll.data.order_url;
      const appTransId = resEnroll.data.app_trans_id; // Lưu cái này để check

      // 4. Lưu lại ID giao dịch để lát quay lại app thì kiểm tra
      await AsyncStorage.setItem("current_payment_id", String(enrollmentId));

      // 5. Mở ZaloPay (Web hoặc App)
      const supported = await Linking.canOpenURL(payUrl);
      if (supported) {
        await Linking.openURL(payUrl);
      } else {
        Alert.alert("Lỗi", "Không thể mở liên kết thanh toán");
      }
    } else {
      Alert.alert("Thất bại", "Tạo đơn hàng lỗi: " + res.data.return_message);
    }
  },
};

// 3. Chiến lược khóa học Miễn phí (Nếu giá tiền = 0)
export const VNPayStrategy = {
  async pay(authApis, endpoints, token, enrollmentId) {
    try {
      console.info("--> Đang xử lý thanh toán VNPay...");
      let resEnroll = await authApis(token).post(endpoints["vnpay-payment"], {
        enrollment_id: enrollmentId,
      });
      if (resEnroll.data && resEnroll.data.payment_url) {
        const payUrl = resEnroll.data.payment_url;
        console.log("VNPay URL:", payUrl);

        // 3. Lưu ID để lát quay lại App kiểm tra (QUAN TRỌNG)
        // Key này phải khớp với key bạn dùng trong hàm checkPaymentStatus
        await AsyncStorage.setItem("current_payment_id", String(enrollmentId));

        // 4. Mở trình duyệt web để thanh toán
        const supported = await Linking.canOpenURL(payUrl);
        if (supported) {
          await Linking.openURL(payUrl);
        } else {
          Alert.alert("Lỗi", "Thiết bị không hỗ trợ mở liên kết này.");
        }
      } else {
        Alert.alert("Lỗi", "Không lấy được đường dẫn thanh toán.");
      }
    } catch (error) {
      console.error("Lỗi VNPay Strategy:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi kết nối tới cổng thanh toán.");
    }
  },
};

const MaintenanceStrategy = {
  pay: async () => {
    Alert.alert(
      "Thông báo",
      "Phương thức thanh toán này đang bảo trì. Vui lòng quay lại sau."
    );
  },
};
