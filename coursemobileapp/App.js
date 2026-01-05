import React, {useContext, useReducer} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Icon} from "react-native-paper";
import {MyUserContext} from "./utils/contexts/MyContext";
import MyUserReducer from "./utils/reducers/MyUserReducer";
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
import PaymentModal from "./screens/PaymentModal/PaymentModal";

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

const LecturerStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="LecturerHome"
      component={LecturerHome}
      options={{title: "Quản lý giảng dạy"}}
    />
    <Stack.Screen
      name="ManageCourse"
      component={ManageCourse}
      options={{title: "Chi tiết khóa học"}}
    />
    <Stack.Screen
      name="AddCourse"
      component={AddCourse}
      options={{title: "Tạo khóa học"}}
    />
    <Stack.Screen
      name="AddLesson"
      component={AddLesson}
      options={{title: "Thêm bài học"}}
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

const TabNavigator = () => {
  const [user] = useContext(MyUserContext);

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
        <Tab.Screen
          name="Manage"
          component={LecturerStack}
          options={{
            title: "Giảng dạy",
            headerShown: false,
            tabBarIcon: ({color}) => (
              <Icon source="school" size={26} color={color} />
            ),
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
              tabBarIcon: () => <Icon color="blue" source="login" size={26} />,
            }}
          />
          <Tab.Screen
            name="Register"
            component={Register}
            options={{
              title: "Đăng ký",
              tabBarIcon: () => (
                <Icon color="blue" source="account-plus" size={26} />
              ),
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
