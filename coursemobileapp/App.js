
import React, { useContext, useEffect, useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import { MyUserContext } from "./utils/contexts/MyContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./utils/firebase";
import Home from "./screens/Home/Home";
import Lesson from "./screens/Home/Lesson";
import LessonDetail from "./screens/Home/LessonDetail";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import User from "./screens/User/User";
import StudentProgress from "./screens/Lecturer/StudentProgress";
import LecturerHome from "./screens/Lecturer/LecturerHome";
import ManageCourse from "./screens/Lecturer/ManageCourse";
import AddCourse from "./screens/Lecturer/AddCourse";
import AddLesson from "./screens/Lecturer/AddLesson";
import UserCourse from "./screens/User/UserCourse";
import Statistics from "./screens/Lecturer/Statistics";
import ChatDetail from "./screens/User/ChatDetail";
import Chat from "./screens/User/Chat";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CourseStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CourseHome"
      component={Home}
      options={{title: "Khóa học"}}
    />
    <Stack.Screen
      name="Lesson"
      component={Lesson}
      options={{title: "Bài học"}}
    />
    <Stack.Screen
      name="LessonDetail"
      component={LessonDetail}
      options={{title: "Chi tiết bài học"}}
    />
  </Stack.Navigator>
);


const UserCourseStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="UserCourseList"
      component={UserCourse}
      options={{title: "Khóa học của tôi"}}
    />
    <Stack.Screen
      name="Lesson"
      component={Lesson}
      options={{title: "Bài học"}}
    />
    <Stack.Screen
      name="LessonDetail"
      component={LessonDetail}
      options={{title: "Chi tiết bài học"}}
    />
  </Stack.Navigator>
);

const LecturerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="LecturerHome" component={LecturerHome} options={{ title: "Quản lý giảng dạy" }} />
    <Stack.Screen name="ManageCourse" component={ManageCourse} options={{ title: "Chi tiết khóa học" }} />
    <Stack.Screen name="AddCourse" component={AddCourse} options={{ title: "Tạo khóa học" }} />
    <Stack.Screen name="AddLesson" component={AddLesson} options={{ title: "Thêm bài học" }} />
    <Stack.Screen name="StudentProgress" component={StudentProgress} options={{ title: "Kết quả học tập" }} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatContacts" component={Chat} options={{ title: "Danh bạ chat" }} />
    <Stack.Screen
      name="ChatDetail"
      component={ChatDetail}
      options={({ route }) => ({ title: route.params?.receiver?.username || "Phòng chat" })}
    />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const [user] = useContext(MyUserContext);
  const [unreadCount, setUnreadCount] = React.useState(0);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "messages"),
        where("receiverId", "==", user.id),
        where("isRead", "==", false)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <Tab.Navigator screenOptions={{tabBarActiveTintColor: "#2563eb"}}>
      <Tab.Screen
        name="Main"
        component={CourseStack}
        options={{
          title: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({color}) => (
            <Icon color={color} source="home" size={26} />
          ),
        }}
      />

      {user?.role === "LECTURER" && (
        <>
          <Tab.Screen
            name="Manage"
            component={LecturerStack}
            options={{
              title: "Giảng dạy",
              headerShown: false,
              tabBarIcon: ({ color }) => <Icon source="school" size={26} color={color} />
            }}
          />
          <Tab.Screen
            name="StatisticsTab"
            component={Statistics}
            options={{
              title: "Thống kê",
              headerShown: true,
              tabBarIcon: ({ color }) => <Icon source="chart-bar" size={26} color={color} />,
            }}
          />
        </>
      )}

      {user !== null && (
        <Tab.Screen
          name="Chat"
          component={ChatStack}
          options={{
            title: "Tin nhắn",
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon source="chat-processing-outline" size={26} color={color} />,
            tabBarBadge: unreadCount > 0 ? unreadCount : null,
          }}
        />
      )}
      {user === null ? (
        <>
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: ({ color }) => <Icon color={color} source="login" size={26} />,
            }}
          />
          <Tab.Screen
            name="Register"
            component={Register}
            options={{
              title: "Đăng ký",
              tabBarIcon: ({ color }) => <Icon color={color} source="account-plus" size={26} />,
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Profile"
            component={User}
            options={{
              title: "Cá nhân",
              tabBarIcon: () => <Icon source="account" size={26} />,
            }}
          />
          <Tab.Screen
            name="UserCourse"
            component={UserCourseStack}
            options={{
              title: "Khóa học của tôi",
              headerShown: false,
              tabBarIcon: () => (
                <Icon color="blue" source="book-open-variant" size={26} />
              ),

            }}
          />
          {user?.role === "STUDENT" && (
            <Tab.Screen
              name="UserCourse"
              component={UserCourse}
              options={{
                title: "Khóa học của tôi",
                tabBarIcon: ({ color }) => <Icon color={color} source="book-open-variant" size={26} />,
              }}
            />
          )}
        </>
      )}
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </MyUserContext.Provider>
  );
};

export default App;
