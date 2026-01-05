import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
export const MoMoStrategy = {
  async pay(authApis, endpoints, token, enrollmentId) {
    console.info("--> Đang xử lý thanh toán MoMo...");
    let resEnroll = await authApis(token).post(endpoints["momo-payment"], {
      enrollment_id: enrollmentId,
    });
    if (resEnroll.data.status == "PENDING") {
      let enrollId = resEnroll.data.id;
      let resMOMO = await authApis(token).post(endpoints["momo-payment"], {
        enrollment_id: enrollId,
      });
      if (resMOMO.data.payUrl) {
        await AsyncStorage.setItem("current_payment_id", String(enrollId));
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
    // Logic của ZaloPay có thể khác: Redirect webview chẳng hạn
    // ...
  },
};

// 3. Chiến lược khóa học Miễn phí (Nếu giá tiền = 0)
export const PayPalStrategy = {
  async pay(authApis, endpoints, token, enrollmentId) {
    console.info("--> Đang xử lý thanh toán PayPal...");
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
