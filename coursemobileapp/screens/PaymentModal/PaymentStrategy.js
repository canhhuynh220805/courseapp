import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Linking from "expo-linking";
import {Alert} from "react-native";
export const MoMoStrategy = {
  async pay(authApis, endpoints, token, enrollmentId, coursePrice = 0) {
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
  async pay(authApis, endpoints, token, enrollmentId, coursePrice = 0) {
    console.info("--> Đang xử lý thanh toán ZaloPay...");
    // 1. CẤU HÌNH ĐƯỜNG DẪN LOCAL (NGROK)
    // Mỗi lần tắt ngrok bật lại link này sẽ đổi, nhớ cập nhật nhé!
    const LOCAL_BASE_URL =
      "https://nonreparable-torpidly-eufemia.ngrok-free.dev";
    const API_URL = `${LOCAL_BASE_URL}/zalo-pay/create/`;

    try {
      console.log("🚀 Đang gọi Server Local lấy link Zalo:", API_URL);

      // 2. GỌI API SANG NGROK
      // Dùng axios thường, không cần authApis
      let res = await axios.post(API_URL, {
        enrollment_id: enrollmentId,
        amount: coursePrice, // Gửi giá tiền từ App sang
      });

      console.log("✅ Kết quả từ Local:", res.data);

      // 3. MỞ ZALOPAY
      if (res.data.order_url) {
        Linking.openURL(res.data.order_url);
      } else {
        Alert.alert("Lỗi", "Không lấy được link thanh toán");
      }
    } catch (ex) {
      console.error("❌ Lỗi gọi Local Server:", ex);
      Alert.alert("Lỗi", "Không kết nối được với Server thanh toán (Local).");
    }
  },
};

// 3. Chiến lược khóa học Miễn phí (Nếu giá tiền = 0)
export const VNPayStrategy = {
  async pay(authApis, endpoints, token, enrollmentId, coursePrice = 0) {
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
