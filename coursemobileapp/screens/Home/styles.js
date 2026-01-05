import {StyleSheet, Dimensions} from "react-native";

// 1. Định nghĩa bảng màu (giống CSS variables)
export const COLORS = {
  primary: "#2563eb",
  primaryLight: "#dbeafe",
  background: "#f9fafb",
  white: "#ffffff",
  textMain: "#111827",
  textSecondary: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  inputBg: "#f3f4f6",
  danger: "#fee2e2",
  success: "#10b981",
};

const {width} = Dimensions.get("window");

export default StyleSheet.create({
  // ==============================
  // COMMON / LAYOUT
  // ==============================
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // ==============================
  // HEADER (Tách ra 2 loại header)
  // ==============================
  // Header cho trang danh sách (Home)
  homeHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // Header cho trang chi tiết (Detail - có nút back)
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10, // Đảm bảo nổi lên trên
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==============================
  // SEARCH & FILTER
  // ==============================
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  filterButton: {
    padding: 4,
  },
  // Slider lọc giá
  priceFilterContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  priceFilterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    width: 30,
  },

  // ==============================
  // COURSE LIST / CARDS
  // ==============================
  courseList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ==============================
  // DETAIL SCREEN / LESSON VIEW
  // ==============================
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  lessonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "flex-end",
    padding: 16,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.9)", // Primary with opacity
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
  contentContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // Title Section trong chi tiết
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBg,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContent: {
    flex: 1,
    marginRight: 12,
  },
  subject: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textMain,
    lineHeight: 32,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  likeButtonActive: {
    backgroundColor: COLORS.danger,
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Video Section
  videoSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  videoPlayer: {
    width: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#1f2937",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  videoUrl: {
    fontSize: 12,
    color: COLORS.textLight,
    paddingHorizontal: 16,
  },
  videoNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  noVideoContainer: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  noVideoText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBg,
  },
  contentText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 28,
  },

  // ==============================
  // COMMENTS SECTION
  // ==============================
  commentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    maxHeight: 100,
    paddingVertical: 4,
  },
  postButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  postButtonDisabled: {
    backgroundColor: COLORS.inputBg,
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },
  commentContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  commentTimestamp: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // ==============================
  // REGISTER BUTTON SECTION
  // ==============================
  registerSection: {
    padding: 20,
    backgroundColor: "#F0F9FF",
    marginHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  registerHint: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    textAlign: "center",
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  inputWrapper: {
    flex: 1, // Để 2 ô co giãn bằng nhau
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border, // Dùng màu viền chuẩn
    backgroundColor: COLORS.white, // Nền trắng
    borderRadius: 12, // Bo góc giống Search
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.textMain, // Màu chữ chuẩn
    textAlign: "center", // Căn giữa số cho đẹp
  },
  dash: {
    marginHorizontal: 10,
    fontSize: 24,
    color: COLORS.textLight,
    marginTop: 18, // Căn chỉnh cho ngang hàng với input
  },
  previewText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.primary, // Dùng màu xanh chủ đạo
    fontWeight: "600",
    textAlign: "center",
  },
  resetText: {
    fontSize: 12,
    color: COLORS.primary, // Màu xanh
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 8, // Tăng vùng bấm cho dễ chạm
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
