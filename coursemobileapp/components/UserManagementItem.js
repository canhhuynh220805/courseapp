import React from 'react';
import { View } from 'react-native';
import { Avatar, Text, Caption } from 'react-native-paper';

const UserManagementItem = ({ user, primaryColor, icon = "account", rightAction }) => {
    return (
        <View style={{
            flexDirection: 'row',
            padding: 16,
            alignItems: 'center',
            backgroundColor: '#fff',
            justifyContent: 'space-between'
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {user.avatar ? (
                    <Avatar.Image size={48} source={{ uri: user.avatar }} />
                ) : (
                    <Avatar.Text
                        size={48}
                        label={user.username?.[0]?.toUpperCase() || "?"}
                        style={{ backgroundColor: '#dbeafe' }}
                        color={primaryColor}
                    />
                )}
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>
                        {user.username}
                    </Text>
                    <Caption numberOfLines={1}>{user.email || "Chưa cập nhật email"}</Caption>
                </View>
            </View>

            {rightAction && (
                <View style={{ marginLeft: 8 }}>
                    {rightAction}
                </View>
            )}
        </View>
    );
};

export default UserManagementItem;