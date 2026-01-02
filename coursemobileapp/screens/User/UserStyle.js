import {StyleSheet, Dimensions} from "react-native";

export default StyleSheet.create({
  // 1. Khung màn hình chính (Nền xám nhạt)
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center", // Căn giữa nội dung theo chiều dọc
  },

  // 2. Thẻ chứa thông tin (Card trắng nổi lên)
  profileCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 24, // Bo tròn nhiều hơn chút cho mềm mại
    padding: 30, // Tăng padding cho thoáng
    alignItems: "center",

    // Đổ bóng (Shadow)
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // 3. Phần Avatar
  avatarContainer: {
    marginBottom: 20,
    // Tạo bóng riêng cho avatar để nổi bật hơn
    shadowColor: "#3b82f6",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 120, // To hơn chút xíu
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#ffffff", // Viền trắng
  },

  // 4. Phần Chữ (Tên & Email)
  userName: {
    fontSize: 24,
    fontWeight: "800", // Chữ đậm hơn
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32, // Khoảng cách tới nút logout
    textAlign: "center",
  },

  // 5. Nút Đăng xuất (Style cũ của bạn nhưng chỉnh lại chút cho cân đối)
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2", // Nền đỏ rất nhạt
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fecdd3", // Viền đỏ nhạt
    width: "100%", // Nút rộng full thẻ card
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e11d48", // Màu chữ đỏ đậm
  },
});
