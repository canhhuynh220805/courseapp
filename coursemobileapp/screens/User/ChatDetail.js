import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Text, Card, ActivityIndicator } from 'react-native-paper';
import { db } from '../../utils/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { MyUserContext } from "../../utils/contexts/MyContext";

const ChatDetail = ({ route }) => {
    const { receiver } = route.params;
    const [user] = useContext(MyUserContext);
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const roomId = [user.id, receiver.id].sort((a, b) => a - b).join('-');

    useEffect(() => {
        const q = query(
            collection(db, "messages"),
            where("roomId", "==", roomId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMsgs = snapshot.docs.map(document => {
                const data = document.data();

                if (data.receiverId === user.id && data.isRead === false) {
                    updateDoc(doc(db, "messages", document.id), { isRead: true });
                }

                return { id: document.id, ...data };
            });
            setMessages(fetchedMsgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId]);

    const sendMessage = async () => {
        if (msg.trim()) {
            try {
                await addDoc(collection(db, "messages"), {
                    roomId: roomId,
                    text: msg,
                    senderId: user.id,
                    senderName: user.username,
                    receiverId: receiver.id,
                    isRead: false,
                    createdAt: new Date().getTime(),
                    user: {
                        _id: user.id,
                        name: user.username,
                        avatar: user.avatar
                    }
                });
                setMsg('');
            } catch (e) {
                console.error("Lỗi gửi tin nhắn: ", e);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {loading ? <ActivityIndicator style={{ flex: 1 }} /> : (
                <FlatList
                    data={messages}
                    inverted
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.msgWrapper, item.senderId === user.id ? styles.myMsg : styles.theirMsg]}>
                            <Card style={[styles.msgCard, { backgroundColor: item.senderId === user.id ? '#2563eb' : '#f3f4f6' }]}>
                                <Card.Content style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                                    <Text style={{ color: item.senderId === user.id ? '#fff' : '#000' }}>
                                        {item.text || item.content}
                                    </Text>
                                </Card.Content>
                            </Card>
                        </View>
                    )}
                    contentContainerStyle={{ padding: 10 }}
                />
            )}
            <View style={styles.inputArea}>
                <TextInput
                    value={msg}
                    onChangeText={setMsg}
                    placeholder="Nhập tin nhắn..."
                    mode="flat"
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                />
                <IconButton icon="send" iconColor="#2563eb" size={28} onPress={sendMessage} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    msgWrapper: { marginVertical: 4, maxWidth: '80%' },
    myMsg: { alignSelf: 'flex-end' },
    theirMsg: { alignSelf: 'flex-start' },
    msgCard: { borderRadius: 15, elevation: 1 },
    inputArea: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, borderColor: '#e5e7eb' }
});

export default ChatDetail;