import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const endpoints = {
  categories: "/categories/",
  courses: "/courses/",
  lessons: (courseId) => `/courses/${courseId}/lessons/`,
  login: "/o/token/",
  register: "/users/",
  "current-user": "/users/current-user/",
  "course-stats": "/stats/course-stats/",
  "general-stats": "/stats/general-stats/",
  "course-students": (courseId) => `/courses/${courseId}/students/`,
  "add-course": "/courses/",
  "course-details": (courseId) => `/courses/${courseId}/`,
  "add-lesson": "/lessons/",
  "lesson-detail": (lessonId) => `/lessons/${lessonId}/`,
  "enroll-course": (courseId) => `/courses/${courseId}/enroll/`,
  "my-courses": "/courses/my-course/",

const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET;

export const authApis = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});

export { CLIENT_ID, CLIENT_SECRET };
