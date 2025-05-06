import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../navigation/types';

type CollaborativeWorkspaceScreenProps = {
  navigation: DrawerNavigationProp<RootStackParamList>;
};

type Task = {
  id: number;
  title: string;
  assignee: string;
  status: string;
};

type Message = {
  id: number;
  user: string;
  message: string;
  time: string;
};

type TaskCardProps = {
  key?: React.Key;
  task: Task;
  colors: any;
};

type MessageCardProps = {
  key?: React.Key;
  message: Message;
  colors: any;
};

interface TaskItemProps {
  task: Task;
  colors: any;
  key?: string;
}

interface MessageItemProps {
  message: Message;
  colors: any;
  key?: string;
}

const TaskItem = ({ task, colors }: TaskItemProps) => (
  <View style={[styles.taskCard, { backgroundColor: colors.background }]}>
    <View style={styles.taskHeader}>
      <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
      <Text
        style={[
          styles.taskStatus,
          {
            color:
              task.status === 'Completed'
                ? '#4CAF50'
                : task.status === 'In Progress'
                  ? '#FF9800'
                  : colors.text,
          },
        ]}
      >
        {task.status}
      </Text>
    </View>
    <Text style={[styles.taskAssignee, { color: colors.secondary }]}>
      Assigned to: {task.assignee}
    </Text>
  </View>
);

const MessageItem = ({ message, colors }: MessageItemProps) => (
  <View style={styles.messageContainer}>
    <View style={styles.messageHeader}>
      <Text style={[styles.userName, { color: colors.primary }]}>{message.user}</Text>
      <Text style={[styles.messageTime, { color: colors.secondary }]}>{message.time}</Text>
    </View>
    <Text style={[styles.messageText, { color: colors.text }]}>{message.message}</Text>
  </View>
);

const CollaborativeWorkspaceScreen: React.FC<CollaborativeWorkspaceScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');

  const dummyTasks: Task[] = [
    { id: 1, title: 'Review Content Guidelines', assignee: 'John Doe', status: 'In Progress' },
    { id: 2, title: 'Update Moderation Rules', assignee: 'Jane Smith', status: 'Pending' },
    { id: 3, title: 'Analyze User Reports', assignee: 'Mike Johnson', status: 'Completed' },
  ];

  const dummyMessages: Message[] = [
    {
      id: 1,
      user: 'John Doe',
      message: 'Updated the content moderation workflow',
      time: '10:30 AM',
    },
    { id: 2, user: 'Jane Smith', message: 'Found a pattern in recent disputes', time: '11:15 AM' },
    {
      id: 3,
      user: 'Mike Johnson',
      message: 'Implementing new verification process',
      time: '12:00 PM',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Collaborative Workspace</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Tasks Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Tasks</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary + '20' }]}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View>
            {dummyTasks.map(task => (
              <TaskItem key={task.id.toString()} task={task} colors={colors} />
            ))}
          </View>
        </View>

        {/* Team Chat Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Chat</Text>
          <View style={styles.chatContainer}>
            {dummyMessages.map(msg => (
              <MessageItem key={msg.id.toString()} message={msg} colors={colors} />
            ))}
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Type your message..."
              placeholderTextColor={colors.secondary}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 12,
    padding: 8,
  },
  chatContainer: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
  input: {
    borderRadius: 8,
    flex: 1,
    height: 40,
    marginRight: 12,
    paddingHorizontal: 12,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
  },
  section: {
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  taskAssignee: {
    fontSize: 14,
  },
  taskCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CollaborativeWorkspaceScreen;
