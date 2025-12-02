import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { CLIENT_ID, CLIENT_SECRET, endpoints } from "../../utils/Apis";

const Logout = async (nav) => {
  try {
    console.info("Đang đăng xuất khỏi server...");
    const access_token = await AsyncStorage.getItem("access_token");

    if (access_token) {
      const formData = new FormData();
      formData.append("token", access_token);
      formData.append("client_id", CLIENT_ID);
      formData.append("client_secret", CLIENT_SECRET);
      let res = await Apis.post(endpoints["logout"], formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.info("Đã hủy token");
    }
  } catch (ex) {
    console.error("Lỗi khi gọi revoke (nhưng vẫn sẽ logout ở máy):", ex);
  } finally {
    await AsyncStorage.removeItem("access_token");
    if (nav) nav.replace("Login");
  }
};

export default Logout;
