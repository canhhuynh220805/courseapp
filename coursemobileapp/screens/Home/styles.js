import {StyleSheet} from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
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
    color: "#111827",
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#2563eb",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  courseList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
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
    color: "#111827",
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
